import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Search,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  MapPin,
  ExternalLink,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Complaint } from '../types';
import {
  searchGeocodeLocations,
  GeocodeSearchResult,
  getCurrentUserLocation,
} from '../utils/reverseGeocode';

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
    label: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
  street: {
    label: 'Street',
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

  const [activeComplaint, setActiveComplaint] =
    useState<Complaint | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    GeocodeSearchResult[]
  >([]);

  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentTheme, setCurrentTheme] = useState<MapTheme>('osm');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const [userLocationInfo, setUserLocationInfo] = useState<{
    latitude: number;
    longitude: number;
    city?: string;
    source: 'gps' | 'ip';
    accuracy?: number;
  } | null>(null);

  const [locationNotice, setLocationNotice] = useState<string | null>(
    null
  );

  const [isIframeBlocked, setIsIframeBlocked] = useState(false);

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

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [19.2183, 72.9781],
      zoom: 12,
      minZoom: 2,
      maxZoom: 19,
      zoomControl: false,
    });

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
            <div style="
              position:relative;
              display:flex;
              align-items:center;
              justify-content:center;
              width:34px;
              height:34px;
            ">
              <div style="
                position:absolute;
                width:34px;
                height:34px;
                border-radius:999px;
                background:${isLiveGps ? '#60A5FA' : '#34D399'};
                opacity:.25;
              "></div>

              <div style="
                position:relative;
                display:flex;
                align-items:center;
                justify-content:center;
                width:22px;
                height:22px;
                border-radius:999px;
                background:${isLiveGps ? '#2563EB' : '#059669'};
                border:3px solid white;
                box-shadow:0 2px 8px rgba(15,23,42,.3);
                color:white;
                font-size:11px;
              ">
                ●
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
        }

        if (userCircleRef.current) {
          map.removeLayer(userCircleRef.current);
        }

        const marker = L.marker([latitude, longitude], {
          icon: userIcon,
        }).addTo(map);

        marker.bindPopup(`
          <div style="padding:8px;font-family:Inter,Arial,sans-serif;color:#0f172a;font-size:12px;">
            <strong style="font-weight:800;">
              ${isLiveGps ? 'Your GPS Location' : 'Your Network Location'}
            </strong>
            <br/>
            <span>
              ${res.city ? `${res.city}, ` : ''}
              ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°
            </span>
            <br/>
            <span style="font-size:10px;color:#64748b;">
              ${
                isLiveGps
                  ? `Accuracy: ±${accuracy?.toFixed(0) || '4'}m`
                  : 'Estimated via Network IP'
              }
            </span>
          </div>
        `);

        userMarkerRef.current = marker;

        if (accuracy && isLiveGps) {
          userCircleRef.current = L.circle(
            [latitude, longitude],
            {
              radius: Math.min(accuracy, 250),
              color: '#2563EB',
              fillColor: '#2563EB',
              fillOpacity: 0.12,
              weight: 1.5,
            }
          ).addTo(map);
        }

        if (!selectedComplaintId) {
          map.flyTo(
            [latitude, longitude],
            13,
            {
              animate: true,
              duration: 1.2,
            }
          );
        }
      } else if (res.isIframeBlocked) {
        setIsIframeBlocked(true);
      }
    } catch {
      // Background location failure is intentionally ignored.
    }
  };

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

      let color = '#2563EB';
      let pulse = 'rgba(37,99,235,.20)';

      if (complaint.status === 'repair_in_progress') {
        color = '#D97706';
        pulse = 'rgba(217,119,6,.18)';
      } else if (complaint.status === 'verified') {
        color = '#059669';
        pulse = 'rgba(5,150,105,.18)';
      } else if (complaint.status === 'suspicious') {
        color = '#E11D48';
        pulse = 'rgba(225,29,72,.18)';
      }

      const isSelected =
        selectedComplaintId === complaint.id ||
        activeComplaint?.id === complaint.id;

      const iconHtml = `
        <div style="
          position:relative;
          width:34px;
          height:34px;
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
        ">

          <div style="
            position:absolute;
            inset:0;
            border-radius:999px;
            background:${pulse};
            transform:${isSelected ? 'scale(1.15)' : 'scale(1)'};
          "></div>

          <div style="
            position:relative;
            width:26px;
            height:26px;
            border-radius:999px;
            background:white;
            border:3px solid ${color};
            box-shadow:0 2px 8px rgba(15,23,42,.25);
            display:flex;
            align-items:center;
            justify-content:center;
          ">

            <div style="
              width:9px;
              height:9px;
              border-radius:999px;
              background:${color};
            "></div>

          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([lat, lon], {
        icon: customIcon,
      });

      marker.on('click', () => {
        setActiveComplaint(complaint);

        if (onSelectComplaint) {
          onSelectComplaint(complaint);
        }

        map.panTo(
          [lat, lon],
          {
            animate: true,
          }
        );
      });

      marker.addTo(markersLayer);
    });

    if (filtered.length > 0 && !selectedComplaintId) {
      const validCoords = filtered
        .filter(
          (c) =>
            c.location.latitude &&
            c.location.longitude
        )
        .map(
          (c) =>
            [
              c.location.latitude,
              c.location.longitude,
            ] as [number, number]
        );

      if (validCoords.length > 0) {
        try {
          const bounds = L.latLngBounds(validCoords);

          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15,
          });
        } catch {
          // Ignore invalid bounds.
        }
      }
    }
  }, [
    complaints,
    statusFilter,
    selectedComplaintId,
    activeComplaint?.id,
  ]);

  useEffect(() => {
    if (
      selectedComplaintId &&
      mapInstanceRef.current
    ) {
      const found = complaints.find(
        (c) => c.id === selectedComplaintId
      );

      if (
        found &&
        found.location.latitude &&
        found.location.longitude
      ) {
        setActiveComplaint(found);

        mapInstanceRef.current.flyTo(
          [
            found.location.latitude,
            found.location.longitude,
          ],
          15,
          {
            animate: true,
            duration: 1.2,
          }
        );
      }
    }
  }, [selectedComplaintId, complaints]);

  const handleSearch = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      const results =
        await searchGeocodeLocations(searchQuery);

      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (
    result: GeocodeSearchResult
  ) => {
    const map = mapInstanceRef.current;

    if (!map) return;

    map.flyTo(
      [result.latitude, result.longitude],
      15,
      {
        animate: true,
        duration: 1.5,
      }
    );

    L.popup()
      .setLatLng([
        result.latitude,
        result.longitude,
      ])
      .setContent(`
        <div style="
          padding:8px;
          font-family:Inter,Arial,sans-serif;
          color:#0f172a;
          font-size:12px;
        ">
          <strong>${result.road}</strong>
          <br/>
          <span>${result.formattedAddress}</span>
        </div>
      `)
      .openOn(map);

    setSearchResults([]);

    setSearchQuery(
      result.road || result.formattedAddress
    );
  };

  const handleRecenterUser = async () => {
    const map = mapInstanceRef.current;

    if (!map) return;

    setIsLocating(true);
    setLocationNotice(null);

    const res =
      await getCurrentUserLocation(true);

    setIsLocating(false);

    if (
      res.status === 'success' &&
      res.coords
    ) {
      const {
        latitude,
        longitude,
        accuracy,
      } = res.coords;

      setUserLocationInfo({
        latitude,
        longitude,
        city: res.city,
        source: res.source || 'gps',
        accuracy,
      });

      map.flyTo(
        [latitude, longitude],
        15,
        {
          animate: true,
          duration: 1.2,
        }
      );

      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      if (userCircleRef.current) {
        map.removeLayer(userCircleRef.current);
      }

      const isLiveGps = res.source === 'gps';

      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            position:relative;
            display:flex;
            align-items:center;
            justify-content:center;
            width:34px;
            height:34px;
          ">
            <div style="
              position:absolute;
              width:34px;
              height:34px;
              border-radius:999px;
              background:${isLiveGps ? '#60A5FA' : '#34D399'};
              opacity:.25;
            "></div>

            <div style="
              position:relative;
              width:22px;
              height:22px;
              border-radius:999px;
              background:${isLiveGps ? '#2563EB' : '#059669'};
              border:3px solid white;
              box-shadow:0 2px 8px rgba(15,23,42,.3);
            "></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker(
        [latitude, longitude],
        { icon: userIcon }
      ).addTo(map);

      marker.bindPopup(`
        <div style="
          padding:8px;
          font-family:Inter,Arial,sans-serif;
          color:#0f172a;
          font-size:12px;
        ">
          <strong>
            ${isLiveGps ? 'Your GPS Location' : 'Your Network Location'}
          </strong>
          <br/>
          <span>
            ${res.city ? `${res.city}, ` : ''}
            ${latitude.toFixed(4)}°,
            ${longitude.toFixed(4)}°
          </span>
          <br/>
          <span style="font-size:10px;color:#64748b;">
            ${
              isLiveGps
                ? `Accuracy: ±${accuracy?.toFixed(0) || '4'}m`
                : 'Estimated via Network IP'
            }
          </span>
        </div>
      `).openPopup();

      userMarkerRef.current = marker;

      if (accuracy && isLiveGps) {
        userCircleRef.current =
          L.circle(
            [latitude, longitude],
            {
              radius: Math.min(
                accuracy,
                250
              ),
              color: '#2563EB',
              fillColor: '#2563EB',
              fillOpacity: 0.12,
              weight: 1.5,
            }
          ).addTo(map);
      }

      setLocationNotice(
        `Located: ${
          res.city || 'Your coordinates'
        } (${isLiveGps ? 'Live GPS' : 'Network IP'})`
      );
    } else {
      if (res.isIframeBlocked) {
        setIsIframeBlocked(true);
      }

      setLocationNotice(
        res.errorMessage ||
          'Unable to retrieve location.'
      );
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${className}`}
    >

      {/* SEARCH + FILTERS */}
      <div className="pointer-events-none absolute left-4 right-4 top-4 z-[1000] flex flex-col gap-2 md:flex-row md:items-start md:justify-between">

        {/* SEARCH */}
        <div className="pointer-events-auto relative w-full md:w-[360px]">
          <form
            onSubmit={handleSearch}
            className="relative"
          >
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search a road, landmark or city"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-xs font-medium text-slate-800 shadow-lg outline-none backdrop-blur-md placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />

            {isSearching ? (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-600" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </form>

          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-[1001] mt-2 max-h-64 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-xl">

              {searchResults.map(
                (item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      handleSelectSearchResult(
                        item
                      )
                    }
                    className="flex w-full items-start gap-2 p-3 text-left text-xs transition hover:bg-slate-50"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                    <div className="min-w-0">
                      <strong className="block font-bold text-slate-800">
                        {item.road}
                      </strong>

                      <span className="line-clamp-1 text-[11px] text-slate-400">
                        {item.formattedAddress}
                      </span>
                    </div>
                  </button>
                )
              )}

            </div>
          )}
        </div>

        {/* STATUS FILTER */}
        <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">

          <button
            onClick={() =>
              setStatusFilter('all')
            }
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-bold transition ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            All {complaints.length}
          </button>

          <button
            onClick={() =>
              setStatusFilter('reported')
            }
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-bold transition ${
              statusFilter === 'reported'
                ? 'bg-blue-600 text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Reported
          </button>

          <button
            onClick={() =>
              setStatusFilter(
                'repair_in_progress'
              )
            }
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-bold transition ${
              statusFilter ===
              'repair_in_progress'
                ? 'bg-amber-500 text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            In Repair
          </button>

          <button
            onClick={() =>
              setStatusFilter('verified')
            }
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-bold transition ${
              statusFilter === 'verified'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Verified
          </button>
        </div>
      </div>

      {/* LOCATION NOTICE */}
      {(locationNotice ||
        userLocationInfo ||
        isIframeBlocked) && (
        <div className="absolute left-4 right-4 top-20 z-[1000] flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 text-xs shadow-lg backdrop-blur-md">

          <div className="flex items-center gap-2">

            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute h-full w-full animate-ping rounded-full bg-blue-400 opacity-50" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-blue-600" />
            </span>

            {userLocationInfo ? (
              <span className="text-slate-600">
                Current location:{' '}
                <strong className="text-slate-900">
                  {userLocationInfo.city ||
                    `${userLocationInfo.latitude.toFixed(
                      4
                    )}°, ${userLocationInfo.longitude.toFixed(
                      4
                    )}°`}
                </strong>{' '}
                <span className="text-[10px] text-slate-400">
                  (
                  {userLocationInfo.source ===
                  'gps'
                    ? 'Live GPS'
                    : 'Network estimate'}
                  )
                </span>
              </span>
            ) : locationNotice ? (
              <span className="text-slate-600">
                {locationNotice}
              </span>
            ) : isIframeBlocked ? (
              <span className="text-amber-700">
                Browser GPS is restricted in preview.
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">

            {isIframeBlocked && (
              <a
                href={
                  typeof window !== 'undefined'
                    ? window.location.href
                    : '#'
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100"
              >
                Open in New Tab
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            {userLocationInfo && (
              <button
                type="button"
                onClick={handleRecenterUser}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-200"
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
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>

          </div>
        </div>
      )}

      {/* MAP CONTROLS */}
      <div className="absolute bottom-5 right-4 z-[1000] flex flex-col items-end gap-2">

        {showLayerMenu && (
          <div className="mb-1 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">

            <div className="px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
              Map Style
            </div>

            <div className="mt-1 space-y-1">

              {(Object.keys(
                MAP_THEMES
              ) as MapTheme[]).map(
                (theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() =>
                      switchTheme(theme)
                    }
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                      currentTheme === theme
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>
                      {MAP_THEMES[theme].label}
                    </span>

                    {currentTheme ===
                      theme && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                )
              )}

            </div>
          </div>
        )}

        <button
          onClick={() =>
            setShowLayerMenu(
              !showLayerMenu
            )
          }
          title="Switch Map Layer"
          className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-lg transition ${
            showLayerMenu
              ? 'border-blue-200 bg-blue-50 text-blue-600'
              : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
          }`}
        >
          <Layers className="h-4 w-4" />
        </button>

        <button
          onClick={handleRecenterUser}
          disabled={isLocating}
          title="Recenter on My Location"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:border-blue-200 hover:text-blue-600 disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </button>

        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">

          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex h-9 w-10 items-center justify-center border-b border-slate-100 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex h-9 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

        </div>
      </div>

      {/* SELECTED MAP REPORT */}
      {activeComplaint && (
        <div className="absolute bottom-5 left-4 z-[1000] w-[calc(100%-5rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">

          <div className="flex items-start justify-between gap-3">

            <div className="flex min-w-0 items-center gap-2">

              <span className="font-mono text-[10px] font-bold text-blue-600">
                {activeComplaint.id}
              </span>

              <span
                className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase ${
                  activeComplaint.status ===
                  'verified'
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                    : activeComplaint.status ===
                      'repair_in_progress'
                    ? 'border-amber-100 bg-amber-50 text-amber-700'
                    : activeComplaint.status ===
                      'suspicious'
                    ? 'border-rose-100 bg-rose-50 text-rose-700'
                    : 'border-blue-100 bg-blue-50 text-blue-700'
                }`}
              >
                {activeComplaint.status.replace(
                  '_',
                  ' '
                )}
              </span>

            </div>

            <button
              onClick={() =>
                setActiveComplaint(null)
              }
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>

          </div>

          <div className="mt-3">

            <h4 className="text-sm font-black leading-snug text-slate-900">
              {activeComplaint.location.road}
            </h4>

            <p className="mt-1 text-[11px] text-slate-500">
              {activeComplaint.location.landmark
                ? `${activeComplaint.location.landmark}, `
                : ''}
              {activeComplaint.location.city}
              {activeComplaint.location.state
                ? `, ${activeComplaint.location.state}`
                : ''}
            </p>

          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 border-y border-slate-100 py-3">

            <div>
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Severity
              </span>

              <span className="mt-1 block text-[10px] font-bold text-slate-700">
                {activeComplaint.severity}
              </span>
            </div>

            <div>
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Hazard Score
              </span>

              <span className="mt-1 block text-[10px] font-bold text-blue-600">
                {activeComplaint.hazardScore}/100
              </span>
            </div>

          </div>

          <div className="flex items-center justify-between gap-3">

            <span className="truncate text-[10px] text-slate-400">
              {activeComplaint.department}
            </span>

            {onSelectComplaint && (
              <button
                onClick={() =>
                  onSelectComplaint(
                    activeComplaint
                  )
                }
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-blue-700"
              >
                View Report
                <ExternalLink className="h-3 w-3" />
              </button>
            )}

          </div>

        </div>
      )}

      {/* MAP */}
      <div
        ref={mapContainerRef}
        className="z-[1] h-full w-full"
      />
    </div>
  );
};
