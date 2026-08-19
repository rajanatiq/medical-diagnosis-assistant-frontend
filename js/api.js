/**
 * api.js - Centralized API Service for Medical Assistant
 */

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

const api = {
  getToken() {
    return localStorage.getItem("med_token");
  },

  setToken(token) {
    localStorage.setItem("med_token", token);
  },

  clearToken() {
    localStorage.removeItem("med_token");
    localStorage.removeItem("med_user");
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("med_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    localStorage.setItem("med_user", JSON.stringify(user));
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.detail || data.message || "An unexpected error occurred.";
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${endpoint}]:`, error);
      throw error;
    }
  },

  // Auth endpoints
  async login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },

  async register(email, password, fullName) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName })
    });
  },

  async getMe() {
    return this.request("/auth/me");
  },

  // Symptoms endpoint
  async getSymptoms() {
    return this.request("/symptoms");
  },

  async getSymptomsByCategory() {
    return this.request("/symptoms/by-category");
  },

  // Diagnosis & Assessment
  async runAssessment(symptoms, durationDays = 1, ageBand = "30-39", sex = "Other") {
    return this.request("/assessment/predict", {
      method: "POST",
      body: JSON.stringify({
        symptoms,
        duration_days: durationDays,
        age_band: ageBand,
        sex: sex,
        save_to_history: true
      })
    });
  },

  async getHistory() {
    return this.request("/assessment/history");
  },

  // Real-time Nearby Healthcare
  async getNearbyCare(lat, lon, radiusKm = 15, facilityType = "all", specialty = null) {
    return this.request("/nearby", {
      method: "POST",
      body: JSON.stringify({
        latitude: lat,
        longitude: lon,
        radius_km: radiusKm,
        facility_type: facilityType,
        specialty: specialty
      })
    });
  },

  // Patient profile
  async getProfile() {
    return this.request("/patient/profile");
  },

  async updateProfile(profileData) {
    return this.request("/patient/profile", {
      method: "PUT",
      body: JSON.stringify(profileData)
    });
  }
};
