/**
 * dashboard.js - Home Overview Screen
 */

const dashboardScreen = {
  init() {
    this.bindEvents();
    this.renderUserInfo();
  },

  bindEvents() {
    const checkBtn = document.getElementById("dash-check-symptoms-btn");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => {
        if (window.showScreen) window.showScreen("diagnosis");
      });
    }

    const nearbyBtn = document.getElementById("dash-find-nearby-btn");
    if (nearbyBtn) {
      nearbyBtn.addEventListener("click", () => {
        if (window.showScreen) window.showScreen("nearby");
      });
    }

    const historyBtn = document.getElementById("dash-view-history-btn");
    if (historyBtn) {
      historyBtn.addEventListener("click", () => {
        if (window.showScreen) window.showScreen("history");
      });
    }

    const refreshLocBtn = document.getElementById("dash-refresh-location-btn");
    if (refreshLocBtn) {
      refreshLocBtn.addEventListener("click", async () => {
        await userLocation.fetchCurrentLocation();
        this.renderUserInfo();
      });
    }
  },

  renderUserInfo() {
    const user = api.getCurrentUser();
    const welcomeEl = document.getElementById("dash-welcome-text");
    if (welcomeEl) {
      welcomeEl.innerText = user 
        ? `Welcome back, ${user.full_name || user.email}!` 
        : "Welcome to Your Health Assistant";
    }

    const locTextEl = document.getElementById("dash-location-text");
    if (locTextEl) {
      locTextEl.innerText = userLocation.cityName || "Detecting your location...";
    }
  }
};
