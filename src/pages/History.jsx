// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { api } from "../utils/api";

// export default function History() {
//   const { token } = useAuth();
//   const [rows, setRows] = useState([]);
//   const [msg, setMsg] = useState("");
//   const [selectedType, setSelectedType] = useState("");
// const [selectedEvent, setSelectedEvent] = useState("");


//   const fetchData = async () => {
//     try {
//       const data = await api("/api/ocr/history", { token });
//       setRows(data);
//     } catch (e) {
//       setMsg("Failed to load: " + e.message);
//     }
//   };

//   useEffect(() => { fetchData(); }, []);

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this record?")) return;
//     try {
//       await api(`/api/ocr/delete/${id}`, { method: "DELETE", token });
//       setMsg("Deleted.");
//       fetchData();
//       setTimeout(() => setMsg(""), 2000);
//     } catch (e) {
//       setMsg(e.message);
//     }
//   };

// const handleExport = () => {
//   const params = new URLSearchParams({
//     type: selectedType || "",
//     event: selectedEvent || "",
//     limit: 50,
//   });
//   window.open(`/api/ocr/export?${params.toString()}`, "_blank");
// };



//   return (
//     <div className="container">
//       <div className="card">
//         <h2 style={{ color: "var(--brand)" }}>Saved Records</h2>
//         {msg && <div className={`notice ${msg.includes("fail") ? "error" : "success"}`}>{msg}</div>}


//        <button className="btn" onClick={handleExport} style={{ marginBottom: "10px" }}>
//     Export to Excel
//   </button>

//         {rows.length === 0 ? (
//           <p className="notice info">No records yet.</p>
//         ) : (
//           <div style={{ overflowX: "auto" }}>
//             <table className="table">
//              <thead>
//   <tr>
//     {/* <th>Custom ID</th> */}
//     <th>Date</th>
//     <th>Event</th>
//     <th>Type</th>
//     <th>Name</th>
//     <th>Designation</th>
//     <th>Company</th>
//     <th>Number</th>
//     <th>Email</th>
//     <th>Website</th>
//     <th>Address</th>
//     <th>Actions</th>
//   </tr>
// </thead>
// <tbody>
//   {rows.map((r, index) => (
//     <tr key={r._id}>
//       {/* <td>{index + 1}</td> Serial number based on backend order */}
//       <td>{new Date(r.createdAt).toLocaleDateString()}</td>
//       <td>{r.event?.name || "—"}</td>
//       <td>{r.type}</td>
//       <td>{r.name}</td>
//       <td>{r.designation}</td>
//       <td>{r.company}</td>
//       <td>{r.number}</td>
//       <td>{r.email}</td>
//       <td>{r.site}</td>
//       <td>{r.address}</td>
//       <td className="actions">
//         <Link className="btn" to={`/edit/${r._id}`}>Edit</Link>
//         <button className="btn danger" onClick={() => handleDelete(r._id)}>Delete</button>
//       </td>
//     </tr>
//   ))}
// </tbody>

// </table>

//           </div>
//         )}
//       </div>
// {/* 
//       <button className="btn" onClick={handleExport}>
//   Export to Excel
// </button> */}

//     </div>
//   );
// }







// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { api } from "../utils/api";

// export default function History() {
//   const { token } = useAuth();
//   const [rows, setRows] = useState([]);
//   const [msg, setMsg] = useState("");
//   const [selectedType, setSelectedType] = useState("");
//   const [selectedEvent, setSelectedEvent] = useState("");
//   const [events, setEvents] = useState([]); // 🔹 event list for dropdown

//   const fetchData = async () => {
//     try {
//       const data = await api("/api/ocr/history", { token });
//       setRows(data);
//     } catch (e) {
//       setMsg("Failed to load: " + e.message);
//     }
//   };

//   const fetchEvents = async () => {
//     try {
//       const data = await api("/api/events", { token });
//       setEvents(data);
//     } catch (e) {
//       console.error("Failed to load events:", e.message);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     fetchEvents();
//   }, []);

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this record?")) return;
//     try {
//       await api(`/api/ocr/delete/${id}`, { method: "DELETE", token });
//       setMsg("Deleted.");
//       fetchData();
//       setTimeout(() => setMsg(""), 2000);
//     } catch (e) {
//       setMsg(e.message);
//     }
//   };

//   const handleExport = () => {
//     const params = new URLSearchParams({
//       type: selectedType || "",
//       event: selectedEvent || "",
//       limit: 50,
//     });
//     window.open(`/api/ocr/export?${params.toString()}`, "_blank");
//   };

//   return (
//     <div className="container">
//       <div className="card">
//         <h2 style={{ color: "var(--brand)" }}>Saved Records</h2>
//         {msg && (
//           <div className={`notice ${msg.includes("fail") ? "error" : "success"}`}>
//             {msg}
//           </div>
//         )}

