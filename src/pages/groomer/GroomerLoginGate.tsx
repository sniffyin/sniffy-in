/**
 * groomer/GroomerLoginGate.tsx
 *
 * Thin wrapper around the shared SniffyLoginGate, locked to the
 * Groomer portal. The shared gate handles the full visual + auth
 * flow. There is no UI to switch to the back office — groomers
 * should not be aware that an admin portal exists here.
 */

import SniffyLoginGate from '../SniffyLoginGate';
import { type AdminUser } from '../admin/authStore';

interface Props {
  onAuthed: (user: AdminUser) => void;
}

export default function GroomerLoginGate({ onAuthed }: Props) {
  return <SniffyLoginGate portal="groomer" onAuthed={onAuthed} />;
}
