import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function AdminEvents() {
  const { token, role } = useAuth();
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const data = await api("/api/events");
      setEvents(data);
    } catch (e) { setMsg(e.message); }
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const name = prompt("Event name:");
    if (!name) return;
    try {
      await api("/api/events", { method: "POST", body: { name }, token });
      setMsg("Added.");
      load();
    } catch (e) { setMsg(e.message); }
  };
  const edit = async (ev) => {
    const name = prompt("Rename event:", ev.name);
    if (!name) return;
    try {
      await api(`/api/events/${ev._id}`, { method: "PUT", token, body: { name } });
      setMsg("Updated.");
      load();
    } catch (e) { setMsg(e.message); }
  };
  const del = async (id) => {
    if (!window.confirm("Delete event?")) return;
    try {
      await api(`/api/events/${id}`, { method: "DELETE", token });
      setMsg("Deleted.");
      load();
    } catch (e) { setMsg(e.message); }
  };

  if (role !== "admin") return (
    <div className="container"><div className="card">Forbidden</div></div>
  );

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ color: "var(--brand)" }}>Manage Events</h2>
        {msg && <div className="notice success">{msg}</div>}
        <div className="actions" style={{ marginBottom: 12 }}>
          <button className="btn success" onClick={add}>+ Add Event</button>
        </div>
        {events.length === 0 ? (
          <p className="notice info">No events yet.</p>
        ) : (
          <table className="table">
            <thead><tr><th>Name</th><th>Actions</th></tr></thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev._id}>
                  <td>{ev.name}</td>
                  <td className="actions">
                    <button className="btn" onClick={() => edit(ev)}>Rename</button>
                    <button className="btn danger" onClick={() => del(ev._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
