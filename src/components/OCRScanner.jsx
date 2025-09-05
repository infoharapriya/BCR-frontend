// // import React, { useState, useRef, useEffect } from "react";
// // import Tesseract from "tesseract.js";

// // const OCRScanner = ({ onResult }) => {
// //   const [text, setText] = useState("");
// //   const [fields, setFields] = useState({});
// //   const [loading, setLoading] = useState(false);
// //   const [rotation, setRotation] = useState(0);
// //   const [imageSrc, setImageSrc] = useState(null);
// //   const [cameraActive, setCameraActive] = useState(false);
// //   const [autoScan, setAutoScan] = useState(false);

// //   const imageRef = useRef(null);
// //   const canvasRef = useRef(null);
// //   const videoRef = useRef(null);
// //   const streamRef = useRef(null);

// //   // ---------------- Field extraction helper ----------------
// //   const extractFields = (text) => {
// //     const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
// //     return {
// //       name: lines[0] || "",
// //       designation: lines[1] || "",
// //       company: lines[2] || "",
// //       email: (text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/) || [""])[0],
// //       phone: (text.match(/\+?\d[\d\s-]{8,}\d/g) || [""])[0],
// //     };
// //   };

// //   // ---------------- OCR Handler ----------------
// //   const handleOCR = async (source = null) => {
// //     setLoading(true);
// //     let img = new Image();

// //     if (source) {
// //       img.src = source;
// //       await new Promise((res) => (img.onload = res));
// //     } else if (videoRef.current) {
// //       const canvas = document.createElement("canvas");
// //       canvas.width = videoRef.current.videoWidth;
// //       canvas.height = videoRef.current.videoHeight;
// //       const ctx = canvas.getContext("2d");
// //       ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
// //       img.src = canvas.toDataURL("image/jpeg");
// //       await new Promise((res) => (img.onload = res));
// //     } else {
// //       setLoading(false);
// //       return;
// //     }

// //     // rotate
// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext("2d");
// //     if (rotation % 180 === 0) {
// //       canvas.width = img.width;
// //       canvas.height = img.height;
// //     } else {
// //       canvas.width = img.height;
// //       canvas.height = img.width;
// //     }
// //     ctx.save();
// //     ctx.translate(canvas.width / 2, canvas.height / 2);
// //     ctx.rotate((rotation * Math.PI) / 180);
// //     ctx.drawImage(img, -img.width / 2, -img.height / 2);
// //     ctx.restore();

// //     const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg"));
// //     try {
// //       const { data: { text } } = await Tesseract.recognize(blob, "eng");
// //       setText(text);
// //       const extracted = extractFields(text);
// //       setFields(extracted);

// //       if (onResult) onResult({ raw: text, fields: extracted });
// //     } catch (err) {
// //       console.error("OCR error:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ---------------- Camera Controls ----------------
// //   useEffect(() => {
// //     if (cameraActive) {
// //       navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
// //         videoRef.current.srcObject = stream;
// //         streamRef.current = stream;
// //       });
// //     } else if (streamRef.current) {
// //       streamRef.current.getTracks().forEach((track) => track.stop());
// //     }
// //     return () => {
// //       if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
// //     };
// //   }, [cameraActive]);

// //   useEffect(() => {
// //     let interval;
// //     if (autoScan && cameraActive) {
// //       interval = setInterval(() => handleOCR(), 5000);
// //     }
// //     return () => clearInterval(interval);
// //   }, [autoScan, cameraActive]);

// //   // ---------------- Handlers ----------------
// //   const handleImageChange = (e) => {
// //     const file = e.target.files[0];
// //     if (!file) return;
// //     const reader = new FileReader();
// //     reader.onload = () => setImageSrc(reader.result);
// //     reader.readAsDataURL(file);
// //     setText("");
// //     setRotation(0);
// //     setFields({});
// //   };

// //   return (
// //     <div className="p-4 border rounded-lg shadow bg-white">
// //       <h3 className="text-lg font-bold mb-2">📄 OCR Business Card Scanner</h3>

