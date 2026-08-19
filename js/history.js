/**
 * history.js - Past Health Assessments History Screen
 */

const historyScreen = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    const refreshBtn = document.getElementById("refresh-history-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.loadHistory());
    }

    const signInCtaBtn = document.getElementById("history-signin-btn");
    if (signInCtaBtn) {
      signInCtaBtn.addEventListener("click", () => {
        if (window.auth && typeof window.auth.openAuthModal === "function") {
          window.auth.openAuthModal();
        }
      });
    }
  },

  async loadHistory() {
    const container = document.getElementById("history-list-container");
    const emptyState = document.getElementById("history-empty-state");
    const anonBanner = document.getElementById("history-anon-banner");

    const user = api.getCurrentUser();
    if (!user) {
      if (anonBanner) anonBanner.classList.remove("hidden");
      if (container) container.innerHTML = "";
      if (emptyState) emptyState.classList.add("hidden");
      return;
    }

    if (anonBanner) anonBanner.classList.add("hidden");
    if (container) {
      container.innerHTML = `<div class="loading-state"><i data-lucide="loader-2" class="spin-icon"></i> Loading your past assessments...</div>`;
      if (window.lucide) window.lucide.createIcons();
    }

    try {
      const historyItems = await api.getHistory();
      if (!historyItems || historyItems.length === 0) {
        if (container) container.innerHTML = "";
        if (emptyState) emptyState.classList.remove("hidden");
        return;
      }

      if (emptyState) emptyState.classList.add("hidden");

      if (container) {
        container.innerHTML = historyItems.map(item => {
          const dateStr = new Date(item.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          const urgencyClass = item.urgency === "emergency" ? "badge-emergency" : (item.urgency === "see_doctor_soon" ? "badge-warning" : "badge-normal");

          return `
            <div class="history-item-card">
              <div class="history-card-top">
                <div>
                  <h4 class="history-disease-name">${item.top_disease}</h4>
                  <span class="history-date"><i data-lucide="calendar"></i> ${dateStr}</span>
                </div>
                <div class="history-badge ${urgencyClass}">
                  <span>${item.urgency_label}</span>
                </div>
              </div>

              <div class="history-card-body">
                <div class="history-meta">
                  <span>Match Confidence: <strong>${item.probability}%</strong></span>
                  <span>Specialty: <strong>${item.recommended_specialty}</strong></span>
                </div>

                <div class="history-symptoms-list">
                  <strong>Reported Symptoms:</strong>
                  <div class="symptom-tags">
                    ${item.symptoms.map(s => `<span class="symptom-chip-sm">${s.replace(/_/g, " ")}</span>`).join("")}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join("");

        if (window.lucide) window.lucide.createIcons();
      }
    } catch (err) {
      if (container) {
        container.innerHTML = `<div class="error-state">Failed to load assessment history. Please try again.</div>`;
      }
    }
  }
};