//         {/* 🔹 Filters + Export */}
//         <div style={{ marginBottom: "12px", display: "flex", gap: "10px" }}>
//           <select
//             value={selectedType}
//             onChange={(e) => setSelectedType(e.target.value)}
//             className="input"
//           >
//             <option value="">All Types</option>
//             <option value="Customer">Customer</option>
//             <option value="Supplier">Supplier</option>
//           </select>

//           <select
//             value={selectedEvent}
//             onChange={(e) => setSelectedEvent(e.target.value)}
//             className="input"
//           >
//             <option value="">All Events</option>
//             {events.map((ev) => (
//               <option key={ev._id} value={ev._id}>
//                 {ev.name}
//               </option>
//             ))}
//           </select>

//           <button className="btn" onClick={handleExport}>
//             Export to Excel
//           </button>
//         </div>

//         {rows.length === 0 ? (
//           <p className="notice info">No records yet.</p>
//         ) : (
//           <div style={{ overflowX: "auto" }}>
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Event</th>
//                   <th>Type</th>
//                   <th>Name</th>
//                   <th>Designation</th>
//                   <th>Company</th>
//                   <th>Number</th>
//                   <th>Email</th>
//                   <th>Website</th>
//                   <th>Address</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {rows.map((r) => (
//                   <tr key={r._id}>
//                     <td>{new Date(r.createdAt).toLocaleDateString()}</td>
//                     <td>{r.event?.name || "—"}</td>
//                     <td>{r.type}</td>
//                     <td>{r.name}</td>
//                     <td>{r.designation}</td>
//                     <td>{r.company}</td>
//                     <td>{r.number}</td>
//                     <td>{r.email}</td>
//                     <td>{r.site}</td>
//                     <td>{r.address}</td>
//                     <td className="actions">
//                       <Link className="btn" to={`/edit/${r._id}`}>
//                         Edit
//                       </Link>
//                       <button
//                         className="btn danger"
//                         onClick={() => handleDelete(r._id)}
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


//08/09/2025

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function History() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState([]); // 🔹 event list for dropdown

  // 🔹 Fetch history with filters
  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        type: selectedType || "",
        event: selectedEvent || "",
        limit: 50,
      });

      const data = await api(`/api/ocr/history?${params.toString()}`, { token });
      setRows(data);
    } catch (e) {
      setMsg("Failed to load: " + e.message);
    }
  };

  // 🔹 Fetch events for filter dropdown
  const fetchEvents = async () => {
    try {
      const data = await api("/api/events", { token });
      setEvents(data);
    } catch (e) {
      console.error("Failed to load events:", e.message);
    }
  };

  // 🔹 Initial + re-fetch when filters change
  useEffect(() => {
    fetchData();
  }, [selectedType, selectedEvent]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api(`/api/ocr/delete/${id}`, { method: "DELETE", token });
      setMsg("Deleted.");
      fetchData();
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg(e.message);
    }
  };


  //08/09/2025

 const handleExport = async () => {
  try {
    const res = await fetch("https://bcr-fullstack.onrender.com/api/ocr/export", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ send token from AuthContext
      },
    });

    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ocr_records.xlsx"; // ✅ auto download
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error(err);
    alert("Failed to export Excel: " + err.message);
  }
};


  return (
    <div className="container">
      <div className="card">
        <h2 style={{ color: "var(--brand)" }}>Saved Records</h2>
        {msg && (
          <div className={`notice ${msg.includes("fail") ? "error" : "success"}`}>
            {msg}
          </div>
        )}

        {/* 🔹 Filters + Export */}
        <div style={{ marginBottom: "12px", display: "flex", gap: "10px" }}>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input"
          >
            <option value="">All Types</option>
            <option value="Customer">Customer</option>
            <option value="Supplier">Supplier</option>
          </select>

          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="input"
          >
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.name}
              </option>
            ))}
          </select>

          <button className="btn" onClick={handleExport}>
            Export to Excel
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="notice info">No records yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Company</th>
                  <th>Number</th>
                  <th>Email</th>
                  <th>Website</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>{r.event?.name || "—"}</td>
                    <td>{r.type}</td>
                    <td>{r.name}</td>
                    <td>{r.designation}</td>
                    <td>{r.company}</td>
                    <td>{r.number}</td>
                    <td>{r.email}</td>
                    <td>{r.site}</td>
                    <td>{r.address}</td>
                    <td className="actions">
                      <Link className="btn" to={`/edit/${r._id}`}>
                        Edit
                      </Link>
                      <button
                        className="btn danger"
                        onClick={() => handleDelete(r._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
