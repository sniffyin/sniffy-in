import { Star, Quote } from 'lucide-react';
import { HOME_TESTIMONIALS } from '../data/homeTestimonials';
import { GOOGLE_REVIEW_URL } from '../data/siteLinks';
import RatingSummary from './RatingSummary';

export default function Testimonials() {
  const testimonials = HOME_TESTIMONIALS;

  return (
    <section className="py-8 md:py-12 px-4 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-1.5 leading-tight">
            <span className="text-sniffy-purple">What Pet Parents</span>{' '}
            <span className="text-sniffy-yellow">Say</span>
          </h2>

          <p className="text-gray-600 text-sm md:text-base">
            Loved by pets and their families across Pune
          </p>

          {/*
            The home page's LocalBusiness JSON-LD in index.html now carries an
            aggregateRating. This is the on-page rating that backs it — the two
            have to ship together. See src/data/reputation.ts.
          */}
          <RatingSummary className="mt-4" />
        </div>

        {/* Cards */}
        <div className="grid gap-3 md:grid-cols-2">

          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-sniffy-yellow/10 to-sniffy-purple/10
              rounded-xl p-3.5 relative border border-gray-100"
            >

              {/* Quote icon */}
              <Quote
                size={22}
                className="text-sniffy-yellow/20 absolute top-3 right-3"
              />

              {/* Stars */}
              <div className="flex gap-1 mb-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-sniffy-yellow text-sniffy-yellow"
                  />
                ))}
              </div>

              {/* Review */}
              <p className="text-gray-700 text-[13px] leading-snug mb-2.5">
                {testimonial.review}
              </p>

              {/* User */}
              <div className="flex items-center gap-2.5">

                <div
                  className="w-8 h-8 rounded-full
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

            </div>
          ))}

        </div>

        {/*
          Google review CTA. Every other marketing surface (locality pages, both
          city hubs, the hero) links out to the Business Profile — the home page
          was the one that did not, despite being the most-visited page. Review
          volume and recency are primary local-pack ranking inputs, so this is
          the highest-traffic place to ask.
        */}
        <div className="text-center mt-8 md:mt-10">
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-sniffy-purple
            text-sniffy-purple px-6 py-2.5 rounded-full font-semibold text-sm
            hover:bg-sniffy-purple hover:text-white transition"
          >
            <Star size={16} className="fill-sniffy-yellow text-sniffy-yellow" />
            Read all Google Reviews
          </a>
        </div>
      </div>
    </section>
  );
}