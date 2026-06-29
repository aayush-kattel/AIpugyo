import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

// Subcategory detection based on name keywords (since DB only stores category:'heritage')
function getSubcategory(name = '') {
  const n = name.toLowerCase();
  if (n.includes('stupa') || n.includes('boudha') || n.includes('swayambhu'))      return 'Stupa';
  if (n.includes('temple') || n.includes('pashupati') || n.includes('changu'))      return 'Temple';
  if (n.includes('durbar') || n.includes('palace'))                                  return 'Palace';
  if (n.includes('national park') || n.includes('sagarmatha') || n.includes('chitwan')) return 'Natural';
  if (n.includes('lumbini') || n.includes('garden'))                                 return 'UNESCO';
  return 'UNESCO'; // All heritage sites are UNESCO — safe default
}

const categories = ['All', 'UNESCO', 'Temple', 'Palace', 'Stupa', 'Natural'];

const SITE_IMAGES = {
  'pashupatinath':   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR98JRXTz0GEJ6a331FcT2d_NzF4s3OtR1uXh56b8DsKA&s=10',
  'boudhanath':      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4t-0ZRTRLxXH5WdRxGh3OaKkpK7bMf_Dsn2mAdLCftg&s=10',
  'swayambhunath':   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjJCo0kMZc38DvpivvUvCNu_lUJPovTxmApbnCWf4zuw&s=10',
  'kathmandu durbar':'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2CrI_T6D0rK0B-kEbvgRy8oY2srVoqNvHjJwzgK8DCg&s=10',
  'patan':           'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi4jMhQjDshwkZjJBJ6bE13AKTU7IInzOtKlCaZtXZiQ&s=10',
  'bhaktapur':       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZQgxMSQiw869BA2okXYInwcDl22Kf6c1XKrLm7Hi2Wg&s=10',
  'lumbini':         'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGB7zvrRche50w7GUbD83AB3Zi4_Gb3atDqeEax7w2hw&s=10',
  'chitwan':         'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTixQfIWS38WccmiixUtMxTgZdUBVhCaah29W7zUjwS-w&s=10',
  'sagarmatha':      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFQ8MwwDBRP8v4UZt6ORs4Ce7n8GK3dYOKCB0kqlQfQg&s=10',
  'changu':          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShy2MCt4f-JVctVMFwYu1JzxGfuDmbQ05eFAW7zY3nvA&s=10',
  'default':         'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80',
};

function getSiteImage(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, url] of Object.entries(SITE_IMAGES)) {
    if (key !== 'default' && lower.includes(key)) return url;
  }
  return SITE_IMAGES.default;
}

const SUBCATEGORY_ICON = {
  Stupa:   'circle',
  Temple:  'temple_hindu',
  Palace:  'account_balance',
  Natural: 'park',
  UNESCO:  'public',
};

