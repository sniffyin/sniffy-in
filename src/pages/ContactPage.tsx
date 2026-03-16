/**
 * ContactPage.tsx — Contact Us page for Sniffy
 * Route: /contact
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, MessageCircle, Clock, Send, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

// ─── Contact methods ──────────────────────────────────────────────────────────

const contactMethods = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 89713 13003',
    subtext: 'Fastest response — usually within minutes',
    href: 'https://wa.me/918971313003',
    cta: 'Chat on WhatsApp',
    color: 'bg-green-50 border-green-100',
    iconColor: 'text-green-600 bg-green-100',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 89713 13003',
    subtext: 'Mon–Sun, 9 AM – 9 PM',
    href: 'tel:+918971313003',
    cta: 'Call Now',
    color: 'bg-purple-50 border-purple-100',
    iconColor: 'text-sniffy-purple bg-sniffy-purple/10',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'care@sniffy.in',
    subtext: 'We reply within 24 hours',
    href: 'mailto:care@sniffy.in',
    cta: 'Send Email',
    color: 'bg-yellow-50 border-yellow-100',
    iconColor: 'text-yellow-700 bg-yellow-100',
  },
];

const operatingHours = [
  { day: 'Monday – Friday', hours: '9:00 AM – 9:00 PM' },
  { day: 'Saturday', hours: '9:00 AM – 9:00 PM' },
  { day: 'Sunday', hours: '9:00 AM – 9:00 PM' },
];

const coverageAreas = [
  'Wakad', 'Wagholi', 'Kothrud', 'Shivajinagar',
  'Kondhwa', 'NIBM', 'Dhanori', 'Pimpri-Chinchwad',
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const sendTelegram = async (name: string, phone: string, message: string) => {
    const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;
    const msg = [
      '📬 *New Contact Form Message*',
      `👤 Name: ${name}`,
      `📞 Phone: ${phone}`,
      `💬 Message: ${message}`,
    ].join('\n');
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' }),
    });
  };

  const handleSubmit = async () => {
    if (!form.name || form.phone.length < 10 || !form.message) return;
    setStatus('sending');
    try {
      // Save to Supabase contact_messages if table exists, else just Telegram
      try {
        await supabase.from('contact_messages').insert([{
          name: form.name,
          phone: form.phone,
          message: form.message,
        }]);
      } catch (_) {
        // Table may not exist — Telegram is the source of truth
      }
      await sendTelegram(form.name, form.phone, form.message);
      setStatus('sent');
      setForm({ name: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Navbar activePath="/contact" />
      </header>

      <main>

        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-purple-100 via-purple-50 to-white px-4 py-16 md:py-20 text-center">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-widest text-sniffy-purple font-bold mb-4">
              Get in touch
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
              We're here when<br />
              <span className="text-sniffy-purple">your pet needs us</span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              Questions about grooming, worried about your dog's coat, want to know if we cover your area — just reach out. We reply fast.
            </p>
          </motion.div>
        </section>

        {/* ── Contact methods ── */}
        <section className="px-4 py-12 bg-white">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactMethods.map((method, i) => (
              <motion.a
                key={method.label}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className={`group flex flex-col gap-4 border rounded-3xl p-6 transition-all duration-200 hover:shadow-md ${method.color}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${method.iconColor}`}>
                  <method.icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">{method.label}</p>
                  <p className="font-bold text-gray-900 text-base">{method.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{method.subtext}</p>
                </div>
                <span className="mt-auto text-sm font-semibold text-sniffy-purple group-hover:underline">
                  {method.cta} →
                </span>
              </motion.a>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
