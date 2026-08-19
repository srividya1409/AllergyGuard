// Thin API client wrapping fetch calls to the backend.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const signUp = (name, email, password) =>
  request("/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) });

export const logIn = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const getProfile = (accessToken) =>
  request("/profile", { headers: { Authorization: `Bearer ${accessToken}` } });

export const updateProfile = (accessToken, profile) =>
  request("/profile", {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(profile),
  });

export const scanBarcode = (accessToken, barcode) =>
  request("/scan/barcode", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ barcode }),
  });
