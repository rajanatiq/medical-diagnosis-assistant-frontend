/* ==========================================================================
   AegisMed - Clinical Decision Support Frontend Controller
   ========================================================================== */

const API_BASE = "http://127.0.0.1:8000/api/v1";

// Application State
const state = {
  activeTab: "wizard",
  currentStep: 1,
  symptomsList: [],
  selectedSymptoms: new Set(),
  durationDays: 3,
  ageBand: "30-39",
  sex: "Female",
  currentAssessment: null,
  isBackendOnline: false,
  currentUser: JSON.parse(localStorage.getItem("aegis_user") || "null"),
  searchQuery: "",
  activeCategory: "all",
  providers: [],
  selectedProvider: null,
  userLat: 33.6844,
  userLon: 73.0479,
  mapSpecialty: "",
  mapRadius: 50,
  mapEmergencyOnly: false,
};

const COMMON_QUICK_PICKS = [
  { id: "high_fever", label: "High Fever" },
  { id: "cough", label: "Cough" },
  { id: "fatigue", label: "Fatigue" },
  { id: "headache", label: "Headache" },
  { id: "chest_pain", label: "Chest Pain ⚠️" },
  { id: "breathlessness", label: "Breathlessness" },
  { id: "vomiting", label: "Vomiting" },
  { id: "skin_rash", label: "Skin Rash" },
  { id: "joint_pain", label: "Joint Pain" },
  { id: "abdominal_pain", label: "Abdominal Pain" }
];

// Helper: Get Auth Headers
function getAuthHeaders() {
  const token = localStorage.getItem("aegis_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// Initialization on DOM Load
document.addEventListener("DOMContentLoaded", async () => {
  initLucide();
  setupNavigation();
  setupStepper();
  setupFiltersAndSearch();
  setupDemographicsControls();
  setupAuthModal();
  setupMapControls();
  setupPrivacyControls();

  await checkBackendHealth();
  await loadSymptomCatalog();
  renderQuickPills();
  updateUserDisplay();
});

function initLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 1. Health Check
async function checkBackendHealth() {
  const badge = document.getElementById("backend-status-badge");
  const badgeText = document.getElementById("backend-status-text");
  const banner = document.getElementById("offline-banner");

  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      state.isBackendOnline = true;
      badge.classList.remove("offline");
      badgeText.textContent = "FastAPI Online";
      banner.style.display = "none";
    } else {
      throw new Error("Offline");
    }
  } catch {
    state.isBackendOnline = false;
    badge.classList.add("offline");
    badgeText.textContent = "API Offline";
    banner.style.display = "flex";
  }
}

document.getElementById("btn-retry-connection")?.addEventListener("click", async () => {
  await checkBackendHealth();
  if (state.isBackendOnline && state.symptomsList.length === 0) {
    await loadSymptomCatalog();
  }
});

