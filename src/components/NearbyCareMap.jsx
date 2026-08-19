import React, { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Building2,
  AlertCircle,
  ExternalLink,
  LocateFixed,
  SlidersHorizontal,
  Hospital,
  Stethoscope,
} from "lucide-react";
import { fetchNearbyProviders } from "../services/api";

const CITY_PRESETS = [
  { name: "Islamabad", lat: 33.6844, lon: 73.0479 },
  { name: "Rawalpindi", lat: 33.5651, lon: 73.0169 },
  { name: "Lahore", lat: 31.5204, lon: 74.3587 },
  { name: "Karachi", lat: 24.8607, lon: 67.0011 },
  { name: "Peshawar", lat: 34.0151, lon: 71.5249 },
];

function calcHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function NearbyCareMap({
  initialSpecialty,
  initialUrgency,
}) {
  const [userLat, setUserLat] = useState(33.6844);
  const [userLon, setUserLon] = useState(73.0479);
  const [facilityTypeFilter, setFacilityTypeFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState(initialSpecialty || "");
  const [radiusKm, setRadiusKm] = useState(20);
  const [emergencyOnly, setEmergencyOnly] = useState(initialUrgency === "emergency");

  const [rawProviders, setRawProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Locate User GPS
  const handleLocateMe = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLat(lat);
        setUserLon(lon);
        setIsLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 13, { animate: true, duration: 1.2 });
        }
      },
      (err) => {
        console.warn("Geolocation notice:", err);
        setIsLocating(false);
        alert("Could not access GPS. Please check location permissions.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    handleLocateMe();
  }, []);

  // Fetch providers from backend
  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchNearbyProviders({
        lat: userLat,
        lon: userLon,
        specialty: specialtyFilter || undefined,
        urgency: emergencyOnly ? "emergency" : undefined,
        radius_km: radiusKm,
      });
      setRawProviders(data || []);
      if (data && data.length > 0) {
        setSelectedProviderId(data[0].id);
      }
    } catch (err) {
      console.warn("Failed to load providers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [userLat, userLon, specialtyFilter, radiusKm, emergencyOnly]);

  // Recalculate dynamic distance from live coordinates & apply radius and type filters
  const providers = useMemo(() => {
    return (rawProviders || [])
      .map((p) => {
        const exactDist = calcHaversine(userLat, userLon, p.latitude, p.longitude);
        return {
          ...p,
          distance_km: exactDist,
        };
      })
      .filter((p) => {
        if (p.distance_km > radiusKm) return false;
        if (facilityTypeFilter === "hospital" && p.facility_type !== "Hospital") return false;
        if (facilityTypeFilter === "clinic" && p.facility_type !== "Clinic") return false;
        return true;
      })
      .sort((a, b) => a.distance_km - b.distance_km);
  }, [rawProviders, userLat, userLon, radiusKm, facilityTypeFilter]);

  const selectedProvider = useMemo(() => {
    if (!providers || providers.length === 0) return null;
    return providers.find((p) => p.id === selectedProviderId) || providers[0];
  }, [providers, selectedProviderId]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLon],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. RADIUS SEARCH PERIMETER CIRCLE
    const radiusCircle = L.circle([userLat, userLon], {
      radius: radiusKm * 1000,
      color: "#0ea5e9",
      fillColor: "#0ea5e9",
      fillOpacity: 0.08,
      weight: 2,
      dashArray: "5, 8",
    });
    markersLayer.addLayer(radiusCircle);

    // 2. USER LOCATION PIN: (You) Blue Circle Avatar
    const userIcon = L.divIcon({
      className: "custom-user-pin",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="background: #0284c7; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; border: 1px solid #38bdf8; box-shadow: 0 2px 8px rgba(0,0,0,0.4); white-space: nowrap; margin-bottom: 3px;">
            (You)
          </div>
          <div style="width: 38px; height: 38px; border-radius: 50%; background: #0284c7; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(2, 132, 199, 0.7); border: 3px solid #ffffff; font-size: 18px; color: white;">
            👤
          </div>
        </div>
      `,
      iconSize: [40, 60],
      iconAnchor: [20, 60],
    });

    const userMarker = L.marker([userLat, userLon], { icon: userIcon });
    userMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
        <strong style="color: #0284c7; font-size: 13px;">📍 (You) Your Current Location</strong><br/>
        <span>Coordinates: ${userLat.toFixed(4)}°, ${userLon.toFixed(4)}°</span>
      </div>
    `);
    markersLayer.addLayer(userMarker);

    const boundsPoints = [[userLat, userLon]];

    // 3. HEALTHCARE PINS: Red Circle with Facility Name Pill Badge
    providers.forEach((p) => {
      const isSelected = selectedProvider?.id === p.id;
      const iconEmoji = p.facility_type === "Hospital" ? "🏥" : "🩺";
      const pinColor = isSelected ? "#dc2626" : (p.facility_type === "Hospital" ? "#ea580c" : "#0ea5e9");

      const facilityIcon = L.divIcon({
        className: `custom-facility-pin-${p.id}`,
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
            <div style="background: ${pinColor}; color: #ffffff; padding: 2px 7px; border-radius: 6px; font-size: 10px; font-weight: 700; border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 3px 8px rgba(0,0,0,0.5); white-space: nowrap; margin-bottom: 3px;">
              ${p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name}
            </div>
            <div style="width: ${isSelected ? '38px' : '34px'}; height: ${isSelected ? '38px' : '34px'}; border-radius: 50%; background: ${pinColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 12px rgba(0,0,0,0.4); border: 2.5px solid #ffffff; font-size: ${isSelected ? '18px' : '15px'}; color: white;">
              ${iconEmoji}
            </div>
          </div>
        `,
        iconSize: [38, 55],
        iconAnchor: [19, 55],
      });

      const facilityMarker = L.marker([p.latitude, p.longitude], { icon: facilityIcon });

      facilityMarker.on("click", () => {
        setSelectedProviderId(p.id);
      });

      facilityMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; max-width: 220px;">
          <strong style="font-size: 13px; color: #0f172a;">${p.name}</strong><br/>
          <span style="color: #0284c7; font-weight: bold;">${p.specialty} (${p.facility_type})</span><br/>
          <span>📍 ${p.address}</span><br/>
          <strong style="color: #059669; font-size: 12px;">Distance: ${p.distance_km} km away</strong><br/>
          <a href="https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${p.latitude},${p.longitude}" target="_blank" style="display: inline-block; margin-top: 6px; padding: 4px 8px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 11px;">
            Get Driving Directions ↗
          </a>
        </div>
      `);

      markersLayer.addLayer(facilityMarker);
      boundsPoints.push([p.latitude, p.longitude]);
    });

    // 4. DRAW ROUTE LINE TO SELECTED FACILITY
    if (selectedProvider) {
      const routeLine = L.polyline(
        [
          [userLat, userLon],
          [selectedProvider.latitude, selectedProvider.longitude],
        ],
        {
          color: "#0284c7",
          weight: 4,
          dashArray: "8, 8",
          opacity: 0.9,
        }
      );
      markersLayer.addLayer(routeLine);
    }

    // Fit map bounds to view user + facilities
    if (boundsPoints.length > 1) {
      const bounds = L.latLngBounds(boundsPoints.map((pt) => L.latLng(pt[0], pt[1])));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView([userLat, userLon], 12);
    }
  }, [userLat, userLon, providers, selectedProvider, radiusKm]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. Header & Controls */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
              <MapPin className="w-5 h-5 text-sky-400" />
              <span>Healthcare Facility Locator Map</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Search nearby clinics & hospitals with dynamic radius calculation and turn-by-turn navigation.
            </p>
          </div>

          {/* City Presets Quick Switch */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">Quick Jump:</span>
            {CITY_PRESETS.map((city) => (
              <button
                key={city.name}
                onClick={() => {
                  setUserLat(city.lat);
                  setUserLon(city.lon);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([city.lat, city.lon], 12, { animate: true });
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                  Math.abs(userLat - city.lat) < 0.05 && Math.abs(userLon - city.lon) < 0.05
                    ? "bg-sky-500 text-white border-sky-400 shadow-sm"
                    : "bg-slate-900/60 border-white/10 text-slate-300 hover:bg-white/5"
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2 border-t border-white/5">
          {/* Facility Type Selector (Tabs: All, Hospital, Clinic) */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              <span>Facility Type</span>
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-white/10">
              {[
                { id: "all", label: "All" },
                { id: "hospital", label: "Hospital", icon: <Hospital className="w-3.5 h-3.5 text-rose-400" /> },
                { id: "clinic", label: "Clinic", icon: <Stethoscope className="w-3.5 h-3.5 text-sky-400" /> },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFacilityTypeFilter(t.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    facilityTypeFilter === t.id
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Specialty Filter */}
          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Specialty / Department</label>
            <input
              type="text"
              placeholder="e.g. Cardiology..."
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Search Radius Slider */}
          <div className="sm:col-span-3 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Search Radius</span>
              <span className="text-sky-400 font-mono font-bold">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="2"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 mt-2"
            />
          </div>

          {/* Emergency 24/7 Checkbox */}
          <div className="sm:col-span-2 flex items-center sm:pt-6">
            <label className="text-xs font-semibold text-slate-300 cursor-pointer select-none flex items-center gap-2">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 text-rose-500 focus:ring-rose-500 bg-slate-900"
              />
              <span>24/7 ER</span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Interactive Leaflet Map with Floating Controls & Radius Overlay */}
      <div className="glass-panel p-4 space-y-3 relative">
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
              <strong className="text-sky-300">(You) Origin Pin</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <strong className="text-rose-300">Hospitals & Clinics</strong>
            </span>
          </div>

          <span className="text-[11px] text-sky-400 font-semibold">
            {providers.length} facilities inside {radiusKm} km radius
          </span>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-96 rounded-2xl overflow-hidden border border-white/10 z-0 shadow-inner bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Top-Right Floating Radius Pill Badge */}
          <div className="absolute top-3 right-3 z-[400] px-3.5 py-1.5 rounded-full bg-sky-600/90 text-white font-bold text-xs shadow-lg border border-sky-400/50 backdrop-blur-md flex items-center gap-1.5">
            <span>🔵</span>
            <span>{providers.length} facilities</span>
          </div>

          {/* Bottom-Right Floating "Locate Me" Target Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="absolute bottom-4 right-4 z-[400] w-12 h-12 rounded-full bg-white text-slate-900 hover:bg-slate-100 active:scale-95 transition-all shadow-2xl border-2 border-slate-300 flex items-center justify-center group"
            title="Locate Me (Detect GPS)"
          >
            <LocateFixed
              className={`w-6 h-6 text-slate-800 group-hover:text-sky-600 transition-colors ${
                isLocating ? "animate-spin text-sky-500" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Main Content: Provider List (5 cols) & Facility Details with Navigation (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Facilities List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-slate-200">{providers.length}</strong> facilities
            </span>
            {isLoading && <span className="text-sky-400 animate-pulse">Scanning area...</span>}
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {providers.map((p) => {
              const isSelected = selectedProvider?.id === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProviderId(p.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/10"
                      : "bg-slate-900/60 border-white/5 hover:bg-slate-850 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.emergency_capable && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                            ER
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-sky-400 font-medium">
                        {p.specialty} • {p.facility_type}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                        {p.distance_km} km away
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 truncate mb-2">{p.address}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {p.hours}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {p.rating}
                    </span>
                  </div>
                </div>
              );
            })}

            {providers.length === 0 && !isLoading && (
              <div className="glass-panel p-8 text-center text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold">No healthcare facilities found within {radiusKm} km.</p>
                <p className="text-xs text-slate-500">Try expanding the search radius slider above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Facility View with Directions Action */}
        <div className="lg:col-span-7">
          {selectedProvider ? (
            <div className="glass-panel p-6 space-y-5 sticky top-24">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px]">
                      {selectedProvider.facility_type}
                    </span>
                    {selectedProvider.emergency_capable && (
                      <span className="badge bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px]">
                        24/7 Emergency Trauma Capable
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 font-display">
                    {selectedProvider.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Department: <strong className="text-sky-400">{selectedProvider.specialty}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{selectedProvider.rating} / 5.0</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    📍 {selectedProvider.distance_km} km from you
                  </span>
                </div>
              </div>

              {/* Facility Details Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <p className="text-slate-500 font-medium">Full Address</p>
                  <p className="text-slate-200 font-semibold">{selectedProvider.address}</p>
                  <p className="text-slate-400">{selectedProvider.city || "Local Area"}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <p className="text-slate-500 font-medium">Operating Schedule</p>
                  <p className="text-slate-200 font-semibold">{selectedProvider.hours}</p>
                  <p className="text-emerald-400 font-medium">● Verified Healthcare Facility</p>
                </div>
              </div>

              {/* Action Buttons: Directions & Call */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${selectedProvider.latitude},${selectedProvider.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary w-full sm:flex-1 py-3 text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Get Driving Directions from (You)</span>
                </a>

                {selectedProvider.phone && (
                  <a
                    href={`tel:${selectedProvider.phone.replace(/\s+/g, "")}`}
                    className="btn btn-secondary w-full sm:w-auto py-3 text-xs flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-300">Select a Healthcare Provider</p>
              <p className="text-xs text-slate-500">
                Choose a pin on the map or an item in the list to view exact route and direct driving navigation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NearbyCareMap;