// //       <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
// //       <div className="flex gap-2 mb-2">
// //         <button onClick={() => setCameraActive(!cameraActive)} className="px-3 py-1 bg-blue-500 text-white rounded">
// //           {cameraActive ? "Stop Camera" : "Start Camera"}
// //         </button>
// //         {cameraActive && (
// //           <button onClick={() => handleOCR()} className="px-3 py-1 bg-green-500 text-white rounded">
// //             📷 Capture & OCR
// //           </button>
// //         )}
// //         <button onClick={() => setAutoScan(!autoScan)} className="px-3 py-1 bg-purple-500 text-white rounded">
// //           {autoScan ? "⏸ Stop Auto-Scan" : "▶ Start Auto-Scan"}
// //         </button>
// //       </div>

// //       {cameraActive && <video ref={videoRef} autoPlay className="w-full mb-2 border rounded" />}
// //       {imageSrc && (
// //         <div className="mb-2">
// //           <img
// //             ref={imageRef}
// //             src={imageSrc}
// //             alt="preview"
// //             style={{ transform: `rotate(${rotation}deg)`, maxWidth: "100%" }}
// //           />
// //           <button onClick={() => setRotation((r) => (r + 90) % 360)} className="mt-1 px-2 py-1 bg-gray-500 text-white rounded">
// //             🔄 Rotate
// //           </button>
// //           <button onClick={() => handleOCR(imageSrc)} className="ml-2 px-2 py-1 bg-green-600 text-white rounded">
// //             Run OCR
// //           </button>
// //         </div>
// //       )}

// //       {loading && <p className="text-sm text-blue-600">⏳ Processing...</p>}
// //       {text && (
// //         <div className="mt-2 text-sm">
// //           <strong>Extracted Text:</strong>
// //           <pre className="bg-gray-100 p-2 rounded">{text}</pre>
// //         </div>
// //       )}

// //       <canvas ref={canvasRef} className="hidden"></canvas>
// //     </div>
// //   );
// // };

// // export default OCRScanner;



// import { useRef, useState } from "react";
// import QRScanner from "./QRScanner";
// import { api } from "../utils/api";
// import { useAuth } from "../context/AuthContext";

// export default function OCRScanner({ selectedEvent, selectedType, onSaved }) {
//   const { token } = useAuth();
//   const [file, setFile] = useState(null);
//   const [result, setResult] = useState(null);
//   const [formData, setFormData] = useState(null);
//   const [msg, setMsg] = useState("");

//   // camera
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [streaming, setStreaming] = useState(false);
//   const [capturedPreview, setCapturedPreview] = useState(null);

//   const showMsg = (text, timeout = 2500) => {
//     setMsg(text);
//     setTimeout(() => setMsg(""), timeout);
//   };

//   // ---- IMAGE COMPRESSION ----
//   async function compressImage(file, maxWidth = 1000, quality = 0.7) {
//     return new Promise((resolve) => {
//       const img = new Image();
//       const reader = new FileReader();

//       reader.onload = (e) => (img.src = e.target.result);
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         const scale = Math.min(1, maxWidth / img.width);
//         canvas.width = img.width * scale;
//         canvas.height = img.height * scale;

//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

//         canvas.toBlob(
//           (blob) =>
//             resolve(new File([blob], "compressed.jpg", { type: "image/jpeg" })),
//           "image/jpeg",
//           quality
//         );
//       };
//       reader.readAsDataURL(file);
//     });
//   }

//   // ---- OCR ----
//   const handleExtract = async (chosenFile) => {
//     try {
//       const compressedFile = await compressImage(chosenFile);
//       const fd = new FormData();
//       fd.append("image", compressedFile);

//       const data = await api("/api/ocr/scan", {
//         method: "POST",
//         body: fd,
//         token,
//         isForm: true,
//       });

