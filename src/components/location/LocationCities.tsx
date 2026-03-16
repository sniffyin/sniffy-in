import { motion } from "framer-motion";
import type { LocationConfig } from "./LocationHero";

interface LocationCitiesProps {
  location: LocationConfig;
}

export default function LocationCities({ location }: LocationCitiesProps) {
  const cities = [...location.otherCities].sort((a, b) => a.name.localeCompare(b.name));
  const firstFive = cities.slice(0, 5);
  const rest = cities.slice(5);

  return (
    <section className="bg-gray-50 py-10 md:py-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Pet Grooming Across Pune
          </h2>
          <p className="text-gray-500 mb-7 text-sm md:text-base">
            We bring home grooming to all major localities in Pune
          </p>
        </motion.div>

        {/* Desktop - all pills */}
        <motion.div
          className="hidden md:flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {cities.map((city) => (
            <a
              key={city.slug}
              href={"/" + city.slug}
              className="px-5 py-2 rounded-full text-sm font-semibold text-sniffy-purple border border-sniffy-purple/30 bg-sniffy-purple/5 hover:bg-sniffy-purple hover:text-white transition-all duration-200"
            >
              {city.name}
            </a>
          ))}
        </motion.div>

        {/* Mobile - first 5 + expandable */}
        <div className="md:hidden">
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {firstFive.map((city) => (
              <a
                key={city.slug}
                href={"/" + city.slug}
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-sniffy-purple border border-sniffy-purple/30 bg-sniffy-purple/5"
              >
                {city.name}
              </a>
            ))}
          </div>
          {rest.length > 0 && (
            <details className="group inline-block">
              <summary className="cursor-pointer list-none text-sniffy-purple font-semibold text-sm underline underline-offset-2">
                View all locations
              </summary>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {rest.map((city) => (
                  <a
                    key={city.slug}
                    href={"/" + city.slug}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold text-sniffy-purple border border-sniffy-purple/30 bg-sniffy-purple/5"
                  >
                    {city.name}
                  </a>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}
