/**
 * profile.js - Patient Health Profile Screen
 */

const profileScreen = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    const form = document.getElementById("patient-profile-form");
    if (form) {
      form.addEventListener("submit", (e) => this.handleSaveProfile(e));
    }
  },

  async loadProfile() {
    const user = api.getCurrentUser();
    const anonBanner = document.getElementById("profile-anon-banner");
    const formContainer = document.getElementById("profile-form-container");

    if (!user) {
      if (anonBanner) anonBanner.classList.remove("hidden");
      if (formContainer) formContainer.classList.add("hidden");
      return;
    }

    if (anonBanner) anonBanner.classList.add("hidden");
    if (formContainer) formContainer.classList.remove("hidden");

    try {
      const data = await api.getProfile();
      if (data) {
        document.getElementById("profile-age-band").value = data.age_band || "30-39";
        document.getElementById("profile-sex").value = data.sex || "Other";
        document.getElementById("profile-allergies").value = data.allergies || "";
        document.getElementById("profile-medications").value = data.current_medications || "";
        document.getElementById("profile-history").value = data.medical_history || "";
      }
    } catch (err) {
      console.warn("Could not load profile:", err);
    }
  },

  async handleSaveProfile(e) {
    e.preventDefault();
    const saveBtn = document.getElementById("save-profile-btn");

    const payload = {
      age_band: document.getElementById("profile-age-band").value,
      sex: document.getElementById("profile-sex").value,
      allergies: document.getElementById("profile-allergies").value.trim(),
      current_medications: document.getElementById("profile-medications").value.trim(),
      medical_history: document.getElementById("profile-history").value.trim()
    };

    try {
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Saving...`;
        if (window.lucide) window.lucide.createIcons();
      }

      await api.updateProfile(payload);
      window.showToast("Health profile updated successfully!", "success");
    } catch (err) {
      window.showToast(err.message || "Failed to update profile.", "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i data-lucide="save"></i> <span>Save Profile</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }
};
