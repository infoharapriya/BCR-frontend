// api.js
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000";

console.log(import.meta.env.VITE_API_BASE);

export async function api(url, { method = "GET", body, token, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } };

  if (token) {
    opts.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body instanceof FormData) {
    opts.body = body; // don’t set content-type
  } else if (body) {
    opts.body = JSON.stringify(body);
    opts.headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${url}`, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || res.statusText);
  }

  return data;
}
