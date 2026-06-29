import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', country: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit() {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Account created!');
      navigate('/chat');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  }

  const fields = [
    { label: 'Full Name', key: 'name', type: 'text', icon: 'person', placeholder: 'Your full name' },
    { label: 'Email Address', key: 'email', type: 'email', icon: 'email', placeholder: 'you@email.com' },
    { label: 'Password', key: 'password', type: 'password', icon: 'lock', placeholder: 'Create a password' },
    { label: 'Country', key: 'country', type: 'text', icon: 'flag', placeholder: 'e.g. Nepal, India, USA' },
  ];

  return (
    <main style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>

      {/* Left image panel */}
      <section style={{
        position: 'relative',
        width: '50%',
        overflow: 'hidden',
        display: 'none',
        flexShrink: 0,
      }} className="md:!flex">
        <img
          src="https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1920&q=100&fit=crop"
          alt="Nepal scenery"
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
          {/* Logo + text */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.png" alt="AI Pugyo" style={{ height: 52, width: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }} />
            <span style={{ fontWeight: 800, fontSize: 22, color: '#fff', fontFamily: 'Manrope, sans-serif' }}>AI Pugyo</span>
          </Link>

          {/* Quote */}
          <div>
            <div style={{ fontSize: 64, color: 'rgba(255,255,255,0.18)', lineHeight: 1, marginBottom: 12, fontFamily: 'Georgia, serif' }}>"</div>
            <p style={{
              color: '#fff', fontSize: 26, fontWeight: 700,
              fontStyle: 'italic', lineHeight: '38px', maxWidth: 380
            }}>
              Nepal awaits — let AI Pugyo be your guide through every trail, temple, and teahouse.
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['🏔️ Trek Planning', '🛕 Heritage Tours', '🗺️ Live Maps', '🆘 SOS Guard'].map(t => (
                <span key={t} style={{
                  fontSize: 12, background: 'rgba(255,255,255,0.15)',
                  color: '#fff', padding: '5px 12px', borderRadius: 999, fontWeight: 600
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Right form */}
      <section style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', background: '#fff8f4', minHeight: '100vh'
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Top bar: logo + home link */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <img src="/logo.png" alt="AI Pugyo" style={{ height: 44, width: 'auto' }} />
              <span style={{ fontWeight: 800, fontSize: 17, color: '#9d4300', fontFamily: 'Manrope, sans-serif' }}>AI Pugyo</span>
            </Link>
            <Link to="/" style={{
              fontSize: 13, color: '#8c7164',
              display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              Home
            </Link>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1f1b17', marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: '#584237', marginBottom: 28, fontSize: 15 }}>Join Nepal's AI tourist assistant</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {fields.map(({ label, key, type, icon, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1f1b17', marginBottom: 7 }}>{label}</label>
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
                    style={{
                      width: '100%', paddingLeft: 42, paddingRight: 16,
                      paddingTop: 13, paddingBottom: 13,
                      borderRadius: 12, border: '1.5px solid #e0d9cc',
                      background: '#fff', color: '#1f1b17', fontSize: 14,
                      fontFamily: 'Manrope', outline: 'none', boxSizing: 'border-box'
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
                fontFamily: 'Manrope', marginTop: 6,
                transition: 'all 0.2s'
              }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, marginTop: 22, color: '#584237' }}>
            Already have one?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: '#9d4300', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}