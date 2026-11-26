const BASE = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, options);
  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export function createAnalysis({ text, file }) {
  if (file) {
    const body = new FormData();
    body.append("file", file);
    return request("/analyses", { method: "POST", body });
  }
  return request("/analyses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

export function listAnalyses() {
  return request("/analyses");
}

export function getAnalysis(id) {
  return request(`/analyses/${encodeURIComponent(id)}`);
}

export function deleteAnalysis(id) {
  return request(`/analyses/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function markdownUrl(id) {
  return `${BASE}/analyses/${encodeURIComponent(id)}/export.md`;
}
