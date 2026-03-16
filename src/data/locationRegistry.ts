import { locations } from "./locations";

import {
  dhanoriLocation, dhanoriReviews, dhanoriFAQs, dhanoriMapEmbed,
  wagholiLocation, wagholiReviews, wagholiFAQs, wagholiMapEmbed,
  shivajinagarLocation, shivajinagarReviews, shivajinagarFAQs, shivajinagarMapEmbed,
  wakadLocation, wakadReviews, wakadFAQs, wakadMapEmbed,
  pimpriChinchwadLocation, pimpriChinchwadReviews, pimpriChinchwadFAQs, pimpriChinchwadMapEmbed,
  kondhwaLocation, kondhwaReviews, kondhwaFAQs, kondhwaMapEmbed,
  nibmLocation, nibmReviews, nibmFAQs, nibmMapEmbed,
  kothrudLocation, kothrudReviews, kothrudFAQs, kothrudMapEmbed,

  kalyaniNagarLocation, kalyaniNagarReviews, kalyaniNagarFAQs, kalyaniNagarMapEmbed,
  lohegaonLocation, lohegaonReviews, lohegaonFAQs, lohegaonMapEmbed,
  kharadiLocation, kharadiReviews, kharadiFAQs, kharadiMapEmbed,
  vimanNagarLocation, vimanNagarReviews, vimanNagarFAQs, vimanNagarMapEmbed,
  mundwaLocation, mundwaReviews, mundwaFAQs, mundwaMapEmbed,
  koregaonParkLocation, koregaonParkReviews, koregaonParkFAQs, koregaonParkMapEmbed,
  dhayariLocation, dhayariReviews, dhayariFAQs, dhayariMapEmbed,
  karveNagarLocation, karveNagarReviews, karveNagarFAQs, karveNagarMapEmbed,
  ambegaonLocation, ambegaonReviews, ambegaonFAQs, ambegaonMapEmbed,
  banerLocation, banerReviews, banerFAQs, banerMapEmbed,
  bavdhanLocation, bavdhanReviews, bavdhanFAQs, bavdhanMapEmbed,
  khadkiLocation, khadkiReviews, khadkiFAQs, khadkiMapEmbed,
  ravetLocation, ravetReviews, ravetFAQs, ravetMapEmbed,
  aundhLocation, aundhReviews, aundhFAQs, aundhMapEmbed,
  kalewadiLocation, kalewadiReviews, kalewadieFAQs, kalewadiMapEmbed,
  katrajLocation, katrajReviews, katrajFAQs, katrajMapEmbed,
  handewadiLocation, handewadiReviews, handewadiFAQs, handewadiMapEmbed,
  hadapsarLocation, hadapsarReviews, hadapsarFAQs, hadapsarMapEmbed,
  bibewadiLocation, bibewadiReviews, bibewadiFAQs, bibewadiMapEmbed,
  campLocation, campReviews, campFAQs, campMapEmbed,
  wanowrieLocation, wanowrieReviews, wanowrieFAQs, wanowrieMapEmbed,
} from "./locationData";