//       setResult(data);
//       setFormData({
//         ...data.fields,
//         event: selectedEvent,
//         type: selectedType,
//       });
//     } catch (e) {
//       alert(e.message);
//     }
//   };

//   const onSubmitUpload = async (e) => {
//     e.preventDefault();
//     if (!file) return alert("Please select an image");
//     await handleExtract(file);
//   };

//   // ---- CAMERA ----
//   const startCamera = async () => {
//   try {
//     let stream;
//     try {
//       stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: { ideal: "environment" }, // back camera if available
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//         audio: false,
//       });
//     } catch {
//       stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: false,
//       });
//     }

//     if (videoRef.current) {
//       videoRef.current.srcObject = stream;

//       // Ensure attributes for autoplay on mobile
//       videoRef.current.setAttribute("playsInline", "true");
//       videoRef.current.setAttribute("muted", "true");

//       // Try playing once metadata is loaded
//       videoRef.current.onloadedmetadata = async () => {
//         try {
//           await videoRef.current.play();
//           setStreaming(true);
//           console.log("📷 Camera streaming");
//         } catch (err) {
//           console.error("Video play error:", err);
//         }
//       };
//     }
//   } catch (err) {
//     alert(`Camera error: ${err.message}`);
//     console.error("Camera error", err);
//   }
// };


//   const stopCamera = () => {
//     if (videoRef.current && videoRef.current.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
//       videoRef.current.srcObject = null;
//     }
//     setStreaming(false);
//   };

//   const capturePhoto = async () => {
//     const v = videoRef.current, c = canvasRef.current;
//     if (!v || !c) return;

//     c.width = v.videoWidth || 1280;
//     c.height = v.videoHeight || 720;

//     const ctx = c.getContext("2d");
//     ctx.drawImage(v, 0, 0, c.width, c.height);

//     const dataUrl = c.toDataURL("image/jpeg", 0.8);
//     setCapturedPreview(dataUrl);

//     c.toBlob(async (blob) => {
//       if (!blob) return;
//       const f = new File([blob], "capture.jpg", { type: "image/jpeg" });
//       await handleExtract(f);
//     }, "image/jpeg", 0.8);
//   };

//   // ---- SAVE ----
//   const handleSave = async () => {
//     try {
//       if (!formData) return alert("No data to save");
//       const payload = { ...formData, raw: result?.raw || "", event: selectedEvent, type: selectedType };

//       await api("/api/ocr/save", { method: "POST", token, body: payload });

//       showMsg("Saved!");
//       setResult(null);
//       setFormData(null);
//       setFile(null);
//       if (onSaved) onSaved();
//     } catch (e) {
//       showMsg("Save failed: " + e.message, 3500);
//     }
//   };

//   // ---- QR RESULT ----
//   const onQRResult = (decodedText) => {
//     let f = {};
//     try {
//       const j = JSON.parse(decodedText);
//       if (j && typeof j === "object") f = j;
//     } catch {}

//     if (/BEGIN:VCARD/i.test(decodedText)) {
//       decodedText.split(/\r?\n/).forEach((line) => {
//         const [key, value] = line.split(/:(.+)/);
//         if (!value) return;
//         const k = key.toLowerCase();
//         if (k.includes("fn")) f.name = value;
//         if (k.includes("org")) f.company = value;
//         if (k.includes("title")) f.designation = value;
//         if (k === "email") f.email = value;
//         if (k === "tel") f.number = value;
//         if (k === "url") f.site = value;
//         if (k === "adr") f.address = value.replace(/;/g, " ");
//       });
//     }

//     if (!Object.keys(f).length && /^https?:\/\//i.test(decodedText)) {
//       f.site = decodedText;
//     }

//     setResult({ raw: decodedText, fields: f });
//     setFormData({ ...f, event: selectedEvent, type: selectedType });
//     showMsg("QR decoded.");
//   };

