import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint } from 'lucide-react';

const ALL_FEATURES = [
  'Bath With Shampoo & Conditioner',
  'Full Body Trimming/ Full Body Haircut',
  'Blow Dry',
  'Combing/ Brushing',
  'Nail Clipping',
  'Eye & Ear Cleaning',
  'Sanitary Trim',
  'Under Paw Trim',
  'Paw Massage',
  'Mouth Spray',
  'Spritz of Perfume',
]

interface PackagesProps {
  onBookNow: () => void;
  showToggle?: boolean;
}

export default function Packages({ onBookNow, showToggle = true }: PackagesProps) {
  const [selectedPet, setSelectedPet] = useState<'dog' | 'cat'>('dog');
  const dogPackages = [
    {
      title: 'SPA BATH',
      price: '₹799',
      originalPrice: '₹999',
      items: [
        'Bath With Shampoo & Conditioner',
        'Blow Dry',
        'Combing/ Brushing',
        'Nail Clipping',
        'Eye & Ear Cleaning',
        'Paw Massage',
        'Mouth Spray',
        'Spritz of Perfume',
      ],
    },
    {
      title: 'HAIR CUT',
      price: '₹999',
      originalPrice: '₹1199',
      items: [
        'Full Body Trimming/ Full Body Haircut',
        'Combing/ Brushing',
        'Nail Clipping',
        'Eye & Ear Cleaning',
        'Mouth Spray',
        'Spritz of Perfume',
      ],
    },
    {
      title: 'SPA BATH + HAIR CUT',
      price: '₹1299',
      originalPrice: '₹1499',
      featured: true,
      items: [
        'Bath With Shampoo & Conditioner',
        'Full Body Trimming/ Full Body Haircut',
        'Blow Dry',
        'Combing/ Brushing',
        'Nail Clipping',
        'Eye & Ear Cleaning',
        'Sanitary Trim',
        'Under Paw Trim',
        'Paw Massage',
        'Mouth Spray',
        'Spritz of Perfume',
      ],
    },
  ];

  const catPackages = [
    {
      title: 'SPA BATH',
      price: '₹799',
      originalPrice: '₹999',
      items: [
        'Bath With Shampoo & Conditioner',
        'Blow Dry',
        'Combing/ Brushing',
        'Nail Clipping',
        'Eye & Ear Cleaning',
        'Paw Massage',
        'Mouth Spray',
        'Spritz of Perfume',
      ],
    },
    {
      title: 'HAIR CUT',
      price: '₹999',
      originalPrice: '₹1199',
      items: [
        'Full Body Trimming/ Full Body Haircut',
        'Combing/ Brushing',
        'Nail Clipping',
        'Eye & Ear Cleaning',
        'Mouth Spray',
        'Spritz of Perfume',
      ],
    },
    {
      title: 'SPA BATH + HAIR CUT',
      price: '₹1299',
      originalPrice: '₹1499',
      featured: true,
      items: [
        'Bath With Shampoo & Conditioner',
        'Full Body Trimming/ Full Body Haircut',
        'Blow Dry',
        'Combing/ Brushing',
        'Nail Clipping',
        'Eye & Ear Cleaning',
        'Sanitary Trim',
        'Under Paw Trim',
        'Mouth Spray',
        'Spritz of Perfume',
      ],
    },
  ];

  const dogAddOns = [
    'Tick and Flea Care - Spot-on cost (as per size) + 149',
    'Medicated Bath (Fungal/Bacterial Skin Infection) - 299',
    'Destressing Massage (with Coconut/Neem Oil) - 299',
    'Hygiene Hair Cut(Face & Sanitary) : 299',
    'Deworming - 299',
  ];

  const catAddOns = [
    'Tick and Flea Care - Spot-on cost (as per size) + 149',
    'Medicated Bath (Fungal/Bacterial Skin Infection) - 299',
    'Hygiene Hair Cut(Face & Sanitary) : 299',
    'Deworming - 299',
  ];

  const PackageCard = ({ pkg, index, petType }: { pkg: any; index: number; petType: 'dog' | 'cat' }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className="relative overflow-visible"
    >
      <div className="bg-[#f5e6c8] rounded-[40px] p-4 md:p-7 shadow-sm transition-all duration-300 h-full">
        <div className="bg-sniffy-purple text-white text-center py-3 px-6 rounded-[30px] mb-6 font-bold text-base md:text-xl w-fit mx-auto">
          {pkg.title}
        </div>

        <ul className="space-y-2">
          {/* INCLUDED FEATURES */}
          {pkg.items.map((feature: string, i: number) => (
            <li key={feature} className="flex items-start gap-3">
              <PawPrint
                size={18}
                className="text-sniffy-purple flex-shrink-0 mt-1"
                fill="currentColor"
              />

              <span className="text-gray-800 font-medium text-[14px] md:text-base leading-snug">
                {feature}
              </span>
            </li>
          ))}

          {/* NOT INCLUDED FEATURES (only on mobile) */}
          {ALL_FEATURES.filter(feature => !pkg.items.includes(feature)).map((feature, i) => (
            <li
              key={feature}
              className="flex items-start gap-3 opacity-40 md:hidden"
            >
              <PawPrint
                size={18}
                className="text-gray-400 flex-shrink-0 mt-1"
                fill="currentColor"
              />

              <span className="text-gray-400 line-through font-medium text-[14px] leading-snug">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* MOBILE PRICE */}
        <div className="mt-5 flex justify-center md:hidden">
          <div className="bg-sniffy-purple rounded-full px-7 py-3 text-center shadow-xl">
            <span className="block text-orange-400 line-through text-xs">
              {pkg.originalPrice}
            </span>
            <span className="text-white font-bold text-lg">
              {pkg.price}
            </span>
          </div>
        </div>

        {/* DESKTOP PRICE */}
        <div className="hidden md:flex absolute bottom-4 right-4 w-32 h-32 bg-sniffy-purple rounded-full flex-col items-center justify-center shadow-xl">
          <span className="text-orange-400 line-through text-base">{pkg.originalPrice}</span>
          <span className="text-white font-bold text-3xl">{pkg.price}</span>
        </div>
      </div>
    </motion.div>
  );

  const currentPackages = selectedPet === 'dog' ? dogPackages : catPackages;
  const currentAddOns = selectedPet === 'dog' ? dogAddOns : catAddOns;

  return (
    <section className="py-10 md:py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            <span className="text-sniffy-purple">Our Grooming</span>{' '}
            <span className="text-sniffy-yellow">Packages</span>
          </h2>

          {showToggle && <div className="inline-flex bg-gray-100 rounded-full p-1.5 md:p-2 shadow-lg">
            <button
              onClick={() => setSelectedPet('dog')}
              className={`px-5 md:px-8 py-2 md:py-3 rounded-full font-semibold text-sm md:text-lg transition-all duration-300 ${
                selectedPet === 'dog'
                  ? 'bg-sniffy-purple text-white shadow-lg'
                  : 'text-gray-600 hover:text-sniffy-purple'
              }`}
            >
              🐶 Dog
            </button>
            <button
              onClick={() => setSelectedPet('cat')}
              className={`px-5 md:px-8 py-2 md:py-3 rounded-full font-semibold text-sm md:text-lg transition-all duration-300 ${
                selectedPet === 'cat'
                  ? 'bg-sniffy-purple text-white shadow-lg'
                  : 'text-gray-600 hover:text-sniffy-purple'
              }`}
            >
              🐱 Cat
            </button>
          </div>}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPet}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 text-center"
            >
              {/* <div className="inline-block bg-sniffy-purple text-white px-8 py-3 rounded-full mb-4">
                <h3 className="text-2xl md:text-3xl font-bold">
                  Groom your <span className="text-sniffy-yellow">{selectedPet === 'dog' ? 'DOG' : 'CAT'}</span>
                </h3>
              </div> */}
              {/* <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
                Give your pet the perfect grooming - gentle care, expert hands, stress-free experience!
              </p> */}
            </motion.div>

            <div className="mb-6">
              {/* Mobile swipe */}
              <div className="flex lg:hidden gap-5 overflow-x-auto overflow-y-hidden pb-4 snap-x snap-mandatory scrollbar-hide items-start">
                {currentPackages.map((pkg, index) => (
                  <div key={index} className="min-w-[75%] snap-center">
                    <PackageCard pkg={pkg} index={index} petType={selectedPet} />
                  </div>
                ))}
              </div>

              {/* Desktop grid */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-6">
                {currentPackages.map((pkg, index) => (
                  <PackageCard key={index} pkg={pkg} index={index} petType={selectedPet} />
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12"
            >
              <h4 className="text-2xl md:text-3xl font-bold text-sniffy-purple mb-5 text-center">
                Special Add Ons
              </h4>

              <div className="bg-[#f5e6c8] rounded-[28px] p-4 md:p-8 shadow-md max-w-3xl mx-auto">

                <ul className="divide-y divide-black/10">

                  {currentAddOns.map((addon, index) => {
                    const parts = addon.split(' - ')

                    return (
                      <li
                        key={index}
                        className="py-2.5 md:py-3 text-sm md:text-lg font-medium"
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">

                          <span className="text-gray-800">
                            {parts[0]}
                          </span>

                          <span className="hidden md:block flex-1 border-b border-dashed border-gray-300"></span>

                          <span className="text-gray-900 font-semibold md:whitespace-nowrap">
                            {parts[1] || ""}
                          </span>

                        </div>
                      </li>
                    )
                  })}

                </ul>

              </div>
            </motion.div>
            {/* <section className="mt-20 bg-gray-50 rounded-[32px] px-6 py-10 md:px-12 md:py-14">
              <h2 className="text-2xl md:text-3xl font-bold text-sniffy-purple mb-4">
                Pet Grooming Services Across Pune
              </h2>

              <p className="text-gray-700 text-base md:text-lg leading-relaxed max-w-5xl">
                Sniffy offers professional dog and cat grooming at home across all major
                areas of Pune including <strong>Wakad</strong>, <strong>Hinjewadi</strong>,
                <strong>Baner</strong>, <strong>Aundh</strong>, <strong>Kothrud</strong>,
                <strong>Bavdhan</strong>, <strong>Karve Nagar</strong>, <strong>Hadapsar</strong>,
                <strong>Magarpatta</strong>, <strong>Kharadi</strong>, <strong>Viman Nagar</strong>,
                <strong>Yerawada</strong>, <strong>Pimpri-Chinchwad</strong>,
                <strong>Pimple Saudagar</strong> and nearby localities.
              </p>
            </section> */}
          </motion.div>
        </AnimatePresence>

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button
            onClick={onBookNow}
            className="bg-sniffy-yellow text-sniffy-purple px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
          >
            Book Your Grooming Session
          </button>
        </motion.div> */}
      </div>
    </section>
  );
}
