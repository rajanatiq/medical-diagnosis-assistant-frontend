/**
 * auth.js - User Authentication & Session Management
 */

const auth = {
  init() {
    this.bindEvents();
    this.updateAuthUI();
  },

  bindEvents() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout());
    }

    const authModalBtn = document.getElementById("auth-modal-btn");
    if (authModalBtn) {
      authModalBtn.addEventListener("click", () => this.openAuthModal());
    }

    const closeAuthBtn = document.getElementById("close-auth-modal");
    if (closeAuthBtn) {
      closeAuthBtn.addEventListener("click", () => this.closeAuthModal());
    }

    // Toggle between Login & Register tabs
    const loginTabBtn = document.getElementById("tab-login-btn");
    const regTabBtn = document.getElementById("tab-register-btn");
    if (loginTabBtn && regTabBtn) {
      loginTabBtn.addEventListener("click", () => {
        loginTabBtn.classList.add("active");
        regTabBtn.classList.remove("active");
        document.getElementById("login-form-container").classList.remove("hidden");
        document.getElementById("register-form-container").classList.add("hidden");
      });

      regTabBtn.addEventListener("click", () => {
        regTabBtn.classList.add("active");
        loginTabBtn.classList.remove("active");
        document.getElementById("register-form-container").classList.remove("hidden");
        document.getElementById("login-form-container").classList.add("hidden");
      });
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const submitBtn = document.getElementById("login-submit-btn");

    if (!email || !password) {
      window.showToast("Please enter both email and password.", "error");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Signing in...`;
      if (window.lucide) window.lucide.createIcons();

      const res = await api.login(email, password);
      api.setToken(res.access_token);
      api.setCurrentUser({
        id: res.user_id,
        email: res.email,
        full_name: res.full_name
      });

      window.showToast(`Welcome back, ${res.full_name || "User"}!`, "success");
      this.closeAuthModal();
      this.updateAuthUI();

      // AUTO-TRIGGER: Fetch user's real-time location immediately on login!
      console.log("User logged in. Automatically fetching GPS location...");
      await userLocation.fetchCurrentLocation();

      // Auto-load history and nearby care
      if (window.historyScreen && typeof window.historyScreen.loadHistory === "function") {
        window.historyScreen.loadHistory();
      }
      if (window.nearbyScreen && typeof window.nearbyScreen.loadNearbyCare === "function") {
        window.nearbyScreen.loadNearbyCare();
      }
    } catch (err) {
      window.showToast(err.message || "Failed to log in. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Sign In</span> <i data-lucide="arrow-right"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const submitBtn = document.getElementById("reg-submit-btn");

    if (!email || !password) {
      window.showToast("Please fill in all required fields.", "error");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Creating account...`;
      if (window.lucide) window.lucide.createIcons();

      const res = await api.register(email, password, fullName);
      api.setToken(res.access_token);
      api.setCurrentUser({
        id: res.user_id,
        email: res.email,
        full_name: res.full_name
      });

      window.showToast("Account created successfully!", "success");
      this.closeAuthModal();
      this.updateAuthUI();

      // Auto fetch location on new signup
      await userLocation.fetchCurrentLocation();
    } catch (err) {
      window.showToast(err.message || "Failed to create account.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Create Account</span> <i data-lucide="check"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
  },

  handleLogout() {
    api.clearToken();
    this.updateAuthUI();
    window.showToast("You have been signed out.", "info");
    if (window.showScreen) {
      window.showScreen("dashboard");
    }
  },

  openAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.classList.remove("hidden");
  },

  closeAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.classList.add("hidden");
  },

  updateAuthUI() {
    const user = api.getCurrentUser();
    const userBadge = document.getElementById("user-profile-badge");
    const authBtn = document.getElementById("auth-modal-btn");
    const userDropdown = document.getElementById("user-dropdown-name");

    if (user) {
      if (userBadge) userBadge.classList.remove("hidden");
      if (authBtn) authBtn.classList.add("hidden");
      if (userDropdown) userDropdown.innerText = user.full_name || user.email;
    } else {
      if (userBadge) userBadge.classList.add("hidden");
      if (authBtn) authBtn.classList.remove("hidden");
    }
  }
};
