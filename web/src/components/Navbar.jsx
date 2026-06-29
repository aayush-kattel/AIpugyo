import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  }

  // If the user isn't logged in, send them to /login instead of the page.
  function guardedNavigate(to, label) {
    if (!user) {
      navigate('/login', { state: { message: `Please sign in first to access ${label}.` } });
    } else {
      navigate(to);
    }
  }

  const links = [
    { to: '/chat', label: 'Chat', icon: 'chat_bubble' },
    { to: '/planner', label: 'Planner', icon: 'map' },
    { to: '/heritage', label: 'Explorer', icon: 'temple_hindu' },
    { to: '/map', label: 'Map', icon: 'explore' },
    { to: '/safety', label: 'Alerts', icon: 'emergency' },
  ];

  return (
    // NOTE: backdrop-filter on the <nav> creates a CSS "containing block" for
    // any position:fixed descendant, which used to pin the mobile nav to the
    // navbar instead of the viewport. The mobile nav is now rendered as a
    // sibling AFTER the </nav>, not inside it, so position:fixed works
    // correctly again.
    <>
      <nav style={{
        background: 'rgba(255,248,244,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e0d9cc', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 24px', maxWidth: 1280, margin: '0 auto'
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/logo.png" alt="AI Pugyo" style={{ height: 44, width: 'auto' }} />
            <span style={{ fontWeight: 800, fontSize: 18, color: '#9d4300', fontFamily: 'Manrope, sans-serif' }}>
              AI Pugyo
            </span>
          </Link>

          {/* Desktop nav links — only the "hidden md:flex" classes control
              visibility now; no inline `display` here to fight with them. */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 24 }}>
            {links.map(({ to, label }) => (
              <button key={to} onClick={() => guardedNavigate(to, label)} style={{
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope',
                color: pathname === to ? '#9d4300' : '#584237',
                borderBottom: pathname === to ? '2px solid #9d4300' : '2px solid transparent',
                paddingBottom: 2, transition: 'color 0.15s'
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* User avatar + dropdown, or Sign In */}
          {user ? (
            <div className="group" style={{ position: 'relative' }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fff', border: '1.5px solid #e0d9cc',
                borderRadius: 999, padding: '6px 14px 6px 8px',
                cursor: 'pointer', fontFamily: 'Manrope'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#f97316', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14, flexShrink: 0
                }}>
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#9d4300' }}>
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8c7164' }}>
                  expand_more
                </span>
              </button>

              {/* Dropdown */}
              <div className="group-hover:block hidden" style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: '#fff', border: '1px solid #e0d9cc',
                borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                minWidth: 190, zIndex: 200, overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #f0e8e0' }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#1f1b17', margin: 0 }}>{user.name}</p>
                  <p style={{ fontSize: 11, color: '#8c7164', margin: '2px 0 0' }}>{user.email}</p>
                </div>
                <Link to="/" style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 16px', color: '#1f1b17', textDecoration: 'none',
                  fontSize: 13, fontWeight: 600, background: '#fff'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff8f4'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#f97316' }}>home</span>
                  Home
                </Link>
                <Link to="/dashboard" style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 16px', color: '#1f1b17', textDecoration: 'none',
                  fontSize: 13, fontWeight: 600, background: '#fff'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff8f4'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#f97316' }}>dashboard</span>
                  My Dashboard
                </Link>
                <div style={{ borderTop: '1px solid #f0e8e0' }} />
                <button onClick={logout} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 16px', color: '#ba1a1a', background: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  fontFamily: 'Manrope', textAlign: 'left'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff0f0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" style={{
              padding: '9px 26px', borderRadius: 999, fontSize: 14,
              fontWeight: 700, color: '#fff', background: '#f97316',
              textDecoration: 'none', display: 'inline-block'
            }}>
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile bottom nav — rendered as a SIBLING of <nav>, not inside it,
          so position:fixed is relative to the viewport (see note above). */}
      <div className="flex md:hidden" style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 50, borderRadius: 999, padding: '8px 16px',
        alignItems: 'center', gap: 4,
        background: '#9d4300', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
      }}>
        {links.map(({ to, label, icon }) => (
          <button key={to} onClick={() => guardedNavigate(to, label)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '4px 12px', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer',
            color: pathname === to ? '#ffdbca' : 'rgba(255,255,255,0.7)'
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: 20,
              fontVariationSettings: pathname === to ? "'FILL' 1" : "'FILL' 0"
            }}>{icon}</span>
            <span style={{ fontSize: 10 }}>{label}</span>
          </button>
        ))}
      </div>
    </>
  );
}