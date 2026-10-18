import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';
import { createReadStream, existsSync } from 'fs';
import { ALL_PUNE_CITIES } from './src/data/locationData';
import { ALL_CAT_PUNE_CITIES } from './src/data/catLocationData';

const locationInputs = Object.fromEntries(
  ALL_PUNE_CITIES.map(({ slug }) => {
    const citySlug = slug.split('/').pop() ?? slug;

    const key =
      'dog' +
      citySlug
        .split('-')
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join('');

    return [
      key,
      resolve(__dirname, `dog-grooming-in-pune/${citySlug}.html`)
    ];
  })
);

const catLocationInputs = Object.fromEntries(
  ALL_CAT_PUNE_CITIES.map(({ slug }) => {
    const citySlug = slug.split('/').pop() ?? slug;

    const key =
      'cat' +
      citySlug
        .split('-')
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join('');

    return [
      key,
      resolve(__dirname, `cat-grooming-in-pune/${citySlug}.html`)
    ];
  })
);

// ── Hub-page directory index (dev + preview parity with .htaccess) ─────────
// The two hub pages live at `<dir>/index.html`, but every canonical link,
// sitemap entry and <link rel="canonical"> points at the extension-less,
// slash-less URL `/dog-grooming-in-pune`. Apache resolves that via .htaccess
// rule 0; Vite's static middleware does not — it treats the bare directory
// path as a miss and hands it to the SPA fallback, which renders NotFound.
// This middleware mirrors the Apache rule so dev/preview match production.
const HUB_DIRS = ['dog-grooming-in-pune', 'cat-grooming-in-pune'];

const hubIndexMiddleware = () => {
  const handler = (server: { middlewares: { use: (fn: (req: { url?: string }, res: unknown, next: () => void) => void) => void } }) => {
    server.middlewares.use((req, res, next) => {
      const [path] = (req.url ?? '').split('?');
      const dir = HUB_DIRS.find((d) => path === `/${d}` || path === `/${d}/`);
      if (dir) req.url = `/${dir}/index.html`;
      next();
    });
  };

  return {
    name: 'sniffy-hub-index',
    configureServer: handler,
    configurePreviewServer: handler,
  };
};

// ── APK download links (dev + preview parity with .htaccess) ───────────────
// Production maps /download/admin and /download/groomer to files in
// /downloads/ via .htaccess. Vite ignores .htaccess, so mirror it here and send
// the same attachment headers.
const APK_LINKS: Record<string, string> = {
  '/download/admin': 'sniffy-admin.apk',
  '/download/groomer': 'sniffy-groomer.apk',
};

const apkDownloadMiddleware = () => {
  const make = (baseDir: string) => (server: { middlewares: { use: (fn: (req: { url?: string }, res: any, next: () => void) => void) => void } }) => {
    server.middlewares.use((req, res, next) => {
      const [path] = (req.url ?? '').split('?');
      const file = APK_LINKS[path.replace(/\/$/, '').toLowerCase()];
      const full = file && resolve(__dirname, baseDir, 'downloads', file);
      if (!full || !existsSync(full)) return next();
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
      createReadStream(full).pipe(res);
    });
  };

  return {
    name: 'sniffy-apk-download',
    configureServer: make('public'),
    configurePreviewServer: make('dist'),
  };
};

