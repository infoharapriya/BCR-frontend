//10/9/2025

import { useRef, useState, useEffect } from "react";
import QRScanner from "./QRScanner";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../css/ocrScanner.css";

export default function OCRScanner({ selectedEvent, selectedType, onSaved }) {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);

  const showMsg = (text, timeout = 2500) => {
    setMsg(text);
    setTimeout(() => setMsg(""), timeout);
  };

  //10/09/2025

  async function compressImage(file, maxWidth = 1000, quality = 0.7) {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => (img.src = e.target.result);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) =>
            resolve(new File([blob], "compressed.jpg", { type: "image/jpeg" })),
          "image/jpeg",
          quality
        );
      };
      reader.readAsDataURL(file);
    });
  }

  // ---- OCR (upload or camera) ----
  const handleExtract = async (chosenFile) => {
    try {
      setLoading(true);

      const compressedFile = await compressImage(chosenFile);

      const fd = new FormData();
      fd.append("image", compressedFile);

      const data = await api("/api/ocr/scan", {
        method: "POST",
        body: fd,
        token,
        isForm: true,
      });

      setResult(data);
      setFormData({
        ...data.fields,
        event: selectedEvent,
        type: selectedType,
      });

      showMsg("Extraction complete.");
    } catch (e) {
      showMsg("Extract failed: " + e.message, 3500);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image");
    await handleExtract(file);
  };

  // ---- CAMERA ----
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 1.777 },
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsInline", "true");
        videoRef.current.setAttribute("muted", "true");
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
            setStreaming(true);
            console.log("📷 Camera streaming started");
          } catch (err) {
            console.error("Play error:", err);
          }
        };
      }
    } catch (err) {
      showMsg("Camera error: " + err.message, 3500);
      console.error("Camera error", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  };

  // ---- Capture + Upload OCR ----
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    try {
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );

      if (!blob) {
        console.error("❌ Canvas did not return a blob");
        setLoading(false);
        return;
      }

      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      console.log("📸 Captured image:", file);

      await handleExtract(file);
    } catch (err) {
      console.error("Capture error:", err);
      showMsg("Capture failed: " + err.message, 4000);
      setLoading(false);
    }
  };

  useEffect(() => () => stopCamera(), []);

  // ---- SAVE ----
  const handleSave = async () => {
    try {
      if (!formData) return alert("No data to save");
      const payload = {
        ...formData,
        raw: formData.raw || result?.raw || "",
        event: selectedEvent,
        type: selectedType,
      };

      await api("/api/ocr/save", { method: "POST", token, body: payload });

      showMsg("Saved!");
      setResult(null);
      setFormData(null);
      setFile(null);
      if (onSaved) onSaved();
    } catch (e) {
      showMsg("Save failed: " + e.message, 3500);
    }
  };

  // ---- QR RESULT ----
  const onQRResult = (decodedText) => {
    let f = {};
    try {
      const j = JSON.parse(decodedText);
      if (j && typeof j === "object") f = j;
    } catch {}

    if (/BEGIN:VCARD/i.test(decodedText)) {
      decodedText.split(/\r?\n/).forEach((line) => {
        const [key, value] = line.split(/:(.+)/);
        if (!value) return;
        const k = key.toLowerCase();
        if (k.includes("fn")) f.name = value;
        if (k.includes("title")) f.designation = value;
        if (k.includes("org")) f.company = value;
        if (k === "tel") f.number = value;
        if (k === "email") f.email = value;
        if (k === "url") f.site = value;
        if (k === "adr") f.address = value.replace(/;/g, " ");
      });
    }

    if (!Object.keys(f).length && /^https?:\/\//i.test(decodedText)) {
      f.site = decodedText;
    }

    setResult({ raw: decodedText, fields: f });
    setFormData({ ...f, event: selectedEvent, type: selectedType });
    showMsg("QR decoded.");
  };

  return (
    <div className="ocr-container">
      {/* Upload Section */}
      <div className="flex-row">
        <div className="flex-col" style={{ flex: 1 }}>
          <form onSubmit={onSubmitUpload} className="flex-col">
            <label className="label">
              Upload Image
              <input
                type="file"
                accept="image/*"
                className="input"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <button className="btn btn-blue" type="submit">
              Extract
            </button>
          </form>
        </div>

        {/* Camera Section */}
        <div className="flex-col" style={{ flex: 1 }}>
          {!streaming ? (
            <button onClick={startCamera} className="btn btn-green">
              Start Scan
            </button>
          ) : (
            <button onClick={stopCamera} className="btn btn-red">
              Stop Scan
            </button>
          )}

          <div>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="video"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          {streaming && (
            <button
              onClick={capturePhoto}
              className="btn btn-blue"
              disabled={loading}
            >
              {loading ? "Processing..." : "📸 Extract"}
            </button>
          )}
        </div>
      </div>

      {/* QR Scanner */}
      <div>
        <QRScanner onResult={onQRResult} />
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Scanning Card in Process</p>
        </div>
      )}

      {/* Notification */}
      {msg && (
        <div
          className={`alert ${
            msg.includes("fail") ? "alert-error" : "alert-success"
          }`}
        >
          {msg}
        </div>
      )}

      {/* Editable Form */}
      {formData && (
        <div className="flex-col">
          <h3>Review & Edit</h3>
          <div className="grid">
            {[
              ["Name", "name"],
              ["Designation", "designation"],
              ["Company", "company"],
              ["Number", "number"],
              ["Email", "email"],
              ["Website", "site"],
              ["Address", "address"],
            ].map(([label, key]) => (
              <label key={key}>
                <span className="label">{label}</span>
                <input
                  className="input"
                  value={formData[key] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>
          <label>
            <span className="label">Raw Text</span>
            <textarea
              className="textarea"
              rows="4"
              value={formData.raw || result?.raw || ""}
              onChange={(e) =>
                setFormData({ ...formData, raw: e.target.value })
              }
            />
          </label>

          <button className="btn btn-green" onClick={handleSave}>
            Save
          </button>
        </div>
      )}
    </div>
  );
}
