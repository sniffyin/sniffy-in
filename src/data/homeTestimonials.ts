/**
 * homeTestimonials — reviews shown on the home page.
 * Extracted so scripts/prerenderSpa.ts can render them into static HTML.
 * See src/data/homeFaqs.ts for the rationale.
 *
 * NOTE: these are first-party marketing testimonials, NOT verified customer
 * reviews, so they are deliberately not marked up as schema.org aggregateRating.
 */

export interface HomeTestimonial {
  petName: string;
  ownerName: string;
  review: string;
  rating: number;
}

export const HOME_TESTIMONIALS: HomeTestimonial[] = [
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
