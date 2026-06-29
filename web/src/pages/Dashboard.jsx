import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useEffect, useState } from 'react';

const HISTORY_KEY = 'aipugyo_chat_sessions';

function getLocalChatCount() {
  try {
    const sessions = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return sessions.reduce((total, s) =>
      total + (s.messages || []).filter(m => m.role === 'user').length, 0
    );
  } catch { return 0; }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]           = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [serverStats, setStats]   = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user._id) { setLoading(false); return; }

    // Fetch fresh user data from server so trekPlans is always current after refresh
    Promise.all([
      api.get(`/ai/history/${user._id}`).catch(() => ({ data: [] })),
      api.get(`/auth/me`).catch(() => ({ data: null })),
    ]).then(([histRes, meRes]) => {
      const chatCount = histRes.data?.length ?? 0;
      if (meRes.data) {
        // Sync fresh user data back to localStorage
        const fresh = { ...user, ...meRes.data };
        localStorage.setItem('user', JSON.stringify(fresh));
        setUser(fresh);
        setStats({ chatCount, trekPlans: meRes.data.trekPlans || 0, heritageViews: meRes.data.heritageViews || 0 });
      } else {
        setStats({ chatCount, trekPlans: user.trekPlans || 0, heritageViews: user.heritageViews || 0 });
      }
    }).finally(() => setLoading(false));
  }, []);

  const chatCount     = serverStats?.chatCount     ?? getLocalChatCount();
  const trekPlans     = serverStats?.trekPlans     ?? user.trekPlans     ?? 0;
  const heritageViews = serverStats?.heritageViews ?? user.heritageViews ?? 0;

  const quickLinks = [
    { to: '/chat',     icon: 'chat_bubble',  label: 'AI Chat',       desc: 'Ask AI Pugyo anything' },
    { to: '/planner',  icon: 'map',          label: 'Trek Planner',  desc: 'Generate itinerary' },
    { to: '/heritage', icon: 'temple_hindu', label: 'Heritage',      desc: 'Explore Nepal sites' },
    { to: '/map',      icon: 'location_on',  label: 'Adventure Map', desc: 'Find places near you' },
    { to: '/safety',   icon: 'emergency',    label: 'Emergency',     desc: 'Safety & SOS' },
  ];

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  return (
    <div style={{ background: '#fff8f4', minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">

        <header className="mb-10 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="AI Pugyo"
              style={{ height: 52, width: 'auto', objectFit: 'contain' }}
              onError={e => { e.target.style.display = 'none'; }} />
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1f1b17' }}>
                नमस्ते, {user.name || 'Traveller'} 👋
              </h1>
              <p style={{ color: '#584237' }}>Welcome back to AI Pugyo — your Nepal travel companion</p>
            </div>
          </div>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10,
            background: '#ffdad6', color: '#ba1a1a', border: 'none',
            cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Manrope',
          }}>
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sign Out
          </button>
        </header>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {quickLinks.map(({ to, icon, label, desc }) => (
            <Link key={to} to={to}
              className="p-5 rounded-xl border transition-all hover:shadow-md hover:scale-105 group"
              style={{ background: '#fff', borderColor: '#e0d9cc', textDecoration: 'none' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors"
                style={{
                  background: icon === 'emergency' ? 'rgba(186,26,26,0.1)' : 'rgba(249,115,22,0.1)',
                  color:      icon === 'emergency' ? '#ba1a1a'              : '#9d4300',
                }}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <h3 className="font-bold text-sm mb-1" style={{ color: '#1f1b17' }}>{label}</h3>
              <p className="text-xs" style={{ color: '#584237' }}>{desc}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Stats */}
          <div className="p-6 rounded-xl border" style={{ background: '#fff', borderColor: '#e0d9cc' }}>
            <h2 className="font-bold mb-4" style={{ color: '#1f1b17' }}>Your Travel Stats</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 rounded animate-pulse" style={{ background: '#f5ece6' }} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'AI Conversations',      val: chatCount,     icon: 'chat_bubble'  },
                  { label: 'Trek Plans Generated',  val: trekPlans,     icon: 'map'          },
                  { label: 'Heritage Sites Viewed', val: heritageViews, icon: 'temple_hindu' },
                ].map(({ label, val, icon }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b"
                    style={{ borderColor: '#f5ece6' }}>
                    <span className="text-sm flex items-center gap-2" style={{ color: '#584237' }}>
                      <span className="material-symbols-outlined text-[16px]" style={{ color: '#f97316' }}>{icon}</span>
                      {label}
                    </span>
                    <span className="font-bold text-lg" style={{ color: '#9d4300' }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tip + emergency */}
          <div className="p-6 rounded-xl border" style={{ background: '#fff8f4', borderColor: '#e0d9cc', borderLeft: '4px solid #f97316' }}>
            <h2 className="font-bold mb-2" style={{ color: '#1f1b17' }}>
              <span className="material-symbols-outlined text-[18px] mr-1" style={{ color: '#f97316' }}>auto_awesome</span>
              AI Tip of the Day
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#584237' }}>
              The best time to visit Nepal for trekking is October–November (autumn) when skies are
              clear and temperatures are ideal. Spring (March–April) is also excellent for
              rhododendron blooms and clear Himalayan views.
            </p>
            <div className="mt-4 p-3 rounded-xl" style={{ background: '#ffdad6', border: '1px solid #f97316' }}>
              <p className="text-xs font-semibold" style={{ color: '#ba1a1a' }}>
                🆘 Emergency? Call Tourist Police: <strong>1144</strong> | Ambulance: <strong>102</strong>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}