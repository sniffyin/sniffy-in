/**
 * siteLinks — external and cross-surface URLs used across the marketing site.
 *
 * The Google review link in particular was previously copy-pasted into five
 * files (heroSlides, LocationReviews, PunePage, CatPunePage, and the groomer's
 * CollectReviewModal). If the Business Profile is ever moved or the shortlink
 * regenerated, missing one of those silently sends customers to a dead page —
 * and review volume is the main input to local ranking, so a broken link there
 * is expensive and invisible. One constant, one place to change.
 */

/**
 * Google Business Profile "write a review" shortlink.
 *
 * Opens the review composer directly rather than the profile page — one tap
 * fewer, which measurably matters for completion. Get a fresh one from the
 * Business Profile dashboard → Ask for reviews.
 */
export const GOOGLE_REVIEW_URL = 'https://g.page/r/CfEJw603IrkPECE/review';

/** Public Business Profile listing (map pack result). */
export const GOOGLE_PROFILE_URL = 'https://g.page/r/CfEJw603IrkPECE';

export const INSTAGRAM_URL = 'https://www.instagram.com/sniffy.in';
export const PHONE = '8971313003';
export const EMAIL = 'care@sniffy.in';
