import { useState, useRef, useEffect } from 'react'

const BOT_RESPONSES = {
  greeting: "Hey! I'm Nova, your reading assistant. Ask me anything about books, study tips, or what to read next.",
  recommendation: "Based on what's popular right now, I'd suggest checking out 'Atomic Habits' by James Clear — it's a quick read and super practical for building study routines.",
  study_tip: "Try the Pomodoro technique: 25 minutes of focused reading, then a 5-minute break. After 4 rounds, take a longer break. Works wonders for retention.",
  groups: "You can join study groups from the Groups page. They're great for accountability — reading with others keeps you on track.",
  progress: "To track your reading, just open a book and click 'Start Reading'. You can update your page number whenever you take a break.",
  help: "I can help with:\n• Book recommendations\n• Study tips\n• How to use Learnova\n• Understanding your reading stats",
  default: "Hmm, I'm not sure about that one. But I can help with book recommendations, study tips, or navigating the app. What sounds good?",
}

function getBotReply(msg) {
  const lower = msg.toLowerCase()
  if (lower.match(/\b(hi|hello|hey|sup|yo)\b/)) return BOT_RESPONSES.greeting
  if (lower.match(/\b(recommend|suggest|what should|book)\b/)) return BOT_RESPONSES.recommendation
  if (lower.match(/\b(study|tip|focus|concentrate|remember|retain)\b/)) return BOT_RESPONSES.study_tip
  if (lower.match(/\b(group|team|study group)\b/)) return BOT_RESPONSES.groups
  if (lower.match(/\b(progress|track|page|update|start)\b/)) return BOT_RESPONSES.progress
  if (lower.match(/\b(help|what can|how)\b/)) return BOT_RESPONSES.help
  return BOT_RESPONSES.default
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: BOT_RESPONSES.greeting, time: new Date() },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function send(text) {
    const msg = text || input.trim()
    if (!msg) return

    const userMsg = { from: 'user', text: msg, time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const reply = getBotReply(msg)
      setMessages(prev => [...prev, { from: 'bot', text: reply, time: new Date() }])
      setTyping(false)
    }, 600 + Math.random() * 800)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const suggestions = ['Recommend a book', 'Study tips', 'How do I track progress?']

  return (
    <>
      <button
        className={`chatbot-toggle ${open ? 'chatbot-toggle--open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat' : 'Open chat assistant'}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>

      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">N</div>
              <div>
                <h4>Nova</h4>
                <span className="chatbot-status">online</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg--${msg.from}`}>
                {msg.from === 'bot' && <div className="chat-msg-avatar">N</div>}
                <div className="chat-bubble">{msg.text}</div>
              </div>
            ))}
            {typing && (
              <div className="chat-msg chat-msg--bot">
                <div className="chat-msg-avatar">N</div>
                <div className="chat-bubble chat-bubble--typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && (
            <div className="chatbot-suggestions">
              {suggestions.map(s => (
                <button key={s} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="chatbot-input-row">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask Nova something..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="chatbot-send" onClick={() => send()} disabled={!input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
