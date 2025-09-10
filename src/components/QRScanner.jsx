import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onResult }) {
  const qrDivId = "qr-reader";
  const qrRef = useRef(null);
  const [scanning, setScanning] = useState(false);

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
        { fps: 10, qrbox: 250 },
        (text) => {
          onResult(text);
          stop();
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
    <div>
      {!scanning ? (
        <button className="btn" onClick={start}>📷 Scan QR</button>
      ) : (
        <button className="btn secondary" onClick={stop}>Stop Scan</button>
      )}
      <div id={qrDivId} style={{ width: 200, height: 100, marginTop: 10, background: "#fff" }} />
    </div>
  );
}
