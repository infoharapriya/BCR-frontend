// import { useEffect, useRef, useState } from "react";
// import { Html5Qrcode } from "html5-qrcode";
// import '../css/loading.css'

// export default function QRScanner({ onResult }) {
//   const qrDivId = "qr-reader";
//   const qrRef = useRef(null);
//   const [scanning, setScanning] = useState(false);

//   useEffect(() => {
//     return () => {
//       if (qrRef.current) {
//         qrRef.current.stop().then(() => qrRef.current.clear());
//       }
//     };
//   }, []);

//   const start = async () => {
//     if (qrRef.current) return;
//     const qr = new Html5Qrcode(qrDivId);
//     qrRef.current = qr;
//     try {
//       await qr.start(
//         { facingMode: "environment" },
//          { fps: 10, qrbox: { width: 350, height: 350 } },
//          //10/09/2025
//          (decodedText) => {
//     onResult(decodedText);
//           // onResult(text)
//           // stop()
//       },
//         () => {}
//       );
//       setScanning(true);
//     } catch (e) {
//       alert("Camera permission denied or unavailable.");
//     }
//   };

//   const stop = async () => {
//     if (!qrRef.current) return;
//     try {
//       await qrRef.current.stop();
//       await qrRef.current.clear();
//     } catch {}
//     qrRef.current = null;
//     setScanning(false);
//   };

//   return (
//     <div>
//       {!scanning ? (
//         <button className="btn" onClick={start}>📷 Scan QR</button>
//       ) : (
//         <button className="btn secondary" onClick={stop}>Stop Scan</button>
//       )}
//       <div id={qrDivId} style={{ width: 300, height: 300, marginTop: 5, background: "#fff" }} />
//     </div>
//   );
// }



//10/9/2025

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import '../css/loading.css'


export default function QRScanner({ onResult }) {
  const qrDivId = "qr-reader";
  const qrRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ for overlay

  useEffect(() => {
    return () => {
      if (qrRef.current) {
        qrRef.current.stop().then(() => qrRef.current.clear());
      }
    };
  }, []);

  const start = async () => {
    if (qrRef.current) return;
    const qr = new Html5Qrcode(qrDivId);
    qrRef.current = qr;
    try {
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 350, height: 350 } },
        async (decodedText) => {
          setLoading(true); // ✅ show loader when something scanned
          try {
            await onResult(decodedText); // pass result to parent
          } finally {
            setLoading(false); // ✅ hide loader after processing
            stop(); // stop scanner automatically (optional)
          }
        },
        () => {}
      );
      setScanning(true);
    } catch (e) {
      alert("Camera permission denied or unavailable.");
    }
  };

  const stop = async () => {
    if (!qrRef.current) return;
    try {
      await qrRef.current.stop();
      await qrRef.current.clear();
    } catch {}
    qrRef.current = null;
    setScanning(false);
  };

  return (
    <div style={{ position: "relative" }}>
      {!scanning ? (
        <button className="btn" onClick={start}>📷 Scan QR</button>
      ) : (
        <button className="btn secondary" onClick={stop}>Stop Scan</button>
      )}
      <div
        id={qrDivId}
        style={{
          width: 300,
          height: 300,
          marginTop: 5,
          background: "#fff"
        }}
      />

      {/* ✅ Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Scanning QR in Process</p>
        </div>
      )}
    </div>
  );
}
