import base from './tailwind.config.js';

/**
 * Tailwind config for the stylesheet the generated locality/hub pages load
 * (src/marketing.css). The shared config scans all of src/, so the one
 * stylesheet carried every admin/groomer/portal utility too — ~113 KB, 79%
 * unused on a locality page, and render-blocking. This scans only what the
 * public pages can render. If a class is missing on a public page, its file is
 * outside these globs: add it here.
 */
/** @type {import('tailwindcss').Config} */
export default {
  ...base,
  content: [
    './index.html',
    './src/components/**/*.{ts,tsx}',
    './src/data/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/entries/**/*.{ts,tsx}',
    './src/pages/LocationPage.tsx',
    './src/pages/PunePage.tsx',
    './src/pages/CatPunePage.tsx',
    './scripts/**/*.{js,ts}',
    // Dashboard/PWA-only chrome — never imported by the public pages' graph.
    '!./src/components/{WeatherWidget,SessionChat,PWAInstallGate,NotificationsPanel,MobileTopBar,SideDrawer,DraggableAddSessionFAB,CompletionCodePill,ConfirmDialog,PaymentStatusBadge}.tsx',
  ],
};
