const API_BASE = "http://127.0.0.1:8000/api/v1";

const getHeaders = () => {
  const token = localStorage.getItem("med_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Check if backend FastAPI server is online
 */
export async function fetchHealthStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch 131 clinical symptoms catalog from SQL Server / ML
 */
export async function fetchSymptoms() {
  const res = await fetch(`${API_BASE}/assessments/symptoms/list`);
  if (!res.ok) throw new Error("Failed to load symptom list from server");
  const data = await res.json();
  return data.symptoms || [];
}

/**
 * Submit symptom evaluation to ML model & triage engine
 */
export async function submitAssessment(payload) {
  const res = await fetch(`${API_BASE}/assessments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to submit assessment");
  }
  return res.json();
}

/**
 * Search real-time nearby healthcare facilities & hospitals
 */
export async function fetchNearbyProviders(params) {
  const query = new URLSearchParams({
    lat: params.lat.toString(),
    lon: params.lon.toString(),
    ...(params.specialty ? { specialty: params.specialty } : {}),
    ...(params.urgency ? { urgency: params.urgency } : {}),
    ...(params.radius_km ? { radius_km: params.radius_km.toString() } : {}),
  });

  const res = await fetch(`${API_BASE}/recommendations/nearby?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch nearby care providers");
  return res.json();
}

/**
 * NLP Auto-Extract: Parse patient natural language text (English & Urdu)
 */
export async function parsePatientInput(text) {
  const res = await fetch(`${API_BASE}/nlp/parse-patient-input`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to parse patient input");
  }
  return res.json();
}

/**
 * NLP Parse & Prefill: Parse text and get structured form-ready prefill data
 */
export async function parseAndPrefill(text) {
  const res = await fetch(`${API_BASE}/nlp/parse-and-prefill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to prefill from patient input");
  }
  return res.json();
}

/**
 * Authenticate user login
 */
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid login credentials");
  }
  const data = await res.json();
  localStorage.setItem("med_auth_token", data.access_token);
  return data;
}

/**
 * Register new user
 */
export async function registerUser(email, password, fullName) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
  const data = await res.json();
  localStorage.setItem("med_auth_token", data.access_token);
  return data;
}

/**
 * Fetch user triage history from SQL Server database
 */
export async function fetchAssessmentHistory() {
  const res = await fetch(`${API_BASE}/assessments`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

/**
 * Fetch patient profile (age-band, sex) from SQL Server
 */
export async function fetchPatientProfile() {
  const res = await fetch(`${API_BASE}/patient/profile`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

/**
 * Save updated patient profile (age-band, sex) to SQL Server
 */
export async function updatePatientProfile(profile) {
  const res = await fetch(`${API_BASE}/patient/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

/**
 * Permanently delete all health assessments and PHI records (GDPR Right to Erasure)
 */
export async function deleteAllHealthData() {
  const res = await fetch(`${API_BASE}/patient/data`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to erase records from database");
  return res.json();
}
