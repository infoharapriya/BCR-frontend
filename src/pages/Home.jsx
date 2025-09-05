import { useEffect, useRef, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { api } from "../utils/api";
// import QRScanner from "../components/QRScanner";

// export default function Home() {
//   const { token, role } = useAuth();
//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState("");
//   const [selectedType, setSelectedType] = useState("");

//   const [file, setFile] = useState(null);
//   const [result, setResult] = useState(null);
//   const [formData, setFormData] = useState(null);
//   const [msg, setMsg] = useState("");

//   // camera refs
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [streaming, setStreaming] = useState(false);
//   const [capturedPreview, setCapturedPreview] = useState(null);

//   // ---- EVENTS ----
//   const fetchEvents = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const data = await api("/api/events", { token });
//       setEvents(Array.isArray(data) ? data : data.events || []);
//     } catch (err) {
//       console.error("Fetch error:", err.message);
//       setEvents([]);
//     }
//   };

//   useEffect(() => {
//     fetchEvents();
//     return () => stopCamera();
//   }, []);

//   const addEvent = async () => {
//     const name = prompt("New event name:");
//     if (!name) return;
//     try {
//       await api("/api/events", {
//         method: "POST",
//         body: { name },
//         token,
//       });
//       await fetchEvents();
//       showMsg("Event added.");
//     } catch (e) {
//       alert(e.message);
//     }
//   };

//   const editEvent = async () => {
//     const ev = events.find((e) => e.name === selectedEvent);
//     if (!ev) return alert("No event selected");
//     const newName = prompt("Edit event name:", ev.name);
//     if (!newName) return;

//     try {
//       await api(`/api/events/${ev._id}`, {
//         method: "PUT",
//         body: { name: newName },
//         token,
//       });
//       await fetchEvents();
//       setSelectedEvent(newName);
//       showMsg("Event updated.");
//     } catch (e) {
//       alert(e.message);
//     }
//   };

//   const deleteEvent = async () => {
//     const ev = events.find((e) => e._id === selectedEvent);
//     if (!ev) return alert("No event selected");
//     if (!window.confirm(`Delete event "${ev.name}"?`)) return;

//     try {
//       await api(`/api/events/${ev._id}`, { method: "DELETE", token });
//       await fetchEvents();
//       setSelectedEvent("");
//       showMsg("Event deleted.");
//     } catch (e) {
//       alert(e.message);
//     }
//   };

//   // ---- IMAGE COMPRESSION ----
//   async function compressImage(file, maxWidth = 1000, quality = 0.7) {
//     return new Promise((resolve) => {
//       const img = new Image();
//       const reader = new FileReader();

//       reader.onload = (e) => {
//         img.src = e.target.result;
//       };
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         const scale = Math.min(1, maxWidth / img.width);
//         canvas.width = img.width * scale;
//         canvas.height = img.height * scale;

//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

//         canvas.toBlob(
//           (blob) => {
//             resolve(new File([blob], "compressed.jpg", { type: "image/jpeg" }));
//           },
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
//  const startCamera = async () => {
//   try {
//     let stream;
//     try {
//       stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: { ideal: "environment" },
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
//       videoRef.current.muted = true;
//       videoRef.current.setAttribute("playsInline", true);

//       // ✅ Wait until actual frames are available
//       videoRef.current.onloadeddata = async () => {
//         try {
//           await videoRef.current.play();
//           setStreaming(true); // move this here instead of before
//         } catch (err) {
//           console.error("Play error:", err);
//         }
//       };
//     }
//   } catch (err) {
//     alert(`Camera error: ${err.message}`);
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
//     const v = videoRef.current,
//       c = canvasRef.current;
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

//       const payload = {
//         ...formData,
//         raw: result?.raw || "",
//         event: selectedEvent,
//         type: selectedType,
//       };

//       await api("/api/ocr/save", {
//         method: "POST",
//         token,
//         body: payload,
//       });

//       showMsg("Saved!");
//       setResult(null);
//       setFormData(null);
//       setFile(null);
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
//       const lines = decodedText.split(/\r?\n/);
//       lines.forEach((line) => {
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

//   const showMsg = (text, timeout = 2500) => {
//     setMsg(text);
//     setTimeout(() => setMsg(""), timeout);
//   };

//   const readyToUpload = selectedEvent && selectedType;

//   // ---- UI ----
//   return (
//     <div className="container">
//       <div className="card">
//         <h2 style={{ color: "var(--brand)", marginBottom: 10 }}>
//           OCR Business Card Extractor
//         </h2>

//         {/* Selectors */}
//         <div className="row">
//           <div className="col-6">
//             <label>
//               Event
//               <select
//                 value={selectedEvent}
//                 onChange={(e) => setSelectedEvent(e.target.value)}
//               >
//                 <option value="">-- Select --</option>
//                 {Array.isArray(events) &&
//                   events.map((ev) => (
//                     <option key={ev._id} value={ev._id}>
//                       {ev.name}
//                     </option>
//                   ))}
//               </select>
//             </label>
//           </div>
//           <div className="col-6">
//             <label>
//               Type
//               <select
//                 value={selectedType}
//                 onChange={(e) => setSelectedType(e.target.value)}
//               >
//                 <option value="">-- Select --</option>
//                 <option value="Customer">Customer</option>
//                 <option value="Supplier">Supplier</option>
//               </select>
//             </label>
//           </div>
//         </div>

//         {/* Admin Controls */}
//         {role === "admin" && (
//           <div className="actions" style={{ marginTop: 6 }}>
//             <button className="btn success" onClick={addEvent}>
//               + Add Event
//             </button>
//             {selectedEvent && (
//               <>
//                 <button className="btn" onClick={editEvent}>
//                   ✏️ Edit
//                 </button>
//                 <button className="btn danger" onClick={deleteEvent}>
//                   🗑 Delete
//                 </button>
//               </>
//             )}
//           </div>
//         )}

//         {!readyToUpload && (
//           <div className="notice info">
//             Select <b>Event</b> and <b>Type</b> to continue.
//           </div>
//         )}

//         {readyToUpload && (
//           <>
//             <div className="row" style={{ marginTop: 10 }}>
//               {/* Upload */}
//               <div className="col-6">
//                 <form onSubmit={onSubmitUpload}>
//                   <label>
//                     Upload Image
//                     <input
//                       type="file"
//                       className="input"
//                       accept="image/*"
//                       onChange={(e) => setFile(e.target.files?.[0] || null)}
//                     />
//                   </label>
//                   <button className="btn" type="submit">
//                     Extract
//                   </button>
//                 </form>
//               </div>

//               {/* Camera Section */}
//               <div className="col-6">
//                 <div className="camera-box" style={{ marginTop: 10 }}>
//                   {!streaming ? (
//                     <button className="btn" onClick={startCamera}>
//                       📷 Start Scan
//                     </button>
//                   ) : (
//                     <div style={{ textAlign: "center" }}>
//                       <video
//                         ref={videoRef}
//                         autoPlay
//                         playsInline
//                         style={{
//                           width: "100%",
//                           maxWidth: "500px",
//                           height: "300px",
//                           objectFit: "cover",
//                           borderRadius: "8px",
//                           // background: "#000",
//                         }}
//                       />
//                       <canvas ref={canvasRef} style={{ display: "none" }} />

//                       <div
//                         style={{
//                           marginTop: 10,
//                           display: "flex",
//                           gap: "10px",
//                           justifyContent: "center",
//                         }}
//                       >
//                         <button className="btn" onClick={capturePhoto}>
//                           📸 Extract
//                         </button>
//                         <button className="btn secondary" onClick={stopCamera}>
//                           Stop Scan
//                         </button>
//                       </div>

//                       {capturedPreview && (
//                         <div style={{ marginTop: 12 }}>
//                           <p>Captured Image:</p>
//                           <img
//                             src={capturedPreview}
//                             alt="Captured"
//                             style={{
//                               width: "100%",
//                               maxWidth: "500px",
//                               border: "1px solid #ddd",
//                               borderRadius: "6px",
//                             }}
//                           />
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* QR Scanner */}
//             <div style={{ marginTop: 16 }}>
//               <QRScanner onResult={onQRResult} />
//             </div>
//           </>
//         )}

