import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function History() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  const fetchData = async () => {
    try {
      const data = await api("/api/ocr/history", { token });
      setRows(data);
    } catch (e) {
      setMsg("Failed to load: " + e.message);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ color: "var(--brand)" }}>Saved Records</h2>
        {msg && <div className={`notice ${msg.includes("fail") ? "error" : "success"}`}>{msg}</div>}
        {rows.length === 0 ? (
          <p className="notice info">No records yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
             <thead>
  <tr>
    <th>Custom ID</th>
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
  {rows.map(r => (
    <tr key={r._id}>
      <td>{r.customId}</td>
      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
      <td>{r.event?.name}</td>
      <td>{r.type}</td>
      <td>{r.name}</td>
      <td>{r.designation}</td>
      <td>{r.company}</td>
      <td>{r.number}</td>
      <td>{r.email}</td>
      <td>{r.site}</td>
      <td>{r.address}</td>
      <td className="actions">
        <Link className="btn" to={`/edit/${r._id}`}>Edit</Link>
        <button className="btn danger" onClick={() => handleDelete(r._id)}>Delete</button>
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
