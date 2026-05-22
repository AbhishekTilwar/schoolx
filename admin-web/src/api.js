const API = '/api/v1';

export function getToken() {
  return localStorage.getItem('schoolx_token');
}

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export function login(email, password, orgSlug) {
  return api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, orgSlug }),
  });
}
