import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
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

export default defineConfig({
  plugins: [react()],

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
