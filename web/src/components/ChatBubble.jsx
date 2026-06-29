export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-full flex items-center justify-center mr-3 mt-1 shrink-0 overflow-hidden"
          style={{ background: '#fff', border: '1px solid #e0d9cc' }}>
          <img src="/logo.png" alt="AI Pugyo" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
        </div>
      )}
      <div className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed`}
        style={{
          background: isUser ? '#9d4300' : '#fff',
          color: isUser ? '#fff' : '#1f1b17',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          border: isUser ? 'none' : '1px solid #e0d9cc',
          boxShadow: '0 2px 8px rgba(26,23,20,0.06)'
        }}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.time && (
          <p className="text-xs mt-1" style={{ color: isUser ? 'rgba(255,219,202,0.8)' : '#8c7164' }}>{message.time}</p>
        )}
      </div>
    </div>
  );
}