export const LOCATION_CONTENT = {
  "dhanori": { location: dhanoriLocation, reviews: dhanoriReviews, faqs: dhanoriFAQs, mapEmbed: dhanoriMapEmbed },
  "wagholi": { location: wagholiLocation, reviews: wagholiReviews, faqs: wagholiFAQs, mapEmbed: wagholiMapEmbed },
  "shivajinagar": { location: shivajinagarLocation, reviews: shivajinagarReviews, faqs: shivajinagarFAQs, mapEmbed: shivajinagarMapEmbed },
  "wakad": { location: wakadLocation, reviews: wakadReviews, faqs: wakadFAQs, mapEmbed: wakadMapEmbed },
  "pimpri-chinchwad": { location: pimpriChinchwadLocation, reviews: pimpriChinchwadReviews, faqs: pimpriChinchwadFAQs, mapEmbed: pimpriChinchwadMapEmbed },
  "kondhwa": { location: kondhwaLocation, reviews: kondhwaReviews, faqs: kondhwaFAQs, mapEmbed: kondhwaMapEmbed },
  "nibm": { location: nibmLocation, reviews: nibmReviews, faqs: nibmFAQs, mapEmbed: nibmMapEmbed },
  "kothrud": { location: kothrudLocation, reviews: kothrudReviews, faqs: kothrudFAQs, mapEmbed: kothrudMapEmbed },
  // New localities
  "kalyani-nagar": { location: kalyaniNagarLocation, reviews: kalyaniNagarReviews, faqs: kalyaniNagarFAQs, mapEmbed: kalyaniNagarMapEmbed },
  "lohegaon": { location: lohegaonLocation, reviews: lohegaonReviews, faqs: lohegaonFAQs, mapEmbed: lohegaonMapEmbed },
  "kharadi": { location: kharadiLocation, reviews: kharadiReviews, faqs: kharadiFAQs, mapEmbed: kharadiMapEmbed },
  "viman-nagar": { location: vimanNagarLocation, reviews: vimanNagarReviews, faqs: vimanNagarFAQs, mapEmbed: vimanNagarMapEmbed },
  "mundwa": { location: mundwaLocation, reviews: mundwaReviews, faqs: mundwaFAQs, mapEmbed: mundwaMapEmbed },
  "koregaon-park": { location: koregaonParkLocation, reviews: koregaonParkReviews, faqs: koregaonParkFAQs, mapEmbed: koregaonParkMapEmbed },
  "dhayari": { location: dhayariLocation, reviews: dhayariReviews, faqs: dhayariFAQs, mapEmbed: dhayariMapEmbed },
  "karve-nagar": { location: karveNagarLocation, reviews: karveNagarReviews, faqs: karveNagarFAQs, mapEmbed: karveNagarMapEmbed },
  "ambegaon": { location: ambegaonLocation, reviews: ambegaonReviews, faqs: ambegaonFAQs, mapEmbed: ambegaonMapEmbed },
  "baner": { location: banerLocation, reviews: banerReviews, faqs: banerFAQs, mapEmbed: banerMapEmbed },
  "bavdhan": { location: bavdhanLocation, reviews: bavdhanReviews, faqs: bavdhanFAQs, mapEmbed: bavdhanMapEmbed },
  "khadki": { location: khadkiLocation, reviews: khadkiReviews, faqs: khadkiFAQs, mapEmbed: khadkiMapEmbed },
  "ravet": { location: ravetLocation, reviews: ravetReviews, faqs: ravetFAQs, mapEmbed: ravetMapEmbed },
  "aundh": { location: aundhLocation, reviews: aundhReviews, faqs: aundhFAQs, mapEmbed: aundhMapEmbed },
  "kalewadi": { location: kalewadiLocation, reviews: kalewadiReviews, faqs: kalewadieFAQs, mapEmbed: kalewadiMapEmbed },
  "katraj": { location: katrajLocation, reviews: katrajReviews, faqs: katrajFAQs, mapEmbed: katrajMapEmbed },
  "handewadi": { location: handewadiLocation, reviews: handewadiReviews, faqs: handewadiFAQs, mapEmbed: handewadiMapEmbed },
  "hadapsar": { location: hadapsarLocation, reviews: hadapsarReviews, faqs: hadapsarFAQs, mapEmbed: hadapsarMapEmbed },
  "bibewadi": { location: bibewadiLocation, reviews: bibewadiReviews, faqs: bibewadiFAQs, mapEmbed: bibewadiMapEmbed },
  "camp": { location: campLocation, reviews: campReviews, faqs: campFAQs, mapEmbed: campMapEmbed },
  "wanowrie": { location: wanowrieLocation, reviews: wanowrieReviews, faqs: wanowrieFAQs, mapEmbed: wanowrieMapEmbed },
};

export const LOCATION_REGISTRY = locations.map((loc) => {
  const content = LOCATION_CONTENT[loc.slug as keyof typeof LOCATION_CONTENT];
  return { ...loc, ...content };
});