import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit() {
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ ...data.user, isAdmin: true }));
      toast.success('Admin access granted');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Access denied');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#1a1714', color: '#fff', fontFamily: 'Manrope, sans-serif' }}>
      <header className="w-full px-6 py-4 flex justify-between items-center">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
  <img src="/logo.png" alt="AI Pugyo" style={{ height: 42, width: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(249,115,22,0.5)' }} />
  <span style={{ fontWeight: 800, fontSize: 17, color: '#ffb690', fontFamily: 'Manrope, sans-serif' }}>AI Pugyo Admin</span>
</div>
        <Link to="/" className="flex items-center gap-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Site
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="relative mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(249,115,22,0.15)', border: '2px solid rgba(249,115,22,0.3)' }}>
              <span className="material-symbols-outlined text-4xl" style={{ color: '#f97316', fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin Access</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Restricted — Team ADS only</p>
          </div>

          <div className="space-y-4">
            {[{ label: 'Admin Email', key: 'email', type: 'email', icon: 'email' },
              { label: 'Password', key: 'password', type: 'password', icon: 'lock' }].map(({ label, key, type, icon }) => (
              <div key={key}>
                <label className="block text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>{icon}</span>
                  <input type={type} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontFamily: 'Manrope' }}
                    onFocus={e => e.target.style.borderColor = '#f97316'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
              </div>
            ))}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all hover:brightness-95 mt-2"
              style={{ background: '#f97316', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}