//         {msg && (
//           <div
//             className={`notice ${msg.includes("fail") ? "error" : "success"}`}
//           >
//             {msg}
//           </div>
//         )}

//         {/* Editable form */}
//         {formData && (
//           <div className="row" style={{ marginTop: 16 }}>
//             <div className="col-12">
//               <h3 style={{ color: "var(--brand)" }}>Review & Edit</h3>
//             </div>
//             {[
//               ["Name", "name"],
//               ["Designation", "designation"],
//               ["Company", "company"],
//               ["Number", "number"],
//               ["Email", "email"],
//               ["Website", "site"],
//             ].map(([label, key]) => (
//               <div className="col-6" key={key}>
//                 <label>
//                   {label}
//                   <input
//                     className="input"
//                     value={formData[key] || ""}
//                     onChange={(e) =>
//                       setFormData({ ...formData, [key]: e.target.value })
//                     }
//                   />
//                 </label>
//               </div>
//             ))}
//             <div className="col-12">
//               <label>
//                 Address
//                 <textarea
//                   className="input"
//                   rows="3"
//                   value={formData.address || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, address: e.target.value })
//                   }
//                 />
//               </label>
//             </div>
//             <div className="col-12 actions">
//               <button className="btn" onClick={handleSave}>
//                 Save
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Raw OCR */}
//         {result?.raw && (
//           <div style={{ marginTop: 16 }}>
//             <h4>Raw Output</h4>
//             <textarea className="input" readOnly rows="6" value={result.raw} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// import { useEffect, useRef, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { api } from "../utils/api";
// import QRScanner from "../components/QRScanner";
// import Tesseract from "tesseract.js";

