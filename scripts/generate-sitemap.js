import fs from "fs";
import { ALL_PUNE_CITIES } from "../src/data/locationData.ts";
import { ALL_CAT_PUNE_CITIES } from "../src/data/catLocationData.ts";

const BASE_URL = "https://sniffy.in";

const urls = [
  `${BASE_URL}`,
  `${BASE_URL}/dog-grooming-in-pune`,
  `${BASE_URL}/cat-grooming-in-pune`,
];

ALL_PUNE_CITIES.forEach((city) => {
  urls.push(`${BASE_URL}/${city.slug}`);
});

ALL_CAT_PUNE_CITIES.forEach((city) => {
  urls.push(`${BASE_URL}/${city.slug}`);
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls
  .map(
    (url) => `
  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
  )
  .join("")}

</urlset>
`;

fs.writeFileSync("dist/sitemap.xml", sitemap);

console.log("✅ Sitemap generated with clean URLs");