export default defineConfig({
  plugins: [
    react(),
    hubIndexMiddleware(),
    apkDownloadMiddleware(),
    // ── PWA / installable mobile app ──────────────────────────
    // Generates a Workbox-powered service worker so the app is
    // installable on Android & iOS home screens and serves the
    // app shell offline. We keep our hand-tuned manifest at
    // /favicon/site.webmanifest (rich icons, brand colour, IN
    // locale) instead of letting the plugin generate one.
    VitePWA({
      // We already ship our own webmanifest — don't overwrite it.
      manifest: false,
      // Auto-update strategy: whenever a new SW is detected the
      // page picks it up on next navigation. No user prompt UI
      // needed — keeps the install behaviour simple.
      registerType: 'autoUpdate',
      // Inject the SW-registration <script> automatically into
      // every HTML entry. Zero code in main.tsx required.
      //
      // 'auto' resolves to a plain <script src="/registerSW.js"> with no
      // defer/async — a classic, parser-blocking script that also needs a
      // network round trip. Vite emits it into EVERY HTML entry (all 58
      // locality pages included, not just the main SPA), so it sat in
      // <head> and delayed the browser from ever reaching the prerendered
      // <body> text — the likely cause of the mobile LCP regression flagged
      // in Search Console (Core Web Vitals > Mobile). 'script-defer' adds
      // `defer`, so it no longer blocks parsing/rendering.
      injectRegister: 'script-defer',
      // Only the main SPA entry needs the SW. The location
      // landing pages are SEO islands and don't load React.
      filename: 'sw.js',
      workbox: {
        // Precache the SPA shell — JS, CSS, and small assets.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Don't precache the per-city landing HTML — they bloat
        // the cache and aren't part of the installable app flow.
        //
        // The chunk exclusions below matter as much as the HTML ones. That glob
        // matches EVERY emitted chunk, so the precache had grown to ~5.1 MB
        // (4.4 MB of it JavaScript) and the service worker downloaded all of it
        // in the background immediately after first paint — on every visit, for
        // every visitor, including someone who only ever sees the marketing home
        // page. On a throttled mobile connection that competes for bandwidth
        // with the page itself and shows up as a badly inflated Speed Index.
        //
        // Everything listed here is still available: it is code-split, so the
        // browser fetches it on demand when the route that needs it is opened,
        // and the runtimeCaching rule below keeps it for repeat visits. The only
        // thing lost is *offline* availability of the admin/groomer dashboards,
        // which are online-only tools anyway (they read live Supabase data).
        globIgnores: [
          'dog-grooming-in-pune/**',
          'cat-grooming-in-pune/**',
          '**/sitemap.xml',

          // Admin/groomer-only libraries — ~1.35 MB combined, never touched by
          // a public visitor. xlsx = spreadsheet export, jspdf + html2canvas =
          // payroll slips, vendor-charts = the analytics tab.
          '**/assets/xlsx.*.js',
          '**/assets/jspdf*.js',
          '**/assets/html2canvas*.js',
          '**/assets/vendor-charts.*.js',
          '**/assets/purify.es.*.js',

          // ~690 KB of locality prose behind the /dog- and /cat- locality
          // routes, which are served as static HTML anyway.
          '**/assets/locationData.*.js',
          '**/assets/catLocationData.*.js',
          '**/assets/locationRegistry.*.js',
          '**/assets/catLocationRegistry.*.js',

          // 361 KB lottie player, lazy-loaded on booking success only.
          '**/assets/vendor-lottie.*.js',

          // Every dashboard tab chunk (~650 KB combined). The admin and groomer
          // dashboards read live Supabase data, so caching them for offline use
          // buys nothing — an offline dashboard has no data to render.
          '**/assets/*Tab.*.js',
          '**/assets/Admin*.js',
          '**/assets/Groomer*.js',
          '**/assets/CustomerPortal*.js',
          '**/assets/index.es.*.js',

          // 219 KB and referenced by nothing — not index.html, not the
          // webmanifest. It was pure dead weight in the precache.
          '**/favicon/favicon.svg',

          // Prerendered route HTML. scripts/prerenderSpa.ts emits a ~86 KB file
          // per route (17 of them, ~1.4 MB) because each carries that route's
          // full prerendered body. They exist for crawlers, not for offline use,
          // and navigateFallback below serves index.html for any cache miss —
          // so precaching them duplicated the shell 17 times over.
          'about.html',
          'how-it-works.html',
          'why-sniffy.html',
          'contact.html',
          'faqs.html',
          'blogs.html',
          'groomer-onboarding.html',
          'blogs/**',

          // Same reasoning: served by Apache's ErrorDocument for real 404s, and
          // offline navigations already fall back to index.html, whose `*` route
          // renders NotFoundPage. Precaching it would be a third copy of the shell.
          '404.html',
        ],
        // SPA fallback: any navigation that misses the cache
        // (e.g. deep link refreshed offline) serves index.html.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          // Don't hijack the SEO landing pages or admin/groomer
          // routes that need fresh data on every load. The `(\/|$)`
          // tail matters: the hub pages are linked as `/dog-grooming-in-pune`
          // with no trailing slash, and a `\/`-only pattern would miss them —
          // the SW would then serve the precached SPA shell and the hub would
          // render NotFound for any visitor who already has the SW installed.
          /^\/dog-grooming-in-pune(\/|$)/,
          /^\/cat-grooming-in-pune(\/|$)/,
          // The error page must not be answered from the precached SPA shell.
          // Without this, a visitor with the SW installed who navigates to
          // /404.html gets index.html — which renders the right thing (App's `*`
          // route is NotFoundPage) but under the home page's <title>, canonical
          // and `index, follow` robots tag. Crawlers never run a service worker
          // so they always got the real file; this makes the two agree.
          /^\/404\.html$/,
          // APK download links are served by Apache as file downloads; the SW
          // must not answer them with the SPA shell.
          /^\/download(s)?(\/|$)/,
        ],
        // Runtime caching. (No Google-Fonts rule — the app ships no web
        // fonts, so that cache bucket never matched anything.)
        runtimeCaching: [
          {
            // Cache product/marketing images for instant repeat loads.
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
          {
            // Catches the chunks deliberately kept out of the precache above.
            // StaleWhileRevalidate, not CacheFirst: the filenames are content-
            // hashed so a stale hit is never *wrong*, but revalidating keeps the
            // bucket from pinning a chunk that a later deploy orphaned.
            //
            // Net effect: an admin pays the download once, on the visit where
            // they actually open the tab that needs it, instead of every public
            // visitor paying for all of it up front.
            urlPattern: ({ request, url }) =>
              (request.destination === 'script' || request.destination === 'style') &&
              url.pathname.startsWith('/assets/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lazy-chunks',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
        // Bump cache size — we have a few large images.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Always claim clients & skip waiting so updates apply quickly.
        clientsClaim: true,
        skipWaiting: true,
      },
      // Dev-mode toggle: keep the SW disabled during `vite dev`
      // to avoid stale-asset confusion while iterating.
      devOptions: { enabled: false },
    }),
  ],

  // Exclude lucide-react from pre-bundling so Rollup can tree-shake unused icons
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  build: {
    // Target modern browsers — drops legacy polyfills, smaller output
    // Chrome 87+ covers >96% of Indian mobile traffic
    target: ['es2020', 'chrome87', 'safari14'],

    // Inline assets ≤ 4 KB as base64 (saves tiny-file round trips)
    assetsInlineLimit: 4096,

    // Each async chunk gets only the CSS it actually needs
    cssCodeSplit: true,

    // No source maps in production
    sourcemap: false,

    // esbuild is fast and produces very compact output
    minify: 'esbuild',
    cssMinify: true,

    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        // admin: resolve(__dirname, 'admin.html'),
        dogPune: resolve(__dirname, 'dog-grooming-in-pune/index.html'),
        catPune: resolve(__dirname, 'cat-grooming-in-pune/index.html'),

        ...locationInputs,
        ...catLocationInputs,
      },

      output: {
        // Each heavy dependency in its own chunk so the browser can cache them
        // independently. A new deploy only re-downloads what actually changed.
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/'))
            return 'vendor-react';
          if (id.includes('node_modules/react-router'))
            return 'vendor-router';
          if (id.includes('node_modules/framer-motion'))
            return 'vendor-motion';
          if (id.includes('node_modules/lucide-react'))
            return 'vendor-icons';
          if (id.includes('node_modules/@lottiefiles'))
            return 'vendor-lottie';
          if (id.includes('node_modules/@supabase'))
            return 'vendor-supabase';
          // recharts (+ its d3-* deps) is only used by the Analytics tab, but
          // it's big and stable — give it its own chunk so it stays cached
          // across deploys instead of being re-downloaded whenever any
          // analytics code changes.
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory-vendor'))
            return 'vendor-charts';
        },

        // Content-hash filenames = perfect long-term caching for JS/CSS
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },

    chunkSizeWarningLimit: 600,
  },
});
