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
    description: "Sniffy brings professional dog grooming to your home in Dhanori, Pune. A trained groomer visits your door with everything needed — bath, trim, nail care and more. No salon trips, no stress for your dog. Starting ₹799.",

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
    description: "Getting your dog groomed in Kondhwa, Pune is now as simple as booking a slot. Sniffy's trained groomers come to your home with all equipment — so your dog stays calm, clean and comfortable. From ₹799.",

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
    description: "Sniffy offers reliable in-home dog grooming across Kothrud, Pune. Our groomers arrive at your door fully equipped and work at a pace your dog is comfortable with — bath, haircut, nail trim and more. From ₹799.",

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
    description: "Looking for dog grooming in NIBM, Pune? Sniffy sends a trained groomer directly to your home — clean equipment, gentle handling and a thorough session your dog will be comfortable with. Starting ₹799.",

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
    description: "Sniffy provides in-home dog grooming across all of Pimpri-Chinchwad, Pune — Akurdi, Nigdi, Bhosari, Pimple Saudagar and more. One booking and a groomer comes to you with everything needed. From ₹799.",

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
    description: "Sniffy's certified groomers visit your home in Shivajinagar, Pune for a complete dog grooming session — bath, haircut, ear cleaning, nail trim and more. Your dog gets full attention in the comfort of home. From ₹799.",

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
    description: "Sniffy makes dog grooming in Wagholi, Pune effortless — pick a time that works for you and a trained groomer shows up at your home. Morning, afternoon or evening slots available. Starting ₹799.",

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
    description: "Sniffy brings certified dog grooming to your home in Wakad, Pune — so your dog gets a proper bath, trim and nail care without either of you going anywhere. Apartment-friendly setup, from ₹799.",

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
    description: "Skip the salon run — Sniffy sends a trained groomer to your home in Kalyani Nagar, Pune. Full grooming session including bath, blow-dry, nail trim and ear cleaning, done in your own space. From ₹799.",

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
    description: "No need to travel for a good groom — Sniffy's trained groomers come to you in Lohegaon, Pune. Bath, trim, nail care and more, done calmly in your home. Hygienic setup, gentle handling. From ₹799.",

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
    description: "Too busy for a salon trip? Sniffy fits dog grooming around your schedule in Kharadi, Pune — early morning, afternoon or evening slots. A trained groomer shows up with everything and handles it all. From ₹799.",

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
    description: "Sniffy's groomers come to your home in Viman Nagar, Pune — so your dog gets a thorough, stress-free session without leaving the house. Bath, trim, nail care and more, done right at your door. From ₹799.",

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
    description: "Sniffy makes proper dog grooming easy in Mundwa, Pune — a certified groomer visits your home with all equipment, handles the full session, and leaves your space clean. No mess, no hassle. From ₹799.",

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
    description: "Sniffy brings premium dog grooming to your home in Koregaon Park, Pune. Our experienced groomers handle every breed with care — full bath, coat treatment, nail trim and more, done at your doorstep. From ₹799.",

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
    description: "Quality dog grooming has finally reached Dhayari, Pune — Sniffy's trained groomers visit your home so your dog gets the care they deserve without a long drive. Full session, clean setup, from ₹799.",

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
    description: "Sniffy offers gentle, thorough dog grooming at your home in Karve Nagar, Pune — especially suited for senior dogs and nervous pets who do better in a familiar environment. Full session from ₹799.",

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
    description: "Sniffy now covers Ambegaon, Pune for in-home dog grooming. Book a slot and a trained groomer visits your door — bath, trim, nail care and a full coat check, done without the salon trip. From ₹799.",

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
    description: "Sniffy's groomers show up on time at your home in Baner, Pune — fully equipped for a proper dog grooming session that fits your schedule. No waiting rooms, no travel, just a clean dog and a clean space. From ₹799.",

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
    description: "Your dog doesn't need to leave Bavdhan for a great groom. Sniffy sends a trained groomer to your home in Bavdhan, Pune — calm one-on-one session, full grooming care, zero travel stress. From ₹799.",

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
    description: "Sniffy brings professional dog grooming to your home in Khadki, Pune — punctual, well-equipped and thorough. Whether you're in a society or a cantonment quarter, our groomer handles it all at your door. From ₹799.",

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
    description: "Sniffy now serves Ravet, Pune with in-home dog grooming — no need to drive out of the area for a reliable session. A trained groomer visits your home with all the equipment. Bath, trim, nails and more. From ₹799.",

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
    description: "Sniffy's trained groomers visit your home in Aundh, Pune for a complete dog grooming session — on your time, in your space, with professional equipment. Bath, trim, ear clean, nail care and more. From ₹799.",

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
    description: "Sniffy covers Kalewadi, Pune for in-home dog grooming — so you and your dog skip the traffic and the waiting room. Trained groomer, hygienic setup, full session done at your doorstep. From ₹799.",

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
    description: "Sniffy brings the groomer to you in Katraj, Pune — so your dog gets a proper, relaxed grooming session at home instead of a stressful salon visit. Full grooming package, clean equipment. From ₹799.",

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
    description: "Sniffy's trained groomers now visit homes in Handewadi, Pune — full dog grooming sessions done right at your door. Bath, blow-dry, trim, nail care and more. No driving, no waiting. From ₹799.",

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
    description: "Whether you're near Magarpatta or deep in Hadapsar, Pune — Sniffy's groomers come to you. Trained, well-equipped and on time, they handle the full session while your dog stays comfortable at home. From ₹799.",

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
    description: "Sniffy sends trained groomers to your home in Bibewadi, Pune for a calm, thorough dog grooming session — suited for family dogs of all ages. No salon, no travel, just a well-groomed dog. From ₹799.",

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
    description: "Sniffy offers in-home dog grooming in Camp, Pune — a discreet, professional service that works in bungalows and apartments alike. Experienced groomers, all breeds welcome, full session at your door. From ₹799.",

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
    description: "Sniffy's groomers visit your home in Wanowrie, Pune for a proper, unhurried dog grooming session — the kind your dog actually stays calm through. Bath, trim, nail care and a full coat check. From ₹799.",

    ogTitle: "Dog Grooming at Home in Wanowrie, Pune | Sniffy",
    ogDescription: "Unhurried home dog grooming in Wanowrie, Pune — trained groomers, full session at your door, from ₹799.",

    twitterTitle: "Dog Grooming at Home in Wanowrie, Pune | Sniffy",
    twitterDescription: "Unhurried, thorough home dog grooming in Wanowrie, Pune — at your door, from ₹799.",

    nearby: ["NIBM", "Kondhwa", "Camp", "Hadapsar"]
  }

]
