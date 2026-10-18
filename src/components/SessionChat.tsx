/**
 * components/SessionChat.tsx
 *
 * Zomato-style live session chat — used in all three portals:
 *
 *   Groomer     → can tap quick-send presets OR type freely
 *   Customer    → sees updates + can reply
 *   Coordinator → sees full thread with sender labels + can inject notes
 *
 * Architecture:
 *   • Supabase Realtime subscription on INSERT for the session's messages
 *   • Append-only (no edit/delete) — history is sacred
 *   • System events (arrival, completion) are posted automatically by
 *     callers via `postStatusEvent()` — they appear as a styled pill in
 *     the thread, not as a chat bubble
 *
 * Props:
 *   sessionId    — grooming_sessions.id
 *   senderType   — 'groomer' | 'customer' | 'coordinator'
 *   senderId     — groomer.id | customer.id | admin username
 *   senderName   — display name shown on outgoing messages
 *   readOnly     — hide the input entirely (not used currently, reserved)
 */

import {
  useEffect, useRef, useState, useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ChevronDown, Loader2, MessageCircle, Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SenderType = 'groomer' | 'customer' | 'coordinator';

export interface SessionMessage {
  id: string;
  session_id: string;
  sender_type: SenderType;
  sender_id: string;
  sender_name: string;
  body: string;
  msg_type: 'text' | 'status_event';
  created_at: string;
}

interface Props {
  sessionId: string;
  senderType: SenderType;
  senderId: string;
  senderName: string;
  readOnly?: boolean;
  /** Called after a message is successfully sent — lets parent refresh state */
  onMessageSent?: () => void;
}

// ─── Quick-send presets (groomer only) ───────────────────────────────────────

const GROOMER_PRESETS = [
  { emoji: '', label: "I've started!", body: "I've started and heading your way!" },
  { emoji: '', label: 'On my way',     body: 'On my way to your location.' },
  { emoji: '', label: 'Running late',  body: "Running about 10-15 mins late. Sorry for the wait!" },
  { emoji: '', label: "I've arrived",  body: "I've arrived at your doorstep!" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function fmtDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/** Group messages by calendar day */
function groupByDay(msgs: SessionMessage[]): { day: string; items: SessionMessage[] }[] {
  const map: Map<string, SessionMessage[]> = new Map();
  for (const m of msgs) {
    const key = new Date(m.created_at).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    day: fmtDay(items[0].created_at),
    items,
  }));
}

// ─── Sender colour mapping ────────────────────────────────────────────────────

const SENDER_STYLES: Record<SenderType, {
  bubble: string;
  text: string;
  align: 'left' | 'right';
  nameColor: string;
}> = {
  groomer: {
    bubble: '#EEEDFE',
    text: '#3C3489',
    align: 'left',
    nameColor: '#534AB7',
  },
  customer: {
    bubble: '#E1F5EE',
    text: '#085041',
    align: 'right',
    nameColor: '#0F6E56',
  },
  coordinator: {
    bubble: '#FAEEDA',
    text: '#633806',
    align: 'left',
    nameColor: '#854F0B',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusEventPill({ body }: { body: string }) {
  return (
    <div className="flex justify-center my-1">
      <span
        className="text-[11px] font-semibold px-3 py-1 rounded-full"
        style={{ background: '#F1EFE8', color: '#5F5E5A' }}
      >
        {body}
      </span>
    </div>
  );
}

function ChatBubble({
  msg,
  isSelf,
  showName,
}: {
  msg: SessionMessage;
  isSelf: boolean;
  showName: boolean;
}) {
  const style = SENDER_STYLES[msg.sender_type];
  const isRight = isSelf;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex flex-col gap-0.5 ${isRight ? 'items-end' : 'items-start'}`}
    >
      {showName && !isSelf && (
        <span
          className="text-[10px] font-bold px-1"
          style={{ color: style.nameColor }}
        >
          {msg.sender_name}
          {msg.sender_type === 'coordinator' && (
            <span className="ml-1 text-[9px] font-semibold opacity-70">(coordinator)</span>
          )}
        </span>
      )}
      <div
        className="max-w-[78%] px-3 py-2 text-sm leading-snug"
        style={{
          background: isSelf
            ? (msg.sender_type === 'customer' ? '#E1F5EE' : msg.sender_type === 'coordinator' ? '#FAEEDA' : '#EEEDFE')
            : (msg.sender_type === 'groomer' ? '#EEEDFE' : msg.sender_type === 'coordinator' ? '#FAEEDA' : '#E1F5EE'),
          color: isSelf
            ? (msg.sender_type === 'customer' ? '#085041' : msg.sender_type === 'coordinator' ? '#633806' : '#3C3489')
            : (msg.sender_type === 'groomer' ? '#3C3489' : msg.sender_type === 'coordinator' ? '#633806' : '#085041'),
          borderRadius: isRight
            ? '16px 16px 4px 16px'
            : '16px 16px 16px 4px',
        }}
      >
        {msg.body}
      </div>
      <span className="text-[10px] text-gray-400 px-1">{fmtTime(msg.created_at)}</span>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SessionChat({
  sessionId,
  senderType,
  senderId,
  senderName,
  readOnly = false,
  onMessageSent,
}: Props) {
  const [chatOpen, setChatOpen]     = useState(false);
  const [messages, setMessages]     = useState<SessionMessage[]>([]);
  const [loading, setLoading]       = useState(false);
  const [draft, setDraft]           = useState('');
  const [sending, setSending]       = useState(false);
  const [showPresets, setShowPresets] = useState(senderType === 'groomer');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tappedPreset, setTappedPreset] = useState<string | null>(null);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);

  // ── Fetch messages (only when chat is opened) ─────────────────────────────
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('session_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as SessionMessage[]);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    if (chatOpen) fetchMessages();
  }, [chatOpen, fetchMessages]);

  // ── Realtime subscription — always active so unread count works ────────────
  useEffect(() => {
    const channel = supabase
      .channel(`session_chat:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const incoming = payload.new as SessionMessage;
          if (chatOpen) {
            setMessages(prev => {
              if (prev.some(m => m.id === incoming.id)) return prev;
              return [...prev, incoming];
            });
          } else {
            // Increment badge when chat is closed and a new message arrives
            setUnreadCount(n => n + 1);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, chatOpen]);

  // ── Auto-scroll to bottom on new message ──────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowScrollBtn(true);
    }
  }, [messages]);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBtn(false);
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowScrollBtn(!nearBottom);
  }

  // ── Send a message ─────────────────────────────────────────────────────────
  async function sendMessage(
    body: string,
    msgType: 'text' | 'status_event' = 'text',
    presetLabel?: string,
  ) {
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setDraft('');
    if (presetLabel) setTappedPreset(presetLabel);

    const { error } = await supabase.from('session_messages').insert({
      session_id: sessionId,
      sender_type: senderType,
      sender_id: senderId,
      sender_name: senderName,
      body: trimmed,
      msg_type: msgType,
    });

    if (error) {
      console.error('Chat send error:', error);
      setDraft(trimmed);
    } else {
      onMessageSent?.();
    }

    setSending(false);
    // Reset the tapped highlight after a short visual moment
    setTimeout(() => setTappedPreset(null), 800);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(draft);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const grouped = groupByDay(messages);

  return (
    <div className="relative">

      {/* ── Collapsed trigger — shown when chat is closed ── */}
      {!chatOpen && (
        <button
          onClick={() => { setChatOpen(true); setUnreadCount(0); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: '#EEEDFE' }}
          >
            <MessageCircle size={17} style={{ color: '#534AB7' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[13px] font-extrabold text-gray-900">
              {senderType === 'groomer' ? 'Message Customer' : senderType === 'coordinator' ? 'Session Chat' : 'Chat with Groomer'}
            </p>
            <p className="text-[11px] text-gray-400">
              {senderType === 'groomer' ? 'Send quick updates or type a message' : 'Tap to open live chat'}
            </p>
          </div>
          {unreadCount > 0 && (
            <span
              className="w-5 h-5 rounded-full text-[11px] font-extrabold flex items-center justify-center text-white shrink-0"
              style={{ background: '#E24B4A' }}
            >
              {unreadCount}
            </span>
          )}
          <ChevronDown size={15} className="text-gray-400 shrink-0" />
        </button>
      )}

      {/* ── Expanded chat panel ── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white"
          >
            {/* Header with close */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
              <MessageCircle size={15} className="text-sniffy-purple shrink-0" />
              <div className="flex-1">
                <p className="text-[13px] font-extrabold text-gray-900">
                  {senderType === 'groomer' ? 'Message Customer' : senderType === 'coordinator' ? 'Session Chat' : 'Chat with Groomer'}
                </p>
                <p className="text-[10px] text-gray-400">
                  {senderType === 'coordinator' ? 'Full thread — groomer · customer · coordinator' : 'Live · messages appear instantly'}
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" title="Live" />
              <button
                onClick={() => setChatOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition ml-1"
              >
                <ChevronDown size={14} className="text-gray-500" />
              </button>
            </div>

            {/* Message list */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="overflow-y-auto px-4 py-3 space-y-1"
              style={{ maxHeight: 380, minHeight: 200 }}
            >
              {loading ? (
                <div className="flex justify-center items-center h-24 gap-2 text-gray-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs">Loading messages…</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-1">
                  <MessageCircle size={22} className="text-gray-200" />
                  <p className="text-xs text-gray-400">No messages yet</p>
                  {senderType === 'groomer' && (
                    <p className="text-[11px] text-gray-400">Tap a quick update below to notify the customer</p>
                  )}
                </div>
              ) : (
                grouped.map(({ day, items }) => (
                  <div key={day}>
                    <div className="flex items-center gap-2 my-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-[10px] font-semibold text-gray-400 px-1">{day}</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <div className="space-y-2">
                      {items.map((msg, idx) => {
                        if (msg.msg_type === 'status_event') {
                          return <StatusEventPill key={msg.id} body={msg.body} />;
                        }
                        const isSelf = msg.sender_id === senderId;
                        const prevSender = idx > 0 ? items[idx - 1].sender_id : null;
                        const showName = msg.sender_id !== prevSender;
                        return (
                          <ChatBubble
                            key={msg.id}
                            msg={msg}
                            isSelf={isSelf}
                            showName={showName && senderType === 'coordinator'}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Scroll-to-bottom button */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="absolute right-3 bottom-20 w-8 h-8 rounded-full bg-sniffy-purple shadow-md flex items-center justify-center z-10"
                >
                  <ChevronDown size={16} className="text-white" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Groomer quick-send presets */}
            {!readOnly && senderType === 'groomer' && (
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setShowPresets(p => !p)}
                  className="w-full flex items-center gap-1.5 px-4 py-2 text-left"
                >
                  <Zap size={12} className="text-sniffy-purple" />
                  <span className="text-[11px] font-extrabold text-sniffy-purple uppercase tracking-wide">
                    Quick updates
                  </span>
                  <ChevronDown
                    size={12}
                    className={`ml-auto text-gray-400 transition-transform ${showPresets ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {showPresets && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-2 flex flex-wrap gap-2">
                        {GROOMER_PRESETS.map(p => {
                          const isActive = tappedPreset === p.label;
                          // Only disable the button that's currently sending — others stay interactive
                          const isDisabled = isActive && sending;
                          return (
                            <button
                              key={p.label}
                              onClick={() => !sending && sendMessage(p.body, 'text', p.label)}
                              disabled={isDisabled}
                              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95"
                              style={isActive
                                ? { background: '#EEEDFE', borderColor: '#7F77DD', color: '#3C3489', opacity: sending ? 0.6 : 1 }
                                : { background: '#F4F4F4', borderColor: '#E0E0E0', color: '#555', opacity: 1 }
                              }
                            >
                              <span>{p.emoji}</span>
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Text input */}
            {!readOnly && (
              <div className="flex items-end gap-2 px-3 py-2.5 border-t border-gray-100">
                <textarea
                  rows={1}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    senderType === 'groomer' ? 'Or type a custom message…'
                    : senderType === 'coordinator' ? 'Add a note or instruction…'
                    : 'Reply to your groomer…'
                  }
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-sniffy-purple transition"
                  style={{ maxHeight: 100, minHeight: 40, lineHeight: 1.5 }}
                  onInput={e => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = 'auto';
                    t.style.height = Math.min(t.scrollHeight, 100) + 'px';
                  }}
                />
                <button
                  onClick={() => sendMessage(draft)}
                  disabled={!draft.trim() || sending}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-90 disabled:opacity-40"
                  style={{ background: '#7F77DD' }}
                >
                  {sending
                    ? <Loader2 size={16} className="text-white animate-spin" />
                    : <Send size={16} className="text-white" />
                  }
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helper exported for callers to post system events ────────────────────────
/**
 * Post a status_event message automatically (e.g. when groomer marks arrived).
 * Call this from SessionActionPanel or other milestone triggers.
 */
export async function postStatusEvent(
  sessionId: string,
  body: string,
  actorName: string,
  actorId: string,
  actorType: SenderType,
) {
  await supabase.from('session_messages').insert({
    session_id: sessionId,
    sender_type: actorType,
    sender_id: actorId,
    sender_name: actorName,
    body,
    msg_type: 'status_event',
  });
}
