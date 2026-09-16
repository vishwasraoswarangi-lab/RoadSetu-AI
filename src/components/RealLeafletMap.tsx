import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Search,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  X,
  Loader2,
} from 'lucide-react';
import { Complaint } from '../types';
import { searchGeocodeLocations, GeocodeSearchResult, getCurrentUserLocation } from '../utils/reverseGeocode';

interface RealLeafletMapProps {
  complaints: Complaint[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: Complaint) => void;
  className?: string;
}

type MapTheme = 'osm' | 'satellite' | 'street';

const MAP_THEMES: Record<
  MapTheme,
  { label: string; url: string; attribution: string; maxZoom: number }
> = {
  osm: {
    label: 'OpenStreetMap (Civic)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    label: 'Satellite Aerial (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
  street: {
    label: 'Esri World Street',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; DeLorme, TomTom',
    maxZoom: 19,
  },
};

export const RealLeafletMap: React.FC<RealLeafletMapProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GeocodeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentTheme, setCurrentTheme] = useState<MapTheme>('osm');
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [userLocationInfo, setUserLocationInfo] = useState<{
    latitude: number;
    longitude: number;
    city?: string;
    source: 'gps' | 'ip';
    accuracy?: number;
  } | null>(null);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [isIframeBlocked, setIsIframeBlocked] = useState<boolean>(false);

  // Switch Map Theme dynamically
  const switchTheme = (theme: MapTheme) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = MAP_THEMES[theme];
    const newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    });
    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
    setCurrentTheme(theme);
    setShowLayerMenu(false);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on India / Thane default corridor, but users can zoom out to entire world
    const map = L.map(mapContainerRef.current, {
      center: [19.2183, 72.9781],
      zoom: 12,
      minZoom: 2,
      maxZoom: 19,
      zoomControl: false, // We'll render custom sleek GovTech zoom controls
    });

    // 100% Free, open-source OpenStreetMap layer (no API key required, zero watermarks)
    const initialConfig = MAP_THEMES.osm;
    const baseTiles = L.tileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom,
    });
    baseTiles.addTo(map);
    tileLayerRef.current = baseTiles;

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Automatically attempt to locate user on map initialization
    autoLocateUser(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const autoLocateUser = async (map: L.Map) => {
    try {
      const res = await getCurrentUserLocation(true);
      if (res.status === 'success' && res.coords) {
        const { latitude, longitude, accuracy } = res.coords;
        setUserLocationInfo({
          latitude,
          longitude,
          city: res.city,
          source: res.source || 'gps',
          accuracy,
        });

        const isLiveGps = res.source === 'gps';
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8">
              <div class="absolute w-full h-full rounded-full ${isLiveGps ? 'bg-cyan-400' : 'bg-emerald-400'} animate-ping opacity-75"></div>
              <div class="relative flex items-center justify-center w-6 h-6 rounded-full ${isLiveGps ? 'bg-cyan-500' : 'bg-emerald-500'} border-2 border-white shadow-xl text-[10px] text-white font-bold">
                📍
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
        if (userCircleRef.current) map.removeLayer(userCircleRef.current);

        const marker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
        marker.bindPopup(
          `<div class="p-2 text-xs font-sans text-slate-950">
            <strong class="font-bold">${isLiveGps ? '🛰️ Your Real GPS Location' : '🌐 Your Network Location'}</strong><br/>
            <span>${res.city ? `${res.city}, ` : ''}${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°</span><br/>
            <span class="text-[10px] text-slate-600">${isLiveGps ? 'Accuracy: ±' + (accuracy?.toFixed(0) || '4') + 'm' : 'Estimated via Network IP'}</span>
          </div>`
        );
        userMarkerRef.current = marker;

        if (accuracy && isLiveGps) {
          userCircleRef.current = L.circle([latitude, longitude], {
            radius: Math.min(accuracy, 250),
            color: '#06B6D4',
            fillColor: '#06B6D4',
            fillOpacity: 0.15,
            weight: 1.5,
          }).addTo(map);
        }

        // Only fly to user location if no specific complaint is pre-selected
        if (!selectedComplaintId) {
          map.flyTo([latitude, longitude], 13, { animate: true, duration: 1.2 });
        }
      } else if (res.isIframeBlocked) {
        setIsIframeBlocked(true);
      }
    } catch {
      // Ignore initial background locate error
    }
  };

  // Update markers when complaints or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const filtered = complaints.filter((c) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') {
        return c.status !== 'verified' && c.status !== 'closed';
      }
      return c.status === statusFilter;
    });

    filtered.forEach((complaint) => {
      const lat = complaint.location.latitude;
      const lon = complaint.location.longitude;
      if (!lat || !lon) return;

      // Color coding based on status
      let colorClass = '#EF4444'; // Red
      let pulseColor = 'rgba(239, 68, 68, 0.4)';
      let badgeLabel = 'Reported';

      if (complaint.status === 'repair_in_progress') {
        colorClass = '#F59E0B'; // Amber
        pulseColor = 'rgba(245, 158, 11, 0.4)';
        badgeLabel = 'In Repair';
      } else if (complaint.status === 'verified') {
        colorClass = '#10B981'; // Emerald
        pulseColor = 'rgba(16, 185, 129, 0.4)';
        badgeLabel = 'Verified';
      } else if (complaint.status === 'suspicious') {
        colorClass = '#EC4899'; // Crimson
        pulseColor = 'rgba(236, 72, 153, 0.4)';
        badgeLabel = 'Flagged';
      }

      const isSelected = selectedComplaintId === complaint.id || activeComplaint?.id === complaint.id;

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
          <div class="absolute inset-0 rounded-full animate-ping" style="background-color: ${pulseColor}; opacity: ${
        isSelected ? '0.8' : '0.4'
      };"></div>
          <div class="relative flex items-center justify-center w-7 h-7 rounded-full border-2 shadow-lg transition-transform ${
            isSelected ? 'scale-125 ring-2 ring-cyan-400' : 'hover:scale-110'
          }" style="background-color: #0F172A; border-color: ${colorClass};">
            <div class="w-3 h-3 rounded-full" style="background-color: ${colorClass};"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lon], { icon: customIcon });

      marker.on('click', () => {
        setActiveComplaint(complaint);
        if (onSelectComplaint) {
          onSelectComplaint(complaint);
        }
        map.panTo([lat, lon], { animate: true });
      });

      marker.addTo(markersLayer);
    });

    // Fit bounds if we have markers and it's initial load
    if (filtered.length > 0 && !selectedComplaintId) {
      const validCoords = filtered
        .filter((c) => c.location.latitude && c.location.longitude)
        .map((c) => [c.location.latitude, c.location.longitude] as [number, number]);

      if (validCoords.length > 0) {
        try {
          const bounds = L.latLngBounds(validCoords);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } catch (e) {
          // ignore invalid bounds
        }
      }
    }
  }, [complaints, statusFilter, selectedComplaintId, activeComplaint?.id]);

  // Sync selected complaint from props
  useEffect(() => {
    if (selectedComplaintId && mapInstanceRef.current) {
      const found = complaints.find((c) => c.id === selectedComplaintId);
      if (found && found.location.latitude && found.location.longitude) {
        setActiveComplaint(found);
        mapInstanceRef.current.flyTo(
          [found.location.latitude, found.location.longitude],
          15,
          { animate: true, duration: 1.2 }
        );
      }
    }
  }, [selectedComplaintId, complaints]);

  // Handle Search Execution
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchGeocodeLocations(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: GeocodeSearchResult) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo([result.latitude, result.longitude], 15, {
      animate: true,
      duration: 1.5,
    });

    // Place temporary query pin
    L.popup()
      .setLatLng([result.latitude, result.longitude])
      .setContent(
        `<div class="p-2 text-xs font-sans text-slate-900">
          <strong>${result.road}</strong><br/>
          <span>${result.formattedAddress}</span>
        </div>`
      )
      .openOn(map);

    setSearchResults([]);
    setSearchQuery(result.road || result.formattedAddress);
  };

  // Recenter on user's real geolocation
  const handleRecenterUser = async () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setIsLocating(true);
    setLocationNotice(null);

    const res = await getCurrentUserLocation(true);
    setIsLocating(false);

    if (res.status === 'success' && res.coords) {
      const { latitude, longitude, accuracy } = res.coords;

      setUserLocationInfo({
        latitude,
        longitude,
        city: res.city,
        source: res.source || 'gps',
        accuracy,
      });

      map.flyTo([latitude, longitude], 15, { animate: true, duration: 1.2 });

      // Remove existing user markers
      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      if (userCircleRef.current) map.removeLayer(userCircleRef.current);

      const isLiveGps = res.source === 'gps';
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute w-full h-full rounded-full ${isLiveGps ? 'bg-cyan-400' : 'bg-emerald-400'} animate-ping opacity-75"></div>
            <div class="relative flex items-center justify-center w-6 h-6 rounded-full ${isLiveGps ? 'bg-cyan-500' : 'bg-emerald-500'} border-2 border-white shadow-xl text-[10px] text-white font-bold">
              📍
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
      marker.bindPopup(
        `<div class="p-2 text-xs font-sans text-slate-950">
          <strong class="font-bold">${isLiveGps ? '🛰️ Your Real GPS Location' : '🌐 Your Network Location'}</strong><br/>
          <span>${res.city ? `${res.city}, ` : ''}${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°</span><br/>
          <span class="text-[10px] text-slate-600">${isLiveGps ? 'Accuracy: ±' + (accuracy?.toFixed(0) || '4') + 'm' : 'Estimated via Network IP'}</span>
        </div>`
      ).openPopup();
      userMarkerRef.current = marker;

      if (accuracy && isLiveGps) {
        userCircleRef.current = L.circle([latitude, longitude], {
          radius: Math.min(accuracy, 250),
          color: '#06B6D4',
          fillColor: '#06B6D4',
          fillOpacity: 0.15,
          weight: 1.5,
        }).addTo(map);
      }

      setLocationNotice(`📍 Located: ${res.city || 'Your coordinates'} (${isLiveGps ? 'Live GPS' : 'Network IP'})`);
    } else {
      if (res.isIframeBlocked) {
        setIsIframeBlocked(true);
      }
      setLocationNotice(res.errorMessage || 'Unable to retrieve location.');
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl border border-slate-800 bg-[#0B0F17] ${className}`}>
      {/* Search and Navigation Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 pointer-events-none">
        {/* Real Geocoding Search Box */}
        <div className="relative pointer-events-auto w-full md:w-96">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any road, landmark, city worldwide..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-400 shadow-xl backdrop-blur-md focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            {isSearching ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400 animate-spin" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </form>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur-lg divide-y divide-slate-800 max-h-64 overflow-y-auto z-[1001]">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left p-3 hover:bg-slate-800/80 transition-colors text-xs flex items-start space-x-2"
                >
                  <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">{item.road}</strong>
                    <span className="text-[11px] text-slate-400 line-clamp-1">
                      {item.formattedAddress}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter Badges */}
        <div className="pointer-events-auto flex items-center space-x-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1 backdrop-blur-md shadow-xl text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            All ({complaints.length})
          </button>
          <button
            onClick={() => setStatusFilter('reported')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              statusFilter === 'reported'
                ? 'bg-rose-500 text-white shadow'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            Reported
          </button>
          <button
            onClick={() => setStatusFilter('repair_in_progress')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              statusFilter === 'repair_in_progress'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            In Repair
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              statusFilter === 'verified'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            Verified
          </button>
        </div>
      </div>

      {/* Location Status / Iframe Notification Bar */}
      {(locationNotice || userLocationInfo || isIframeBlocked) && (
        <div className="absolute top-20 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700/80 bg-slate-950/90 px-3.5 py-2 text-xs backdrop-blur-md shadow-2xl">
          <div className="flex items-center space-x-2">
            <div className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute h-full w-full rounded-full bg-cyan-400 animate-ping opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-cyan-400" />
            </div>
            {userLocationInfo ? (
              <span className="text-slate-200">
                Current Location:{' '}
                <strong className="text-cyan-300">
                  {userLocationInfo.city ? `${userLocationInfo.city}` : `${userLocationInfo.latitude.toFixed(4)}°, ${userLocationInfo.longitude.toFixed(4)}°`}
                </strong>{' '}
                <span className="text-[10px] text-slate-400">
                  ({userLocationInfo.source === 'gps' ? '🛰️ Real-time GPS' : '🌐 Network IP Estimate'})
                </span>
              </span>
            ) : locationNotice ? (
              <span className="text-slate-300">{locationNotice}</span>
            ) : isIframeBlocked ? (
              <span className="text-amber-300">
                ⚠️ Browser GPS restricted inside preview iframe.
              </span>
            ) : null}
          </div>

          <div className="flex items-center space-x-2">
            {isIframeBlocked && (
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/30 flex items-center space-x-1"
              >
                <span>Open in New Tab for Live GPS</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {userLocationInfo && (
              <button
                type="button"
                onClick={handleRecenterUser}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
              >
                Re-center
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setLocationNotice(null);
                setIsIframeBlocked(false);
              }}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Sleek Floating Map Controls (Zoom, Location & Layers) */}
      <div className="absolute right-4 bottom-6 z-[1000] flex flex-col items-end space-y-2">
        {/* Layer Selection Dropdown */}
        {showLayerMenu && (
          <div className="mb-1 w-52 rounded-xl border border-slate-700 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Basemap Layer (Free / No Key)
            </div>
            <div className="mt-1 space-y-1">
              {(Object.keys(MAP_THEMES) as MapTheme[]).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => switchTheme(theme)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    currentTheme === theme
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{MAP_THEMES[theme].label}</span>
                  {currentTheme === theme && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Layer Switcher Toggle */}
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          title="Switch Map Layer (OpenStreetMap / Satellite / Street)"
          className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-xl backdrop-blur-md active:scale-95 transition-all ${
            showLayerMenu
              ? 'border-cyan-500 bg-cyan-950/80 text-cyan-300'
              : 'border-slate-700 bg-slate-900/90 text-slate-200 hover:border-cyan-500 hover:text-cyan-400'
          }`}
        >
          <Layers className="h-4 w-4" />
        </button>

        <button
          onClick={handleRecenterUser}
          disabled={isLocating}
          title="Recenter on My Location"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 text-slate-200 shadow-xl backdrop-blur-md hover:border-cyan-500 hover:text-cyan-400 active:scale-95 disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </button>

        <div className="flex flex-col rounded-xl border border-slate-700 bg-slate-900/90 shadow-xl backdrop-blur-md overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex h-9 w-10 items-center justify-center text-slate-200 hover:bg-slate-800 hover:text-white border-b border-slate-800"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex h-9 w-10 items-center justify-center text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active Complaint Inspector Drawer Overlay */}
      {activeComplaint && (
        <div className="absolute left-4 bottom-6 z-[1000] max-w-sm w-full rounded-2xl border border-slate-700/80 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-cyan-400">
                {activeComplaint.id}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  activeComplaint.status === 'verified'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : activeComplaint.status === 'repair_in_progress'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                    : activeComplaint.status === 'suspicious'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                }`}
              >
                {activeComplaint.status.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={() => setActiveComplaint(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-1">
            <h4 className="text-sm font-bold text-white leading-snug">
              {activeComplaint.location.road}
            </h4>
            <p className="text-xs text-slate-400">
              {activeComplaint.location.landmark ? `${activeComplaint.location.landmark}, ` : ''}
              {activeComplaint.location.city}
              {activeComplaint.location.state ? `, ${activeComplaint.location.state}` : ''}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-y border-slate-800/80 py-2.5">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Severity</span>
              <span className="font-semibold text-slate-200">
                {activeComplaint.severity} (Hazard: {activeComplaint.hazardScore}/100)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Reported</span>
              <span className="font-semibold text-slate-200">
                {new Date(activeComplaint.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
              {activeComplaint.department}
            </span>
            {onSelectComplaint && (
              <button
                onClick={() => onSelectComplaint(activeComplaint)}
                className="flex items-center space-x-1 rounded-lg bg-cyan-500/20 px-2.5 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
              >
                <span>Full Ledger</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Real Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-[1]" />
    </div>
  );
};
