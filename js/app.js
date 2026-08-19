/**
 * app.js - Main Application Orchestrator & Screen Navigator
 */

// Toast notification helper
window.showToast = function(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  const iconName = type === "success" ? "check-circle" : (type === "error" ? "alert-circle" : (type === "warning" ? "alert-triangle" : "info"));
  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Global screen switcher
window.showScreen = function(screenName) {
  // Hide all screens
  document.querySelectorAll(".screen-view").forEach(el => el.classList.add("hidden"));

  // Show target screen
  const targetScreen = document.getElementById(`screen-${screenName}`);
  if (targetScreen) {
    targetScreen.classList.remove("hidden");
  }

  // Update navigation button active state
  document.querySelectorAll(".nav-link-btn").forEach(btn => {
    if (btn.dataset.screen === screenName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Call screen lifecycle hook
  if (screenName === "dashboard" && window.dashboardScreen) {
    window.dashboardScreen.renderUserInfo();
  } else if (screenName === "diagnosis" && window.diagnosisScreen) {
    // If not loaded, reload
    if (diagnosisScreen.allSymptoms.length === 0) {
      diagnosisScreen.loadSymptoms();
    }
  } else if (screenName === "nearby" && window.nearbyScreen) {
    if (!nearbyScreen.map) {
      setTimeout(() => nearbyScreen.initMap(), 100);
    }
    nearbyScreen.loadNearbyCare();
  } else if (screenName === "history" && window.historyScreen) {
    historyScreen.loadHistory();
  } else if (screenName === "profile" && window.profileScreen) {
    profileScreen.loadProfile();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
};

// App Initialization
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Initializing Medical Assistant Application...");

  // 1. Initialize Lucide Icons
  if (window.lucide) window.lucide.createIcons();

  // 2. Setup Screen Navigation Buttons
  document.querySelectorAll(".nav-link-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const screenName = btn.dataset.screen;
      if (screenName) window.showScreen(screenName);
    });
  });

  // Brand click goes to dashboard
  const brandLogo = document.getElementById("nav-brand-logo");
  if (brandLogo) {
    brandLogo.addEventListener("click", () => window.showScreen("dashboard"));
  }

  // 3. Initialize Modules
  if (window.auth) window.auth.init();
  if (window.dashboardScreen) window.dashboardScreen.init();
  if (window.diagnosisScreen) window.diagnosisScreen.init();
  if (window.nearbyScreen) window.nearbyScreen.init();
  if (window.historyScreen) window.historyScreen.init();
  if (window.profileScreen) window.profileScreen.init();

  // 4. AUTO-FETCH USER LOCATION ON STARTUP
  console.log("Auto-fetching real-time user location...");
  await userLocation.fetchCurrentLocation();

  // 5. Default Screen: Dashboard
  window.showScreen("dashboard");
});
