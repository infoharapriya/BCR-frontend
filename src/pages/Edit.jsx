import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function Edit() {
  const { id } = useParams();
  const { token } = useAuth();
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const load = async () => {
  try {
    console.log("Fetching record for id:", id);
    const data = await api(`/api/ocr/${id}`, { token });   // 👈 fixed
    console.log("Data received:", data);
    setForm(data);
  } catch (e) {
    console.error("Error while loading:", e);
    setMsg("Failed to load record: " + e.message);
    setForm({});
  }
};

const save = async () => {
  try {
    await api(`/api/ocr/update/${id}`, {   // 👈 fixed
      method: "PUT",
      token,
      body: form
    });
    setMsg("Updated.");
    setTimeout(() => { setMsg(""); navigate("/history"); }, 1200);
  } catch (e) {
    setMsg(e.message);
  }
};

 useEffect(() => { load(); }, [id]);
  if (!form) return (
    <div className="container"><div className="card">Loading...</div></div>
  );

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ color: "var(--brand)" }}>Edit Record</h2>
        {msg && <div className={`notice ${msg.includes("fail") ? "error" : "success"}`}>{msg}</div>}
        <div className="row">
          <div className="col-6"><label>Event<input className="input" value={form.event || ""} onChange={e => setForm({ ...form, event: e.target.value })} /></label></div>
          <div className="col-6"><label>Type<input className="input" value={form.type || ""} onChange={e => setForm({ ...form, type: e.target.value })} /></label></div>
          <div className="col-6"><label>Name<input className="input" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} /></label></div>
          <div className="col-6"><label>Designation<input className="input" value={form.designation || ""} onChange={e => setForm({ ...form, designation: e.target.value })} /></label></div>
          <div className="col-6"><label>Company<input className="input" value={form.company || ""} onChange={e => setForm({ ...form, company: e.target.value })} /></label></div>
          <div className="col-6"><label>Number<input className="input" value={form.number || ""} onChange={e => setForm({ ...form, number: e.target.value })} /></label></div>
          <div className="col-6"><label>Email<input className="input" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} /></label></div>
          <div className="col-6"><label>Website<input className="input" value={form.site || ""} onChange={e => setForm({ ...form, site: e.target.value })} /></label></div>
          <div className="col-12"><label>Address<textarea className="input" rows="3" value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} /></label></div>
          <div className="col-12"><label>Raw Text<textarea className="input" rows="3" value={form.raw || ""} onChange={e => setForm({ ...form, raw: e.target.value })} /></label></div>
        </div>
        <div className="actions"><button className="btn" onClick={save}>Save</button></div>
      </div>
    </div>
  );
}
