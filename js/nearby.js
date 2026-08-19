/**
 * nearby.js - Real-Time Live Healthcare Care Finder & Interactive Map
 */

const nearbyScreen = {
  map: null,
  userMarker: null,
  markersLayer: null,
  facilities: [],
  activeFacilityType: "all",
  currentRadius: 15,
  currentSpecialty: null,

  init() {
    this.bindEvents();
    window.addEventListener("user-location-updated", () => {
      this.loadNearbyCare();
    });
  },

  bindEvents() {
    // Facility Type Filter Tabs
    const filterTabs = document.querySelectorAll(".facility-filter-btn");
    filterTabs.forEach(btn => {
      btn.addEventListener("click", () => {
        filterTabs.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeFacilityType = btn.dataset.type;
        this.loadNearbyCare();
      });
    });

    // Radius Slider
    const radiusSlider = document.getElementById("radius-slider");
    const radiusLabel = document.getElementById("radius-val-label");
    if (radiusSlider && radiusLabel) {
      radiusSlider.addEventListener("input", (e) => {
        this.currentRadius = parseFloat(e.target.value);
        radiusLabel.innerText = `${this.currentRadius} km`;
      });
      radiusSlider.addEventListener("change", () => {
        this.loadNearbyCare();
      });
    }

    // Refresh GPS location button
    const refreshBtn = document.getElementById("refresh-gps-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Locating...`;
        if (window.lucide) window.lucide.createIcons();
        await userLocation.fetchCurrentLocation();
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = `<i data-lucide="crosshair"></i> <span>Update GPS</span>`;
        if (window.lucide) window.lucide.createIcons();
      });
    }
  },

  setSpecialtyAndSearch(specialty) {
    this.currentSpecialty = specialty;
    const specialtyBadge = document.getElementById("active-specialty-filter-badge");
    if (specialtyBadge) {
      if (specialty) {
        specialtyBadge.innerHTML = `<span>Specialty: <strong>${specialty}</strong></span> <button type="button" id="clear-specialty-btn">×</button>`;
        specialtyBadge.classList.remove("hidden");
        document.getElementById("clear-specialty-btn")?.addEventListener("click", () => {
          this.currentSpecialty = null;
          specialtyBadge.classList.add("hidden");
          this.loadNearbyCare();
        });
      } else {
        specialtyBadge.classList.add("hidden");
      }
    }
    this.loadNearbyCare();
  },

  async loadNearbyCare() {
    const listContainer = document.getElementById("facilities-list-container");
    const countBadge = document.getElementById("facilities-count-badge");
    const currentLocText = document.getElementById("nearby-user-location-text");

    if (currentLocText) {
      currentLocText.innerText = `${userLocation.cityName} (${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)})`;
    }

    if (listContainer) {
      listContainer.innerHTML = `<div class="loading-state"><i data-lucide="loader-2" class="spin-icon"></i> Finding real-time healthcare centers near you...</div>`;
      if (window.lucide) window.lucide.createIcons();
    }

    try {
      this.facilities = await api.getNearbyCare(
        userLocation.latitude,
        userLocation.longitude,
        this.currentRadius,
        this.activeFacilityType,
        this.currentSpecialty
      );

      if (countBadge) {
        countBadge.innerText = `${this.facilities.length} found`;
      }

      this.renderFacilitiesList();
      this.updateMap();
    } catch (err) {
      if (listContainer) {
        listContainer.innerHTML = `<div class="error-state">Could not retrieve live healthcare centers. Please check your internet connection.</div>`;
      }
    }
  },

  renderFacilitiesList() {
    const listContainer = document.getElementById("facilities-list-container");
    if (!listContainer) return;

    if (this.facilities.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <i data-lucide="map-pin-off"></i>
          <p>No healthcare facilities found within ${this.currentRadius} km.</p>
          <span>Try increasing the search radius or changing the facility filter.</span>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    listContainer.innerHTML = this.facilities.map(f => {
      const typeIcon = f.facility_type === "Hospital" ? "building-2" : (f.facility_type === "Pharmacy" ? "pill" : "stethoscope");
      return `
        <div class="facility-card" data-lat="${f.latitude}" data-lon="${f.longitude}">
          <div class="facility-header">
            <div class="facility-title-box">
              <div class="facility-type-icon type-${f.facility_type.toLowerCase()}">
                <i data-lucide="${typeIcon}"></i>
              </div>
              <div>
                <h4 class="facility-name">${f.name}</h4>
                <span class="facility-type-label">${f.facility_type} • ${f.specialty}</span>
              </div>
            </div>
            <div class="distance-badge">
              <i data-lucide="navigation"></i>
              <span>${f.distance_km} km</span>
            </div>
          </div>

          <div class="facility-details">
            <p class="facility-address"><i data-lucide="map-pin"></i> <span>${f.address}</span></p>
            <div class="facility-meta-row">
              <span><i data-lucide="clock"></i> ${f.hours}</span>
              <span><i data-lucide="star" class="star-icon"></i> ${f.rating} / 5.0</span>
              ${f.emergency_capable ? `<span class="badge-emergency"><i data-lucide="alert-circle"></i> 24/7 Emergency</span>` : ""}
            </div>
          </div>

          <div class="facility-actions">
            <a href="${f.directions_url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
              <i data-lucide="map"></i> <span>Get Directions (Google Maps)</span>
            </a>
            ${f.phone && f.phone !== "Available on site" ? `
              <a href="tel:${f.phone}" class="btn btn-secondary btn-sm">
                <i data-lucide="phone"></i> <span>Call</span>
              </a>
            ` : ""}
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();

    // Clicking a facility card pans the map to it
    listContainer.querySelectorAll(".facility-card").forEach(card => {
      card.addEventListener("click", () => {
        const lat = parseFloat(card.dataset.lat);
        const lon = parseFloat(card.dataset.lon);
        if (this.map && lat && lon) {
          this.map.flyTo([lat, lon], 15, { animate: true });
        }
      });
    });
  },

  initMap() {
    const mapEl = document.getElementById("leaflet-map-container");
    if (!mapEl || this.map || typeof L === "undefined") return;

    this.map = L.map("leaflet-map-container").setView([userLocation.latitude, userLocation.longitude], 13);

    // OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.updateMap();
  },

  updateMap() {
    if (!this.map && typeof L !== "undefined") {
      this.initMap();
    }
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    // 1. Add User Marker (Pulsing Pin)
    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `<div class="user-pulse-marker"><div class="pulse-ring"></div><div class="user-dot">📍</div></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    this.userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
      .bindPopup(`<strong>Your Location</strong><br/>${userLocation.cityName}`)
      .addTo(this.markersLayer);

    // 2. Add Facility Markers
    this.facilities.forEach(f => {
      const isHospital = f.facility_type === "Hospital";
      const isPharmacy = f.facility_type === "Pharmacy";
      const iconEmoji = isHospital ? "🏥" : (isPharmacy ? "💊" : "🩺");

      const placeIcon = L.divIcon({
        className: "custom-place-marker",
        html: `<div class="place-pin ${f.facility_type.toLowerCase()}">${iconEmoji}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([f.latitude, f.longitude], { icon: placeIcon })
        .bindPopup(`
          <div class="map-popup-card">
            <h4>${f.name}</h4>
            <p><strong>${f.facility_type}</strong> • ${f.specialty}</p>
            <p>${f.address}</p>
            <p><strong>Distance:</strong> ${f.distance_km} km</p>
            <a href="${f.directions_url}" target="_blank" class="popup-dir-link">Open in Google Maps ↗</a>
          </div>
        `);
      this.markersLayer.addLayer(marker);
    });

    // Center map around user
    this.map.setView([userLocation.latitude, userLocation.longitude], 13);
  }
};
