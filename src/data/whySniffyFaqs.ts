/**
 * whySniffyFaqs — the FAQ block on /why-sniffy.
 *
 * Lifted out of pages/WhySniffyPage.tsx so `scripts/prerenderSpa.ts` can render
 * these into the static HTML and build the page's FAQPage schema from Node,
 * without importing React. Page and prerenderer read this same array.
 */

export interface WhySniffyFaq {
  q: string;
  a: string;
}

export const WHY_SNIFFY_FAQS: WhySniffyFaq[] = [
  {
    q: 'How is Sniffy different from just calling a local groomer?',
    a: 'Local groomers are often unverified, with no fixed pricing or accountability. Sniffy groomers are certified, background-checked, and operate under our quality standards with transparent flat-rate pricing.',
  },
  {
    q: 'Is home grooming as good as a salon?',
    a: 'Often better — because your pet is relaxed in their own environment. No travel anxiety, no caging, no exposure to other animals. The groomer focuses entirely on your pet.',
  },
  {
    q: 'What if my pet misbehaves or is difficult to groom?',
    a: 'Our groomers are trained in animal behaviour and handling. We work at your pet\'s pace, and if needed, we\'ll suggest a split session. Your pet\'s comfort always comes first.',
  },
  {
    q: 'Are your products safe for puppies?',
    a: 'Yes! We use gentle, sulphate-free, puppy-safe shampoos. We\'ve groomed pups as young as 3 months without any issues.',
  },
  {
    q: 'Who is actually coming into my house — how are groomers vetted?',
    a: 'Every groomer is identity-verified with documents on file before their first assignment, and you get their name in advance rather than an anonymous "our technician". They are our own trained staff on our payroll, not a marketplace of freelancers we forward your address to. If you would rather a woman groomer attends, say so at booking and we will schedule accordingly.',
  },
  {
    q: 'Can I ask for the same groomer who came last time?',
    a: 'Yes, and we encourage it for anxious pets — a dog that already knows the person holding the dryer behaves completely differently by the third session. Name the groomer when you book. The honest caveat is availability: if they are on leave or fully booked in another part of the city that day, we will offer you a different groomer or a different slot rather than quietly swapping them.',
  },
  {
    q: 'What happens if my pet is injured during a session?',
    a: 'We tell you immediately, we cover the vet visit, and we do not argue about it. Nicks around the paw pads and sanitary areas are the realistic risk in any grooming, and they are rare — but a groomer who hides one is a groomer we do not keep. The instruction to our team is to stop the session, tell the owner in the room, and call the coordinator.',
  },
  {
    q: 'Why does home grooming cost about the same as a salon?',
    a: 'Because the cost of a salon is the rent, and the cost of home grooming is the travel. We spend on the groomer\'s time between appointments instead of on a shopfront, which lands us at roughly the same number — ₹799 for a Spa Bath, ₹999 for a Hair Cut, ₹1299 for both. What you gain for the same money is no car ride, no cage time, and one groomer on one pet for the whole visit.',
  },
  {
    q: 'How do I raise a complaint, and who actually reads it?',
    a: 'Call or WhatsApp the same number you booked on and it reaches a coordinator, not a ticket queue. Every session is logged against the groomer who did it, so a complaint attaches to a specific visit rather than disappearing into a general inbox. Tell us within 48 hours while a re-groom is still useful — we would rather send someone back than have you quietly not book again.',
  },
];