// // --- Helper to extract fields from OCR text ---
// function extractFields(text) {
//   const fields = { name: "", designation: "", company: "", number: "", email: "", site: "", address: "" };
//   const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

//   // email
//   const e = lines.find(l => l.includes("@") && l.includes("."));
//   if (e) fields.email = e;

//   // phone
//   for (const l of lines) {
//     const digits = (l.match(/\d/g) || []).length;
//     if (!fields.number && digits >= 8) {
//       fields.number = l;
//       break;
//     }
//   }

//   // site
//   const s = lines.find(l => /www\.|http/i.test(l));
//   if (s) fields.site = s;

//   // designation
//   const desigK = ["director","manager","ceo","cto","cfo","founder","engineer","marketing","owner","sales","lead","consultant"];
//   const d = lines.find(l => desigK.some(k => l.toLowerCase().includes(k)));
//   if (d) fields.designation = d;

//   // company (all caps)
//   const c = lines.find(l => l === l.toUpperCase() && !l.includes("@") && !/www\.|http/i.test(l) && l.length > 2);
//   if (c) fields.company = c;

//   // name
//   const n = lines.find(l => {
//     if (l === fields.company || l === fields.designation) return false;
//     if (/@|www\.|http/.test(l)) return false;
//     const parts = l.split(/\s+/);
//     return parts.length === 2 && parts.every(p => /^[A-Z][a-zA-Z]+$/.test(p));
//   });
//   if (n) fields.name = n;

//   // address
//   const rev = [...lines].reverse();
//   const a = rev.find(l => l.length > 12 && /[,0-9]/.test(l) && !/@|www\.|http/.test(l));
//   if (a) fields.address = a;

//   return fields;
// }

// export default function Home() {
//   const { token, role } = useAuth();
//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState("");
//   const [selectedType, setSelectedType] = useState("");

//   const [file, setFile] = useState(null);
//   const [result, setResult] = useState(null);
//   const [formData, setFormData] = useState(null);
//   const [msg, setMsg] = useState("");

//   // camera refs
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [streaming, setStreaming] = useState(false);
//   const [capturedPreview, setCapturedPreview] = useState(null);

//   // ---- Fetch Events on Mount ----
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const data = await api("/api/events", { token }); 
//         setEvents(Array.isArray(data) ? data : data.events || []);
//       } catch (e) {
//         console.error("Failed to fetch events:", e);
//       }
//     };
//     fetchEvents();
//   }, [token]);

//   // ---- OCR ----
//   const handleExtract = async (chosenFile) => {
//     try {
//       setMsg("Extracting text... please wait");

//       const { data: { text } } = await Tesseract.recognize(chosenFile, "eng", {
//         logger: m => console.log(m)
//       });

//       const fields = extractFields(text);
//       setResult({ raw: text, fields });
//       setFormData({ ...fields, event: selectedEvent, type: selectedType });

//       setMsg("✅ OCR extraction complete");
//     } catch (e) {
//       console.error("OCR failed", e);
//       alert("OCR failed: " + e.message);
//     }
//   };

//   // ---- SAVE ----
//   const handleSave = async () => {
//     try {
//       if (!formData) return alert("No data to save");

//       const payload = {
//         ...formData,
//         raw: result?.raw || "",
//         event: selectedEvent,
//         type: selectedType,
//       };

//       await api("/api/ocr/save", {
//         method: "POST",
//         token,
//         body: payload,
//       });

//       setMsg("Saved!");
//       setResult(null);
//       setFormData(null);
//       setFile(null);
//     } catch (e) {
//       setMsg("Save failed: " + e.message, 3500);
//     }
//   };

//   // ---- Camera Controls ----// Start camera (with back camera + high resolution)
// async function startCamera() {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: {
//         width: { ideal: 1920 },
//         height: { ideal: 1080 },
//         facingMode: { ideal: "environment" } // back camera
//       },
//       audio: false
//     });

