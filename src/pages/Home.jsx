

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