// 2. Load Symptom Catalog
async function loadSymptomCatalog() {
  const container = document.getElementById("symptoms-grid-container");
  try {
    const res = await fetch(`${API_BASE}/assessments/symptoms/list`);
    if (!res.ok) throw new Error("Failed to load");
    const data = await res.json();
    state.symptomsList = data.symptoms || [];
    renderSymptomsGrid();
  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger full-width">
        <i data-lucide="alert-circle"></i>
        <span>Could not connect to FastAPI server. Make sure your backend server is running on port 8000.</span>
      </div>
    `;
    initLucide();
  }
}

// 3. Render Quick Pills
function renderQuickPills() {
  const container = document.getElementById("quick-picks-container");
  container.innerHTML = COMMON_QUICK_PICKS.map(p => `
    <button class="chip-pill ${state.selectedSymptoms.has(p.id) ? 'active' : ''}" data-id="${p.id}">
      <span>${p.label}</span>
    </button>
  `).join("");

  container.querySelectorAll(".chip-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleSymptom(btn.dataset.id);
    });
  });
}

// 4. Render Symptoms Grid
function renderSymptomsGrid() {
  const container = document.getElementById("symptoms-grid-container");
  const query = state.searchQuery.toLowerCase().trim();

  const filtered = state.symptomsList.filter(s => {
    const matchesSearch = s.label.toLowerCase().includes(query) || s.id.includes(query);
    if (!matchesSearch) return false;

    if (state.activeCategory === "all") return true;
    if (state.activeCategory === "critical") return s.weight >= 6;
    if (state.activeCategory === "chest_respiratory") {
      return s.id.includes("chest") || s.id.includes("breath") || s.id.includes("cough") || s.id.includes("throat");
    }
    if (state.activeCategory === "digestive") {
      return s.id.includes("stomach") || s.id.includes("abdominal") || s.id.includes("vomit") || s.id.includes("nausea") || s.id.includes("diarrhoea");
    }
    if (state.activeCategory === "neuro_head") {
      return s.id.includes("head") || s.id.includes("dizz") || s.id.includes("spinning") || s.id.includes("weakness") || s.id.includes("coma");
    }
    if (state.activeCategory === "skin") {
      return s.id.includes("skin") || s.id.includes("itch") || s.id.includes("rash") || s.id.includes("patch") || s.id.includes("blister");
    }
    if (state.activeCategory === "general") {
      return s.id.includes("fever") || s.id.includes("chill") || s.id.includes("sweat") || s.id.includes("fatigue") || s.id.includes("malaise");
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p class="text-muted text-center full-width py-6">No symptoms matching "${state.searchQuery}"</p>`;
    return;
  }

  container.innerHTML = filtered.map(s => {
    const isSelected = state.selectedSymptoms.has(s.id);
    const isCritical = s.weight >= 6;
    return `
      <div class="symptom-card ${isSelected ? 'active' : ''}" data-id="${s.id}">
        <div class="symptom-left">
          <div class="checkbox-box">
            ${isSelected ? '✓' : ''}
          </div>
          <span class="symptom-label" title="${s.label}">${s.label}</span>
        </div>
        <span class="severity-pill ${isCritical ? 'critical' : ''}">
          W${s.weight} ${isCritical ? '⚠️' : ''}
        </span>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".symptom-card").forEach(card => {
    card.addEventListener("click", () => {
      toggleSymptom(card.dataset.id);
    });
  });
}

function toggleSymptom(id) {
  if (state.selectedSymptoms.has(id)) {
    state.selectedSymptoms.delete(id);
  } else {
    state.selectedSymptoms.add(id);
  }
  updateSelectionUI();
  renderSymptomsGrid();
  renderQuickPills();
}

function updateSelectionUI() {
  const count = state.selectedSymptoms.size;
  const countLabel = document.getElementById("selected-count-label");
  const summaryText = document.getElementById("selected-summary-text");
  const nextBtn = document.getElementById("btn-goto-step-2");
  const clearBtn = document.getElementById("btn-clear-symptoms");

  countLabel.textContent = `${count} selected`;
  if (count === 0) {
    summaryText.textContent = "Please select at least 1 symptom to proceed.";
    summaryText.className = "text-muted";
    nextBtn.disabled = true;
    clearBtn.style.display = "none";
  } else {
    summaryText.innerHTML = `<strong class="text-cyan">${count}</strong> symptoms selected`;
    summaryText.className = "";
    nextBtn.disabled = false;
    clearBtn.style.display = "inline-flex";
  }
}

document.getElementById("btn-clear-symptoms")?.addEventListener("click", () => {
  state.selectedSymptoms.clear();
  updateSelectionUI();
  renderSymptomsGrid();
  renderQuickPills();
});

// 5. Search & Filters
function setupFiltersAndSearch() {
  const searchInput = document.getElementById("symptom-search-input");
  const clearSearchBtn = document.getElementById("search-clear-btn");

  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    clearSearchBtn.style.display = state.searchQuery ? "block" : "none";
    renderSymptomsGrid();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.searchQuery = "";
    clearSearchBtn.style.display = "none";
    renderSymptomsGrid();
  });

  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.activeCategory = btn.dataset.category;
      renderSymptomsGrid();
    });
  });
}

// 6. Navigation Tabs
function setupNavigation() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tab);
    });
  });

  document.getElementById("nav-brand")?.addEventListener("click", () => {
    switchTab("wizard");
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.remove("active");
  });

  const activePane = document.getElementById(`pane-${tabId}`);
  if (activePane) {
    activePane.classList.add("active");
  }

  if (tabId === "map") {
    loadNearbyProviders();
  } else if (tabId === "privacy") {
    loadPrivacyData();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  initLucide();
}

// 7. Stepper Navigation
function setupStepper() {
  document.getElementById("btn-goto-step-2")?.addEventListener("click", () => setStep(2));
  document.getElementById("btn-backto-step-1")?.addEventListener("click", () => setStep(1));
  document.getElementById("btn-goto-step-3")?.addEventListener("click", () => {
    renderStep3Review();
    setStep(3);
  });
  document.getElementById("btn-backto-step-2")?.addEventListener("click", () => setStep(2));

  document.querySelectorAll(".step-item").forEach(item => {
    item.addEventListener("click", () => {
      const targetStep = parseInt(item.dataset.step);
      if (targetStep === 1 || state.selectedSymptoms.size > 0) {
        if (targetStep === 3) renderStep3Review();
        setStep(targetStep);
      }
    });
  });

  document.getElementById("btn-run-triage")?.addEventListener("click", runTriageAssessment);
}

function setStep(stepNum) {
  state.currentStep = stepNum;
  document.querySelectorAll(".step-item").forEach(item => {
    const num = parseInt(item.dataset.step);
    item.classList.toggle("active", num === stepNum);
    item.classList.toggle("completed", num < stepNum && state.selectedSymptoms.size > 0);
  });

  document.getElementById("wizard-step-1").style.display = stepNum === 1 ? "block" : "none";
  document.getElementById("wizard-step-2").style.display = stepNum === 2 ? "block" : "none";
  document.getElementById("wizard-step-3").style.display = stepNum === 3 ? "block" : "none";

  window.scrollTo({ top: 150, behavior: "smooth" });
  initLucide();
}

// 8. Demographics Controls
function setupDemographicsControls() {
  const durationSlider = document.getElementById("duration-slider");
  const durationVal = document.getElementById("duration-val-badge");
  const demoSubLabel = document.getElementById("demographics-sub-label");

  durationSlider?.addEventListener("input", (e) => {
    state.durationDays = parseInt(e.target.value);
    durationVal.textContent = `${state.durationDays} ${state.durationDays === 1 ? 'Day' : 'Days'}`;
    demoSubLabel.textContent = `${state.durationDays}d • ${state.ageBand} yrs`;
  });

  document.querySelectorAll("#age-band-pills .pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#age-band-pills .pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.ageBand = btn.dataset.age;
      demoSubLabel.textContent = `${state.durationDays}d • ${state.ageBand} yrs`;
    });
  });

  document.querySelectorAll("#sex-pills .pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#sex-pills .pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.sex = btn.dataset.sex;
    });
  });
}

function renderStep3Review() {
  const chipsContainer = document.getElementById("review-selected-chips");
  const infoContainer = document.getElementById("review-patient-info");

  const symLabels = Array.from(state.selectedSymptoms).map(id => {
    const found = state.symptomsList.find(s => s.id === id);
    return found ? found.label : id;
  });

  chipsContainer.innerHTML = symLabels.map(label => `
    <span class="selected-chip-badge">${label}</span>
  `).join("");

  infoContainer.innerHTML = `
    <p class="text-sm">Patient Profile: <strong class="text-cyan">${state.ageBand} years</strong> • <strong class="text-cyan">${state.sex}</strong> • <strong class="text-cyan">${state.durationDays} Days Duration</strong></p>
  `;
}

// 9. Run Triage API Call
async function runTriageAssessment() {
  const btn = document.getElementById("btn-run-triage");
  const btnText = document.getElementById("run-triage-btn-text");

  btn.disabled = true;
  btnText.textContent = "Computing Calibrated Probabilities...";

  const payload = {
    symptoms: Array.from(state.selectedSymptoms),
    duration_days: state.durationDays,
    age_band: state.ageBand,
    sex: state.sex
  };

  try {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Triage calculation failed");
    }

    const data = await res.json();
    state.currentAssessment = data;
    renderResultsDashboard(data);
    switchTab("results");
  } catch (err) {
    alert(`Assessment Error: ${err.message}`);
  } finally {
    btn.disabled = false;
    btnText.textContent = "Run Clinical Triage Assessment";
  }
}

// 10. Render Results Dashboard
function renderResultsDashboard(data) {
  const container = document.getElementById("results-content-wrapper");
  const isEmergency = data.urgency === "emergency";

  const urgencyTitles = {
    emergency: "Seek Emergency Care Immediately",
    see_doctor_within_24h: "Consult a Doctor Within 24 Hours",
    see_doctor_soon: "Schedule a Healthcare Visit Soon",
    self_care: "Self-Care & Home Monitoring"
  };

  const urgencyDescs = {
    emergency: "Proceed to the nearest Emergency Department or call an ambulance immediately.",
    see_doctor_within_24h: "Your symptoms warrant clinical evaluation within 24 hours to prevent complications.",
    see_doctor_soon: "Book an appointment with a general physician or specialist in the coming days.",
    self_care: "Symptoms appear mild. Practice home care, rest, hydration, and monitor for changes."
  };

  const topPred = data.predictions && data.predictions.length > 0 ? data.predictions[0] : null;

  container.innerHTML = `
    <!-- Top Urgency Banner -->
    <div class="urgency-banner ${data.urgency}">
      <div class="urgency-left">
        <div class="urgency-icon-box">
          <i data-lucide="${isEmergency ? 'alert-octagon' : 'alert-triangle'}" class="${isEmergency ? 'text-danger' : 'text-cyan'}"></i>
        </div>
        <div>
          <div class="badge ${isEmergency ? 'badge-brand' : 'badge-emerald'} mb-2">
            Urgency: ${data.urgency.replace(/_/g, ' ')}
          </div>
          <h2 class="urgency-title ${isEmergency ? 'text-danger' : 'text-primary'}">
            ${urgencyTitles[data.urgency] || data.urgency_display}
          </h2>
          <p class="urgency-desc">${urgencyDescs[data.urgency] || ''}</p>
          ${data.red_flag_reason ? `<p class="text-danger text-xs font-semibold mt-2">Reason: ${data.red_flag_reason}</p>` : ''}
        </div>
      </div>

      <div class="urgency-actions">
        ${isEmergency ? `
          <a href="tel:911" class="btn btn-emergency btn-lg">
            <i data-lucide="phone-call"></i>
            <span>Call Emergency (911 / 112)</span>
          </a>
        ` : `
          <button class="btn btn-primary" onclick="jumpToSpecialist('${topPred ? topPred.specialty : ''}')">
            <i data-lucide="map-pin"></i>
            <span>Find Nearby ${topPred ? topPred.specialty : 'Care'}</span>
          </button>
        `}
      </div>
    </div>

    <!-- Predictions Panel -->
    <div class="glass-panel predictions-panel">
      <div class="flex-between mb-4">
        <div>
          <h3 class="section-title">Calibrated Condition Probabilities (Top 3)</h3>
          <p class="section-subtitle">Evaluated using calibrated statistical inference + multi-hot symptom vector analysis.</p>
        </div>
        <span class="badge badge-brand">Model: ${data.model_version}</span>
      </div>

      <div class="predictions-list">
        ${data.predictions.map((p, idx) => {
          const confidencePct = (p.confidence * 100).toFixed(1);
          return `
            <div class="prediction-card ${idx === 0 ? 'rank-1' : ''}">
              <div class="prediction-header">
                <div>
                  <h4 class="condition-title">#${idx + 1} ${p.condition}</h4>
                  <span class="text-cyan text-xs font-semibold">Recommended Specialty: ${p.specialty}</span>
                </div>
                <div class="confidence-bar-wrapper">
                  <span class="font-bold text-sm">${confidencePct}% confidence</span>
                  <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${Math.max(p.confidence * 100, 6)}%;"></div>
                  </div>
                </div>
              </div>

              <p class="condition-desc">${p.description}</p>

              ${p.precautions && p.precautions.length > 0 ? `
                <div class="precautions-section">
                  <p class="group-label">Recommended Care Measures & Precautions:</p>
                  <div class="precautions-grid">
                    ${p.precautions.map(pr => `
                      <div class="precaution-item">
                        <i data-lucide="shield-check"></i>
                        <span>${pr}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Action Toolbar -->
    <div class="glass-panel p-4 flex-between">
      <button class="btn btn-secondary btn-sm" onclick="switchTab('wizard')">
        <i data-lucide="refresh-cw"></i>
        <span>Retake Assessment</span>
      </button>

      <div class="flex-gap-2">
        <button class="btn btn-secondary btn-sm" onclick="window.print()">
          <i data-lucide="printer"></i>
          <span>Print Summary</span>
        </button>
        <button class="btn btn-primary btn-sm" onclick="jumpToSpecialist('${topPred ? topPred.specialty : ''}')">
          <i data-lucide="map-pin"></i>
          <span>Find Nearby Specialists</span>
        </button>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="callout glass-panel">
      <i data-lucide="info" class="text-muted"></i>
      <div>
        <p class="font-semibold text-sm">Mandatory Clinical Disclaimer</p>
        <p class="text-xs text-muted leading-relaxed">${data.disclaimer}</p>
      </div>
    </div>
  `;

  initLucide();
}

window.jumpToSpecialist = function(specialty) {
  state.mapSpecialty = specialty;
  document.getElementById("map-specialty-input").value = specialty;
  switchTab("map");
};

// 11. Nearby Care Map & Providers
function setupMapControls() {
  const citySelect = document.getElementById("map-city-select");
  const specialtyInput = document.getElementById("map-specialty-input");
  const radiusSlider = document.getElementById("map-radius-slider");
  const radiusLabel = document.getElementById("map-radius-label");
  const emergencyCheck = document.getElementById("map-emergency-only-check");
  const gpsBtn = document.getElementById("btn-detect-gps");

  citySelect?.addEventListener("change", (e) => {
    const [lat, lon] = e.target.value.split(",").map(Number);
    state.userLat = lat;
    state.userLon = lon;
    loadNearbyProviders();
  });

  specialtyInput?.addEventListener("input", (e) => {
    state.mapSpecialty = e.target.value;
    loadNearbyProviders();
  });

  radiusSlider?.addEventListener("input", (e) => {
    state.mapRadius = parseInt(e.target.value);
    radiusLabel.textContent = `${state.mapRadius} km`;
    loadNearbyProviders();
  });

  emergencyCheck?.addEventListener("change", (e) => {
    state.mapEmergencyOnly = e.target.checked;
    loadNearbyProviders();
  });

  gpsBtn?.addEventListener("click", () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          state.userLat = pos.coords.latitude;
          state.userLon = pos.coords.longitude;
          loadNearbyProviders();
        },
        () => alert("GPS access denied. Using default coordinates.")
      );
    }
  });
}

async function loadNearbyProviders() {
  const updatingText = document.getElementById("map-updating-text");
  const listContainer = document.getElementById("providers-list-container");
  const countText = document.getElementById("providers-count-text");

  updatingText.style.display = "inline";

  const query = new URLSearchParams({
    lat: state.userLat.toString(),
    lon: state.userLon.toString(),
    ...(state.mapSpecialty ? { specialty: state.mapSpecialty } : {}),
    ...(state.mapEmergencyOnly ? { urgency: "emergency" } : {}),
    radius_km: state.mapRadius.toString()
  });

  try {
    const res = await fetch(`${API_BASE}/recommendations/nearby?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    state.providers = data;
    countText.textContent = `Found ${data.length} facilities`;

    renderProvidersList();
    if (data.length > 0) {
      selectProvider(data[0]);
    } else {
      document.getElementById("provider-details-container").innerHTML = `
        <div class="glass-panel p-8 text-center text-muted">
          <p>No healthcare facilities found within ${state.mapRadius}km. Try expanding the radius slider.</p>
        </div>
      `;
    }
  } catch (err) {
    listContainer.innerHTML = `<p class="text-danger text-sm p-4">Error loading providers: ${err.message}</p>`;
  } finally {
    updatingText.style.display = "none";
  }
}

function renderProvidersList() {
  const container = document.getElementById("providers-list-container");
  container.innerHTML = state.providers.map(p => `
    <div class="provider-card ${state.selectedProvider?.id === p.id ? 'selected' : ''}" onclick="selectProviderById(${p.id})">
      <div class="provider-name">
        <span>${p.name}</span>
        <span class="badge badge-brand">${p.distance_km} km</span>
      </div>
      <div class="provider-meta">
        ${p.specialty} • ${p.facility_type}
        ${p.emergency_capable ? '<span class="badge badge-danger text-danger">ER Capable</span>' : ''}
      </div>
      <p class="provider-address">${p.address}</p>
      <div class="provider-footer">
        <span>🕒 ${p.hours}</span>
        <span class="text-amber">★ ${p.rating}</span>
      </div>
    </div>
  `).join("");
}

window.selectProviderById = function(id) {
  const found = state.providers.find(p => p.id === id);
  if (found) selectProvider(found);
};

function selectProvider(p) {
  state.selectedProvider = p;
  renderProvidersList();

  const container = document.getElementById("provider-details-container");
  container.innerHTML = `
    <div class="glass-panel p-6">
      <div class="flex-between mb-3">
        <div>
          <span class="badge badge-brand mb-1">${p.facility_type}</span>
          <h3 class="section-title">${p.name}</h3>
          <p class="text-xs text-cyan">Specialty Department: ${p.specialty}</p>
        </div>
        <div class="text-right">
          <span class="text-amber font-bold">★ ${p.rating} / 5.0</span>
          <p class="text-xs text-muted">Verified Care Center</p>
        </div>
      </div>

      <!-- OpenStreetMap Embed -->
      <div class="map-embed-container">
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=${p.longitude - 0.015}%2C${p.latitude - 0.015}%2C${p.longitude + 0.015}%2C${p.latitude + 0.015}&layer=mapnik&marker=${p.latitude}%2C${p.longitude}"
        ></iframe>
      </div>

      <div class="form-grid mb-4">
        <div class="form-card">
          <p class="form-label-sm">Address</p>
          <p class="font-bold text-sm">${p.address}</p>
          <p class="text-xs text-muted">${p.city || 'Islamabad'}</p>
        </div>
        <div class="form-card">
          <p class="form-label-sm">Hours</p>
          <p class="font-bold text-sm">${p.hours}</p>
          <p class="text-xs text-emerald">● Operating</p>
        </div>
      </div>

      <div class="flex-gap-2">
        ${p.phone ? `
          <a href="tel:${p.phone.replace(/\s+/g, '')}" class="btn btn-primary btn-sm full-width">
            <i data-lucide="phone"></i>
            <span>Call (${p.phone})</span>
          </a>
        ` : ''}
        <a href="https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}" target="_blank" class="btn btn-secondary btn-sm full-width">
          <i data-lucide="external-link"></i>
          <span>Directions</span>
        </a>
      </div>
    </div>
  `;

  initLucide();
}

// 12. Privacy Controls
function setupPrivacyControls() {
  const form = document.getElementById("patient-profile-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const saveStatus = document.getElementById("profile-save-status");
    const payload = {
      age_band: document.getElementById("profile-age-band").value,
      sex: document.getElementById("profile-sex").value,
      medical_history: document.getElementById("profile-medical-history").value,
      allergies: document.getElementById("profile-allergies").value,
      current_medications: document.getElementById("profile-medications").value
    };

    try {
      const res = await fetch(`${API_BASE}/patient/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        saveStatus.style.display = "inline-flex";
        setTimeout(() => saveStatus.style.display = "none", 4000);
      }
    } catch {
      alert("Failed to save encrypted profile");
    }
  });

  const triggerDelBtn = document.getElementById("btn-trigger-delete");
  const confirmBox = document.getElementById("delete-confirmation-box");
  const confirmDelBtn = document.getElementById("btn-confirm-delete");
  const cancelDelBtn = document.getElementById("btn-cancel-delete");

  triggerDelBtn?.addEventListener("click", () => {
    confirmBox.style.display = "block";
  });

  cancelDelBtn?.addEventListener("click", () => {
    confirmBox.style.display = "none";
  });

  confirmDelBtn?.addEventListener("click", async () => {
    try {
      const res = await fetch(`${API_BASE}/patient/data`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        alert("All your health data has been permanently erased.");
        confirmBox.style.display = "none";
        document.getElementById("profile-medical-history").value = "";
        document.getElementById("profile-allergies").value = "";
        document.getElementById("profile-medications").value = "";
      }
    } catch {
      alert("Could not erase records.");
    }
  });
}

async function loadPrivacyData() {
  if (!state.currentUser) return;
  try {
    const res = await fetch(`${API_BASE}/patient/profile`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.age_band) document.getElementById("profile-age-band").value = data.age_band;
      if (data.sex) document.getElementById("profile-sex").value = data.sex;
      document.getElementById("profile-medical-history").value = data.medical_history || "";
      document.getElementById("profile-allergies").value = data.allergies || "";
      document.getElementById("profile-medications").value = data.current_medications || "";
    }
  } catch (err) {
    console.warn(err);
  }
}

