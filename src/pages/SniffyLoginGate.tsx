/**
 * SniffyLoginGate.tsx
 *
 * Shared modern sign-in surface used by both the Admin and Groomer
 * portals. The active portal is fixed by the route the user landed
 * on (/admin vs /groomer) — there is NO portal toggle in the UI,
 * so groomers don't know about the back office and admins don't
 * know about the groomer portal.
 *
 * AdminLoginGate.tsx and GroomerLoginGate.tsx are thin wrappers that
 * render this with the appropriate `portal` prop.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, AlertCircle, User, Lock, ArrowRight,
} from 'lucide-react';
import { loginUser, type AdminUser } from './admin/authStore';

type Portal = 'groomer' | 'admin';

interface Props {
  portal: Portal;
  onAuthed: (user: AdminUser) => void;
}

export default function SniffyLoginGate({ portal, onAuthed }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [shaking, setShake]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const isGroomer = portal === 'groomer';

  function flashError(msg: string) {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const user = loginUser(username.trim(), password, isGroomer ? 'groomer' : undefined);

      // Generic error for any mismatch — never reveal that the
      // other portal exists or that the account belongs to it.
      if (!user) {
        flashError('Incorrect username or password.');
        setLoading(false);
        return;
      }
      const userIsGroomer = user.role === 'groomer';
      if (isGroomer !== userIsGroomer) {
        flashError('Incorrect username or password.');
        setLoading(false);
        return;
      }

      onAuthed(user);
      setLoading(false);
    }, 320);
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        // Layered background: a flat dark overlay on top of the cosmic
        // SVG dims down the bright orbs / waves so the login card pops
        // clearly.  Bumping the rgba alpha (0.45) up darkens further,
        // down brightens.
        backgroundColor: '#1a0a3d',
        backgroundImage: 'linear-gradient(rgba(10,4,30,0.55), rgba(10,4,30,0.95)), url("/login-bg.svg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 mb-7"
      >
        {/* White logo on the dark cosmic background. */}
        <img
          src="/sniffy-logo-white.png"
          alt="Sniffy"
          className="h-[80px] w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
        />
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42, delay: 0.08, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm mx-5"
      >
        <motion.div
          animate={shaking ? { x: [-6, 6, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.38 }}
          className="rounded-[28px] overflow-hidden border border-white/40"
          style={{
            background: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow:
              '0 24px 64px rgba(0,0,0,0.34), 0 4px 18px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          <div className="px-7 pt-7 pb-8">

            {/* Title */}
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-sniffy-purple mb-1.5">
              {isGroomer ? 'Groomer Portal' : 'Back Office'}
            </p>
            <h1 className="text-[20px] leading-tight font-extrabold text-gray-900">
              {isGroomer ? 'Welcome back, Groomer' : 'Sign in to continue'}
            </h1>
            <p className="text-[12px] text-gray-500 mt-1 mb-6">
              {isGroomer
                ? 'Pick up where you left off — your day, your dogs.'
                : 'Coordinator & operations access.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-2.5">

              {/* Username */}
              <label className="block">
                <span className="sr-only">Username</span>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={username}
                    autoCapitalize="none"
                    autoComplete="username"
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    placeholder="Username"
                    className="w-full border border-gray-200 bg-gray-50 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-gray-900
                      placeholder:text-gray-400 focus:outline-none focus:border-sniffy-purple
                      focus:ring-2 focus:ring-sniffy-purple/20 focus:bg-white transition"
                    autoFocus
                  />
                </div>
              </label>

              {/* Password */}
              <label className="block">
                <span className="sr-only">Password</span>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    autoComplete="current-password"
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Password"
                    className="w-full border border-gray-200 bg-gray-50 rounded-2xl pl-10 pr-11 py-3.5 text-sm text-gray-900
                      placeholder:text-gray-400 focus:outline-none focus:border-sniffy-purple
                      focus:ring-2 focus:ring-sniffy-purple/20 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => !s)}
                    tabIndex={-1}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                  >
                    {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </label>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    key={error}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-start gap-1.5 text-[12px] text-red-600 font-medium px-1 leading-snug"
                  >
                    <AlertCircle size={13} className="mt-0.5 shrink-0"/>
                    <span>{error}</span>
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit — sniffy-purple gradient with a warm yellow
                  edge-glow that picks up the brand accent used in the
                  background spheres / plus signs. */}
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="group relative w-full py-3.5 rounded-2xl font-bold text-sm text-white mt-2
                  overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed
                  active:scale-[0.98] transition-all"
                style={{
                  background: 'linear-gradient(145deg, #7c3aed 0%, #451a8b 100%)',
                  boxShadow:
                    '0 10px 24px rgba(69,26,139,0.45), 0 0 0 1px rgba(253,230,138,0.18), inset 0 1px 0 rgba(255,255,255,0.18)',
                }}
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
                  {loading ? 'Signing in…' : 'Sign In'}
                  {!loading && (
                    <ArrowRight size={15} className="transition group-hover:translate-x-0.5"/>
                  )}
                </span>
                {/* subtle gloss sweep on hover */}
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                  style={{
                    background:
                      'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
                  }}
                />
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer caption */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-6 text-[11px] text-white/55 text-center px-8 tracking-wide"
      >
        {isGroomer ? 'Groomer access only' : 'Restricted access'} · Sniffy Pet Partners
      </motion.p>
    </div>
  );
}
