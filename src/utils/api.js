

const BASE_URL ="https://bcr-fullstack.onrender.com";




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

  const res = await fetch(`${BASE_URL}${url}`, opts);  // 👈 always call backend
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || res.statusText);
  }

  return data;
}