//     if (videoRef.current) {
//       videoRef.current.srcObject = stream;
//       setStreaming(true);
//     }
//   } catch (err) {
//     alert("Camera access denied: " + err.message);
//   }
// }



//   const stopCamera = () => {
//     if (videoRef.current?.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//     }
//     setStreaming(false);
//     setCapturedPreview(null);
//   };
// // Capture high-resolution photo
// function capturePhoto() {
//   if (!videoRef.current || !canvasRef.current) return;

//   const video = videoRef.current;
//   const canvas = canvasRef.current;

//   // Set canvas to same size as video stream
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;

//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//   // Convert to image
//   const dataUrl = canvas.toDataURL("image/jpeg", 1.0); // quality = 100%
//   setCapturedPreview(dataUrl);

//   // Convert to file for OCR upload
//   fetch(dataUrl)
//     .then((res) => res.blob())
//     .then((blob) => {
//       const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
//       setFile(file);
//     });
// }

//   // ---- Upload handler ----
//   const onSubmitUpload = (e) => {
//     e.preventDefault();
//     if (!file) return alert("Please select an image");
//     handleExtract(file);
//   };

//   // ---- QR RESULT ----
//   const onQRResult = (decodedText) => {
//     let f = {};
//     try {
//       const j = JSON.parse(decodedText);
//       if (j && typeof j === "object") f = j;
//     } catch {}

//     if (/BEGIN:VCARD/i.test(decodedText)) {
//       const lines = decodedText.split(/\r?\n/);
//       lines.forEach((line) => {
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

//   const showMsg = (text, timeout = 2500) => {
//     setMsg(text);
//     setTimeout(() => setMsg(""), timeout);
//   };

//   const readyToUpload = selectedEvent && selectedType;

//   // ---- UI ----
//   return (
//     <div className="container">
//       <div className="card">
//         <h2 style={{ color: "var(--brand)", marginBottom: 10 }}>
//           OCR Business Card Extractor
//         </h2>

//         {/* Selectors */}
//         <div className="row">
//           <div className="col-6">
//             <label>
//               Event
//               <select
//                 value={selectedEvent}
//                 onChange={(e) => setSelectedEvent(e.target.value)}
//               >
//                 <option value="">-- Select --</option>
//                 {Array.isArray(events) &&
//                   events.map((ev) => (
//                     <option key={ev._id} value={ev.name}>
//                       {ev.name}
//                     </option>
//                   ))}
//               </select>
//             </label>
//           </div>
//           <div className="col-6">
//             <label>
//               Type
//               <select
//                 value={selectedType}
//                 onChange={(e) => setSelectedType(e.target.value)}
//               >
//                 <option value="">-- Select --</option>
//                 <option value="Customer">Customer</option>
//                 <option value="Supplier">Supplier</option>
//               </select>
//             </label>
//           </div>
//         </div>

//         {!readyToUpload && (
//           <div className="notice info">
//             Select <b>Event</b> and <b>Type</b> to continue.
//           </div>
//         )}

//         {readyToUpload && (
//           <>
//             <div className="row" style={{ marginTop: 10 }}>
//               {/* Upload */}
//               <div className="col-6">
//                 <form onSubmit={onSubmitUpload}>
//                   <label>
//                     Upload Image
//                     <input
//                       type="file"
//                       className="input"
//                       accept="image/*"
//                       onChange={(e) => setFile(e.target.files?.[0] || null)}
//                     />
//                   </label>
//                   <button className="btn" type="submit">
//                     Extract
//                   </button>
//                 </form>
//               </div>

//               {/* Camera Section */}
//               <div className="col-6">
//                 {streaming ? (
//                   <div style={{ textAlign: "center" }}>
//                     <video
//                       ref={videoRef}
//                       autoPlay
//                       muted
//                       playsInline
//                       style={{
//                         width: "100%",
//                         maxWidth: "500px",
//                         height: "300px",
//                         objectFit: "cover",
//                         borderRadius: "8px",
//                         background: "#000",
//                       }}
//                     />
//                     <canvas ref={canvasRef} style={{ display: "none" }} />

//                     <div
//                       style={{
//                         marginTop: 10,
//                         display: "flex",
//                         gap: "10px",
//                         justifyContent: "center",
//                       }}
//                     >
//                       <button className="btn" onClick={capturePhoto}>
//                         📸 Extract
//                       </button>
//                       <button className="btn secondary" onClick={stopCamera}>
//                         Stop Scan
//                       </button>
//                     </div>

