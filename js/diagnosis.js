/**
 * diagnosis.js - Symptom Checker & Health Triage Screen
 */

const diagnosisScreen = {
  allSymptoms: [],
  selectedSymptoms: new Set(),
  activeCategory: "all",
  searchQuery: "",

  async init() {
    this.bindEvents();
    await this.loadSymptoms();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById("symptom-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderSymptomPills();
      });
    }

    // Duration slider
    const slider = document.getElementById("symptom-duration-slider");
    const durationLabel = document.getElementById("duration-days-label");
    if (slider && durationLabel) {
      slider.addEventListener("input", (e) => {
        durationLabel.innerText = `${e.target.value} day${e.target.value > 1 ? "s" : ""}`;
      });
    }

    // Clear all symptoms button
    const clearBtn = document.getElementById("clear-selected-symptoms");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.selectedSymptoms.clear();
        this.updateSelectedUI();
        this.renderSymptomPills();
      });
    }

    // Analyze button
    const analyzeBtn = document.getElementById("analyze-symptoms-btn");
    if (analyzeBtn) {
      analyzeBtn.addEventListener("click", () => this.handleAnalyze());
    }

    // Common quick pick chips
    document.querySelectorAll(".quick-symptom-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const code = chip.dataset.code;
        if (code) {
          this.toggleSymptom(code);
        }
      });
    });
  },

  async loadSymptoms() {
    const container = document.getElementById("symptoms-pills-container");
    if (!container) return;

    container.innerHTML = `<div class="loading-state"><i data-lucide="loader-2" class="spin-icon"></i> Loading symptoms...</div>`;
    if (window.lucide) window.lucide.createIcons();

    try {
      this.allSymptoms = await api.getSymptoms();
      this.renderCategoryTabs();
      this.renderSymptomPills();
    } catch (err) {
      container.innerHTML = `<div class="error-state">Failed to load symptoms list from server. Please check backend.</div>`;
    }
  },

  renderCategoryTabs() {
    const tabsContainer = document.getElementById("symptom-category-tabs");
    if (!tabsContainer) return;

    const categories = ["all", ...new Set(this.allSymptoms.map(s => s.category || "General"))];
    
    tabsContainer.innerHTML = categories.map(cat => `
      <button class="category-pill-btn ${cat === this.activeCategory ? "active" : ""}" data-category="${cat}">
        ${cat === "all" ? "All Symptoms" : cat}
      </button>
    `).join("");

    tabsContainer.querySelectorAll(".category-pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        tabsContainer.querySelectorAll(".category-pill-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeCategory = btn.dataset.category;
        this.renderSymptomPills();
      });
    });
  },

  renderSymptomPills() {
    const container = document.getElementById("symptoms-pills-container");
    if (!container) return;

    let filtered = this.allSymptoms;

    // Filter by category
    if (this.activeCategory !== "all") {
      filtered = filtered.filter(s => s.category === this.activeCategory);
    }

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(s => 
        s.label.toLowerCase().includes(this.searchQuery) ||
        s.code.toLowerCase().includes(this.searchQuery)
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state">No matching symptoms found for "${this.searchQuery}".</div>`;
      return;
    }

    container.innerHTML = filtered.map(s => {
      const isSelected = this.selectedSymptoms.has(s.code);
      return `
        <button class="symptom-toggle-pill ${isSelected ? "selected" : ""}" data-code="${s.code}">
          <span class="symptom-name">${s.label}</span>
          ${s.is_critical ? `<span class="badge-critical" title="Critical symptom">⚠️</span>` : ""}
          <i data-lucide="${isSelected ? "check" : "plus"}" class="pill-icon"></i>
        </button>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();

    // Bind click events on pills
    container.querySelectorAll(".symptom-toggle-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const code = pill.dataset.code;
        this.toggleSymptom(code);
      });
    });
  },

  toggleSymptom(code) {
    if (this.selectedSymptoms.has(code)) {
      this.selectedSymptoms.delete(code);
    } else {
      this.selectedSymptoms.add(code);
    }
    this.updateSelectedUI();
    this.renderSymptomPills();
  },

  updateSelectedUI() {
    const countBadge = document.getElementById("selected-count-badge");
    const tray = document.getElementById("selected-symptoms-tray");
    const analyzeBtn = document.getElementById("analyze-symptoms-btn");

    if (countBadge) countBadge.innerText = `${this.selectedSymptoms.size} selected`;
    if (analyzeBtn) analyzeBtn.disabled = this.selectedSymptoms.size === 0;

    if (tray) {
      if (this.selectedSymptoms.size === 0) {
        tray.innerHTML = `<span class="tray-placeholder">No symptoms selected yet. Pick from the list below.</span>`;
      } else {
        const items = Array.from(this.selectedSymptoms).map(code => {
          const sym = this.allSymptoms.find(s => s.code === code);
          const label = sym ? sym.label : code.replace(/_/g, " ");
          return `
            <span class="selected-chip">
              <span>${label}</span>
              <button type="button" class="remove-chip-btn" data-code="${code}">×</button>
            </span>
          `;
        }).join("");
        tray.innerHTML = items;

        tray.querySelectorAll(".remove-chip-btn").forEach(btn => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.toggleSymptom(btn.dataset.code);
          });
        });
      }
    }
  },

  async handleAnalyze() {
    if (this.selectedSymptoms.size === 0) {
      window.showToast("Please select at least one symptom.", "warning");
      return;
    }

    const slider = document.getElementById("symptom-duration-slider");
    const durationDays = slider ? parseInt(slider.value, 10) : 1;
    const analyzeBtn = document.getElementById("analyze-symptoms-btn");
    const resultsContainer = document.getElementById("diagnosis-results-section");

    try {
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Analyzing symptoms...`;
      if (window.lucide) window.lucide.createIcons();

      const symptomsArray = Array.from(this.selectedSymptoms);
      const result = await api.runAssessment(symptomsArray, durationDays);

      this.renderResults(result);
      if (resultsContainer) {
        resultsContainer.classList.remove("hidden");
        resultsContainer.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      window.showToast(err.message || "Failed to analyze symptoms.", "error");
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = `<i data-lucide="sparkles"></i> <span>Analyze My Symptoms</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
  },

  renderResults(res) {
    const resultsContainer = document.getElementById("diagnosis-results-section");
    if (!resultsContainer) return;

    const urgencyClass = res.urgency === "emergency" ? "urgency-emergency" : (res.urgency === "see_doctor_soon" ? "urgency-warning" : "urgency-normal");

    resultsContainer.innerHTML = `
      <div class="result-card">
        <!-- Urgency Alert Header -->
        <div class="urgency-banner ${urgencyClass}">
          <div class="urgency-header-row">
            <div class="urgency-badge" style="background: ${res.urgency_color}">
              <i data-lucide="${res.urgency === "emergency" ? "alert-triangle" : "heart-pulse"}"></i>
              <span>${res.urgency_label}</span>
            </div>
            <span class="severity-score">Severity: ${res.composite_severity} / 10</span>
          </div>
          <p class="urgency-description">${res.urgency_description}</p>
          ${res.red_flag_triggered ? `<div class="red-flag-box"><strong>⚠️ Attention:</strong> ${res.red_flag_reason}</div>` : ""}
        </div>

        <!-- Top Predicted Conditions -->
        <div class="conditions-section">
          <h3><i data-lucide="activity"></i> Possible Health Conditions</h3>
          <p class="section-subtext">Based on AI evaluation of your reported symptoms:</p>

          <div class="conditions-list">
            ${res.top_conditions.map((cond, idx) => `
              <div class="condition-item">
                <div class="cond-header">
                  <div class="cond-title">
                    <span class="cond-rank">#${idx + 1}</span>
                    <span class="cond-name">${cond.disease}</span>
                  </div>
                  <div class="cond-percent-pill">${cond.probability}% match</div>
                </div>

                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${cond.probability}%"></div>
                </div>

                <p class="cond-desc">${cond.description || "Medical condition matching your clinical symptom profile."}</p>

                <div class="cond-footer">
                  <span class="specialty-badge">
                    <i data-lucide="stethoscope"></i> Recommended Specialist: <strong>${cond.specialty}</strong>
                  </span>
                </div>

                ${cond.precautions && cond.precautions.length > 0 ? `
                  <div class="precautions-box">
                    <strong>Recommended Precautions:</strong>
                    <ul>
                      ${cond.precautions.map(p => `<li>${p}</li>`).join("")}
                    </ul>
                  </div>
                ` : ""}
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Action Advice & Care Finder CTA -->
        <div class="advice-section">
          <h3><i data-lucide="check-circle-2"></i> What You Should Do Next</h3>
          <ul class="advice-list">
            ${res.advice.map(adv => `<li><i data-lucide="arrow-right-circle"></i> <span>${adv}</span></li>`).join("")}
          </ul>

          <div class="care-cta-box">
            <div>
              <h4>Find Real-Time Healthcare Nearby</h4>
              <p>Locate nearby clinics and hospitals specializing in <strong>${res.recommended_specialty}</strong>.</p>
            </div>
            <button class="btn btn-primary" id="goto-nearby-with-specialty-btn">
              <i data-lucide="map-pin"></i> <span>Find ${res.recommended_specialty} Nearby</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Bind CTA button to open Nearby Care screen with specialty filter
    const ctaBtn = document.getElementById("goto-nearby-with-specialty-btn");
    if (ctaBtn) {
      ctaBtn.addEventListener("click", () => {
        if (window.showScreen) {
          window.showScreen("nearby");
          if (window.nearbyScreen && typeof window.nearbyScreen.setSpecialtyAndSearch === "function") {
            window.nearbyScreen.setSpecialtyAndSearch(res.recommended_specialty);
          }
        }
      });
    }
  }
};
