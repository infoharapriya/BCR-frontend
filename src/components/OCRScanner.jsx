import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";

const OCRScanner = ({ onResult }) => {
  const [text, setText] = useState("");
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [autoScan, setAutoScan] = useState(false);

  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ---------------- Field extraction helper ----------------
  const extractFields = (text) => {
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    return {
      name: lines[0] || "",
      designation: lines[1] || "",
      company: lines[2] || "",
      email: (text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/) || [""])[0],
      phone: (text.match(/\+?\d[\d\s-]{8,}\d/g) || [""])[0],
    };
  };

  // ---------------- OCR Handler ----------------
  const handleOCR = async (source = null) => {
    setLoading(true);
    let img = new Image();

    if (source) {
      img.src = source;
      await new Promise((res) => (img.onload = res));
    } else if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      img.src = canvas.toDataURL("image/jpeg");
      await new Promise((res) => (img.onload = res));
    } else {
      setLoading(false);
      return;
    }

    // rotate
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (rotation % 180 === 0) {
      canvas.width = img.width;
      canvas.height = img.height;
    } else {
      canvas.width = img.height;
      canvas.height = img.width;
    }
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg"));
    try {
      const { data: { text } } = await Tesseract.recognize(blob, "eng");
      setText(text);
      const extracted = extractFields(text);
      setFields(extracted);

      if (onResult) onResult({ raw: text, fields: extracted });
    } catch (err) {
      console.error("OCR error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Camera Controls ----------------
  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      });
    } else if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [cameraActive]);

  useEffect(() => {
    let interval;
    if (autoScan && cameraActive) {
      interval = setInterval(() => handleOCR(), 5000);
    }
    return () => clearInterval(interval);
  }, [autoScan, cameraActive]);

  // ---------------- Handlers ----------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
    setText("");
    setRotation(0);
    setFields({});
  };

  return (
    <div className="p-4 border rounded-lg shadow bg-white">
      <h3 className="text-lg font-bold mb-2">📄 OCR Business Card Scanner</h3>

      <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
      <div className="flex gap-2 mb-2">
        <button onClick={() => setCameraActive(!cameraActive)} className="px-3 py-1 bg-blue-500 text-white rounded">
          {cameraActive ? "Stop Camera" : "Start Camera"}
        </button>
        {cameraActive && (
          <button onClick={() => handleOCR()} className="px-3 py-1 bg-green-500 text-white rounded">
            📷 Capture & OCR
          </button>
        )}
        <button onClick={() => setAutoScan(!autoScan)} className="px-3 py-1 bg-purple-500 text-white rounded">
          {autoScan ? "⏸ Stop Auto-Scan" : "▶ Start Auto-Scan"}
        </button>
      </div>

      {cameraActive && <video ref={videoRef} autoPlay className="w-full mb-2 border rounded" />}
      {imageSrc && (
        <div className="mb-2">
          <img
            ref={imageRef}
            src={imageSrc}
            alt="preview"
            style={{ transform: `rotate(${rotation}deg)`, maxWidth: "100%" }}
          />
          <button onClick={() => setRotation((r) => (r + 90) % 360)} className="mt-1 px-2 py-1 bg-gray-500 text-white rounded">
            🔄 Rotate
          </button>
          <button onClick={() => handleOCR(imageSrc)} className="ml-2 px-2 py-1 bg-green-600 text-white rounded">
            Run OCR
          </button>
        </div>
      )}

      {loading && <p className="text-sm text-blue-600">⏳ Processing...</p>}
      {text && (
        <div className="mt-2 text-sm">
          <strong>Extracted Text:</strong>
          <pre className="bg-gray-100 p-2 rounded">{text}</pre>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default OCRScanner;