//                     {capturedPreview && (
//                       <div style={{ marginTop: 12 }}>
//                         <p>Captured Image:</p>
//                         <img
//                           src={capturedPreview}
//                           alt="Captured"
//                           style={{
//                             width: "100%",
//                             maxWidth: "500px",
//                             border: "1px solid #ddd",
//                             borderRadius: "6px",
//                           }}
//                         />
//                       </div>
//                     )}

//                     <p style={{ color: "green", marginTop: 8 }}>
//                       ✅ Camera streaming...
//                     </p>
//                   </div>
//                 ) : (
//                   <button className="btn" onClick={startCamera}>
//                     📷 Start Scan
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* QR Scanner */}
//             <div style={{ marginTop: 16 }}>
//               <QRScanner onResult={onQRResult} />
//             </div>
//           </>
//         )}

//         {msg && (
//           <div
//             className={`notice ${msg.includes("fail") ? "error" : "success"}`}
//           >
//             {msg}
//           </div>
//         )}

//         {/* Editable form */}
//         {formData && (
//           <div className="row" style={{ marginTop: 16 }}>
//             <div className="col-12">
//               <h3 style={{ color: "var(--brand)" }}>Review & Edit</h3>
//             </div>
//             {[
//               ["Name", "name"],
//               ["Designation", "designation"],
//               ["Company", "company"],
//               ["Number", "number"],
//               ["Email", "email"],
//               ["Website", "site"],
//             ].map(([label, key]) => (
//               <div className="col-6" key={key}>
//                 <label>
//                   {label}
//                   <input
//                     className="input"
//                     value={formData[key] || ""}
//                     onChange={(e) =>
//                       setFormData({ ...formData, [key]: e.target.value })
//                     }
//                   />
//                 </label>
//               </div>
//             ))}
//             <div className="col-12">
//               <label>
//                 Address
//                 <textarea
//                   className="input"
//                   rows="3"
//                   value={formData.address || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, address: e.target.value })
//                   }
//                 />
//               </label>
//             </div>
//             <div className="col-12 actions">
//               <button className="btn" onClick={handleSave}>
//                 Save
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Raw OCR */}
//         {result?.raw && (
//           <div style={{ marginTop: 16 }}>
//             <h4>Raw Output</h4>
//             <textarea className="input" readOnly rows="6" value={result.raw} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// import { useEffect, useRef, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { api } from "../utils/api";
// import QRScanner from "../components/QRScanner";

// export default function Home() {
//   const { token, role } = useAuth();
//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState("");
//   const [selectedType, setSelectedType] = useState("");

//   const [file, setFile] = useState(null);
//   const [result, setResult] = useState(null);
//   const [formData, setFormData] = useState(null);
//   const [msg, setMsg] = useState("");

//   // camera refs
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [streaming, setStreaming] = useState(false);
//   const [capturedPreview, setCapturedPreview] = useState(null);

//   // ---- EVENTS ----
//   const fetchEvents = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const data = await api("/api/events", { token });
//       setEvents(Array.isArray(data) ? data : data.events || []);
//     } catch (err) {
//       console.error("Fetch error:", err.message);
//       setEvents([]);
//     }
//   };

//   useEffect(() => {
//     fetchEvents();
//     return () => stopCamera();
//   }, []);

//   const addEvent = async () => {
//     const name = prompt("New event name:");
//     if (!name) return;
//     try {
//       await api("/api/events", {
//         method: "POST",
//         body: { name },
//         token,
//       });
//       await fetchEvents();
//       showMsg("Event added.");
//     } catch (e) {
//       alert(e.message);
//     }
//   };

//   const editEvent = async () => {
//     const ev = events.find((e) => e.name === selectedEvent);
//     if (!ev) return alert("No event selected");
//     const newName = prompt("Edit event name:", ev.name);
//     if (!newName) return;

//     try {
//       await api(`/api/events/${ev._id}`, {
//         method: "PUT",
//         body: { name: newName },
//         token,
//       });
//       await fetchEvents();
//       setSelectedEvent(newName);
//       showMsg("Event updated.");
//     } catch (e) {
//       alert(e.message);
//     }
//   };

//   const deleteEvent = async () => {
//     const ev = events.find((e) => e.name === selectedEvent);
//     if (!ev) return alert("No event selected");
//     if (!window.confirm(`Delete event "${ev.name}"?`)) return;

//     try {
//       await api(`/api/events/${ev._id}`, { method: "DELETE", token });
//       await fetchEvents();
//       setSelectedEvent("");
//       showMsg("Event deleted.");
//     } catch (e) {
//       alert(e.message);
//     }
//   };

