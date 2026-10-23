/**
 * PageMetaStrip — the "Have a dog/cat too?" cross-link plus the page's
 * last-updated date, shown as one card.
 *
 * The prerendered HTML emits the same markup (pageMetaStripHtml in
 * scripts/prerenderLocationBody.ts). Keep the two in step: one of them is what
 * a given crawler sees.
 */
import { CalendarCheck, PawPrint } from 'lucide-react';
import { formatPageDate } from '../data/pageDates';

interface PageMetaStripProps {
  sibling?: { prompt: string; href: string; label: string } | null;
  updated?: string;
}

export default function PageMetaStrip({ sibling, updated }: PageMetaStripProps) {
  if (!sibling && !updated) return null;

  return (
    <section className="px-4 py-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl border border-sniffy-purple/15 bg-white shadow-sm overflow-hidden flex flex-col sm:flex-row sm:divide-x divide-y sm:divide-y-0 divide-sniffy-purple/10">
          {sibling && (
            <a
              href={sibling.href}
              className="group flex flex-1 items-center gap-3.5 px-4 py-4 sm:px-5 hover:bg-sniffy-purple/5 transition-colors"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sniffy-purple/10 text-sniffy-purple">
                <PawPrint className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-gray-500">{sibling.prompt} We groom both.</span>
                <span className="block text-[15px] font-semibold text-sniffy-purple group-hover:underline">
                  {sibling.label} →
                </span>
              </span>
            </a>
          )}
          {updated && (
            <div className="flex flex-1 items-center gap-3.5 px-4 py-4 sm:px-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sniffy-purple/10 text-sniffy-purple">
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="min-w-0">
                <span className="block text-xs text-gray-500">Prices, coverage &amp; reviews last updated</span>
                <time dateTime={updated} className="block text-[15px] font-semibold text-gray-800">
                  {formatPageDate(updated)}
                </time>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
