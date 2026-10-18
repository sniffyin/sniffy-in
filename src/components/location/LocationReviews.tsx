import { Star, Quote } from 'lucide-react';
import type { LocationConfig } from './LocationHero';
import { GOOGLE_REVIEW_URL } from '../../data/siteLinks';
import RatingSummary from '../RatingSummary';

export interface LocationReview {
  petName: string;
  ownerName: string;
  area: string;
  review: string;
  rating: number;
}

interface LocationReviewsProps {
  location: LocationConfig;
  reviews: LocationReview[];
}

export default function LocationReviews({ location, reviews }: LocationReviewsProps) {
  return (
    <section className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-2 leading-tight">
            <span className="text-sniffy-purple">What {location.name}</span>{' '}
            <span className="text-sniffy-yellow">Pet Parents Say</span>
          </h2>

          <p className="text-gray-600 text-sm md:text-base">
            Loved by pet families across {location.name} and nearby areas
          </p>

          {/*
            The page's LocalBusiness JSON-LD carries an aggregateRating; this is
            the visible counterpart Google requires it to have. Removing one
            without the other leaves the markup describing something the page
            doesn't show. See src/data/reputation.ts.
          */}
          <RatingSummary className="mt-4" />
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-5 md:grid-cols-2">

          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-sniffy-yellow/10 to-sniffy-purple/10
              rounded-2xl p-5 md:p-6 relative border border-gray-100"
            >

              {/* Quote */}
              <Quote
                size={28}
                className="text-sniffy-yellow/20 absolute top-3 right-3"
              />

              {/* Stars */}
              <div className="flex gap-1 mb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-sniffy-yellow text-sniffy-yellow"
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {review.review}
              </p>

              {/* User */}
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full 
                bg-gradient-to-br from-sniffy-purple to-sniffy-yellow
                flex items-center justify-center text-white font-bold text-sm">
                  {review.petName[0]}
                </div>

                <div className="leading-tight">
                  <div className="font-semibold text-sniffy-purple text-sm">
                    {review.petName}
                  </div>

                  <div className="text-xs text-gray-500">
                    Owner: {review.ownerName}
                  </div>

                  <div className="text-xs text-sniffy-purple/60">
                    {review.area}
                  </div>
                </div>

              </div>

            </div>
          ))}

        </div>

        {/* Button */}
        <div
          className="text-center mt-8 md:mt-10"
        >
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