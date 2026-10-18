/**
 * admin/AdminLoginGate.tsx
 *
 * Thin wrapper around the shared SniffyLoginGate, locked to the
 * Admin / Back-Office portal. The shared gate handles the full
 * visual + auth flow. There is no UI to switch to the groomer
 * portal — admins should not be aware that one exists here.
 */

import SniffyLoginGate from '../SniffyLoginGate';
import { type AdminUser } from './authStore';

interface Props {
  onAuthed: (user: AdminUser) => void;
}

export default function AdminLoginGate({ onAuthed }: Props) {
  return <SniffyLoginGate portal="admin" onAuthed={onAuthed} />;
}
