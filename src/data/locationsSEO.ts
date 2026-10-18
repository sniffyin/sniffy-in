export type LocationSEO = {
  slug: string
  name: string
  postal: string
  lat: string
  lng: string

  title: string
  description: string

  ogTitle: string
  ogDescription: string

  twitterTitle: string
  twitterDescription: string

  nearby: string[]
}

export const locationsSEO: LocationSEO[] = [

  {
    slug: "dhanori",
    name: "Dhanori",
    postal: "411015",
    lat: "18.5836",
    lng: "73.9064",

    title: "Dog Grooming at Home in Dhanori, Pune | Sniffy",
    description: "Dog grooming at home in Dhanori, Pune from ₹799. A trained groomer brings bath, haircut, nail and ear care to your door. Same-day slots — book online.",

    ogTitle: "Dog Grooming at Home in Dhanori, Pune | Sniffy",
    ogDescription: "Trained groomers visit your home in Dhanori, Pune. Bath, trim & nail care for your dog — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Dhanori, Pune | Sniffy",
    twitterDescription: "Professional dog grooming at your door in Dhanori, Pune. No salon needed — from ₹799.",

    nearby: ["Viman Nagar", "Lohegaon", "Vishrantwadi", "Yerawada"]
  },

  {
    slug: "kondhwa",
    name: "Kondhwa",
    postal: "411048",
    lat: "18.4612",
    lng: "73.8936",

    title: "Professional Dog Grooming at Home in Kondhwa, Pune | Sniffy",
    description: "Dog grooming at home in Kondhwa, Pune from ₹799. Trained groomer, full kit, bath to blow-dry at your door. No salon trip. Pick a slot and book online.",

    ogTitle: "Professional Dog Grooming at Home in Kondhwa, Pune | Sniffy",
    ogDescription: "Sniffy's groomers visit your home in Kondhwa, Pune. Calm, thorough dog grooming sessions from ₹799.",

    twitterTitle: "Dog Grooming at Home in Kondhwa, Pune | Sniffy",
    twitterDescription: "Book a dog groomer at your door in Kondhwa, Pune — thorough sessions from ₹799.",

    nearby: ["NIBM Road", "Undri", "Mohammadwadi", "Wanowrie"]
  },

  {
    slug: "kothrud",
    name: "Kothrud",
    postal: "411038",
    lat: "18.5074",
    lng: "73.8143",

    title: "Trusted Dog Grooming at Home in Kothrud, Pune | Sniffy",
    description: "Dog grooming at home in Kothrud, Pune from ₹799. Bath, haircut, nail and ear care by a trained groomer at your door. Book a morning or evening slot.",

    ogTitle: "Trusted Dog Grooming at Home in Kothrud, Pune | Sniffy",
    ogDescription: "Reliable in-home dog grooming in Kothrud, Pune. Trained groomers, pet-safe products, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Kothrud, Pune | Sniffy",
    twitterDescription: "Reliable dog grooming at your door in Kothrud, Pune — trained groomers, from ₹799.",

    nearby: ["Karve Nagar", "Warje", "Bavdhan", "Erandwane", "Paud Road"]
  },

  {
    slug: "nibm",
    name: "NIBM",
    postal: "411048",
    lat: "18.4726",
    lng: "73.8948",

    title: "Dog Grooming at Home in NIBM, Pune | Book a Groomer | Sniffy",
    description: "Dog grooming at home in NIBM, Pune from ₹799. A trained groomer visits with clean tools for bath, trim and nail care. Gentle handling — book online.",

    ogTitle: "Dog Grooming at Home in NIBM, Pune | Sniffy",
    ogDescription: "Book a trained dog groomer at your home in NIBM, Pune. Gentle, thorough sessions from ₹799.",

    twitterTitle: "Dog Grooming at Home in NIBM, Pune | Sniffy",
    twitterDescription: "Trained dog groomers at your door in NIBM, Pune — gentle and thorough, from ₹799.",

    nearby: ["NIBM Road", "Kondhwa", "Undri", "Wanowrie", "Mohammadwadi"]
  },

  {
    slug: "pimpri-chinchwad",
    name: "Pimpri-Chinchwad",
    postal: "411018",
    lat: "18.6298",
    lng: "73.7997",

    title: "Dog Grooming at Home Across Pimpri-Chinchwad, Pune | Sniffy",
    description: "Dog grooming at home across Pimpri-Chinchwad from ₹799 — Akurdi, Nigdi, Bhosari, Pimple Saudagar. Groomer comes to you with the full kit. Book online.",

    ogTitle: "Dog Grooming at Home Across Pimpri-Chinchwad, Pune | Sniffy",
    ogDescription: "In-home dog grooming across Pimpri-Chinchwad — all areas covered, trained groomers, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Pimpri-Chinchwad | Sniffy",
    twitterDescription: "Sniffy covers all of Pimpri-Chinchwad for in-home dog grooming — from ₹799.",

    nearby: ["Akurdi", "Nigdi", "Bhosari", "Pimple Saudagar"]
  },

  {
    slug: "shivajinagar",
    name: "Shivajinagar",
    postal: "411005",
    lat: "18.5308",
    lng: "73.8474",

    title: "Dog Grooming at Home in Shivajinagar, Pune | Certified Groomers | Sniffy",
    description: "Dog grooming at home in Shivajinagar, Pune from ₹799. Certified groomer does bath, haircut, ear cleaning and nail trim at your door. Book a slot.",

    ogTitle: "Dog Grooming at Home in Shivajinagar, Pune | Sniffy",
    ogDescription: "Certified groomers at your door in Shivajinagar, Pune. Complete dog grooming sessions from ₹799.",

    twitterTitle: "Dog Grooming at Home in Shivajinagar, Pune | Sniffy",
    twitterDescription: "Certified dog groomers visit your home in Shivajinagar, Pune — from ₹799.",

    nearby: ["Deccan Gymkhana", "Erandwane", "Model Colony", "Pune University Road"]
  },

  {
    slug: "wagholi",
    name: "Wagholi",
    postal: "412207",
    lat: "18.5679",
    lng: "73.9799",

    title: "Dog Grooming at Home in Wagholi, Pune | Flexible Slots | Sniffy",
    description: "Dog grooming at home in Wagholi, Pune from ₹799. Morning, afternoon or evening slots — a trained groomer comes to you with everything. Book online.",

    ogTitle: "Dog Grooming at Home in Wagholi, Pune | Sniffy",
    ogDescription: "Flexible in-home dog grooming slots in Wagholi, Pune — morning to evening, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Wagholi, Pune | Sniffy",
    twitterDescription: "Pick a time, book a groomer — in-home dog grooming in Wagholi, Pune from ₹799.",

    nearby: ["Kharadi", "Viman Nagar", "Nagar Road", "Lohegaon"]
  },

  {
    slug: "wakad",
    name: "Wakad",
    postal: "411057",
    lat: "18.5984",
    lng: "73.7602",

    title: "Dog Grooming at Home in Wakad, Pune | No Salon Needed | Sniffy",
    description: "Dog grooming at home in Wakad, Pune from ₹799. Apartment-friendly setup; certified groomer handles bath, trim and nail care at your door. Book now.",

    ogTitle: "Dog Grooming at Home in Wakad, Pune | Sniffy",
    ogDescription: "Certified in-home dog grooming in Wakad, Pune. Apartment-friendly, trained groomers, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Wakad, Pune | Sniffy",
    twitterDescription: "Certified dog groomers at your door in Wakad, Pune — no salon needed, from ₹799.",

    nearby: ["Hinjewadi", "Pimple Saudagar", "Thergaon", "Chinchwad"]
  },

  {
    slug: "kalyani-nagar",
    name: "Kalyani Nagar",
    postal: "411006",
    lat: "18.5362",
    lng: "73.9042",

    title: "Dog Grooming at Home in Kalyani Nagar, Pune | Sniffy",
    description: "Dog grooming at home in Kalyani Nagar, Pune from ₹799. Bath, blow-dry, nail trim and ear cleaning by a trained groomer at your door. Book a slot.",

    ogTitle: "Dog Grooming at Home in Kalyani Nagar, Pune | Sniffy",
    ogDescription: "Home dog grooming in Kalyani Nagar, Pune. Trained groomers, full session at your door — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Kalyani Nagar, Pune | Sniffy",
    twitterDescription: "Home dog grooming in Kalyani Nagar, Pune — full session at your door, from ₹799.",

    nearby: ["Koregaon Park", "Viman Nagar", "Kharadi", "Nagar Road"]
  },

  {
    slug: "lohegaon",
    name: "Lohegaon",
    postal: "411047",
    lat: "18.5987",
    lng: "73.9169",

    title: "Dog Grooming at Home in Lohegaon, Pune | Doorstep Service | Sniffy",
    description: "Dog grooming at home in Lohegaon, Pune from ₹799. Trained groomer, hygienic kit, bath to nail care at your door. No travel — book online today.",

    ogTitle: "Dog Grooming at Home in Lohegaon, Pune | Sniffy",
    ogDescription: "Doorstep dog grooming in Lohegaon, Pune. Trained groomers, hygienic setup — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Lohegaon, Pune | Sniffy",
    twitterDescription: "Doorstep dog grooming in Lohegaon, Pune — trained groomers, no salon run, from ₹799.",

    nearby: ["Dhanori", "Viman Nagar", "Vishrantwadi", "Tingre Nagar"]
  },

  {
    slug: "kharadi",
    name: "Kharadi",
    postal: "411014",
    lat: "18.5516",
    lng: "73.9427",

    title: "Dog Grooming at Home in Kharadi, Pune | Book Online | Sniffy",
    description: "Dog grooming at home in Kharadi, Pune from ₹799. Early morning to evening slots; the groomer arrives with everything needed. Book online in minutes.",

    ogTitle: "Dog Grooming at Home in Kharadi, Pune | Sniffy",
    ogDescription: "Flexible home dog grooming in Kharadi, Pune. Book a slot that works for you — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Kharadi, Pune | Sniffy",
    twitterDescription: "Book a dog groomer at your home in Kharadi, Pune — flexible slots, from ₹799.",

    nearby: ["Kalyani Nagar", "Wagholi", "Viman Nagar", "Mundhwa"]
  },

  {
    slug: "viman-nagar",
    name: "Viman Nagar",
    postal: "411014",
    lat: "18.5679",
    lng: "73.9143",

    title: "Dog Grooming at Home in Viman Nagar, Pune | Sniffy",
    description: "Dog grooming at home in Viman Nagar, Pune from ₹799. Stress-free bath, trim, nail and ear care by a trained groomer at your door. Book a slot today.",

    ogTitle: "Dog Grooming at Home in Viman Nagar, Pune | Sniffy",
    ogDescription: "Stress-free home dog grooming in Viman Nagar, Pune. Trained groomers at your door — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Viman Nagar, Pune | Sniffy",
    twitterDescription: "Trained groomers at your door in Viman Nagar, Pune — stress-free dog grooming from ₹799.",

    nearby: ["Kalyani Nagar", "Lohegaon", "Dhanori", "Kharadi"]
  },

  {
    slug: "mundwa",
    name: "Mundwa",
    postal: "411036",
    lat: "18.5246",
    lng: "73.9213",

    title: "Dog Grooming at Home in Mundwa, Pune | Sniffy",
    description: "Dog grooming at home in Mundwa, Pune from ₹799. Certified groomer brings the full kit, grooms your dog and leaves your space clean. Book online.",

    ogTitle: "Dog Grooming at Home in Mundwa, Pune | Sniffy",
    ogDescription: "Certified home dog grooming in Mundwa, Pune. Clean setup, trained groomers — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Mundwa, Pune | Sniffy",
    twitterDescription: "Certified dog groomers at your home in Mundwa, Pune — clean, hassle-free, from ₹799.",

    nearby: ["Kalyani Nagar", "Kharadi", "Hadapsar", "Koregaon Park"]
  },

  {
    slug: "koregaon-park",
    name: "Koregaon Park",
    postal: "411001",
    lat: "18.5362",
    lng: "73.8938",

    title: "Dog Grooming at Home in Koregaon Park, Pune | Sniffy",
    description: "Dog grooming at home in Koregaon Park, Pune from ₹799. Experienced groomers, all breeds — bath, coat care and nail trim at your door. Book a slot.",

    ogTitle: "Dog Grooming at Home in Koregaon Park, Pune | Sniffy",
    ogDescription: "Premium home dog grooming in Koregaon Park, Pune. Experienced groomers, all breeds — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Koregaon Park, Pune | Sniffy",
    twitterDescription: "Premium dog grooming at your home in Koregaon Park, Pune — experienced groomers, from ₹799.",

    nearby: ["Kalyani Nagar", "Camp", "Mundhwa", "Dhole Patil Road"]
  },

  {
    slug: "dhayari",
    name: "Dhayari",
    postal: "411041",
    lat: "18.4681",
    lng: "73.8143",

    title: "Dog Grooming at Home in Dhayari, Pune | Sniffy",
    description: "Dog grooming at home in Dhayari, Pune from ₹799. A trained groomer visits with a clean setup for bath, haircut and nail care. Book a slot online.",

    ogTitle: "Dog Grooming at Home in Dhayari, Pune | Sniffy",
    ogDescription: "Home dog grooming now available in Dhayari, Pune. Trained groomers, full session — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Dhayari, Pune | Sniffy",
    twitterDescription: "Trained groomers now visiting homes in Dhayari, Pune — full dog grooming from ₹799.",

    nearby: ["Narhe", "Ambegaon", "Warje", "Nanded City"]
  },

  {
    slug: "karve-nagar",
    name: "Karve Nagar",
    postal: "411052",
    lat: "18.4975",
    lng: "73.8213",

    title: "Dog Grooming at Home in Karve Nagar, Pune | Sniffy",
    description: "Dog grooming at home in Karve Nagar, Pune from ₹799. Gentle, unhurried sessions — ideal for senior or anxious dogs. Book a groomer at your door.",

    ogTitle: "Dog Grooming at Home in Karve Nagar, Pune | Sniffy",
    ogDescription: "Gentle home dog grooming in Karve Nagar, Pune — great for senior dogs, full session from ₹799.",

    twitterTitle: "Dog Grooming at Home in Karve Nagar, Pune | Sniffy",
    twitterDescription: "Gentle home dog grooming in Karve Nagar, Pune — perfect for senior or anxious dogs, from ₹799.",

    nearby: ["Kothrud", "Erandwane", "Warje", "Anand Nagar"]
  },

  {
    slug: "ambegaon",
    name: "Ambegaon",
    postal: "411046",
    lat: "18.4612",
    lng: "73.8274",

    title: "Dog Grooming at Home in Ambegaon, Pune | Sniffy",
    description: "Dog grooming at home in Ambegaon, Pune from ₹799. Bath, trim, nail care and a full coat check at your door — no salon trip. Book a slot online.",

    ogTitle: "Dog Grooming at Home in Ambegaon, Pune | Sniffy",
    ogDescription: "In-home dog grooming now in Ambegaon, Pune. Trained groomers at your door — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Ambegaon, Pune | Sniffy",
    twitterDescription: "Home dog grooming now available in Ambegaon, Pune — book a trained groomer, from ₹799.",

    nearby: ["Dhayari", "Katraj", "Narhe", "Warje"]
  },

  {
    slug: "baner",
    name: "Baner",
    postal: "411045",
    lat: "18.5590",
    lng: "73.7874",

    title: "Dog Grooming at Home in Baner, Pune | On-Time Service | Sniffy",
    description: "Dog grooming at home in Baner, Pune from ₹799. On-time groomers arrive fully equipped for bath, haircut and nail care. Book a slot that suits you.",

    ogTitle: "Dog Grooming at Home in Baner, Pune | Sniffy",
    ogDescription: "On-time home dog grooming in Baner, Pune. Fully equipped groomers at your door — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Baner, Pune | Sniffy",
    twitterDescription: "Punctual home dog grooming in Baner, Pune — groomers at your door, on your schedule, from ₹799.",

    nearby: ["Balewadi", "Aundh", "Wakad", "Pashan"]
  },

  {
    slug: "bavdhan",
    name: "Bavdhan",
    postal: "411021",
    lat: "18.5136",
    lng: "73.7763",

    title: "Dog Grooming at Home in Bavdhan, Pune | Sniffy",
    description: "Dog grooming at home in Bavdhan, Pune from ₹799. One-on-one session at your door — bath, haircut, nail and ear care. No travel. Book online today.",

    ogTitle: "Dog Grooming at Home in Bavdhan, Pune | Sniffy",
    ogDescription: "Home dog grooming in Bavdhan, Pune — calm, one-on-one session at your door, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Bavdhan, Pune | Sniffy",
    twitterDescription: "One-on-one home dog grooming in Bavdhan, Pune — no travel, no stress, from ₹799.",

    nearby: ["Baner", "Kothrud", "Pashan", "Sus"]
  },

  {
    slug: "khadki",
    name: "Khadki",
    postal: "411003",
    lat: "18.5695",
    lng: "73.8474",

    title: "Dog Grooming at Home in Khadki, Pune | Sniffy",
    description: "Dog grooming at home in Khadki, Pune from ₹799. Societies and cantonment quarters covered; punctual, fully equipped groomers. Book a slot online.",

    ogTitle: "Dog Grooming at Home in Khadki, Pune | Sniffy",
    ogDescription: "Professional home dog grooming in Khadki, Pune — punctual groomers, all areas covered, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Khadki, Pune | Sniffy",
    twitterDescription: "Punctual home dog grooming in Khadki, Pune — trained groomers, all residential areas, from ₹799.",

    nearby: ["Aundh", "Shivajinagar", "Dapodi", "Sangvi"]
  },

  {
    slug: "ravet",
    name: "Ravet",
    postal: "412101",
    lat: "18.6484",
    lng: "73.7433",

    title: "Dog Grooming at Home in Ravet, Pune | Sniffy",
    description: "Dog grooming at home in Ravet, Pune from ₹799. A trained groomer comes to you with everything — bath, trim, nails and ear care. Book online today.",

    ogTitle: "Dog Grooming at Home in Ravet, Pune | Sniffy",
    ogDescription: "In-home dog grooming now available in Ravet, Pune. Trained groomers at your door — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Ravet, Pune | Sniffy",
    twitterDescription: "Home dog grooming now in Ravet, Pune — book a trained groomer at your door, from ₹799.",

    nearby: ["Akurdi", "Pimple Saudagar", "Wakad", "Tathawade"]
  },

  {
    slug: "aundh",
    name: "Aundh",
    postal: "411007",
    lat: "18.5590",
    lng: "73.8143",

    title: "Dog Grooming at Home in Aundh, Pune | Sniffy",
    description: "Dog grooming at home in Aundh, Pune from ₹799. Trained groomer, professional kit — bath, trim, ear clean and nail care at your door. Book a slot.",

    ogTitle: "Dog Grooming at Home in Aundh, Pune | Sniffy",
    ogDescription: "Complete home dog grooming in Aundh, Pune — trained groomers on your schedule, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Aundh, Pune | Sniffy",
    twitterDescription: "Complete dog grooming at your home in Aundh, Pune — on your schedule, from ₹799.",

    nearby: ["Baner", "Khadki", "Shivajinagar", "Pimple Gurav"]
  },

  {
    slug: "kalewadi",
    name: "Kalewadi",
    postal: "411033",
    lat: "18.6219",
    lng: "73.7763",

    title: "Dog Grooming at Home in Kalewadi, Pune | Sniffy",
    description: "Dog grooming at home in Kalewadi, Pune from ₹799. Skip the traffic and the waiting room — hygienic full session at your door. Book online today.",

    ogTitle: "Dog Grooming at Home in Kalewadi, Pune | Sniffy",
    ogDescription: "Home dog grooming in Kalewadi, Pune — skip the salon, trained groomers at your door, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Kalewadi, Pune | Sniffy",
    twitterDescription: "Skip the salon — home dog grooming in Kalewadi, Pune, trained groomers at your door, from ₹799.",

    nearby: ["Wakad", "Pimple Saudagar", "Ravet", "Chinchwad"]
  },

  {
    slug: "katraj",
    name: "Katraj",
    postal: "411046",
    lat: "18.4507",
    lng: "73.8627",

    title: "Dog Grooming at Home in Katraj, Pune | Sniffy",
    description: "Dog grooming at home in Katraj, Pune from ₹799. Relaxed full grooming package with clean equipment at your door. No salon stress — book a slot.",

    ogTitle: "Dog Grooming at Home in Katraj, Pune | Sniffy",
    ogDescription: "Relaxed home dog grooming in Katraj, Pune — no salon stress, trained groomers at your door, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Katraj, Pune | Sniffy",
    twitterDescription: "Home dog grooming in Katraj, Pune — relaxed session at your door, no salon needed, from ₹799.",

    nearby: ["Ambegaon", "Kondhwa", "Dhayari", "Bibewadi"]
  },

  {
    slug: "handewadi",
    name: "Handewadi",
    postal: "411048",
    lat: "18.4456",
    lng: "73.9042",

    title: "Dog Grooming at Home in Handewadi, Pune | Sniffy",
    description: "Dog grooming at home in Handewadi, Pune from ₹799. Bath, blow-dry, trim and nail care at your door — no driving, no waiting. Book online today.",

    ogTitle: "Dog Grooming at Home in Handewadi, Pune | Sniffy",
    ogDescription: "Home dog grooming now in Handewadi, Pune — full session at your door, trained groomers, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Handewadi, Pune | Sniffy",
    twitterDescription: "Trained groomers now at your door in Handewadi, Pune — full dog grooming from ₹799.",

    nearby: ["Hadapsar", "Wanowrie", "Undri", "Kondhwa"]
  },

  {
    slug: "hadapsar",
    name: "Hadapsar",
    postal: "411028",
    lat: "18.5062",
    lng: "73.9427",

    title: "Dog Grooming at Home in Hadapsar, Pune | Sniffy",
    description: "Dog grooming at home in Hadapsar, Pune from ₹799 — Magarpatta to Manjri. On-time, fully equipped groomers at your door. Book a slot online.",

    ogTitle: "Dog Grooming at Home in Hadapsar, Pune | Sniffy",
    ogDescription: "Home dog grooming across all of Hadapsar, Pune — trained groomers, on-time arrival, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Hadapsar, Pune | Sniffy",
    twitterDescription: "Dog grooming at your door anywhere in Hadapsar, Pune — trained, on-time, from ₹799.",

    nearby: ["Magarpatta City", "Kharadi", "Wanowrie", "Mundhwa"]
  },

  {
    slug: "bibewadi",
    name: "Bibewadi",
    postal: "411037",
    lat: "18.4756",
    lng: "73.8627",

    title: "Dog Grooming at Home in Bibewadi, Pune | Sniffy",
    description: "Dog grooming at home in Bibewadi, Pune from ₹799. Calm, thorough sessions for family dogs of every age and breed. Book a groomer at your door.",

    ogTitle: "Dog Grooming at Home in Bibewadi, Pune | Sniffy",
    ogDescription: "Calm home dog grooming in Bibewadi, Pune — trained groomers for dogs of all ages, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Bibewadi, Pune | Sniffy",
    twitterDescription: "Calm, thorough home dog grooming in Bibewadi, Pune — all ages, all breeds, from ₹799.",

    nearby: ["Katraj", "Kondhwa", "Sinhagad Road", "Sahakarnagar"]
  },

  {
    slug: "camp",
    name: "Camp",
    postal: "411001",
    lat: "18.5136",
    lng: "73.8825",

    title: "Dog Grooming at Home in Camp, Pune | Sniffy",
    description: "Dog grooming at home in Camp, Pune from ₹799. Bungalow or apartment, experienced groomers handle all breeds at your door. Book a slot online.",

    ogTitle: "Dog Grooming at Home in Camp, Pune | Sniffy",
    ogDescription: "Professional home dog grooming in Camp, Pune — experienced groomers, all breeds, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Camp, Pune | Sniffy",
    twitterDescription: "Professional dog grooming at your home in Camp, Pune — all breeds welcome, from ₹799.",

    nearby: ["Koregaon Park", "Wanowrie", "Kalyani Nagar", "MG Road"]
  },

  {
    slug: "wanowrie",
    name: "Wanowrie",
    postal: "411040",
    lat: "18.4878",
    lng: "73.8938",

    title: "Dog Grooming at Home in Wanowrie, Pune | Sniffy",
    description: "Dog grooming at home in Wanowrie, Pune from ₹799. Unhurried bath, trim, nail care and a full coat check at your door. Book a slot online today.",

    ogTitle: "Dog Grooming at Home in Wanowrie, Pune | Sniffy",
    ogDescription: "Unhurried home dog grooming in Wanowrie, Pune — trained groomers, full session at your door, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Wanowrie, Pune | Sniffy",
    twitterDescription: "Unhurried, thorough home dog grooming in Wanowrie, Pune — at your door, from ₹799.",

    nearby: ["NIBM", "Kondhwa", "Camp", "Hadapsar"]
  },
  {
    slug: "hinjewadi",
    name: "Hinjewadi",
    postal: "411057",
    lat: "18.5913",
    lng: "73.7389",

    title: "Dog Grooming at Home in Hinjewadi, Pune | Sniffy",
    description: "Dog grooming at home in Hinjewadi, Pune from ₹799. Trained groomer at your door for bath, haircut and nail care. Weekend slots — book online.",

    ogTitle: "Dog Grooming at Home in Hinjewadi, Pune | Sniffy",
    ogDescription: "Trained groomers visit your home in Hinjewadi, Pune. Bath, trim & nail care for your dog — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Hinjewadi, Pune | Sniffy",
    twitterDescription: "Professional dog grooming at your door in Hinjewadi, Pune. No salon needed — from ₹799.",

    nearby: ["Wakad", "Maan", "Marunji", "Balewadi"]
  },

  {
    slug: "pimple-saudagar",
    name: "Pimple Saudagar",
    postal: "411027",
    lat: "18.5980",
    lng: "73.7997",

    title: "Dog Grooming at Home in Pimple Saudagar, Pune | Sniffy",
    description: "Dog grooming at home in Pimple Saudagar, Pune from ₹799. Trained groomer visits your society flat for bath, trim and nail care. Book online.",

    ogTitle: "Dog Grooming at Home in Pimple Saudagar, Pune | Sniffy",
    ogDescription: "Trained groomers visit your home in Pimple Saudagar, Pune. Bath, trim & nail care for your dog — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Pimple Saudagar, Pune | Sniffy",
    twitterDescription: "Professional dog grooming at your door in Pimple Saudagar, Pune. No salon needed — from ₹799.",

    nearby: ["Rahatani", "Pimple Gurav", "Wakad", "Aundh"]
  },

  {
    slug: "magarpatta",
    name: "Magarpatta",
    postal: "411028",
    lat: "18.5157",
    lng: "73.9280",

    title: "Dog Grooming at Home in Magarpatta, Pune | Sniffy",
    description: "Dog grooming at home in Magarpatta, Pune from ₹799. Groomer comes to your tower with the full kit — bath, haircut, nail care. Book a slot online.",

    ogTitle: "Dog Grooming at Home in Magarpatta, Pune | Sniffy",
    ogDescription: "Trained groomers visit your home in Magarpatta, Pune. Bath, trim & nail care for your dog — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Magarpatta, Pune | Sniffy",
    twitterDescription: "Professional dog grooming at your door in Magarpatta, Pune. No salon needed — from ₹799.",

    nearby: ["Hadapsar", "Amanora", "Mundhwa", "Sopan Baug"]
  },

  {
    slug: "yerawada",
    name: "Yerawada",
    postal: "411006",
    lat: "18.5510",
    lng: "73.8830",

    title: "Dog Grooming at Home in Yerawada, Pune | Sniffy",
    description: "Dog grooming at home in Yerawada, Pune from ₹799. Trained groomer at your door for bath, trim, nail and ear care. No salon trip — book online.",

    ogTitle: "Dog Grooming at Home in Yerawada, Pune | Sniffy",
    ogDescription: "Trained groomers visit your home in Yerawada, Pune. Bath, trim & nail care for your dog — from ₹799.",

    twitterTitle: "Dog Grooming at Home in Yerawada, Pune | Sniffy",
    twitterDescription: "Professional dog grooming at your door in Yerawada, Pune. No salon needed — from ₹799.",

    nearby: ["Kalyani Nagar", "Vishrantwadi", "Dhanori", "Viman Nagar"]
  }
]