//   // ---- IMAGE COMPRESSION ----
//   async function compressImage(file, maxWidth = 1000, quality = 0.7) {
//     return new Promise((resolve) => {
//       const img = new Image();
//       const reader = new FileReader();

//       reader.onload = (e) => {
//         img.src = e.target.result;
//       };
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         const scale = Math.min(1, maxWidth / img.width);
//         canvas.width = img.width * scale;
//         canvas.height = img.height * scale;

//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

//         canvas.toBlob(
//           (blob) => {
//             resolve(new File([blob], "compressed.jpg", { type: "image/jpeg" }));
//           },
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
//     try {
//       let stream;
//       try {
//         stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             facingMode: { ideal: "environment" },
//             width: { ideal: 1280 },
//             height: { ideal: 720 },
//           },
//           audio: false,
//         });
//       } catch {
//         stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       }

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.muted = true;
//         videoRef.current.setAttribute("playsInline", true);

//         videoRef.current.onloadedmetadata = async () => {
//           try {
//             await videoRef.current.play();
//             setStreaming(true);
//           } catch (err) {
//             console.error("Video play error:", err);
//           }
//         };
//       }
//     } catch (err) {
//       alert(`Camera error: ${err.message}`);
//     }
//   };

//   const stopCamera = () => {
//     const v = videoRef.current;
//     if (v && v.srcObject) {
//       v.srcObject.getTracks().forEach((t) => t.stop());
//       v.srcObject = null;
//     }
//     setStreaming(false);
//   };

//   const capturePhoto = async () => {
//     const v = videoRef.current,
//       c = canvasRef.current;
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

//       const payload = {
//         ...formData,
//         raw: result?.raw || "",
//         event: selectedEvent,
//         type: selectedType,
//       };

//       await api("/api/ocr/save", {
//         method: "POST",
//         token,
//         body: payload,
//       });

//       showMsg("Saved!");
//       setResult(null);
//       setFormData(null);
//       setFile(null);
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
//       const lines = decodedText.split(/\r?\n/);
//       lines.forEach((line) => {
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

//   const showMsg = (text, timeout = 2500) => {
//     setMsg(text);
//     setTimeout(() => setMsg(""), timeout);
//   };

//   const readyToUpload = selectedEvent && selectedType;

//   // ---- UI ----
//   return (
//     <div className="container">
//       <div className="card">
//         <h2 style={{ color: "var(--brand)", marginBottom: 10 }}>
//           OCR Business Card Extractor
//         </h2>

//         {/* Selectors */}
//         <div className="row">
//           <div className="col-6">
//             <label>
//               Event
//               <select
//                 value={selectedEvent}
//                 onChange={(e) => setSelectedEvent(e.target.value)}
//               >
//                 <option value="">-- Select --</option>
//                 {Array.isArray(events) &&
//                   events.map((ev) => (
//                     <option key={ev._id} value={ev.name}>
//                       {ev.name}
//                     </option>
//                   ))}
//               </select>
//             </label>
//           </div>
//           <div className="col-6">
//             <label>
//               Type
//               <select
//                 value={selectedType}
//                 onChange={(e) => setSelectedType(e.target.value)}
//               >
//                 <option value="">-- Select --</option>
//                 <option value="Customer">Customer</option>
//                 <option value="Supplier">Supplier</option>
//               </select>
//             </label>
//           </div>
//         </div>

//         {/* Admin Controls */}
//         {role === "admin" && (
//           <div className="actions" style={{ marginTop: 6 }}>
//             <button className="btn success" onClick={addEvent}>
//               + Add Event
//             </button>
//             {selectedEvent && (
//               <>
//                 <button className="btn" onClick={editEvent}>
//                   ✏️ Edit
//                 </button>
//                 <button className="btn danger" onClick={deleteEvent}>
//                   🗑 Delete
//                 </button>
//               </>
//             )}
//           </div>
//         )}

//         {!readyToUpload && (
//           <div className="notice info">
//             Select <b>Event</b> and <b>Type</b> to continue.
//           </div>
//         )}

//         {readyToUpload && (
//           <>
//             <div className="row" style={{ marginTop: 10 }}>
//               {/* Upload */}
//               <div className="col-6">
//                 <form onSubmit={onSubmitUpload}>
//                   <label>
//                     Upload Image
//                     <input
//                       type="file"
//                       className="input"
//                       accept="image/*"
//                       onChange={(e) => setFile(e.target.files?.[0] || null)}
//                     />
//                   </label>
//                   <button className="btn" type="submit">
//                     Extract
//                   </button>
//                 </form>
//               </div>

