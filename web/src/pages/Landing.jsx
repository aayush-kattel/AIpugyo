import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const features = [
  { icon: 'chat_bubble', title: 'Intelligent Assistant', desc: 'Instant answers about weather, difficulty, and cultural etiquette in any regional dialect.', to: '/chat' },
  { icon: 'map', title: 'Trek Planner', desc: 'Custom itineraries based on your fitness level, time, and budget. Optimized for local teahouses.', to: '/planner' },
  { icon: 'temple_hindu', title: 'Heritage Explorer', desc: 'Discover hidden gems in Kathmandu Valley and beyond with AI-narrated historical guides.', to: '/heritage' },
  { icon: 'emergency', title: 'SOS Guard', desc: 'One-tap emergency hub connecting you to nearest rescue teams and health posts.', to: '/safety' },
];

export default function Landing() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  function guardedNavigate(to, label) {
    if (!user) {
      navigate('/login', { state: { message: `Please sign in first to access ${label}.` } });
    } else {
      navigate(to);
    }
  }

  return (
    <div style={{ background: '#fff8f4', color: '#1f1b17', fontFamily: 'Manrope, sans-serif' }}>

      <Navbar />

      {/* ── Hero ── */}
      <section style={{ position: 'relative', padding: '64px 24px 96px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '50%', height: '100%',
          background: 'radial-gradient(circle at top right, rgba(249,115,22,0.08), transparent)',
          pointerEvents: 'none'
        }} />
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center'
        }} className="grid-cols-1 md:grid-cols-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 999, width: 'fit-content',
              background: '#ffdbca', color: '#341100', marginBottom: 8
            }}>
              <span style={{ fontSize: 18 }}>🇳🇵</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Nepal's First AI Tourist Assistant</span>
            </div>
            <h1 style={{ margin: 0 }}>
              <span style={{ display: 'block', fontSize: 44, lineHeight: '52px', fontWeight: 800, color: '#1f1b17' }}>
                AI पुग्यो —
              </span>
              <span style={{ display: 'block', fontSize: 44, lineHeight: '52px', fontWeight: 800, color: '#f97316' }}>
                Your AI Has Arrived
              </span>
            </h1>
            <p style={{ fontSize: 17, color: '#584237', lineHeight: '28px', maxWidth: 480, marginTop: 8 }}>
              Ask about any trail, teahouse, or heritage site in English or Nepali. Plan your trek. Stay safe with real-time alerts.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
              <button onClick={() => guardedNavigate('/chat', 'Chat')}
                style={{
                  padding: '14px 32px', borderRadius: 999, fontSize: 14,
                  fontWeight: 700, color: '#fff', background: '#f97316',
                  border: 'none', cursor: 'pointer', fontFamily: 'Manrope',
                  display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(249,115,22,0.35)'
                }}>
                Start Chatting
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
              <button onClick={() => guardedNavigate('/planner', 'Planner')}
                style={{
                  padding: '14px 32px', borderRadius: 999, fontSize: 14,
                  fontWeight: 700, color: '#1f1b17', background: 'transparent',
                  border: '2px solid #8c7164', cursor: 'pointer', fontFamily: 'Manrope'
                }}>
                Plan Your Trek
              </button>
            </div>
          </div>

          {/* Hero image */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100%', height: 500, borderRadius: 24,
              overflow: 'hidden', border: '1px solid #e0d9cc', boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              position: 'relative'
            }}>
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=100"
                alt="Nepal mountains"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', top: 24, right: 24,
                background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
                padding: '12px 16px', borderRadius: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <div style={{ width: 10, height: 10, background: '#22c55e', borderRadius: '50%' }} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1f1b17' }}>Active in Nepal</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#8c7164', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Real-time AI monitoring</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 24px', background: '#fbf2eb' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 34, fontWeight: 700, color: '#1f1b17', margin: 0 }}>
              Smarter Travel, Safer Journeys
            </h2>
            <p style={{ color: '#584237', marginTop: 8, maxWidth: 440, margin: '8px auto 0' }}>
              Leveraging advanced AI to make every mile of your journey seamless.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}
            className="grid-cols-1 md:grid-cols-2">
            {features.map(({ icon, title, desc, to }) => (
              <button key={title} onClick={() => guardedNavigate(to, title)}
                style={{
                  padding: 40, borderRadius: 16, border: '1px solid rgba(224,217,204,0.5)',
                  background: '#fff', textAlign: 'left', cursor: 'pointer',
                  fontFamily: 'Manrope', transition: 'box-shadow 0.2s', width: '100%'
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, marginBottom: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: icon === 'emergency' ? 'rgba(186,26,26,0.1)' : 'rgba(249,115,22,0.1)',
                  color: icon === 'emergency' ? '#ba1a1a' : '#9d4300',
                }}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#1f1b17' }}>{title}</h3>
                <p style={{ color: '#584237', margin: 0, lineHeight: '24px' }}>{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Banner — Chitwan National Park 4K ── */}
      <section style={{ position: 'relative', height: 400, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTixQfIWS38WccmiixUtMxTgZdUBVhCaah29W7zUjwS-w&s=10')`,
          backgroundSize: 'cover', backgroundPosition: 'center'
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(31,27,23,0.55)' }} />
        <div style={{
          position: 'relative', zIndex: 10, height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', padding: '0 24px'
        }}>
          <span style={{
            display: 'inline-block', marginBottom: 12, padding: '4px 14px',
            borderRadius: 999, background: 'rgba(249,115,22,0.85)',
            fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase'
          }}>
            Chitwan National Park
          </span>
          <h2 style={{ fontSize: 42, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
            Explore Every Corner
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', maxWidth: 560, margin: '0 0 36px' }}>
            From the subtropical jungles of Terai to the high deserts of Manang, our AI knows every trail.
          </p>
          <button onClick={() => guardedNavigate('/map', 'Map')}
            style={{
              padding: '14px 36px', borderRadius: 999, fontSize: 14,
              fontWeight: 700, color: '#fff', background: '#f97316',
              border: 'none', cursor: 'pointer', fontFamily: 'Manrope',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
            Launch Explorer Map
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span>
          </button>
        </div>
      </section>

      {/* ── Footer ── */}

<footer style={{ background: '#f5ece6', borderTop: '1px solid rgba(224,217,204,0.3)' }}>
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 32px', maxWidth: 1280, margin: '0 auto'
  }}>
    <img src="/logo.png" alt="AI Pugyo" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
    <p style={{ fontSize: 12, color: '#8c7164', margin: 0 }}>© 2083 AI Pugyo — Nepal's AI Tourist Assistant</p>
    <p style={{ fontSize: 12, color: '#584237', margin: 0, fontWeight: 600 }}>Made by Team ADS</p>
  </div>
</footer>

      {/* ── Floating chat button ── */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
        <button onClick={() => guardedNavigate('/chat', 'Chat')}
          style={{
            padding: '14px 24px', borderRadius: 999, boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#f97316', color: '#fff', fontWeight: 700,
            fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'Manrope'
          }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
          Start Chat
        </button>
      </div>
    </div>
  );
}