import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import api from '../api/axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const orangeIcon = new L.DivIcon({
  html: `<div style="width:22px;height:22px;background:#f97316;border:2.5px solid white;border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,0.25)"></div>`,
  className: '', iconSize: [22, 22], iconAnchor: [11, 11],
});
const userIcon = new L.DivIcon({
  html: `<div style="width:26px;height:26px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 4px 12px rgba(59,130,246,0.5)"></div>`,
  className: '', iconSize: [26, 26], iconAnchor: [13, 13],
});
const nearbyIcon = new L.DivIcon({
  html: `<div style="width:20px;height:20px;background:#22c55e;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(34,197,94,0.4)"></div>`,
  className: '', iconSize: [20, 20], iconAnchor: [10, 10],
});
const heritageIcon = new L.DivIcon({
  html: `<div style="width:22px;height:22px;background:#8b5cf6;border:2.5px solid white;border-radius:50%;box-shadow:0 3px 6px rgba(139,92,246,0.35)"></div>`,
  className: '', iconSize: [22, 22], iconAnchor: [11, 11],
});

const PLACE_IMAGES = {
  'everest':       'https://excitingnepal.com/wp-content/uploads/2021/12/12-Days-Everest-base-Camp-trek.jpeg',
  'annapurna':     'https://www.muchbetteradventures.com/magazine/content/images/2025/10/Annapurna-Circuit-6-1600x1067--1-.jpeg',
  'pokhara':       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeDZk17QM6JRKKN71_qewPyTInd7yy__unDiXOoMxKKg&s=10',
  'chitwan':       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTixQfIWS38WccmiixUtMxTgZdUBVhCaah29W7zUjwS-w&s=10',
  'kathmandu':     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ_Nkkgc_05LA-ihupeOzPVHBBtvyNoo4sEOvk-OAFuA&s=10',
  'lumbini':       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGB7zvrRche50w7GUbD83AB3Zi4_Gb3atDqeEax7w2hw&s=10',
  'pashupatinath': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR98JRXTz0GEJ6a331FcT2d_NzF4s3OtR1uXh56b8DsKA&s=10',
  'boudhanath':    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4t-0ZRTRLxXH5WdRxGh3OaKkpK7bMf_Dsn2mAdLCftg&s=10',
  'swayambhunath': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjJCo0kMZc38DvpivvUvCNu_lUJPovTxmApbnCWf4zuw&s=10',
  'langtang':      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxJCdZy9C6xxd_kgFGzpTasC-9uCaCn4tghFePbew5Zw&s=10',
  'mustang':       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu6w7Kd4MmEn6UWoWVYLiWWI8172thIIMXkRmLdPPSmg&s=10',
  'manaslu':       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQUSx6ZCcziJ6JKr_fxIeaa-gorLa6sGqwbr9CbUTyBw&s=10',
  'poon hill':     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1mfvx_MVBWnVuuq078Pt0UG7Blc4NaGiFoJSAksfvIA&s=10',
  'gokyo':         'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgfrhCGajrL9B4YKuFwvNjb_GRZYTwiop54_6iDg8s1g&s=10',
  'kanchenjunga':  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQeoIyuMOnyypSoxUBJaRRJ40kGXM4soo-1gwYKl6Ijw&s=10',
  'patan':         'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi4jMhQjDshwkZjJBJ6bE13AKTU7IInzOtKlCaZtXZiQ&s=10',
  'bhaktapur':     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZQgxMSQiw869BA2okXYInwcDl22Kf6c1XKrLm7Hi2Wg&s=10',
  'sagarmatha':    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFQ8MwwDBRP8v4UZt6ORs4Ce7n8GK3dYOKCB0kqlQfQg&s=10',
  'dolpo':         'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQQEf0ksjmZ-OhRlBNadF2YJpkV52eGw0dvHJQGxqBTQ&s=10',
  'default':       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf5Pifvcg98AfFWbvaiO9Popj9YR5GNsjUg1kOFT4JdQ&s=10',
};

function getPlaceImage(name) {
  if (!name) return PLACE_IMAGES.default;
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(PLACE_IMAGES)) {
    if (key !== 'default' && lower.includes(key)) return url;
  }
  return PLACE_IMAGES.default;
}

function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 13, { animate: true, duration: 1.5 });
  }, [coords, map]);
  return null;
}

const NEPAL_CENTER = [28.3949, 84.1240];
const categories   = ['All', 'Trekking', 'Heritage', 'Wildlife', 'City'];

