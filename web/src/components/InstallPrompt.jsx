import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show,           setShow]           = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setShow(false));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 32px)', maxWidth: 480,
      background: '#fff', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      border: '1.5px solid #e0d9cc', padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 16,
      fontFamily: 'Manrope, sans-serif',
    }}>
      <img src="/logo.png" alt="AI Pugyo" style={{
        width: 52, height: 52, borderRadius: 12, objectFit: 'contain',
        background: '#fff8f4', border: '1px solid #f0e8e0', flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1f1b17' }}>
          Install AI Pugyo
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8c7164', lineHeight: 1.4 }}>
          Add to home screen for offline access &amp; faster loading
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button onClick={handleInstall} style={{
          padding: '8px 18px', borderRadius: 50, background: '#f97316',
          color: '#fff', border: 'none', fontWeight: 700, fontSize: 13,
          cursor: 'pointer', fontFamily: 'Manrope', whiteSpace: 'nowrap',
        }}>
          Install App
        </button>
        <button onClick={() => setShow(false)} style={{
          padding: '4px 0', background: 'none', border: 'none',
          color: '#8c7164', fontSize: 11, cursor: 'pointer', fontFamily: 'Manrope', textAlign: 'center',
        }}>
          Not now
        </button>
      </div>
    </div>
  );
}