//               {/* Camera Section */}
//               <div className="col-6">
//                 <div className="camera-box" style={{ marginTop: 10 }}>
//                   {!streaming ? (
//                     <button className="btn" onClick={startCamera}>
//                       📷 Start Scan
//                     </button>
//                   ) : (
//                     <div style={{ textAlign: "center" }}>
//                       <video
//                         ref={videoRef}
//                         autoPlay
//                         playsInline
//                         muted
//                         style={{
//                           width: "100%",
//                           maxWidth: "500px",
//                           height: "300px",
//                           objectFit: "cover",
//                           borderRadius: "8px",
//                           background: "#000",
//                         }}
//                       />
//                       <canvas ref={canvasRef} style={{ display: "none" }} />

//                       <div
//                         style={{
//                           marginTop: 10,
//                           display: "flex",
//                           gap: "10px",
//                           justifyContent: "center",
//                         }}
//                       >
//                         <button className="btn" onClick={capturePhoto}>
//                           📸 Extract
//                         </button>
//                         <button className="btn secondary" onClick={stopCamera}>
//                           Stop Scan
//                         </button>
//                       </div>

//                       {capturedPreview && (
//                         <div style={{ marginTop: 12 }}>
//                           <p>Captured Image:</p>
//                           <img
//                             src={capturedPreview}
//                             alt="Captured"
//                             style={{
//                               width: "100%",
//                               maxWidth: "500px",
//                               border: "1px solid #ddd",
//                               borderRadius: "6px",
//                             }}
//                           />
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* QR Scanner */}
//             <div style={{ marginTop: 16 }}>
//               <QRScanner onResult={onQRResult} />
//             </div>
//           </>
//         )}

//         {msg && (
//           <div
//             className={`notice ${msg.includes("fail") ? "error" : "success"}`}
//           >
//             {msg}
//           </div>
//         )}

//         {/* Editable form */}
//         {formData && (
//           <div className="row" style={{ marginTop: 16 }}>
//             <div className="col-12">
//               <h3 style={{ color: "var(--brand)" }}>Review & Edit</h3>
//             </div>
//             {[
//               ["Name", "name"],
//               ["Designation", "designation"],
//               ["Company", "company"],
//               ["Number", "number"],
//               ["Email", "email"],
//               ["Website", "site"],
//             ].map(([label, key]) => (
//               <div className="col-6" key={key}>
//                 <label>
//                   {label}
//                   <input
//                     className="input"
//                     value={formData[key] || ""}
//                     onChange={(e) =>
//                       setFormData({ ...formData, [key]: e.target.value })
//                     }
//                   />
//                 </label>
//               </div>
//             ))}
//             <div className="col-12">
//               <label>
//                 Address
//                 <textarea
//                   className="input"
//                   rows="3"
//                   value={formData.address || ""}
//                   onChange={(e) =>
//                     setFormData({ ...formData, address: e.target.value })
//                   }
//                 />
//               </label>
//             </div>
//             <div className="col-12 actions">
//               <button className="btn" onClick={handleSave}>
//                 Save
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Raw OCR */}
//         {result?.raw && (
//           <div style={{ marginTop: 16 }}>
//             <h4>Raw Output</h4>
//             <textarea className="input" readOnly rows="6" value={result.raw} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { api } from "../utils/api";
// import QRScanner from "../components/QRScanner";
// import OCRScanner from "../components/OCRScanner";

// export default function Home() {
//   const { token, role } = useAuth();
//   const [events, setEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState("");
//   const [selectedType, setSelectedType] = useState("");
//   const [formData, setFormData] = useState({});
//   const [msg, setMsg] = useState("");

//   // ✅ Fetch events with proper response handling
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const res = await api.get("/events", { headers: { Authorization: `Bearer ${token}` } });

//         // Check if backend sends { events: [...] } or just [...]
//         if (Array.isArray(res.data)) {
//           setEvents(res.data);
//         } else {
//           setEvents(res.data.events || []);
//         }
//       } catch (err) {
//         console.error("Error fetching events:", err);
//       }
//     };
//     fetchEvents();
//   }, [token]);

//   // ✅ Handle save
//   const handleSave = async () => {
//     try {
//       const res = await api.post(
//         "/ocr/save", // match your backend route
//         { ...formData, event: selectedEvent, type: selectedType },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setMsg("✅ Saved successfully!");
//       console.log("Saved:", res.data);
//     } catch (err) {
//       console.error("Save failed:", err);
//       setMsg("❌ Save failed");
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <h2 className="text-2xl font-bold">Event Management + OCR</h2>

