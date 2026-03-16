import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      petName: 'Bruno',
      ownerName: 'Priya Sharma',
      review:
        'Amazing service! The groomer was so patient with Bruno. He came home looking and smelling wonderful. Highly recommend Sniffy!',
      rating: 5,
    },
    {
      petName: 'Whiskers',
      ownerName: 'Rahul Desai',
      review:
        'My cat was so relaxed during the grooming. The team really knows how to handle anxious pets. Great value for money!',
      rating: 5,
    },
    {
      petName: 'Max',
      ownerName: 'Sneha Patil',
      review:
        'Professional, punctual, and caring. Max looks like a completely different dog! The spa bath package is absolutely worth it.',
      rating: 5,
    },
    {
      petName: 'Coco',
      ownerName: 'Amit Kulkarni',
      review:
        'Home grooming is so convenient! No more stressful car rides to the salon. Coco is happy and so are we. Thank you Sniffy!',
      rating: 5,
    },
  ];

  return (
    <section className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-2 leading-tight">
            <span className="text-sniffy-purple">What Pet Parents</span>{' '}
            <span className="text-sniffy-yellow">Say</span>
          </h2>

          <p className="text-gray-600 text-sm md:text-base">
            Loved by pets and their families across Pune
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-2">

          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}

              className="bg-gradient-to-br from-sniffy-yellow/10 to-sniffy-purple/10
              rounded-2xl p-5 md:p-6 relative border border-gray-100"
            >

              {/* Quote icon */}
              <Quote
                size={26}
                className="text-sniffy-yellow/20 absolute top-3 right-3"
              />

              {/* Stars */}
              <div className="flex gap-1 mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-sniffy-yellow text-sniffy-yellow"
                  />
                ))}
              </div>

              {/* Review */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {testimonial.review}
              </p>

              {/* User */}
              <div className="flex items-center gap-3">

                <div
                  className="w-10 h-10 rounded-full
                  bg-gradient-to-br from-sniffy-purple to-sniffy-yellow
                  flex items-center justify-center text-white font-bold text-sm"
                >
                  {testimonial.petName[0]}
                </div>

                <div className="leading-tight">
                  <div className="font-semibold text-sniffy-purple text-sm">
                    {testimonial.petName}
                  </div>

                  <div className="text-xs text-gray-500">
                    Owner: {testimonial.ownerName}
                  </div>
                </div>

              </div>

            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}