//   return (
//     <div>
//       {/* Upload */}
//       <div className="row" style={{ marginTop: 10 }}>
//         <div className="col-6">
//           <form onSubmit={onSubmitUpload}>
//             <label>
//               Upload Image
//               <input
//                 type="file"
//                 className="input"
//                 accept="image/*"
//                 onChange={(e) => setFile(e.target.files?.[0] || null)}
//               />
//             </label>
//             <button className="btn" type="submit">Extract</button>
//           </form>
//         </div>

//         {/* Camera */}
//         <div className="col-6">
//           <div className="camera-box" style={{ marginTop: 10 }}>
//             {!streaming ? (
//               <button className="btn" onClick={startCamera}>📷 Start Scan</button>
//             ) : (
//               <div style={{ textAlign: "center" }}>
//                 <video
//   ref={videoRef}
//   autoPlay
//   muted
//   playsInline
//   style={{
//     width: "100%",
//     maxWidth: "500px",
//     height: "300px",
//     background: "green",   // so you see if nothing renders
//     objectFit: "cover",
//     borderRadius: "8px",
//   }}
// />

                
//                 <canvas ref={canvasRef} style={{ display: "none" }} />
//                 <div style={{ marginTop: 10, display: "flex", gap: "10px", justifyContent: "center" }}>
//                   <button className="btn" onClick={capturePhoto}>📸 Extract</button>
//                   <button className="btn secondary" onClick={stopCamera}>Stop Scan</button>
//                 </div>
//                 {capturedPreview && (
//                   <div style={{ marginTop: 12 }}>
//                     <p>Captured Image:</p>
//                     <img src={capturedPreview} alt="Captured"
//                       style={{ width: "100%", maxWidth: "500px", border: "1px solid #ddd", borderRadius: "6px" }}
//                     />
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* QR Scanner */}
//       <div style={{ marginTop: 16 }}>
//         <QRScanner onResult={onQRResult} />
//       </div>

//       {/* Notifications */}
//       {msg && <div className={`notice ${msg.includes("fail") ? "error" : "success"}`}>{msg}</div>}

//       {/* Editable form */}
//       {formData && (
//         <div className="row" style={{ marginTop: 16 }}>
//           <div className="col-12"><h3 style={{ color: "var(--brand)" }}>Review & Edit</h3></div>
//           {[
//             ["Name", "name"],
//             ["Designation", "designation"],
//             ["Company", "company"],
//             ["Number", "number"],
//             ["Email", "email"],
//             ["Website", "site"],
//           ].map(([label, key]) => (
//             <div className="col-6" key={key}>
//               <label>
//                 {label}
//                 <input className="input" value={formData[key] || ""}
//                   onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
//                 />
//               </label>
//             </div>
//           ))}
//           <div className="col-12">
//             <label>
//               Address
//               <textarea className="input" rows="3" value={formData.address || ""}
//                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//               />
//             </label>
//           </div>
//           <div className="col-12 actions">
//             <button className="btn" onClick={handleSave}>Save</button>
//           </div>
//         </div>
//       )}

//       {/* Raw OCR */}
//       {result?.raw && (
//         <div style={{ marginTop: 16 }}>
//           <h4>Raw Output</h4>
//           <textarea className="input" readOnly rows="6" value={result.raw} />
//         </div>
//       )}
//     </div>
//   );
// }import { useRef, useState, useEffect } from "react";