export default function Heritage() {
  const navigate = useNavigate();
  const [sites,    setSites]    = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState('All');
  const [loading,  setLoading]  = useState(true);

  // Track heritage view in DB + localStorage when user opens a site detail
  function openSite(site) {
    setSelected(site);
    const token = localStorage.getItem('token');
    if (!token) return; // not logged in, skip tracking
    api.post('/auth/heritage-view', {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data }) => {
      // Sync updated count back to localStorage immediately
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        stored.heritageViews = data.heritageViews;
        localStorage.setItem('user', JSON.stringify(stored));
      } catch {}
    }).catch(() => {}); // silent fail — don't block UI
  }

  function exploreOnMap(site) {
    setSelected(null);
    sessionStorage.setItem('map_popup_place', JSON.stringify(site));
    navigate('/map');
  }

  useEffect(() => {
    api.get('/heritage')
      .then(({ data }) => {
        // Attach computed subcategory to each site
        const withSub = (data || []).map(s => ({ ...s, subcategory: getSubcategory(s.name) }));
        setSites(withSub);
      })
      .catch(() => setSites([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All'
    ? sites
    : sites.filter(s => s.subcategory === filter);

  return (
    <div style={{ background: '#fff8f4', minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1585938389612-a552a28d6914?w=1200&q=80"
          alt="Heritage" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'rgba(157,67,0,0.65)' }}></div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 style={{ fontSize: 40, fontWeight: 800 }}>Heritage Explorer</h1>
          <p className="mt-2 text-white/80">Discover Nepal's UNESCO sites and cultural landmarks</p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-2 items-center">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className="px-5 py-2 rounded-full text-sm font-semibold border transition-all"
              style={{
                background:  filter === c ? '#9d4300' : '#fff',
                color:       filter === c ? '#fff'    : '#584237',
                borderColor: filter === c ? '#9d4300' : '#e0d9cc',
              }}>
              {c}
            </button>
          ))}
          {!loading && (
            <span className="ml-2 text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: '#ffdbca', color: '#9d4300' }}>
              {filtered.length} site{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: '#f5ece6' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl mb-4" style={{ color: '#e0d9cc' }}>temple_hindu</span>
            <p style={{ color: '#8c7164' }}>
              {sites.length === 0
                ? 'No heritage sites found. Connect backend and run seed.'
                : `No ${filter} sites found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(site => (
              <button key={site._id} onClick={() => openSite(site)}
                className="rounded-2xl border text-left transition-all hover:shadow-md hover:-translate-y-1 group overflow-hidden"
                style={{ background: '#fff', borderColor: '#e0d9cc' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={getSiteImage(site.name)}
                    alt={site.name}
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.src = SITE_IMAGES.default; }}
                  />
                  {/* Subcategory badge over image */}
                  <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(255,248,244,0.95)', color: '#9d4300' }}>
                    {site.subcategory}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(249,115,22,0.1)', color: '#9d4300' }}>
                      <span className="material-symbols-outlined text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                        {SUBCATEGORY_ICON[site.subcategory] || 'temple_hindu'}
                      </span>
                    </div>
                    <h3 className="font-bold" style={{ color: '#1f1b17' }}>{site.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs mb-2" style={{ color: '#8c7164' }}>
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {site.district}, {site.region}
                  </div>
                  <p className="text-sm line-clamp-2 mb-3" style={{ color: '#584237' }}>{site.description}</p>
                  <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#f97316' }}>
                    View Details <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,23,20,0.6)' }} onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden relative"
            style={{ background: '#fff', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <img
              src={getSiteImage(selected.name)}
              alt={selected.name}
              style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.src = SITE_IMAGES.default; }}
            />
            <button onClick={() => setSelected(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#1f1b17' }}>
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: '#ffdbca', color: '#341100' }}>
                  {selected.subcategory}
                </span>
                {selected.significance?.toLowerCase().includes('unesco') && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: '#ede9fe', color: '#5b21b6' }}>
                    🏛 UNESCO
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1f1b17', marginBottom: 4 }}>{selected.name}</h2>
              <div className="flex items-center gap-1 text-sm mb-4" style={{ color: '#8c7164' }}>
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {selected.district}, {selected.region}
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#584237' }}>{selected.description}</p>
              {selected.significance && (
                <div className="p-4 rounded-xl mb-4" style={{ background: '#fff8f4', border: '1px solid #e0d9cc' }}>
                  <p className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color: '#9d4300' }}>
                    <span className="material-symbols-outlined text-[14px]">info</span> Significance
                  </p>
                  <p className="text-sm" style={{ color: '#584237' }}>{selected.significance}</p>
                </div>
              )}
              {selected.bestTime && (
                <p className="text-sm mb-4" style={{ color: '#9d4300' }}>
                  🗓 <strong>Best time to visit:</strong> {selected.bestTime}
                </p>
              )}
              {selected.lat && selected.lng && (
                <button onClick={() => exploreOnMap(selected)} style={{
                  width: '100%', padding: '12px', borderRadius: 12,
                  background: '#f97316', color: '#fff', border: 'none',
                  cursor: 'pointer', fontWeight: 700, fontSize: 14,
                  fontFamily: 'Manrope', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                }}>
                  <span className="material-symbols-outlined text-[18px]">map</span>
                  Explore on Map
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}