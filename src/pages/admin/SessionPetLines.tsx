/**
 * admin/SessionPetLines.tsx
 *
 * Per-pet lines for a multi-pet session: who the pet is, and the package /
 * add-ons it is getting.  Used on the admin session card and the groomer
 * screens.  Renders nothing for an ordinary single-pet session (callers pass
 * an empty/undefined list), so those keep their existing layout.
 */
import type { DisplayPet } from './sessionPets';

interface Props {
  pets?: DisplayPet[];
  /** Show each pet's price (admin, payment screens).  Groomer cards leave it off. */
  showAmounts?: boolean;
  /** 'card' = compact, for list cards; 'detail' = a bit larger. */
  size?: 'card' | 'detail';
  className?: string;
}

export default function SessionPetLines({ pets, showAmounts = false, size = 'card', className = '' }: Props) {
  if (!pets || pets.length < 2) return null;
  const text = size === 'detail' ? 'text-sm' : 'text-xs';
  return (
    <ul className={`space-y-1 ${className}`} data-testid="session-pet-lines">
      {pets.map((p, i) => {
        const service = [p.package, ...p.add_ons].filter(Boolean).join(' + ');
        return (
          <li key={i} className={`flex items-start gap-1.5 min-w-0 ${text}`}>
            <span className="shrink-0">{p.type === 'dog' ? '🐶' : '🐱'}</span>
            <span className="min-w-0 flex-1">
              {p.name && <span className="font-extrabold text-sniffy-purple mr-1">{p.name}</span>}
              <span className="font-semibold text-gray-700">{p.breed ?? (p.type === 'dog' ? 'Dog' : 'Cat')}</span>
              {service && <span className="text-gray-500"> · {service}</span>}
            </span>
            {showAmounts && p.amount !== null && (
              <span className="shrink-0 font-bold text-gray-700">₹{p.amount.toLocaleString('en-IN')}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
