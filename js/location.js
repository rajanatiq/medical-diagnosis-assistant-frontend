/**
 * location.js - Real-Time User GPS Location Detection & Geocoding
 */

const userLocation = {
  latitude: 33.6844,   // Default: Islamabad
  longitude: 73.0479,
  cityName: "Islamabad, Pakistan",
  isAutoDetected: false,
  isFetching: false,

  async fetchCurrentLocation() {
    this.isFetching = true;
    this.updateLocationBadge("Detecting location...", true);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser.");
        this.finishLocationFetch(this.latitude, this.longitude, "Islamabad (Default)");
        resolve(this.getLocationData());
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.isAutoDetected = true;

          // Reverse geocode to human-readable city/area name
          const city = await this.reverseGeocode(this.latitude, this.longitude);
          this.cityName = city;
          this.finishLocationFetch(this.latitude, this.longitude, city);
          resolve(this.getLocationData());
        },
        (error) => {
          console.warn("Geolocation permission denied or error:", error.message);
          // Try IP-based location fallback if available
          this.tryIPLocationFallback().then(() => {
            resolve(this.getLocationData());
          });
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  },

  async tryIPLocationFallback() {
    try {
      const resp = await fetch("https://ipapi.co/json/", { timeout: 4000 });
      if (resp.ok) {
        const data = await resp.json();
        if (data.latitude && data.longitude) {
          this.latitude = data.latitude;
          this.longitude = data.longitude;
          this.cityName = `${data.city || ""}, ${data.country_name || ""}`.trim().replace(/^,/, "");
          this.isAutoDetected = true;
          this.finishLocationFetch(this.latitude, this.longitude, this.cityName);
          return;
        }
      }
    } catch {
      // Fallback to default
    }
    this.finishLocationFetch(this.latitude, this.longitude, "Islamabad (Default)");
  },

  async reverseGeocode(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`;
      const resp = await fetch(url, { headers: { "User-Agent": "MedicalAssistantApp/2.0" } });
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.suburb || addr.state_district || addr.state || "Your Area";
        const country = addr.country || "";
        return `${city}, ${country}`.trim().replace(/,\s*$/, "");
      }
    } catch (e) {
      console.warn("Reverse geocode failed:", e);
    }
    return `Lat: ${lat.toFixed(3)}, Lon: ${lon.toFixed(3)}`;
  },

  finishLocationFetch(lat, lon, cityName) {
    this.isFetching = false;
    this.updateLocationBadge(`📍 ${cityName}`, false);

    // If nearby screen is active or map needs update, trigger event
    window.dispatchEvent(new CustomEvent("user-location-updated", {
      detail: { latitude: lat, longitude: lon, cityName: cityName }
    }));
  },

  updateLocationBadge(text, isLoading = false) {
    const badgeEl = document.getElementById("location-badge");
    if (badgeEl) {
      badgeEl.innerHTML = isLoading 
        ? `<i data-lucide="loader-2" class="spin-icon"></i> <span>${text}</span>`
        : `<i data-lucide="map-pin" class="pin-icon"></i> <span>${text}</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
  },

  getLocationData() {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      cityName: this.cityName,
      isAutoDetected: this.isAutoDetected
    };
  }
};
