import { Phone, Mail, MapPin, Instagram, ArrowUpRight } from 'lucide-react';
import { INSTAGRAM_URL, PHONE, EMAIL } from '../data/siteLinks';
import { localityLinkPrefix } from '../data/puneLocalities';

/**
 * Footer link graph.
 *
 * This footer appears on every marketing page, so it is the site's main
 * site-wide internal linking surface. It previously linked only the DOG hub and
 * 8 dog localities — the `/cat-grooming-in-pune` hub and all 29 cat locality
 * pages had essentially nothing pointing at them, despite "cat grooming pune"
 * being a head term with its own 29-page cluster.
 *
 * Now: both hubs, plus dog AND cat localities.
 *
 * Individual blog posts are deliberately NOT listed here — <RelatedArticles>
 * already links every post from every marketing page, and a second set of the
 * same links in the footer repeated text without adding link value.
 */
const footerLinks = {
  dogLocations: {
    label: 'Dog Grooming',
    links: [
      { name: 'All of Pune', href: '/dog-grooming-in-pune' },
      { name: 'Wakad', href: '/dog-grooming-in-pune/wakad' },
      { name: 'Kothrud', href: '/dog-grooming-in-pune/kothrud' },
      { name: 'Baner', href: '/dog-grooming-in-pune/baner' },
      { name: 'Wagholi', href: '/dog-grooming-in-pune/wagholi' },
      { name: 'Kharadi', href: '/dog-grooming-in-pune/kharadi' },
      { name: 'Kondhwa', href: '/dog-grooming-in-pune/kondhwa' },
      { name: 'Hadapsar', href: '/dog-grooming-in-pune/hadapsar' },
      { name: 'Pimpri-Chinchwad', href: '/dog-grooming-in-pune/pimpri-chinchwad' },
    ],
  },
  catLocations: {
    label: 'Cat Grooming',
    links: [
      { name: 'All of Pune', href: '/cat-grooming-in-pune' },
      { name: 'Wakad', href: '/cat-grooming-in-pune/wakad' },
      { name: 'Kothrud', href: '/cat-grooming-in-pune/kothrud' },
      { name: 'Baner', href: '/cat-grooming-in-pune/baner' },
      { name: 'Kharadi', href: '/cat-grooming-in-pune/kharadi' },
      { name: 'Viman Nagar', href: '/cat-grooming-in-pune/viman-nagar' },
      { name: 'Koregaon Park', href: '/cat-grooming-in-pune/koregaon-park' },
      { name: 'Hadapsar', href: '/cat-grooming-in-pune/hadapsar' },
      { name: 'Aundh', href: '/cat-grooming-in-pune/aundh' },
    ],
  },
  company: {
    label: 'Sniffy',
    links: [
      { name: 'How It Works',   href: '/how-it-works' },
      { name: 'Gallery',        href: '/gallery' },
      { name: 'FAQs',           href: '/faqs' },
      { name: 'Why Sniffy',     href: '/why-sniffy' },
      // Single link to the blog index rather than a column of individual posts.
      // Every marketing page already links each post once via <RelatedArticles>,
      // and Google generally only counts the FIRST link to a URL on a page for
      // anchor text — so a second set of post links in the footer added clutter
      // and repeated text without adding link value.
      { name: 'Grooming Guides', href: '/blogs' },
      { name: 'About Us',       href: '/about' },
      { name: 'Contact',        href: '/contact' },
      { name: 'Be a Groomer',   href: '/groomer-onboarding' },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="bg-sniffy-purple text-white pt-10 pb-6 px-4 relative overflow-hidden">

      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-sniffy-yellow/5 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Top — Logo + tagline + contact */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 pb-8 border-b border-white/10">
          {/* Brand block */}
          <div className="max-w-xs">
            <img
              src="/sniffy-logo-white.png"
              alt="Sniffy Pet Partners"
              className="w-32 mb-3 brightness-0 invert"
            />
            <p className="text-white/60 text-sm leading-snug mb-4">
              Professional dog and cat grooming at your doorstep across Pune.
              Trained groomers, pet-safe products, and zero salon hassle.
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/80">
              <a
                href={`tel:${PHONE}`}
                className="flex items-center gap-2 hover:text-sniffy-yellow transition-colors group"
              >
                <Phone size={15} className="text-sniffy-yellow" />
                {PHONE}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2 hover:text-sniffy-yellow transition-colors"
              >
                <Mail size={15} className="text-sniffy-yellow" />
                {EMAIL}
              </a>
              <span className="flex items-center gap-2 text-white/60">
                <MapPin size={15} className="text-sniffy-yellow" />
                Pune, Maharashtra
              </span>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 mt-4">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-sniffy-yellow transition-colors group"
              >
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-sniffy-yellow/20 transition-colors">
                  <Instagram size={15} />
                </span>
                @sniffy.in
                <ArrowUpRight size={13} className="opacity-50 group-hover:opacity-100" />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
            {Object.values(footerLinks).map((section) => (
              <div key={section.label}>
                <h4 className="text-sniffy-yellow font-bold text-sm uppercase tracking-widest mb-3">
                  {section.label}
                </h4>
                <ul className="space-y-1.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-white/60 text-sm hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                      >
                        {/* Locality links carry keyword anchor text ("Dog
                            grooming in Wakad"); the prefix is sr-only so the
                            column stays a compact list of area names. Returns
                            '' for the non-locality columns. */}
                        {localityLinkPrefix(link.href.slice(1)) && (
                          <span className="sr-only">
                            {localityLinkPrefix(link.href.slice(1))}
                          </span>
                        )}
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* copyright */}
        <div className="pt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-white/30 text-xs shrink-0">
            © 2026 Sniffy Pet Partners. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}