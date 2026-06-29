import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import ChatBubble from '../components/ChatBubble';

const suggestions = [
  'Best time to visit Everest Base Camp?',
  'म अन्नपूर्ण सर्किट जान चाहन्छु',
  'Emergency contacts for Solukhumbu?',
  'What permits do I need for trekking?',
];

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const DB_HISTORY_KEY = 'aipugyo_chat_sessions';

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(DB_HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function saveSessions(list) {
  localStorage.setItem(DB_HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
}

const INITIAL_GREETING = {
  role: 'assistant',
  content: 'नमस्ते! I am AI Pugyo 🏔️ — your Nepal expert. Ask me anything in English or Nepali about trails, culture, heritage, visas, or emergencies.',
  time: now(),
};

export default function Chat() {
  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  const [messages,      setMessages]      = useState([INITIAL_GREETING]);
  const [input,         setInput]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [recording,     setRecording]     = useState(false);
  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [sessions,      setSessions]      = useState(loadSessions);
  const [sessionId,     setSessionId]     = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false); // NEW

  const bottomRef = useRef(null);
  const fileRef   = useRef(null);
  const recRef    = useRef(null);

  // ── NEW: Load chat history from MongoDB on mount ──────────────────────────
  useEffect(() => {
    if (!user._id) return;

    setHistoryLoading(true);

    api.get(`/ai/history/${user._id}`)
      .then(({ data }) => {
        if (!data || data.length === 0) return;

        // Group messages by sessionId
        const grouped = {};
        data.forEach(entry => {
          const sid = entry.sessionId || entry._id;
          if (!grouped[sid]) grouped[sid] = [];
          grouped[sid].push(entry);
        });

        // Convert each group into the session format the UI expects
        const dbSessions = Object.entries(grouped).map(([sid, entries]) => {
          const firstMsg = entries[0].message || '';
          return {
            id: sid,
            title: firstMsg.length > 40 ? firstMsg.slice(0, 40) + '…' : firstMsg,
            updatedAt: new Date(entries[entries.length - 1].createdAt).getTime(),
            messages: [
              { ...INITIAL_GREETING },
              ...entries.flatMap(e => [
                { role: 'user',      content: e.message, time: new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                { role: 'assistant', content: e.reply,   time: new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
              ]),
            ],
          };
        });

        // Merge: localStorage sessions take priority (they have richer UI state),
        // DB sessions fill in anything missing (different device / after sign out)
        setSessions(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const newFromDB   = dbSessions.filter(s => !existingIds.has(s.id));
          if (newFromDB.length === 0) return prev; // nothing new

          const merged = [...prev, ...newFromDB]
            .sort((a, b) => b.updatedAt - a.updatedAt);

          saveSessions(merged); // also persist to localStorage
          return merged;
        });
      })
      .catch(() => {
        // silently fail — localStorage sessions still show
      })
      .finally(() => setHistoryLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user._id]);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-save session whenever messages change (if there's user content)
  useEffect(() => {
    const firstUser = messages.find(m => m.role === 'user');
    if (!firstUser) return;
    const id = sessionId || `chat_${Date.now()}`;
    if (!sessionId) setSessionId(id);
    const title = firstUser.content.length > 40
      ? firstUser.content.slice(0, 40) + '…'
      : firstUser.content;
    setSessions(prev => {
      const next = [
        { id, title, messages, updatedAt: Date.now() },
        ...prev.filter(s => s.id !== id),
      ];
      saveSessions(next);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  function loadSession(id) {
    const s = sessions.find(s => s.id === id);
    if (!s) return;
    setMessages(s.messages);
    setSessionId(id);
    setInput('');
    setImageFile(null);
    setImagePreview(null);
  }

  function deleteSession(e, id) {
    e.stopPropagation();
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      saveSessions(next);
      return next;
    });
    if (sessionId === id) startNewChat();
  }

  // Build history for multi-turn context (last 6 turns from current session)
  function buildHistory() {
    const turns = messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0);
    const pairs = [];
    for (let i = 1; i < turns.length - 1; i += 2) {
      if (turns[i] && turns[i + 1]) {
        pairs.push({ message: turns[i].content, reply: turns[i + 1].content });
      }
    }
    return pairs.slice(-6);
  }

  async function send(text) {
    const msg = text || input.trim();
    if (!msg && !imageFile) return;
    if (imageFile) { await sendImage(); return; }

    setInput('');
    const userMsg  = { role: 'user', content: msg, time: now() };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setLoading(true);

    try {
      const history = buildHistory();
      const { data } = await api.post('/ai/chat', {
        message: msg,
        userId: user._id,
        sessionId,
        history,
      });
      setMessages([...nextMsgs, { role: 'assistant', content: data.reply, time: now() }]);
    } catch {
      setMessages([...nextMsgs, { role: 'assistant', content: 'Sorry, could not connect. Please check backend is running.', time: now() }]);
    } finally {
      setLoading(false);
    }
  }

  async function sendImage() {
    const userMsg  = { role: 'user', content: '📷 Identifying this image…', time: now() };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setLoading(true);

    const fd = new FormData();
    fd.append('image', imageFile);

    try {
      const { data } = await api.post('/ai/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessages([...nextMsgs, { role: 'assistant', content: data.description, time: now() }]);
    } catch {
      setMessages([...nextMsgs, { role: 'assistant', content: 'Could not identify image. Please try again.', time: now() }]);
    } finally {
      setLoading(false);
      setImageFile(null);
      setImagePreview(null);
    }
  }

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice not supported in this browser'); return; }
    if (recording) { recRef.current?.stop(); setRecording(false); return; }
    const r = new SR();
    r.lang           = 'ne-NP';
    r.interimResults = false;
    r.onresult = e  => {
      const t = e.results[0][0].transcript;
      setInput(t);
      setRecording(false);
      toast.success('Voice captured! Press Send to ask.');
    };
    r.onerror  = () => setRecording(false);
    r.onend    = () => setRecording(false);
    r.start();
    recRef.current = r;
    setRecording(true);
    toast('Listening… speak now 🎙️', { icon: '🎙️' });
  }

  function startNewChat() {
    setMessages([{ ...INITIAL_GREETING, time: now() }]);
    setSessionId(null);
    setInput('');
    setImageFile(null);
    setImagePreview(null);
  }

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#fff8f4', fontFamily: 'Manrope, sans-serif', color: '#1f1b17',
    }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 260, display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0, flexShrink: 0,
        background: '#fff', borderRight: '1px solid #e0d9cc',
      }} className="hidden md:flex">

        {/* Logo + New chat */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f0e8e0' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 14 }}>
            <img src="/logo.png" alt="AI Pugyo" style={{ height: 38, width: 'auto' }} />
            <span style={{ fontWeight: 800, fontSize: 16, color: '#9d4300' }}>AI Pugyo</span>
          </Link>
          <button onClick={startNewChat} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '10px 16px', borderRadius: 999,
            background: '#f97316', color: '#fff', fontWeight: 700,
            fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'Manrope',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            New Chat
          </button>
        </div>

        {/* Recent sessions */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#8c7164',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '4px 10px 8px',
          }}>Recent Chats</p>

          {/* NEW: loading indicator while fetching from DB */}
          {historyLoading && (
            <p style={{ padding: '4px 10px', fontSize: 12, color: '#f97316' }}>
              Loading your chats…
            </p>
          )}

          {!historyLoading && sessions.length === 0 && (
            <p style={{ padding: '4px 10px', fontSize: 12, color: '#8c7164' }}>
              Your conversations will appear here.
            </p>
          )}

          {sessions.map(s => (
            <div key={s.id} style={{ position: 'relative', marginBottom: 2 }}>
              <button onClick={() => loadSession(s.id)} style={{
                width: '100%', textAlign: 'left', padding: '10px 36px 10px 12px',
                borderRadius: 10,
                background: sessionId === s.id ? '#fff8f4' : 'transparent',
                border: sessionId === s.id ? '1px solid #f97316' : '1px solid transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                color: sessionId === s.id ? '#9d4300' : '#584237',
                fontSize: 13, fontFamily: 'Manrope',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#f97316', flexShrink: 0 }}>chat_bubble</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
              </button>
              <button onClick={e => deleteSession(e, s.id)} style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#8c7164', padding: 2, display: 'flex', alignItems: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #e0d9cc' }}>
          <button onClick={() => navigate('/')} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: 10, color: '#584237',
            fontSize: 13, background: 'transparent', border: 'none',
            cursor: 'pointer', fontFamily: 'Manrope', marginBottom: 2,
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff8f4'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>home</span>
            Home
          </button>

          <button onClick={() => navigate('/dashboard')} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: 10, color: '#584237',
            fontSize: 13, background: 'transparent', border: 'none',
            cursor: 'pointer', fontFamily: 'Manrope',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff8f4'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
            Dashboard
          </button>
        </div>
      </aside>

      {/* ── Main chat area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px', background: '#fff',
          borderBottom: '1px solid #e0d9cc', flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 15, color: '#1f1b17', margin: 0 }}>AI Pugyo Chat</h1>
            <p style={{ fontSize: 12, color: '#8c7164', margin: 0 }}>
              Your Nepal travel expert • Replies in English &amp; Nepali • Multi-turn memory enabled
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#584237' }}>AI Online</span>
          </div>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
          {messages.map((m, i) => <ChatBubble key={i} message={m} />)}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#fff', border: '1px solid #e0d9cc',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
              }}>
                <img src="/logo.png" alt="AI Pugyo" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
                background: '#fff', border: '1px solid #e0d9cc',
              }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%', background: '#f97316',
                      animation: `bounce 1s ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions — only on fresh chat */}
        {messages.length === 1 && (
          <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)} style={{
                padding: '7px 14px', borderRadius: 999, fontSize: 12,
                fontWeight: 500, border: '1px solid #e0d9cc',
                background: '#fff', color: '#584237', cursor: 'pointer',
                fontFamily: 'Manrope', transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff8f4'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Image preview */}
        {imagePreview && (
          <div style={{ padding: '0 16px 8px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={imagePreview} alt="preview" style={{
                height: 64, borderRadius: 10,
                border: '1px solid #e0d9cc', display: 'block',
              }} />
              <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{
                position: 'absolute', top: -6, right: -6,
                width: 20, height: 20, borderRadius: '50%',
                background: '#ba1a1a', color: '#fff', border: 'none',
                cursor: 'pointer', fontSize: 11, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
            <p style={{ fontSize: 11, color: '#8c7164', marginTop: 4 }}>Image ready — press Send to identify</p>
          </div>
        )}

        {/* Input bar */}
        <div style={{
          borderTop: '1px solid #e0d9cc', padding: '14px 16px',
          background: '#fff', flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            maxWidth: 800, margin: '0 auto',
          }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files[0];
                if (!f) return;
                setImageFile(f);
                setImagePreview(URL.createObjectURL(f));
                toast('Image ready — press Send to identify it 🏛️');
                e.target.value = '';
              }} />

            <button onClick={() => fileRef.current?.click()} title="Upload image to identify" style={{
              padding: 10, borderRadius: 10, background: 'transparent',
              border: 'none', cursor: 'pointer', color: '#8c7164',
              display: 'flex', alignItems: 'center',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff8f4'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>image</span>
            </button>

            <button onClick={toggleVoice} title={recording ? 'Stop recording' : 'Voice input (English/Nepali)'} style={{
              padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: recording ? '#f97316' : 'transparent',
              color: recording ? '#fff' : '#8c7164',
              display: 'flex', alignItems: 'center', transition: 'all 0.2s',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {recording ? 'mic_off' : 'mic'}
              </span>
            </button>

            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Ask anything in English or Nepali…"
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 12,
                border: '1.5px solid #e0d9cc', background: '#f5ece6',
                color: '#1f1b17', fontSize: 14, fontFamily: 'Manrope', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e  => e.target.style.borderColor = '#e0d9cc'}
            />

            <button
              onClick={() => send()}
              disabled={loading || (!input.trim() && !imageFile)}
              style={{
                padding: 12, borderRadius: 12,
                background: (loading || (!input.trim() && !imageFile)) ? '#fdd5b4' : '#f97316',
                color: '#fff', border: 'none',
                cursor: (loading || (!input.trim() && !imageFile)) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', transition: 'all 0.2s',
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}