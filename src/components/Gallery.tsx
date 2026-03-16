import { motion } from 'framer-motion';
import { Sparkles, Star, Heart } from 'lucide-react';

export default function Gallery() {
  const images = [
    { id: 1, before: true, icon: Sparkles },
    { id: 2, before: false, icon: Star },
    { id: 3, before: true, icon: Sparkles },
    { id: 4, before: false, icon: Heart },
    { id: 5, before: true, icon: Star },
    { id: 6, before: false, icon: Heart },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-sniffy-yellow/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-sniffy-purple">Before & After</span>{' '}
            <span className="text-sniffy-yellow">Gallery</span>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl">See the amazing transformations</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative aspect-square rounded-[30px] overflow-hidden shadow-xl group cursor-pointer bg-gradient-to-br from-sniffy-purple/20 to-sniffy-yellow/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sniffy-purple to-sniffy-yellow opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center">
                <img.icon size={64} className="text-white/40 group-hover:text-white/60 transition-all" />
              </div>
              <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-full text-sm font-bold text-sniffy-purple shadow-lg">
                {img.before ? '🐶 Before' : '✨ After'}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-500 mt-10 italic text-lg"
        >
          Real transformation photos coming soon!
        </motion.p>
      </div>
    </section>
  );
}
