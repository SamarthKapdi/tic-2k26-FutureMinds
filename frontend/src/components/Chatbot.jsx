import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

const FAQ_RESPONSES = {
  'blood': '🩸 **Blood Donation:**\n- Go to the Blood section to create a request or register as a donor\n- We match donors using GPS within your alert radius\n- All donors are trust-scored for safety',
  'donate': '💰 **Fundraising:**\n- Browse campaigns in the Fund section\n- All campaigns require verification\n- Payments are processed securely via Cashfree\n- Track progress in real-time',
  'missing': '🔍 **Missing Persons:**\n- Report missing persons with photos and details\n- Community members can submit geo-tagged sightings\n- Original reporters get instant notifications',
  'trust': '🛡️ **Trust Score:**\n- Earn points by donating blood (+5), reporting sightings (+3), getting verified (+20)\n- Scores range from 0-100\n- Higher trust = more visibility for your requests',
  'verify': '✅ **Verification:**\n- Go to Profile → Submit documents for verification\n- Admins review within 24 hours\n- Verified users get +20 trust score and a badge',
  'help': '🆘 **Quick Help:**\n- 🩸 Type "blood" for blood donation help\n- 💰 Type "donate" for fundraising help\n- 🔍 Type "missing" for missing persons help\n- 🛡️ Type "trust" for trust score info\n- ✅ Type "verify" for verification help\n- 🗺️ Type "map" for map usage',
  'map': '🗺️ **Live Map:**\n- View all emergencies near you in real-time\n- Filter by Blood requests or Missing persons\n- Click markers for full details\n- Enable Live mode for auto-refresh every 15s',
  'hello': '👋 Hi there! I\'m the Sahyog AI Assistant. How can I help you today?\n\nTry asking about:\n- Blood donation\n- Fundraising\n- Missing persons\n- Trust scores\n- Verification',
  'hi': '👋 Hello! I\'m here to help. Type "help" to see what I can assist with!',
};

function findResponse(input) {
  const lower = input.toLowerCase().trim();
  for (const [key, value] of Object.entries(FAQ_RESPONSES)) {
    if (lower.includes(key)) return value;
  }
  return `🤖 I'm not sure about that. Here are things I can help with:\n\n- Blood donation\n- Fundraising & donations\n- Missing persons\n- Trust scores\n- Verification process\n- Map usage\n\nType **"help"** for a full guide!`;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '👋 Hi! I\'m the **Sahyog AI Assistant**. How can I help you today?\n\nType **"help"** to see all topics.', time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = findResponse(userMsg.text);
      setMessages(prev => [...prev, { role: 'bot', text: response, time: new Date() }]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary shadow-xl shadow-primary/30 flex items-center justify-center text-white hover:scale-110 transition-transform"
        whileTap={{ scale: 0.9 }}
        aria-label="AI Chatbot"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Sahyog AI Assistant</h3>
                <p className="text-white/70 text-xs">Ask me anything</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/70 text-xs">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-gray-100 text-text rounded-bl-md'
                  }`}>
                    {msg.text.split('**').map((part, j) =>
                      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