export default function MapPage() {
  const [places,          setPlaces]          = useState([]);
  const [selected,        setSelected]        = useState(null);
  const [filter,          setFilter]          = useState('All');
  const [userLocation,    setUserLocation]    = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [nearbyPlaces,    setNearbyPlaces]    = useState([]);
  const [flyTarget,       setFlyTarget]       = useState(null);

  // Load places + heritage, merge deduped
  useEffect(() => {
    Promise.all([
      api.get('/places').catch(() => ({ data: [] })),
      api.get('/heritage').catch(() => ({ data: [] })),
    ]).then(([placesRes, heritageRes]) => {
      const all = [...(placesRes.data || []), ...(heritageRes.data || [])];
      // Deduplicate by _id
      const seen = new Set();
      const deduped = all.filter(p => {
        if (seen.has(p._id)) return false;
        seen.add(p._id);
        return true;
      });
      setPlaces(deduped);
    });
  }, []);

  // Restore saved location on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('userLocation');
    if (saved) {
      try { setUserLocation(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Recalculate nearby whenever location or places change
  useEffect(() => {
    if (!userLocation || places.length === 0) return;
    const nearby = places.filter(p => {
      const lat = parseFloat(p.lat);
      const lng = parseFloat(p.lng);
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return false;
      const dist = Math.sqrt(
        Math.pow((lat - userLocation[0]) * 111, 2) +
        Math.pow((lng - userLocation[1]) * 111 * Math.cos(userLocation[0] * Math.PI / 180), 2)
      );
      return dist < 50;
    });
    setNearbyPlaces(nearby);
  }, [userLocation, places]);

  // Handle redirect from Heritage page
  useEffect(() => {
    const stored = sessionStorage.getItem('map_popup_place');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setSelected(p);
        const lat = parseFloat(p.lat);
        const lng = parseFloat(p.lng);
        if (lat && lng) setFlyTarget([lat, lng]);
      } catch {}
      sessionStorage.removeItem('map_popup_place');
    }
  }, []);

  function getLocation() {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setFlyTarget(coords);
        sessionStorage.setItem('userLocation', JSON.stringify(coords));
        setLocationLoading(false);
      },
      err => {
        setLocationLoading(false);
        alert('Could not get location: ' + err.message);
      },
      { timeout: 10000 }
    );
  }

  function handleSelectPlace(p) {
    setSelected(p);
    const lat = parseFloat(p.lat);
    const lng = parseFloat(p.lng);
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) setFlyTarget([lat, lng]);
  }

  const filtered = filter === 'All' ? places : places.filter(p => {
    const cat = (p.category || '').toLowerCase();
    if (filter === 'Heritage') return cat === 'heritage';
    if (filter === 'Trekking') return cat === 'trail' || cat === 'trekking';
    if (filter === 'Wildlife') return (
      p.description?.toLowerCase().includes('wildlife') ||
      p.district?.toLowerCase().includes('chitwan') ||
      cat === 'wildlife'
    );
    if (filter === 'City') return (
      ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Kaski']
        .includes(p.district)
    );
    return true;
  });

  function getMarkerIcon(p) {
    if (nearbyPlaces.find(n => n._id === p._id)) return nearbyIcon;
    if ((p.category || '').toLowerCase() === 'heritage') return heritageIcon;
    return orangeIcon;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Manrope, sans-serif', background: '#fff8f4' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <aside style={{ width: 280, background: '#fff', borderRight: '1px solid #e0d9cc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          className="hidden md:flex">
          <div className="p-4 border-b" style={{ borderColor: '#e0d9cc' }}>
            <h2 className="font-bold mb-3" style={{ color: '#1f1b17' }}>Adventure Map</h2>

            <button onClick={getLocation} disabled={locationLoading} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: '8px 12px', borderRadius: 10, marginBottom: 10,
              background: userLocation ? '#22c55e' : '#3b82f6', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Manrope',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {locationLoading ? 'sync' : userLocation ? 'my_location' : 'location_searching'}
              </span>
              {locationLoading ? 'Locating…' : userLocation ? 'Location Found' : 'Show My Location'}
            </button>

            {userLocation && nearbyPlaces.length > 0 && (
              <div style={{ padding: '6px 10px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #86efac', marginBottom: 8 }}>
                <p style={{ fontSize: 11, color: '#15803d', margin: 0 }}>
                  🟢 {nearbyPlaces.length} places within 50km of you
                </p>
              </div>
            )}

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                  style={{
                    background:  filter === c ? '#9d4300' : '#fff',
                    color:       filter === c ? '#fff'    : '#584237',
                    borderColor: filter === c ? '#9d4300' : '#e0d9cc',
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Place list */}
          <div className="flex-1 overflow-y-auto p-3">
            <p style={{ fontSize: 11, color: '#8c7164', padding: '4px 4px 8px', fontWeight: 600 }}>
              {filtered.length} destinations
            </p>
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl mb-2" style={{ color: '#e0d9cc' }}>map</span>
                <p className="text-xs" style={{ color: '#8c7164' }}>No places found</p>
              </div>
            ) : filtered.map(p => {
              const isNearby   = !!nearbyPlaces.find(n => n._id === p._id);
              const isHeritage = (p.category || '').toLowerCase() === 'heritage';
              return (
                <button key={p._id} onClick={() => handleSelectPlace(p)}
                  className="w-full text-left p-3 rounded-xl mb-1 transition-all hover:bg-orange-50 flex items-start gap-3"
                  style={{
                    background: selected?._id === p._id ? '#fff8f4' : 'transparent',
                    border:     selected?._id === p._id ? '1px solid #f97316' : '1px solid transparent',
                  }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: isNearby ? 'rgba(34,197,94,0.15)' : isHeritage ? 'rgba(139,92,246,0.15)' : 'rgba(249,115,22,0.15)' }}>
                    <span className="material-symbols-outlined text-[16px]"
                      style={{
                        color: isNearby ? '#22c55e' : isHeritage ? '#8b5cf6' : '#f97316',
                        fontVariationSettings: "'FILL' 1"
                      }}>
                      {isHeritage ? 'account_balance' : 'location_on'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1f1b17' }}>{p.name}</p>
                    <p className="text-xs" style={{ color: '#8c7164' }}>{p.district}, {p.region}</p>
                    <div className="flex gap-2 mt-0.5">
                      {isNearby   && <span style={{ fontSize: 10, color: '#15803d', fontWeight: 600 }}>📍 Near you</span>}
                      {isHeritage && <span style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 600 }}>🏛 Heritage</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer
            center={NEPAL_CENTER}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            maxBounds={[[26.3, 80.0], [30.4, 88.2]]}
            maxBoundsViscosity={0.8}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {flyTarget && <FlyTo coords={flyTarget} />}

            {/* User location */}
            {userLocation && (
              <>
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>
                    <div style={{ fontFamily: 'Manrope', textAlign: 'center', minWidth: 140 }}>
                      <strong style={{ color: '#3b82f6' }}>📍 You are here</strong>
                      <p style={{ fontSize: 11, color: '#584237', margin: '4px 0 0' }}>
                        {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
                <Circle center={userLocation} radius={50000}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 1, dashArray: '4' }} />
              </>
            )}

            {/* Place markers */}
            {filtered.map(p => {
              const lat = parseFloat(p.lat);
              const lng = parseFloat(p.lng);
              if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
              return (
                <Marker
                  key={p._id}
                  position={[lat, lng]}
                  icon={getMarkerIcon(p)}
                  eventHandlers={{ click: () => handleSelectPlace(p) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'Manrope, sans-serif', minWidth: 200, maxWidth: 240 }}>
                      <img
                        src={getPlaceImage(p.name)}
                        alt={p.name}
                        style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, marginBottom: 8, display: 'block' }}
                        onError={e => { e.target.src = PLACE_IMAGES.default; }}
                      />
                      <strong style={{ color: '#9d4300', display: 'block', marginBottom: 2, fontSize: 14 }}>{p.name}</strong>
                      <span style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 600, textTransform: 'capitalize' }}>
                        {p.category}
                      </span>
                      <span style={{ color: '#8c7164', fontSize: 11, marginLeft: 6 }}>{p.district}, {p.region}</span>
                      {p.description && (
                        <p style={{ marginTop: 6, fontSize: 11, color: '#584237', lineHeight: 1.5 }}>
                          {p.description.slice(0, 90)}…
                        </p>
                      )}
                      {p.bestTime && (
                        <p style={{ fontSize: 11, color: '#9d4300', margin: '6px 0 0', fontWeight: 600 }}>
                          🗓 Best: {p.bestTime}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Top-right overlay */}
          <div className="absolute top-4 right-4 z-[1000] p-4 rounded-2xl shadow-lg"
            style={{ background: 'rgba(255,248,244,0.95)', border: '1px solid #e0d9cc', backdropFilter: 'blur(12px)' }}>
            <p className="text-xs font-semibold" style={{ color: '#9d4300' }}>
              <span className="material-symbols-outlined text-[14px] mr-1">location_on</span>
              Nepal — {filtered.length} destinations
            </p>
            {userLocation && (
              <p className="text-xs mt-1" style={{ color: '#3b82f6' }}>
                <span className="material-symbols-outlined text-[14px] mr-1">my_location</span>
                Your location active
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] p-3 rounded-xl shadow"
            style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e0d9cc' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { color: '#f97316', label: 'Trekking / Tourist' },
                { color: '#8b5cf6', label: 'Heritage sites' },
                { color: '#22c55e', label: 'Nearby places' },
                { color: '#3b82f6', label: 'Your location' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                  <div style={{ width: 12, height: 12, background: color, borderRadius: '50%', flexShrink: 0 }} />
                  <span style={{ color: '#584237' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}