import React, { useState } from 'react';
import { Search, Send, CheckCheck, Phone, ShieldCheck, MoreVertical, MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface Message {
  id: string;
  sender: 'user' | 'other';
  text: string;
  time: string;
}

interface Thread {
  id: string;
  name: string;
  role: string;
  property: string;
  initials: string;
  avatarBg: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  phone: string;
  messages: Message[];
}

const INITIAL_THREADS: Thread[] = [
  {
    id: 't1',
    name: 'Mrs. Sarah Jenkins',
    role: 'Property Manager',
    property: 'Pentagon Annex, UG Legon',
    initials: 'SJ',
    avatarBg: 'bg-teal-600',
    lastMessage: 'Yes, the Private Single Room is reserved for your tour this Friday.',
    time: '10:42 AM',
    unread: true,
    phone: '+233 24 411 2233',
    messages: [
      { id: 'm1', sender: 'user', text: "Hello Mrs. Jenkins, I'm Alex from UG Legon. Is the Private Room with generator still available for next semester?", time: '10:35 AM' },
      { id: 'm2', sender: 'other', text: "Good morning Alex! Yes, we have two private rooms remaining on Block B, second floor.", time: '10:38 AM' },
      { id: 'm3', sender: 'user', text: "That's great! Does the semester fee include water and WiFi?", time: '10:40 AM' },
      { id: 'm4', sender: 'other', text: "Yes, water is 24/7 borehole and WiFi is unlimited. The generator kicks in within 60 seconds of any ECG outage.", time: '10:41 AM' },
      { id: 'm5', sender: 'other', text: 'Yes, the Private Single Room is reserved for your tour this Friday.', time: '10:42 AM' },
    ],
  },
  {
    id: 't2',
    name: 'Evandy Desk Official',
    role: 'Front Office',
    property: 'Evandy Residence, Legon Campus',
    initials: 'ED',
    avatarBg: 'bg-slate-700',
    lastMessage: 'Your booking reservation request #EV-9821 has been acknowledged.',
    time: 'Yesterday',
    unread: false,
    phone: '+233 20 890 1234',
    messages: [
      { id: 'm20', sender: 'other', text: 'Your booking reservation request #EV-9821 has been acknowledged.', time: 'Yesterday 3:15 PM' },
    ],
  },
  {
    id: 't3',
    name: 'Kwame Boateng',
    role: 'Potential Roommate',
    property: 'Bani Property, UG Legon',
    initials: 'KB',
    avatarBg: 'bg-amber-600',
    lastMessage: 'Hey Alex, do you prefer a quiet room or are you cool with study groups?',
    time: '2 days ago',
    unread: false,
    phone: '+233 55 123 9876',
    messages: [
      { id: 'm30', sender: 'other', text: 'Hey Alex, do you prefer a quiet room or are you cool with study groups?', time: '2 days ago' },
    ],
  },
];

export const Messages: React.FC = () => {
  const { showToast } = useAppContext();
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>(INITIAL_THREADS[0].id);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              lastMessage: newMessage.text,
              time: 'Just now',
              messages: [...t.messages, newMessage],
            }
          : t
      )
    );
    setInputText('');

    // Simulate landlord reply
    setTimeout(() => {
      const replyMessage: Message = {
        id: `reply-${Date.now()}`,
        sender: 'other',
        text: 'Received! Let me know if you need our caretaker to show you around upon arrival.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                lastMessage: replyMessage.text,
                messages: [...t.messages, replyMessage],
              }
            : t
        )
      );
    }, 1200);
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.property.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex-1 flex flex-col bg-[var(--color-bg)] font-sans">
      {/* Top Header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-accent)]">
                Direct Landlord & Desk Chat
              </span>
              <h1 className="text-2xl font-heading font-extrabold text-[var(--color-heading)] tracking-tight">
                Messages
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <ShieldCheck size={14} />
                <span>Encrypted Host Inquiries</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Left Column: Thread List */}
        <div className="w-full md:w-[340px] lg:w-[380px] shrink-0 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xs flex flex-col overflow-hidden h-[620px]">
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs font-medium focus:outline-none focus:border-[var(--color-accent)] text-[var(--color-text-primary)] placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)] hide-scrollbar">
            {filteredThreads.map((thread) => {
              const isActive = thread.id === activeThreadId;
              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setThreads((prev) =>
                      prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t))
                    );
                  }}
                  className={`p-4 flex gap-3 items-center cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-teal-50/50 border-l-4 border-l-[var(--color-accent)]'
                      : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 ${thread.avatarBg}`}
                  >
                    {thread.initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-xs text-[var(--color-heading)] truncate">
                        {thread.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-1">
                        {thread.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-accent)] font-medium truncate mb-0.5">
                      {thread.property}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {thread.lastMessage}
                    </p>
                  </div>

                  {thread.unread && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="flex-1 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xs flex flex-col overflow-hidden h-[620px]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)] shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full text-white font-bold text-xs flex items-center justify-center ${activeThread.avatarBg}`}
              >
                {activeThread.initials}
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--color-heading)]">
                  {activeThread.name}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {activeThread.role} · {activeThread.property}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.open(`https://wa.me/${activeThread.phone.replace(/[^0-9]/g, '')}`, '_blank');
                  showToast('Opening WhatsApp link...');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold hover:border-slate-400 transition-colors cursor-pointer text-[var(--color-text-primary)]"
              >
                <Phone size={13} />
                <span>Call Host</span>
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[var(--color-bg)]/40 hide-scrollbar">
            <div className="text-center my-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-[var(--color-surface)] border border-[var(--color-border)] px-2.5 py-1 rounded-full">
                Booking Inquiries · Today
              </span>
            </div>

            {activeThread.messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              );
            })}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type your question or booking request..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="p-2.5 rounded-lg bg-[var(--color-button)] text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Send Message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
