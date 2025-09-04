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



import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import QRScanner from "../components/QRScanner";

export default function Home() {
  const { token, role } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(null);
  const [msg, setMsg] = useState("");

  // camera refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState(null);

  // ---- EVENTS ----
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await api("/api/events", { token });
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (err) {
      console.error("Fetch error:", err.message);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
    return () => stopCamera();
  }, []);

  const addEvent = async () => {
    const name = prompt("New event name:");
    if (!name) return;
    try {
      await api("/api/events", {
        method: "POST",
        body: { name },
        token,
      });
      await fetchEvents();
      showMsg("Event added.");
    } catch (e) {
      alert(e.message);
    }
  };

  const editEvent = async () => {
    const ev = events.find((e) => e.name === selectedEvent);
    if (!ev) return alert("No event selected");
    const newName = prompt("Edit event name:", ev.name);
    if (!newName) return;

    try {
      await api(`/api/events/${ev._id}`, {
        method: "PUT",
        body: { name: newName },
        token,
      });
      await fetchEvents();
      setSelectedEvent(newName);
      showMsg("Event updated.");
    } catch (e) {
      alert(e.message);
    }
  };

  const deleteEvent = async () => {
    const ev = events.find((e) => e.name === selectedEvent);
    if (!ev) return alert("No event selected");
    if (!window.confirm(`Delete event "${ev.name}"?`)) return;

    try {
      await api(`/api/events/${ev._id}`, { method: "DELETE", token });
      await fetchEvents();
      setSelectedEvent("");
      showMsg("Event deleted.");
    } catch (e) {
      alert(e.message);
    }
  };

  // ---- IMAGE COMPRESSION ----
  async function compressImage(file, maxWidth = 1000, quality = 0.7) {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], "compressed.jpg", { type: "image/jpeg" }));
          },
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // rear camera on mobile
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current
          .play()
          .catch((err) => console.error("Video play blocked:", err));
      }

      setStreaming(true);
      console.log("✅ Camera started");
    } catch (err) {
      console.error("❌ Error accessing camera:", err);
      alert("Camera access denied or not available.");
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

    c.toBlob(async (blob) => {
      if (!blob) return;
      const f = new File([blob], "capture.jpg", { type: "image/jpeg" });
      await handleExtract(f);
    }, "image/jpeg", 0.8);
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

      await api("/api/ocr/save", {
        method: "POST",
        token,
        body: payload,
      });

      showMsg("Saved!");
      setResult(null);
      setFormData(null);
      setFile(null);
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
      const lines = decodedText.split(/\r?\n/);
      lines.forEach((line) => {
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

  const showMsg = (text, timeout = 2500) => {
    setMsg(text);
    setTimeout(() => setMsg(""), timeout);
  };

  const readyToUpload = selectedEvent && selectedType;

  // ---- UI ----
  return (
    <div className="container">
      <div className="card">
        <h2 style={{ color: "var(--brand)", marginBottom: 10 }}>
          OCR Business Card Extractor
        </h2>

        {/* Selectors */}
        <div className="row">
          <div className="col-6">
            <label>
              Event
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="">-- Select --</option>
                {Array.isArray(events) &&
                  events.map((ev) => (
                    <option key={ev._id} value={ev.name}>
                      {ev.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <div className="col-6">
            <label>
              Type
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">-- Select --</option>
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
              </select>
            </label>
          </div>
        </div>

        {/* Admin Controls */}
        {role === "admin" && (
          <div className="actions" style={{ marginTop: 6 }}>
            <button className="btn success" onClick={addEvent}>
              + Add Event
            </button>
            {selectedEvent && (
              <>
                <button className="btn" onClick={editEvent}>
                  ✏️ Edit
                </button>
                <button className="btn danger" onClick={deleteEvent}>
                  🗑 Delete
                </button>
              </>
            )}
          </div>
        )}

        {!readyToUpload && (
          <div className="notice info">
            Select <b>Event</b> and <b>Type</b> to continue.
          </div>
        )}

        {readyToUpload && (
          <>
            <div className="row" style={{ marginTop: 10 }}>
              {/* Upload */}
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

              {/* Camera Section */}
              <div className="col-6">
                {streaming ? (
                  <div style={{ textAlign: "center" }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      style={{
                        width: "100%",
                        maxWidth: "500px",
                        height: "300px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        background: "#000", // fallback
                      }}
                    />
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

                    {/* Debug */}
                    <p style={{ color: "green", marginTop: 8 }}>
                      ✅ Camera streaming...
                    </p>
                  </div>
                ) : (
                  <button className="btn" onClick={startCamera}>
                    📷 Start Scan
                  </button>
                )}
              </div>
            </div>

            {/* QR Scanner */}
            <div style={{ marginTop: 16 }}>
              <QRScanner onResult={onQRResult} />
            </div>
          </>
        )}

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
    </div>
  );
}
