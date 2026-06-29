import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Safety() {
  const [weather, setWeather] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sosState, setSosState] = useState('idle'); // idle | sending | sent | error
  const [userLocation, setUserLocation] = useState(null);
  const [sentTo, setSentTo] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    Promise.all([
      api.get('/safety/weather').catch(() => ({ data: [] })),
      api.get('/safety/contacts').catch(() => ({ data: [] })),
    ]).then(([w, c]) => {
      const wData = Array.isArray(w.data) ? w.data : (w.data ? [w.data] : []);
      setWeather(wData);
      setContacts(c.data || []);
    }).finally(() => setLoading(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { }
      );
    }
  }, []);

  const filtered = contacts.filter(c =>
    c.district?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSOS() {
    if (sosState === 'sent') {
      // Reset
      setSosState('idle');
      setSentTo('');
      return;
    }
    if (sosState === 'sending') return;

    if (!user.email) {
      toast.error('Please log in to use SOS — your registered email is required.');
      return;
    }

    setSosState('sending');

    try {
      const payload = {
        name: user.name || 'Tourist',
        email: user.email,
        phone: user.phone || '',
        lat: userLocation?.lat,
        lng: userLocation?.lng,
        message: '',
      };

      const { data } = await api.post('/safety/sos', payload);

      setSosState('sent');
      setSentTo(data.sentTo || user.email);
      const smsSent = data.smsSentTo?.length ? ` + SMS to ${data.smsSentTo.join(', ')}` : '';
      toast.success(`SOS sent to ${data.emailsSentTo?.join(', ') || user.email}${smsSent}!`, { duration: 6000 });
    } catch (err) {
      setSosState('error');
      const msg = err?.response?.data?.message || 'Failed to send email';
      toast.error(`${msg} — Call 1144 immediately!`, { duration: 8000 });
      // Reset after 4s so they can retry
      setTimeout(() => setSosState('idle'), 4000);
    }
  }

  const sosColors = {
    idle: '#f97316',
    sending: '#d97706',
    sent: '#15803d',
    error: '#ba1a1a',
  };
  const sosLabel = {
    idle: 'SOS',
    sending: '...',
    sent: 'SENT!',
    error: 'FAIL',
  };
  const sosIcon = {
    idle: 'emergency',
    sending: 'progress_activity',
    sent: 'check_circle',
    error: 'error',
  };

  return (
    <div style={{ background: '#fff8f4', minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      <Navbar />
      <main className="pt-10 pb-16 px-6 max-w-4xl mx-auto flex flex-col items-center">

        {/* SOS Button */}
        <section className="flex flex-col items-center mb-12 text-center">
          <div className="relative cursor-pointer mb-4" onClick={handleSOS}>
            <div className="w-36 h-36 rounded-full flex flex-col items-center justify-center text-white font-extrabold shadow-xl transition-all"
              style={{
                background: sosColors[sosState],
                fontSize: 28,
                transition: 'background 0.3s',
              }}>
              <span className={`material-symbols-outlined text-4xl mb-1 ${sosState === 'sending' ? 'animate-spin' : ''}`}
                style={{ fontVariationSettings: "'FILL' 1" }}>
                {sosIcon[sosState]}
              </span>
              {sosLabel[sosState]}
            </div>
            {sosState === 'sending' && (
              <div className="absolute inset-0 rounded-full animate-ping"
                style={{ background: 'rgba(217,119,6,0.3)' }}></div>
            )}
            {sosState === 'idle' && (
              <div className="absolute inset-0 rounded-full animate-ping"
                style={{ background: 'rgba(249,115,22,0.2)', animationDuration: '2s' }}></div>
            )}
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1f1b17' }}>Emergency Hub</h1>
          <p style={{ color: '#584237' }}>
            Tap SOS to send an emergency email to your registered address
          </p>

          {/* Show registered email */}
          {user.email ? (
            <p style={{ fontSize: 12, color: '#3b82f6', marginTop: 4, fontWeight: 600 }}>
              📧 SOS will be sent to: <strong>{user.email}</strong>
            </p>
          ) : (
            <p style={{ fontSize: 12, color: '#ba1a1a', marginTop: 4 }}>
              ⚠️ Log in to enable SOS email
            </p>
          )}

          {userLocation && (
            <p style={{ fontSize: 12, color: '#22c55e', marginTop: 2 }}>
              📍 Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          )}

          {/* Success confirmation box */}
          {sosState === 'sent' && (
            <div style={{ marginTop: 12, padding: '12px 20px', borderRadius: 12, background: '#d1fae5', border: '1px solid #6ee7b7', maxWidth: 400 }}>
              <p style={{ fontSize: 13, color: '#065f46', margin: 0, fontWeight: 600 }}>
                ✅ SOS alert emailed to <strong>{sentTo}</strong>
              </p>
              <p style={{ fontSize: 12, color: '#065f46', margin: '4px 0 0', opacity: 0.8 }}>
                Also call <strong>1144</strong> (Tourist Police) immediately. Tap SOS again to reset.
              </p>
            </div>
          )}

          {sosState === 'error' && (
            <div style={{ marginTop: 12, padding: '12px 20px', borderRadius: 12, background: '#ffdad6', border: '1px solid #ba1a1a', maxWidth: 400 }}>
              <p style={{ fontSize: 13, color: '#93000a', margin: 0, fontWeight: 600 }}>
                ❌ Email failed — call <strong>1144</strong> immediately!
              </p>
              <p style={{ fontSize: 12, color: '#93000a', margin: '4px 0 0' }}>
                Ensure SMTP_USER &amp; SMTP_PASS are set in server .env
              </p>
            </div>
          )}
        </section>

        {/* How SOS works info box */}
        <div className="w-full p-4 rounded-2xl border mb-6"
          style={{ background: '#eff6ff', borderColor: '#3b82f6', borderLeftWidth: 4 }}>
          <p className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: '#1d4ed8' }}>
            <span className="material-symbols-outlined text-[16px]">info</span>
            How SOS Works
          </p>
          <p className="text-xs" style={{ color: '#1e40af' }}>
            When you tap SOS, an emergency email is sent directly to your registered email address
            ({user.email || 'login required'}) with your GPS location and a call-to-action.
            Make sure to also call <strong>1144</strong> (Tourist Police) for immediate help.
          </p>
        </div>

        {/* National numbers */}
        <div className="w-full p-5 rounded-2xl border mb-8"
          style={{ background: '#ffdad6', borderColor: '#ba1a1a', borderLeftWidth: 4 }}>
          <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#93000a' }}>
            <span className="material-symbols-outlined text-[18px]">emergency</span>
            National Emergency Numbers — Always Available
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tourist Police', number: '1144' },
              { label: 'Ambulance', number: '102' },
              { label: 'Nepal Police', number: '100' },
              { label: 'Mountain Rescue', number: '01-4111071' },
            ].map(({ label, number }) => (
              <a key={label} href={`tel:${number}`}
                className="flex flex-col items-center text-center p-3 rounded-xl hover:brightness-95 transition-all"
                style={{ background: 'rgba(186,26,26,0.1)' }}>
                <span className="material-symbols-outlined text-[20px] mb-1" style={{ color: '#ba1a1a' }}>call</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#93000a' }}>{number}</span>
                <span className="text-xs" style={{ color: '#584237' }}>{label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Weather */}
        {weather.length > 0 && (
          <div className="w-full p-5 rounded-2xl border mb-8" style={{ background: '#fff', borderColor: '#e0d9cc' }}>
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1f1b17' }}>
              <span className="material-symbols-outlined" style={{ color: '#f97316' }}>partly_cloudy_day</span>
              Current Weather — Nepal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {weather.slice(0, 3).map(w => (
                <div key={w.city} className="p-4 rounded-xl" style={{ background: '#fff8f4', border: '1px solid #e0d9cc' }}>
                  <p className="font-bold mb-2" style={{ color: '#1f1b17' }}>{w.city}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: 'thermometer', val: `${Math.round(w.temp)}°C` },
                      { icon: 'water_drop', val: `${w.humidity}%` },
                      { icon: 'air', val: `${w.wind}m/s` },
                    ].map(({ icon, val }) => (
                      <div key={icon} className="flex flex-col items-center text-center">
                        <span className="material-symbols-outlined text-[18px]" style={{ color: '#f97316' }}>{icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1f1b17' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs mt-2 capitalize" style={{ color: '#8c7164' }}>{w.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* District contacts */}
        <div className="w-full">
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
              style={{ color: '#8c7164' }}>search</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search district..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#fff', border: '1.5px solid #e0d9cc', color: '#1f1b17', fontFamily: 'Manrope' }}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e => e.target.style.borderColor = '#e0d9cc'}
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#f5ece6' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl mb-3" style={{ color: '#e0d9cc' }}>location_off</span>
              <p style={{ color: '#8c7164' }}>
                {search ? `No contacts for "${search}"` : 'Connect backend to load district contacts'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((c, i) => (
                <div key={i} className="p-5 rounded-2xl border" style={{ background: '#fff', borderColor: '#e0d9cc' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[18px]"
                      style={{ color: '#f97316', fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    <span className="font-bold capitalize" style={{ color: '#1f1b17' }}>{c.district}</span>
                  </div>
                  <div className="grid sm:grid-cols-4 gap-3">
                    {[
                      { key: 'police', label: 'Police', icon: 'local_police', color: '#1976d2' },
                      { key: 'ambulance', label: 'Ambulance', icon: 'local_hospital', color: '#2e7d32' },
                      { key: 'tourist_police', label: 'Tourist Police', icon: 'security', color: '#f97316' },
                      { key: 'rescue', label: 'Rescue', icon: 'emergency_share', color: '#ba1a1a' },
                    ].map(({ key, label, icon, color }) => c[key] && (
                      <a key={key} href={`tel:${c[key]}`}
                        className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm"
                        style={{ borderColor: '#e0d9cc' }}>
                        <span className="material-symbols-outlined text-[20px]"
                          style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                        <div>
                          <div className="text-xs" style={{ color: '#8c7164' }}>{label}</div>
                          <div className="font-bold text-sm" style={{ color: '#1f1b17' }}>{c[key]}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