import QRScanner from "./QRScanner";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function OCRScanner({ selectedEvent, selectedType, onSaved }) {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(null);
  const [msg, setMsg] = useState("");

  // camera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState(null);

  const showMsg = (text, timeout = 2500) => {
    setMsg(text);
    setTimeout(() => setMsg(""), timeout);
  };

  // ---- IMAGE COMPRESSION ----
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

  // ---- OCR ----
  const handleExtract = async (chosenFile) => {
    try {
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
    } catch (e) {
      alert(e.message);
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
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsInline", "true");
        videoRef.current.setAttribute("muted", "true");

        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
            setStreaming(true);
            console.log("📷 Camera streaming");
          } catch (err) {
            console.error("Video play error:", err);
          }
        };
      }
    } catch (err) {
      alert(`Camera error: ${err.message}`);
      console.error("Camera error", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  };

  const capturePhoto = async () => {
    const v = videoRef.current,
      c = canvasRef.current;
    if (!v || !c) return;

    c.width = v.videoWidth || 1280;
    c.height = v.videoHeight || 720;

    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);

    const dataUrl = c.toDataURL("image/jpeg", 0.8);
    setCapturedPreview(dataUrl);

    c.toBlob(
      async (blob) => {
        if (!blob) return;
        const f = new File([blob], "capture.jpg", { type: "image/jpeg" });
        await handleExtract(f);
      },
      "image/jpeg",
      0.8
    );
  };

  // ---- SAVE ----
  const handleSave = async () => {
    try {
      if (!formData) return alert("No data to save");
      const payload = {
        ...formData,
        raw: result?.raw || "",
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
        if (k.includes("org")) f.company = value;
        if (k.includes("title")) f.designation = value;
        if (k === "email") f.email = value;
        if (k === "tel") f.number = value;
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

  // cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div>
      {/* Upload */}
      <div className="row" style={{ marginTop: 10 }}>
        <div className="col-6">
          <form onSubmit={onSubmitUpload}>
            <label>
              Upload Image
              <input
                type="file"
                className="input"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <button className="btn" type="submit">
              Extract
            </button>
          </form>
        </div>

        {/* Camera */}
        <div className="col-6">
          <div className="camera-box" style={{ marginTop: 10 }}>
            {!streaming ? (
              <button className="btn" onClick={startCamera}>
                📷 Start Scan
              </button>
            ) : (
              <div style={{ textAlign: "center", position: "relative" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    height: "300px",
                    background: "#000",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />

                {/* Overlay box with animated scan line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "80%",
                    height: "70%",
                    border: "3px solid #fff",
                    borderRadius: "8px",
                    marginTop: "40px",
                    overflow: "hidden",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="scan-line"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "3px",
                      background: "red",
                      animation: "scan 2s linear infinite",
                    }}
                  />
                </div>

                <canvas ref={canvasRef} style={{ display: "none" }} />

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                  }}
                >
                  <button className="btn" onClick={capturePhoto}>
                    📸 Extract
                  </button>
                  <button className="btn secondary" onClick={stopCamera}>
                    Stop Scan
                  </button>
                </div>

                {capturedPreview && (
                  <div style={{ marginTop: 12 }}>
                    <p>Captured Image:</p>
                    <img
                      src={capturedPreview}
                      alt="Captured"
                      style={{
                        width: "100%",
                        maxWidth: "500px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner */}
      <div style={{ marginTop: 16 }}>
        <QRScanner onResult={onQRResult} />
      </div>

      {/* Notifications */}
      {msg && (
        <div
          className={`notice ${msg.includes("fail") ? "error" : "success"}`}
        >
          {msg}
        </div>
      )}

      {/* Editable form */}
      {formData && (
        <div className="row" style={{ marginTop: 16 }}>
          <div className="col-12">
            <h3 style={{ color: "var(--brand)" }}>Review & Edit</h3>
          </div>
          {[
            ["Name", "name"],
            ["Designation", "designation"],
            ["Company", "company"],
            ["Number", "number"],
            ["Email", "email"],
            ["Website", "site"],
          ].map(([label, key]) => (
            <div className="col-6" key={key}>
              <label>
                {label}
                <input
                  className="input"
                  value={formData[key] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                />
              </label>
            </div>
          ))}
          <div className="col-12">
            <label>
              Address
              <textarea
                className="input"
                rows="3"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </label>
          </div>
          <div className="col-12 actions">
            <button className="btn" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* Raw OCR */}
      {result?.raw && (
        <div style={{ marginTop: 16 }}>
          <h4>Raw Output</h4>
          <textarea className="input" readOnly rows="6" value={result.raw} />
        </div>
      )}
    </div>
  );
}
