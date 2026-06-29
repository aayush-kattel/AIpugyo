import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const NAV = [
  { icon: 'dashboard',   label: 'Dashboard' },
  { icon: 'group',       label: 'Users' },
  { icon: 'chat_bubble', label: 'Chat Logs' },
  { icon: 'map',         label: 'Places' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab,     setTab]     = useState('Dashboard');
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [chats,   setChats]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChat, setExpandedChat] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [sRes, uRes, cRes] = await Promise.all([
        api.get('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/admin/users',     { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/admin/chats',     { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStats(sRes.data);
      setUsers(uRes.data);
      setChats(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id) {
    if (!confirm('Delete this user and all their data?')) return;
    try {
      await api.delete(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch { alert('Failed to delete'); }
  }

  function logout() { localStorage.clear(); navigate('/'); }

  const statCards = [
    { label: 'Total Users',    val: stats?.totalUsers    ?? '—', icon: 'group',        color: '#9d4300' },
    { label: 'AI Chats',       val: stats?.totalChats    ?? '—', icon: 'chat_bubble',  color: '#f97316' },
    { label: 'Places',         val: stats?.totalPlaces   ?? '—', icon: 'location_on',  color: '#3b82f6' },
    { label: 'Heritage Sites', val: stats?.totalHeritage ?? '—', icon: 'temple_hindu', color: '#8b5cf6' },
  ];

  // Group chats by user for easier reading
  const chatsByUser = chats.reduce((acc, c) => {
    const uid = c.userId?._id || 'unknown';
    if (!acc[uid]) acc[uid] = { user: c.userId, messages: [] };
    acc[uid].messages.push(c);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen" style={{ fontFamily: 'Manrope, sans-serif' }}>
  {/* Sidebar */}
  <aside className="w-64 flex flex-col shrink-0"
    style={{ background: '#1a1714', color: '#fff', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 }}>
        <div className="px-6 py-8">
          {/* Actual logo */}
          <div className="flex items-center gap-3 mb-1">
            <img src="/logo.png" alt="AI Pugyo"
              style={{ height: 36, width: 'auto', objectFit: 'contain' }}
              onError={e => { e.target.style.display = 'none'; }} />
            <span style={{ fontWeight: 800, fontSize: 16, color: '#ffb690' }}>AI Pugyo</span>
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin Panel</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ icon, label }) => (
            <button key={label} onClick={() => setTab(label)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
              style={{
                background: tab === label ? 'rgba(249,115,22,0.15)' : 'transparent',
                color:      tab === label ? '#ffb690' : 'rgba(255,255,255,0.6)',
              }}>
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span className="material-symbols-outlined text-[20px]">logout</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col" style={{ background: '#fff8f4' ,marginLeft: 256 }}>
        <header className="flex items-center justify-between px-8 py-4 border-b"
          style={{ background: '#fff', borderColor: '#e0d9cc' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1f1b17' }}>Admin Dashboard</h1>
            <p className="text-sm" style={{ color: '#8c7164' }}>AI पुग्यो — Your AI Has Arrived</p>
          </div>
          <button onClick={fetchAll} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10, background: '#fff8f4',
            border: '1px solid #e0d9cc', cursor: 'pointer', fontSize: 13, color: '#584237', fontFamily: 'Manrope',
          }}>
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Refresh
          </button>
        </header>

        <div className="px-8 py-8 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">

          {/* ── Dashboard Tab ── */}
          {tab === 'Dashboard' && (
            <div className="space-y-8">
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map(({ label, val, icon, color }) => (
                  <div key={label} className="p-6 rounded-xl border" style={{ background: '#fff', borderColor: '#e0d9cc' }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#8c7164' }}>{label}</p>
                        <p style={{ fontSize: 36, fontWeight: 800, color: '#1f1b17', margin: 0 }}>
                          {loading ? '…' : val}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${color}15`, color }}>
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Recent users preview */}
              <div className="p-6 rounded-xl border" style={{ background: '#fff', borderColor: '#e0d9cc' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold" style={{ color: '#1f1b17' }}>Recent Users</h2>
                  <button onClick={() => setTab('Users')} className="text-xs font-semibold"
                    style={{ color: '#f97316' }}>View All →</button>
                </div>
                {loading ? (
                  <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 rounded animate-pulse" style={{ background: '#f5ece6' }} />)}</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e0d9cc' }}>
                        {['Name', 'Email', 'Chats', 'Trek Plans', 'Joined', ''].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#8c7164', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map(u => (
                        <tr key={u._id} style={{ borderBottom: '1px solid #f5ece6' }}>
                          <td style={{ padding: '10px 12px', color: '#1f1b17', fontWeight: 600 }}>{u.name}</td>
                          <td style={{ padding: '10px 12px', color: '#584237' }}>{u.email}</td>
                          <td style={{ padding: '10px 12px', color: '#f97316', fontWeight: 700 }}>{u.chatCount}</td>
                          <td style={{ padding: '10px 12px', color: '#9d4300', fontWeight: 600 }}>{u.trekPlans || 0}</td>
                          <td style={{ padding: '10px 12px', color: '#8c7164' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <button onClick={() => deleteUser(u._id)}
                              style={{ padding: '4px 10px', borderRadius: 6, background: '#ffdad6', color: '#ba1a1a', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Recent Chat Logs preview */}
              <div className="p-6 rounded-xl border" style={{ background: '#fff', borderColor: '#e0d9cc' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold" style={{ color: '#1f1b17' }}>
                    Recent Chat Logs
                    <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                      style={{ background: '#ffdbca', color: '#9d4300' }}>
                      {chats.length} messages
                    </span>
                  </h2>
                  <button onClick={() => setTab('Chat Logs')} className="text-xs font-semibold"
                    style={{ color: '#f97316' }}>View All →</button>
                </div>
                {loading ? (
                  <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-16 rounded animate-pulse" style={{ background: '#f5ece6' }} />)}</div>
                ) : chats.length === 0 ? (
                  <p style={{ color: '#8c7164', fontSize: 13 }}>No chat logs yet. Chats appear after users message the AI.</p>
                ) : (
                  <div className="space-y-3">
                    {chats.slice(0, 3).map(c => (
                      <div key={c._id} className="p-3 rounded-xl border" style={{ borderColor: '#f0e8e0', background: '#fff8f4' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-[14px]" style={{ color: '#f97316' }}>person</span>
                          <span style={{ fontWeight: 700, fontSize: 12, color: '#1f1b17' }}>{c.userId?.name || 'Unknown'}</span>
                          <span style={{ fontSize: 11, color: '#8c7164' }}>{c.userId?.email}</span>
                          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#8c7164' }}>{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#584237', margin: 0 }}>
                          <strong>Q:</strong> {c.message.slice(0, 100)}{c.message.length > 100 ? '…' : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Users Tab ── */}
          {tab === 'Users' && (
            <div className="p-6 rounded-xl border" style={{ background: '#fff', borderColor: '#e0d9cc' }}>
              <h2 className="font-bold mb-6 text-lg" style={{ color: '#1f1b17' }}>All Users ({users.length})</h2>
              {loading ? <p style={{ color: '#8c7164' }}>Loading…</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e0d9cc' }}>
                        {['#', 'Name', 'Email', 'AI Chats', 'Trek Plans', 'Last Seen', 'Joined', 'Actions'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#8c7164', fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u._id} style={{ borderBottom: '1px solid #f5ece6' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fff8f4'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ padding: '10px 12px', color: '#8c7164' }}>{i + 1}</td>
                          <td style={{ padding: '10px 12px', color: '#1f1b17', fontWeight: 600 }}>{u.name}</td>
                          <td style={{ padding: '10px 12px', color: '#584237' }}>{u.email}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontWeight: 700, color: '#f97316' }}>{u.chatCount}</span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#9d4300', fontWeight: 600 }}>{u.trekPlans || 0}</td>
                          <td style={{ padding: '10px 12px', color: '#8c7164' }}>
                            {u.lastSeen ? new Date(u.lastSeen).toLocaleDateString() : '—'}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#8c7164' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <button onClick={() => deleteUser(u._id)}
                              style={{ padding: '4px 10px', borderRadius: 6, background: '#ffdad6', color: '#ba1a1a', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Chat Logs Tab ── */}
          {tab === 'Chat Logs' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-bold text-lg" style={{ color: '#1f1b17' }}>
                  All Chat Logs
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: '#ffdbca', color: '#9d4300' }}>
                  {chats.length} messages from {Object.keys(chatsByUser).length} users
                </span>
              </div>

              {loading ? (
                <p style={{ color: '#8c7164' }}>Loading…</p>
              ) : chats.length === 0 ? (
                <div className="text-center py-12 p-6 rounded-xl border" style={{ background: '#fff', borderColor: '#e0d9cc' }}>
                  <span className="material-symbols-outlined text-5xl mb-3" style={{ color: '#e0d9cc' }}>chat_bubble</span>
                  <p style={{ color: '#8c7164' }}>No chat logs yet. They appear here once users chat with AI Pugyo.</p>
                </div>
              ) : (
                /* Group by user */
                Object.values(chatsByUser).map(({ user: chatUser, messages }) => (
                  <div key={chatUser?._id || 'unknown'} className="rounded-xl border overflow-hidden"
                    style={{ background: '#fff', borderColor: '#e0d9cc' }}>
                    {/* User header */}
                    <button
                      className="w-full flex items-center gap-3 p-4 border-b hover:bg-gray-50 transition-all"
                      style={{ borderColor: '#f0e8e0', background: '#fff8f4' }}
                      onClick={() => setExpandedChat(expandedChat === chatUser?._id ? null : chatUser?._id)}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: '#f97316', flexShrink: 0 }}>
                        {(chatUser?.name || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#1f1b17', margin: 0 }}>
                          {chatUser?.name || 'Unknown User'}
                        </p>
                        <p style={{ fontSize: 12, color: '#8c7164', margin: 0 }}>
                          {chatUser?.email || 'No email'} • {messages.length} message{messages.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: '#8c7164' }}>
                        {expandedChat === chatUser?._id ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>

                    {/* Messages (expandable) */}
                    {expandedChat === chatUser?._id && (
                      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                        {messages.map(c => (
                          <div key={c._id} className="rounded-xl border overflow-hidden"
                            style={{ borderColor: '#f0e8e0' }}>
                            <div style={{ padding: '8px 12px', background: '#fff', borderBottom: '1px solid #f0e8e0' }}>
                              <div className="flex justify-between items-center mb-1">
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#584237' }}>👤 User</span>
                                <span style={{ fontSize: 11, color: '#8c7164' }}>{new Date(c.createdAt).toLocaleString()}</span>
                              </div>
                              <p style={{ fontSize: 13, color: '#1f1b17', margin: 0 }}>{c.message}</p>
                            </div>
                            <div style={{ padding: '8px 12px', background: '#ffdbca' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#9d4300' }}>🤖 AI Pugyo</span>
                              <p style={{ fontSize: 12, color: '#584237', margin: '4px 0 0', lineHeight: 1.5 }}>
                                {c.reply.slice(0, 300)}{c.reply.length > 300 ? '…' : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Places Tab ── */}
          {tab === 'Places' && (
            <div className="p-6 rounded-xl border" style={{ background: '#fff', borderColor: '#e0d9cc' }}>
              <h2 className="font-bold mb-4 text-lg" style={{ color: '#1f1b17' }}>Nepal Destinations</h2>
              <p style={{ color: '#8c7164', fontSize: 13, marginBottom: 16 }}>
                {stats?.totalPlaces || 0} places seeded in database. Use{' '}
                <code style={{ background: '#f5ece6', padding: '1px 6px', borderRadius: 4 }}>node data/seed.js</code> to re-seed.
              </p>
              <div className="p-4 rounded-xl" style={{ background: '#fff8f4', border: '1px solid #e0d9cc' }}>
                <p style={{ fontSize: 13, color: '#584237' }}>
                  Places include: Everest Base Camp, Annapurna Circuit, Pashupatinath, Boudhanath,
                  Swayambhunath, Chitwan, Pokhara, Lumbini, and 20+ more across all regions of Nepal.
                  Each has coordinates (lat/lng) displayed on the Adventure Map.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
