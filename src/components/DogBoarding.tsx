import { motion } from 'framer-motion';
import { Home, Heart, Shield } from 'lucide-react';

export default function DogBoarding() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-sniffy-yellow/30 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 border-4 border-sniffy-yellow"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring" }}
              className="inline-block p-4 bg-gradient-to-br from-sniffy-purple to-sniffy-yellow rounded-full mb-4"
            >
              <Home size={40} className="text-white" />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-sniffy-purple">Looking for a cozy stay</span>{' '}
              <span className="text-sniffy-yellow">for your pet?</span>
            </h2>
            <p className="text-gray-700 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Sniffy offers hygienic, safe, and homely dog boarding in Pune.
              Spacious rooms, constant supervision, and lots of playtime!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="inline-block p-3 bg-sniffy-purple/10 rounded-full mb-3">
                <Shield size={32} className="text-sniffy-purple" />
              </div>
              <h3 className="font-bold text-sniffy-purple mb-2">Safe & Secure</h3>
              <p className="text-gray-600 text-sm">24/7 supervision & care</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="inline-block p-3 bg-sniffy-yellow/10 rounded-full mb-3">
                <Home size={32} className="text-sniffy-yellow" />
              </div>
              <h3 className="font-bold text-sniffy-purple mb-2">Homely Environment</h3>
              <p className="text-gray-600 text-sm">Comfortable & spacious rooms</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="inline-block p-3 bg-sniffy-purple/10 rounded-full mb-3">
                <Heart size={32} className="text-red-500" />
              </div>
              <h3 className="font-bold text-sniffy-purple mb-2">Lots of Love</h3>
              <p className="text-gray-600 text-sm">Playtime & personalized attention</p>
            </motion.div>
          </div>

          <button className="w-full bg-sniffy-yellow text-sniffy-purple py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            Explore Dog Boarding
          </button>
        </motion.div>
      </div>
    </section>
  );
}
