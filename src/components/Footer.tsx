import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Instagram, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  locations: {
    label: 'Areas We Serve',
    links: [
      { name: 'Pune', href: '/dog-grooming-in-pune/' },
      { name: 'Wakad', href: '/dog-grooming-in-pune/wakad' },
      { name: 'Kothrud', href: '/dog-grooming-in-pune/kothrud' },
      { name: 'Wagholi', href: '/dog-grooming-in-pune/wagholi' },
      { name: 'Kondhwa', href: '/dog-grooming-in-pune/kondhwa' },
      { name: 'Dhanori', href: '/dog-grooming-in-pune/dhanori' },
      { name: 'Shivajinagar', href: '/dog-grooming-in-pune/shivajinagar' },
      { name: 'NIBM', href: '/dog-grooming-in-pune/nibm' },
      { name: 'Pimpri-Chinchwad', href: '/dog-grooming-in-pune/pimpri-chinchwad' },
    ],
  },
  company: {
    label: 'Sniffy',
    links: [
      { name: 'How It Works',  href: '/how-it-works' },
      { name: 'FAQs',          href: '/faqs' },
      { name: 'Why Sniffy',    href: '/why-sniffy' },
      { name: 'Blogs',         href: '/blogs' },
      { name: 'About Us',      href: '/about' },
      { name: 'Contact',       href: '/contact' },
      { name: 'Be a Groomer',  href: '/groomer-onboarding' },
    ],
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Footer() {
  return (
    <footer className="bg-sniffy-purple text-white pt-16 pb-8 px-4 relative overflow-hidden">

      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-sniffy-yellow/5 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Top — Logo + tagline + contact */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 pb-12 border-b border-white/10"
        >
          {/* Brand block */}
          <motion.div variants={itemVariants} className="max-w-xs">
            <img
              src="/sniffy-logo-white.png"
              alt="Sniffy Pet Partners"
              className="w-36 mb-4 brightness-0 invert"
            />
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Professional dog grooming at your doorstep across Pune.
              Trained groomers, pet-safe products, and zero salon hassle.
            </p>
            <div className="flex flex-col gap-3 text-sm text-white/80">
              <a
                href="tel:8971313003"
                className="flex items-center gap-2 hover:text-sniffy-yellow transition-colors group"
              >
                <Phone size={15} className="text-sniffy-yellow" />
                8971313003
              </a>
              <a
                href="mailto:care@sniffy.in"
                className="flex items-center gap-2 hover:text-sniffy-yellow transition-colors"
              >
                <Mail size={15} className="text-sniffy-yellow" />
                care@sniffy.in
              </a>
              <span className="flex items-center gap-2 text-white/60">
                <MapPin size={15} className="text-sniffy-yellow" />
                Pune, Maharashtra
              </span>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://www.instagram.com/sniffy.in"
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
          </motion.div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {Object.values(footerLinks).map((section) => (
              <motion.div key={section.label} variants={itemVariants}>
                <h4 className="text-sniffy-yellow font-bold text-sm uppercase tracking-widest mb-4">
                  {section.label}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-white/60 text-sm hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <p className="text-white/30 text-xs shrink-0">
            © 2026 Sniffy Pet Partners. All Rights Reserved.
          </p>
        </motion.div>

      </div>
    </footer>
  );
}