//       {/* Event + Type selection */}
//       <div className="flex gap-4">
//         <select
//           value={selectedEvent}
//           onChange={(e) => setSelectedEvent(e.target.value)}
//           className="border p-2 rounded"
//         >
//           <option value="">Select Event</option>
//           {events.map((ev) => (
//             <option key={ev._id} value={ev._id}>
//               {ev.name}
//             </option>
//           ))}
//         </select>
//         <select
//           value={selectedType}
//           onChange={(e) => setSelectedType(e.target.value)}
//           className="border p-2 rounded"
//         >
//           <option value="">Select Type</option>
//           <option value="attendee">Attendee</option>
//           <option value="speaker">Speaker</option>
//         </select>
//       </div>

//       {/* OCR Scanner */}
//       <OCRScanner
//         onResult={(data) => {
//           setFormData({ ...data.fields, event: selectedEvent, type: selectedType });
//           setMsg("✅ OCR extraction complete");
//         }}
//       />

//       {/* QR Scanner with back camera */}
//       <QRScanner
//         constraints={{ facingMode: "environment" }} // ✅ Back camera
//         onScan={(qrData) => setFormData({ ...formData, qr: qrData })}
//       />

//       {/* Editable form */}
//       <div className="space-y-2">
//         <input
//           placeholder="Name"
//           value={formData.name || ""}
//           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//           className="border p-2 rounded w-full"
//         />
//         <input
//           placeholder="Designation"
//           value={formData.designation || ""}
//           onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//           className="border p-2 rounded w-full"
//         />
//         <input
//           placeholder="Company"
//           value={formData.company || ""}
//           onChange={(e) => setFormData({ ...formData, company: e.target.value })}
//           className="border p-2 rounded w-full"
//         />
//         <input
//           placeholder="Email"
//           value={formData.email || ""}
//           onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//           className="border p-2 rounded w-full"
//         />
//         <input
//           placeholder="Phone"
//           value={formData.number || ""} // ✅ backend expects "number"
//           onChange={(e) => setFormData({ ...formData, number: e.target.value })}
//           className="border p-2 rounded w-full"
//         />
//       </div>

//       <button
//         onClick={handleSave}
//         className="px-4 py-2 bg-blue-600 text-white rounded"
//       >
//         Save to DB
//       </button>

//       {msg && <p className="mt-2 text-sm">{msg}</p>}
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import OCRScanner from "../components/OCRScanner";

export default function Home() {
  const { token, role } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const fetchEvents = async () => {
    try {
      const data = await api("/api/events", { token });
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (err) {
      console.error("Fetch error:", err.message);
      setEvents([]);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const addEvent = async () => {
    const name = prompt("New event name:");
    if (!name) return;
    await api("/api/events", { method: "POST", body: { name }, token });
    await fetchEvents();
  };

  const editEvent = async () => {
    const ev = events.find((e) => e._id === selectedEvent);
    if (!ev) return alert("No event selected");
    const newName = prompt("Edit event name:", ev.name);
    if (!newName) return;
    await api(`/api/events/${ev._id}`, { method: "PUT", body: { name: newName }, token });
    await fetchEvents();
    setSelectedEvent(ev._id);
  };

  const deleteEvent = async () => {
    const ev = events.find((e) => e._id === selectedEvent);
    if (!ev) return alert("No event selected");
    if (!window.confirm(`Delete event "${ev.name}"?`)) return;
    await api(`/api/events/${ev._id}`, { method: "DELETE", token });
    await fetchEvents();
    setSelectedEvent("");
  };

  const readyToUpload = selectedEvent && selectedType;

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ color: "var(--brand)", marginBottom: 10 }}>OCR Business Card Extractor</h2>

        {/* Selectors */}
        <div className="row">
          <div className="col-6">
            <label>
              Event
              <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
                <option value="">-- Select --</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>{ev.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="col-6">
            <label>
              Type
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="">-- Select --</option>
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
              </select>
            </label>
          </div>
        </div>

        {/* Admin controls */}
        {role === "admin" && (
          <div className="actions" style={{ marginTop: 6 }}>
            <button className="btn success" onClick={addEvent}>+ Add Event</button>
            {selectedEvent && (
              <>
                <button className="btn" onClick={editEvent}>✏️ Edit</button>
                <button className="btn danger" onClick={deleteEvent}>🗑 Delete</button>
              </>
            )}
          </div>
        )}

        {!readyToUpload && <div className="notice info">Select <b>Event</b> and <b>Type</b> to continue.</div>}

        {readyToUpload && (
          <OCRScanner
            selectedEvent={selectedEvent}
            selectedType={selectedType}
            onSaved={() => console.log("OCR data saved")}
          />
        )}
      </div>
    </div>
  );
}
