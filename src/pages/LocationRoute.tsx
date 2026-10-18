/**
 * LocationRoute — the `/dog-grooming-in-pune/:slug` route component.
 *
 * This used to live inline in App.tsx as `LocationPageWrapper`. The page
 * component it renders was lazy-loaded, but the registry lookup was not: App.tsx
 * carried a static `import { LOCATION_REGISTRY } from './data/locationRegistry'`
 * at module scope, and that module pulls in all of `locationData.ts`.
 *
 * The practical effect was that ~311 KB of locality prose downloaded on EVERY
 * route — the home page included — to serve a lookup only this route performs.
 * (App.tsx's header comment claimed the data was "deferred until needed" and
 * cited 59 KB; neither was true by the time the locality set had grown to 33.)
 *
 * Keeping the lookup in this file means the registry is part of THIS lazy chunk,
 * so it is fetched when someone actually opens a locality URL and never before.
 */
import { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';

import { LOCATION_CONTENT } from '../data/locationRegistry';

const LocationPage = lazy(() => import('./LocationPage'));

export default function LocationRoute() {
  const { slug } = useParams<{ slug: string }>();

  // LOCATION_CONTENT, not LOCATION_REGISTRY. The old code here indexed
  // LOCATION_REGISTRY by slug, but that export is `locations.map(...)` — an
  // ARRAY — so a string index always yielded undefined and this route always
  // rendered "Location not found". It went unnoticed because .htaccess serves
  // the generated static HTML for these URLs, so the SPA route almost never
  // runs; only a client-side navigation would have hit it.
  const data = LOCATION_CONTENT[slug as keyof typeof LOCATION_CONTENT];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Location not found.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <LocationPage location={data.location} reviews={data.reviews} faqs={data.faqs} />
    </Suspense>
  );
}
