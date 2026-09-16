export interface RoadLocation {
  latitude: number;
  longitude: number;
  address: string;
  road?: string;
  area?: string;
  city?: string;
  region?: string;
  country?: string;
  source: 'gps' | 'ip';
}

async function reverseGeocode(latitude: number, longitude: number) {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`, {
    headers: { Accept: 'application/json', 'Accept-Language': 'en' },
  });
  if (!response.ok) throw new Error('Reverse geocoding failed');
  const data = await response.json();
  const a = data.address || {};
  return {
    address: data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    road: a.road || a.pedestrian || a.footway,
    area: a.suburb || a.neighbourhood || a.village || a.town,
    city: a.city || a.municipality || a.town || a.village,
    region: a.state,
    country: a.country,
  };
}

export function getBrowserLocation(options: PositionOptions = { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }): Promise<RoadLocation> {
  if (!navigator.geolocation) return Promise.reject(new Error('Browser location is not supported.'));
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(async position => {
      try {
        const { latitude, longitude } = position.coords;
        const place = await reverseGeocode(latitude, longitude);
        resolve({ latitude, longitude, ...place, source: 'gps' });
      } catch {
        resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude, address: 'Current GPS location', source: 'gps' });
      }
    }, error => reject(new Error(error.code === error.PERMISSION_DENIED ? 'Location permission was denied. Please enable location access in your browser.' : 'Unable to obtain your current GPS location.')), options);
  });
}