// 13. Auth Modal
function setupAuthModal() {
  let isLoginMode = true;
  const modal = document.getElementById("auth-modal");
  const title = document.getElementById("auth-modal-title");
  const toggleBtn = document.getElementById("btn-toggle-auth-mode");
  const nameGroup = document.getElementById("auth-name-group");
  const submitText = document.getElementById("auth-submit-text");
  const errorAlert = document.getElementById("auth-error-alert");

  document.getElementById("btn-auth-toggle")?.addEventListener("click", () => {
    if (state.currentUser) {
      localStorage.removeItem("aegis_token");
      localStorage.removeItem("aegis_user");
      state.currentUser = null;
      updateUserDisplay();
    } else {
      modal.style.display = "flex";
      initLucide();
    }
  });

  document.getElementById("btn-close-auth-modal")?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  toggleBtn?.addEventListener("click", () => {
    isLoginMode = !isLoginMode;
    title.textContent = isLoginMode ? "Sign In to AegisMed" : "Create Patient Account";
    nameGroup.style.display = isLoginMode ? "none" : "block";
    submitText.textContent = isLoginMode ? "Sign In" : "Create Account";
    toggleBtn.textContent = isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in";
    errorAlert.style.display = "none";
  });

  document.getElementById("auth-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;
    const fullName = document.getElementById("auth-full-name").value;

    const endpoint = isLoginMode ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    const payload = isLoginMode ? { email, password } : { email, password, full_name: fullName };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Authentication failed");
      }

      const data = await res.json();
      localStorage.setItem("aegis_token", data.access_token);
      localStorage.setItem("aegis_user", JSON.stringify(data));
      state.currentUser = data;
      updateUserDisplay();
      modal.style.display = "none";
    } catch (err) {
      errorAlert.textContent = err.message;
      errorAlert.style.display = "block";
    }
  });
}

function updateUserDisplay() {
  const userBtn = document.getElementById("btn-auth-toggle");
  const nameSpan = document.getElementById("user-display-name");

  if (state.currentUser) {
    nameSpan.textContent = state.currentUser.full_name || state.currentUser.email.split("@")[0];
    userBtn.title = "Click to Sign Out";
  } else {
    nameSpan.textContent = "Sign In";
    userBtn.title = "Click to Sign In";
  }
}
