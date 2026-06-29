import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMessage = location.state?.message;

  async function handleSubmit() {
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <main style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Left image panel ── */}
      <section style={{
        position: 'relative', width: '50%', overflow: 'hidden',
        display: 'none', flexShrink: 0,
      }} className="md:!flex">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=100&fit=crop"
          alt="Everest Peak"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(157,67,0,0.72) 0%, rgba(31,27,23,0.55) 100%)'
        }} />
        <div style={{
          position: 'relative', zIndex: 10, height: '100%',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '48px'
        }}>
          {/* Logo + name */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.png" alt="AI Pugyo" style={{
              height: 52, width: 52, borderRadius: '50%',
              objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)'
            }} />
            <span style={{ fontWeight: 800, fontSize: 22, color: '#fff', fontFamily: 'Manrope, sans-serif' }}>
              AI Pugyo
            </span>
          </Link>

          {/* Quote */}
          <div>
            <div style={{
              fontSize: 64, color: 'rgba(255,255,255,0.18)',
              lineHeight: 1, marginBottom: 12, fontFamily: 'Georgia, serif'
            }}>"</div>
            <p style={{
              color: '#fff', fontSize: 26, fontWeight: 700,
              fontStyle: 'italic', lineHeight: '38px', maxWidth: 380
            }}>
              Every great adventure begins with a single step into Nepal's mountains.
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['🏔️ Himalayan Trails', '🛕 Heritage Sites', '🆘 Safe Travels'].map(t => (
                <span key={t} style={{
                  fontSize: 12, background: 'rgba(255,255,255,0.15)',
                  color: '#fff', padding: '5px 12px', borderRadius: 999, fontWeight: 600
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Right form ── */}
      <section style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', background: '#fff8f4', minHeight: '100vh'
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <img src="/logo.png" alt="AI Pugyo" style={{ height: 44, width: 'auto' }} />
              <span style={{ fontWeight: 800, fontSize: 17, color: '#9d4300', fontFamily: 'Manrope, sans-serif' }}>
                AI Pugyo
              </span>
            </Link>
            <Link to="/" style={{
              fontSize: 13, color: '#8c7164',
              display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              Home
            </Link>
          </div>

          {/* Redirect message banner */}
          {redirectMessage && (
            <div style={{
              background: '#fff3cd', border: '1px solid #f97316',
              borderRadius: 10, padding: '10px 14px', marginBottom: 24,
              fontSize: 13, color: '#7a3900', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#f97316' }}>info</span>
              {redirectMessage}
            </div>
          )}

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1f1b17', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: '#584237', marginBottom: 32, fontSize: 15 }}>Sign in to your AI Pugyo account</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'Email address', key: 'email', type: 'email', icon: 'email', placeholder: 'you@email.com' },
              { label: 'Password', key: 'password', type: 'password', icon: 'lock', placeholder: 'Your password' }
            ].map(({ label, key, type, icon, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1f1b17', marginBottom: 7 }}>
                  {label}
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: 13, top: '50%',
                    transform: 'translateY(-50%)', fontSize: 18, color: '#8c7164'
                  }}>{icon}</span>
                  <input
                    type={type}
                    value={form[key]}
                    placeholder={placeholder}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    style={{
                      width: '100%', paddingLeft: 42, paddingRight: 16,
                      paddingTop: 13, paddingBottom: 13, borderRadius: 12,
                      border: '1.5px solid #e0d9cc', background: '#fff',
                      color: '#1f1b17', fontSize: 14, fontFamily: 'Manrope',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#f97316'}
                    onBlur={e => e.target.style.borderColor = '#e0d9cc'}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 999,
                background: loading ? '#fbb07a' : '#f97316',
                color: '#fff', fontSize: 15, fontWeight: 700,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Manrope', marginTop: 4, transition: 'all 0.2s'
              }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, marginTop: 24, color: '#584237' }}>
            No account?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: '#9d4300', textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}