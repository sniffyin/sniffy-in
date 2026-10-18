import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LOTTIE_DOG, LOTTIE_CAT, LOTTIE_LOCATION } from "../lib/lottieAssets";

/* ── Dog Button ── */
function DogButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const btnStyle: React.CSSProperties = {
    borderColor: hovered ? "#6B2FA0" : "#e5e7eb",
    background: hovered
      ? "linear-gradient(145deg, #faf5ff 0%, #f3e8ff 100%)"
      : "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)",
    boxShadow: hovered
      ? "0 8px 30px rgba(107,47,160,0.18), 0 2px 8px rgba(0,0,0,0.06)"
      : "0 2px 8px rgba(0,0,0,0.06)",
    aspectRatio: "1 / 1",
  };
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      className="relative flex flex-col items-center justify-center gap-2 border-2 rounded-2xl overflow-hidden w-full"
      style={btnStyle}
      animate={hovered ? { y: -3 } : { y: 0 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div style={{ width: "100%", height: "78%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <DotLottieReact
          src={LOTTIE_DOG}
          autoplay
          loop
          style={{ width: "160%", height: "160%", marginTop: "8%" }}
        />
      </div>
      <span className="font-bold text-sm tracking-wider uppercase"
        style={{ color: hovered ? "#6B2FA0" : "#374151", letterSpacing: "0.08em", marginTop: "-4%" }}>
        Dog
      </span>
    </motion.button>
  );
}

/* ── Cat Button ── */
function CatButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const btnStyle: React.CSSProperties = {
    borderColor: hovered ? "#6B2FA0" : "#e5e7eb",
    background: hovered
      ? "linear-gradient(145deg, #faf5ff 0%, #f3e8ff 100%)"
      : "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)",
    boxShadow: hovered
      ? "0 8px 30px rgba(107,47,160,0.18), 0 2px 8px rgba(0,0,0,0.06)"
      : "0 2px 8px rgba(0,0,0,0.06)",
    aspectRatio: "1 / 1",
  };
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      className="relative flex flex-col items-center justify-center gap-2 border-2 rounded-2xl overflow-hidden w-full"
      style={btnStyle}
      animate={hovered ? { y: -3 } : { y: 0 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div style={{ width: "100%", height: "78%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <DotLottieReact
          src={LOTTIE_CAT}
          autoplay
          loop
          style={{ width: "160%", height: "160%", marginTop: "-5%" }}
        />
      </div>
      <span className="font-bold text-sm tracking-wider uppercase"
        style={{ color: hovered ? "#6B2FA0" : "#374151", letterSpacing: "0.08em", marginTop: "-4%" }}>
        Cat
      </span>
    </motion.button>
  );
}



/* ── Package peek data ── */
const packages = [
  {
    name: "Spa Bath",
    price: "₹799",
    emoji: "🛁",
    includes: ["Bath with shampoo & conditioner", "Blow dry", "Combing / brushing", "Nail clipping", "Eye & ear cleaning", "Paw massage", "Mouth spray", "Spritz of perfume"],
  },
  {
    name: "Hair Cut",
    price: "₹999",
    emoji: "✂️",
    includes: ["Full body trimming / haircut", "Combing / brushing", "Nail clipping", "Eye & ear cleaning", "Mouth spray", "Spritz of perfume"],
  },
  {
    name: "Spa Bath + Hair Cut",
    price: "₹1299",
    emoji: "✨",
    tag: "Most Popular",
    includes: ["Bath with shampoo & conditioner", "Full body trimming / haircut", "Blow dry", "Combing / brushing", "Nail clipping", "Eye & ear cleaning", "Sanitary trim", "Under paw trim", "Paw massage", "Mouth spray", "Spritz of perfume"],
  },
];

function PackageCard({ pkg, onSelect, isOpen, onToggle }: {
  pkg: typeof packages[0];
  onSelect: () => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const isPopular = "tag" in pkg && pkg.tag;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="border-2 rounded-2xl relative"
      style={{
        borderColor: isPopular ? "#6B2FA0" : isOpen || hovered ? "#6B2FA0" : "#e5e7eb",
        boxShadow: isPopular
          ? hovered
            ? "0 8px 32px rgba(107,47,160,0.22)"
            : "0 4px 20px rgba(107,47,160,0.12)"
          : hovered
          ? "0 4px 16px rgba(107,47,160,0.1)"
          : "none",
      }}
      animate={{ y: hovered ? -2 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Shimmer sweep on hover */}
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ overflow: "hidden", borderRadius: "inherit" }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "40%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
              animation: "shimmer 0.65s ease forwards",
            }}
          />
        </div>
      )}

      {/* Most Popular badge */}
      {isPopular && (
        <span
          className="absolute text-white font-bold rounded-md px-2 py-0.5 pointer-events-none overflow-hidden"
          style={{
            fontSize: 9.5,
            letterSpacing: "0.07em",
            background: "linear-gradient(90deg, #6B2FA0, #9B4FD0)",
            top: -11,
            left: 12,
            zIndex: 10,
            animation: "badgePulse 2s ease-in-out infinite",
          }}
        >
          {/* Badge shimmer sweep */}
          <span
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              animation: "badgeShimmer 2.5s ease-in-out infinite",
              animationDelay: "0.5s",
            }}
          />
          <span style={{ position: "relative", zIndex: 1 }}>⭐ MOST POPULAR</span>
        </span>
      )}

      <div className="flex items-center px-4 py-3.5 gap-3">
        <button onClick={onSelect} className="flex-1 flex items-center gap-3 text-left">
          <div className="flex-1">
            <span className="font-semibold text-gray-900 text-sm">{pkg.name}</span>
          </div>
          <motion.span
            className="font-bold text-gray-900"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {pkg.price}
          </motion.span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="ml-2 flex items-center justify-center rounded-full w-7 h-7 flex-shrink-0 transition-colors"
          style={{ background: isOpen ? "#f3e8ff" : "#f5f5f5" }}
        >
          <motion.svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <path d="M3 5l4 4 4-4" stroke={isOpen ? "#6B2FA0" : "#9ca3af"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: "hidden", borderRadius: "0 0 14px 14px" }}
      >
        <div className="px-5 pb-4 pt-1" style={{ background: "#faf5ff" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9b6bbf" }}>What's included</p>
          <ul className="space-y-1.5">
            {pkg.includes.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -8 }}
                transition={{ delay: isOpen ? i * 0.04 : 0, duration: 0.2 }}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="7" fill="#ede9fe"/>
                  <path d="M4 7l2 2 4-4" stroke="#6B2FA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PackageList({ onSelect }: { onSelect: (name: string) => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="flex flex-col" style={{ gap: 20 }}>
      {packages.map((pkg, i) => (
        <motion.div
          key={pkg.name}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <PackageCard
            pkg={pkg}
            onSelect={() => onSelect(pkg.name)}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        </motion.div>
      ))}
    </div>
  );
}

interface BookingWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function capitalizeFirst(value: string): string {
  return value.length ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

/* DOG BREEDS
Common Indian grooming breeds first
*/

const dogBreeds = [

  "Shih Tzu",
  "Lhasa Apso",
  "Labrador Retriever",
  "Golden Retriever",
  "German Shepherd",
  "Pug",
  "Beagle",
  "Rottweiler",
  "Doberman",
  "Indie / Indian Pariah",
  "Cocker Spaniel",
  "Husky",
  "Saint Bernard",
  "Dachshund",
  "Pomeranian",

  "Affenpinscher",
  "Akita",
  "Alaskan Malamute",
  "American Bulldog",
  "American Eskimo Dog",
  "Australian Shepherd",
  "Basset Hound",
  "Belgian Malinois",
  "Bernese Mountain Dog",
  "Bichon Frise",
  "Border Collie",
  "Boston Terrier",
  "Boxer",
  "Bull Terrier",
  "Cane Corso",
  "Cavalier King Charles Spaniel",
  "Chihuahua",
  "Chow Chow",
  "Dalmatian",
  "French Bulldog",
  "Great Dane",
  "Greyhound",
  "Jack Russell Terrier",
  "Japanese Spitz",
  "Maltese",
  "Miniature Pinscher",
  "Newfoundland",
  "Papillon",
  "Pit Bull",
  "Pointer",
  "Poodle",
  "Samoyed",
  "Shar Pei",
  "Siberian Husky",
  "Tibetan Mastiff",
  "Weimaraner",
  "West Highland Terrier",
  "Yorkshire Terrier",

  "Mixed Breed",
  "Other"
];

const catBreeds = [

  "Persian",
  "Siamese",
  "Maine Coon",
  "British Shorthair",
  "Ragdoll",
  "Himalayan",
  "Bengal",
  "Russian Blue",
  "Scottish Fold",
  "Abyssinian",
  "American Shorthair",
  "Birman",
  "Bombay",
  "Burmese",
  "Cornish Rex",
  "Devon Rex",
  "Egyptian Mau",
  "Norwegian Forest",
  "Oriental Shorthair",
  "Savannah",
  "Sphynx",
  "Indie Cat",
  "Mixed",
  "Other"
];

export default function BookingWizard({ open, onClose, onSuccess }: BookingWizardProps) {

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState({
    service: "",
    package: "",
    petName: "",
    breed: "",
    age: "",
    name: "",
    phone: "",
    petVaccinated: "" as "" | "yes" | "no",
    locationLabel: "",
    locationCoords: null as { lat: number; lng: number } | null,
  });

  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Persistent "this field is invalid" flags — set on a blocked Next/Confirm
  // click, cleared as soon as the user fixes that specific field.
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  // Transient flags that only drive the one-shot shake animation.
  const [shakeKeys, setShakeKeys] = useState<Record<string, boolean>>({});

  const markInvalid = (keys: string[]) => {
    setInvalid((prev) => {
      const next = { ...prev };
      keys.forEach((k) => (next[k] = true));
      return next;
    });
    setShakeKeys((prev) => {
      const next = { ...prev };
      keys.forEach((k) => (next[k] = true));
      return next;
    });
    setTimeout(() => {
      setShakeKeys((prev) => {
        const next = { ...prev };
        keys.forEach((k) => (next[k] = false));
        return next;
      });
    }, 400);
  };

  const clearInvalid = (key: string) => {
    setInvalid((prev) => (prev[key] ? { ...prev, [key]: false } : prev));
  };

  const fieldClass = (key: string, base: string) =>
    `${base} ${shakeKeys[key] ? "field-shake" : ""}`;

  const fieldStyle = (key: string): React.CSSProperties =>
    invalid[key]
      ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.12)" }
      : {};

  const resetWizard = () => {
    setStep(1);
    setSubmitError(null);
    setLocationStatus("idle");
    setInvalid({});
    setShakeKeys({});
    setForm({
      service: "",
      package: "",
      petName: "",
      breed: "",
      age: "",
      name: "",
      phone: "",
      petVaccinated: "",
      locationLabel: "",
      locationCoords: null,
    });
  };

  useEffect(() => {
    if (!open) resetWizard();
  }, [open]);

  if (!open) return null;

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Convert age string to integer for DB
    const ageMap: Record<string, number> = {
      "0-1 years": 0,
      "1-5 years": 2,
      "5+ years": 6,
    };
    const ageInt = ageMap[form.age] ?? 0;

    const locationValue = form.locationCoords
      ? `https://www.google.com/maps?q=${form.locationCoords.lat},${form.locationCoords.lng}`
      : form.locationLabel || null;

    const payload = {
      name: form.name,
      phone: form.phone,
      pet_type: form.service,
      pet_name: capitalizeFirst(form.petName.trim()),
      breed: form.breed,
      age: ageInt,
      medical: "",
      city: "Pune",
      package: form.package,
      location: locationValue,  // single column
      pet_vaccinated: form.petVaccinated === "yes",
    };

    try {
      const { error } = await supabase.from("bookings").insert([payload]);
      if (error) throw error;

      // ── Telegram Notification ──────────────────────────────────────────
      try {
        const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
        const chatId   = import.meta.env.VITE_TELEGRAM_CHAT_ID;

        if (botToken && chatId) {
          const locationLine = locationValue
            ? `📍 *Location:* ${locationValue}`
            : `📍 *Location:* Not provided`;

          const message =
            `🐾 *New Booking — Sniffy!*\n\n` +
            `👤 *Name:* ${form.name}\n` +
            `📞 *Phone:* ${form.phone}\n` +
            `🐶 *Pet:* ${payload.pet_name} — ${form.service} (${form.breed}, ${form.age})\n` +
            `💉 *Vaccinated:* ${form.petVaccinated === "yes" ? "Yes" : "No"}\n` +
            `✂️ *Package:* ${form.package}\n` +
            `🏙️ *City:* Pune\n` +
            `${locationLine}\n` +
            `🕐 *Time:* ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;

          await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "Markdown",
              }),
            }
          );
        }
      } catch (telegramErr) {
        // Telegram failure should never block the booking confirmation
        console.warn("Telegram notification failed:", telegramErr);
      }
      // ──────────────────────────────────────────────────────────────────

      onSuccess();
      resetWizard();
      onClose();
    } catch (err: any) {
      console.error("Booking insert error:", err);
      setSubmitError(
        err?.message
          ? `Error: ${err.message}`
          : "Something went wrong. Please try again or WhatsApp us."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const breedOptions =
    form.service === "Dog Grooming" ? dogBreeds : catBreeds;

  const petInfoComplete =
    form.petName.trim() !== "" && form.breed !== "" && form.age !== "";

  const locationComplete = !!(form.locationCoords || form.locationLabel);

  const contactComplete =
    !!form.name.trim() && form.phone.length === 10 && form.petVaccinated !== "";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}

        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-bold text-lg">Book Grooming</h3>

          <button
            onClick={()=>{
              resetWizard();
              onClose();
            }}
          >
            <X size={20}/>
          </button>
        </div>

        {/* PROGRESS BAR */}

        <div className="flex gap-2 px-6 pt-4">

          {[1,2,3,4,5].map((i)=>(
            <div
              key={i}
              className={`h-2 flex-1 rounded ${
                step >= i
                ? "bg-sniffy-purple"
                : "bg-gray-200"
              }`}
            />
          ))}

        </div>

        <div className="p-6 space-y-6">

          {/* STEP 1 */}

          {step === 1 && (

            <div>

              <h4 className="font-semibold text-lg mb-5">
                What service do you need?
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <DogButton onClick={() => { setForm({...form, service:"Dog Grooming"}); next(); }} />
                <CatButton onClick={() => { setForm({...form, service:"Cat Grooming"}); next(); }} />
              </div>

            </div>

          )}

          {/* STEP 2 */}

          {step === 2 && (

            <div>

              <h4 className="font-semibold text-lg mb-4">
                Choose Package
              </h4>

              <PackageList
                onSelect={(name) => { setForm({...form, package: name}); next(); }}
              />

              <button
                onClick={back}
                className="mt-4 text-sm text-gray-500"
              >
                ← Back
              </button>

            </div>

          )}

          {/* STEP 3 */}

          {step === 3 && (

            <div className="space-y-4">

              <h4 className="font-semibold text-lg">
                Pet Info
              </h4>

              <input
                placeholder="Pet Name"
                value={form.petName}
                className={fieldClass("petName", "w-full border rounded-xl px-4 py-3")}
                style={fieldStyle("petName")}
                onChange={(e)=>{
                  clearInvalid("petName");
                  setForm({...form, petName: capitalizeFirst(e.target.value)});
                }}
              />

              <select
                value={form.breed}
                className={fieldClass("breed", "w-full border rounded-xl px-4 py-3")}
                style={fieldStyle("breed")}
                onChange={(e)=>{
                  clearInvalid("breed");
                  setForm({...form,breed:e.target.value});
                }}
              >

                <option value="">Select Breed</option>

                {breedOptions.map((breed)=>(
                  <option key={breed} value={breed}>
                    {breed}
                  </option>
                ))}

              </select>

              <select
                value={form.age}
                className={fieldClass("age", "w-full border rounded-xl px-4 py-3")}
                style={fieldStyle("age")}
                onChange={(e)=>{
                  clearInvalid("age");
                  setForm({...form,age:e.target.value});
                }}
              >

                <option value="">Age of Pet</option>
                <option>0-1 years</option>
                <option>1-5 years</option>
                <option>5+ years</option>

              </select>

              <div className="flex justify-between pt-2">

                <button
                  onClick={back}
                  className="text-gray-500"
                >
                  ← Back
                </button>

                <button
                  onClick={() => {
                    if (!petInfoComplete) {
                      const missing: string[] = [];
                      if (form.petName.trim() === "") missing.push("petName");
                      if (form.breed === "") missing.push("breed");
                      if (form.age === "") missing.push("age");
                      markInvalid(missing);
                      return;
                    }
                    next();
                  }}
                  className={`px-6 py-2 rounded-full font-semibold
                    ${
                      !petInfoComplete
                      ? "bg-gray-300 text-gray-500"
                      : "bg-sniffy-purple text-white"
                    }`}
                >
                  Next →
                </button>

              </div>

            </div>

          )}

          {/* STEP 4 — Location (optional) */}

          {step === 4 && (
            <div className="space-y-4">

              {/* Lottie + heading */}
              <div className="flex flex-col items-center text-center gap-2">
                {/* Overflow-clip wrapper kills the internal lottie padding */}
                <div style={{ width: 120, height: 90, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DotLottieReact
                    src={LOTTIE_LOCATION}
                    autoplay
                    loop
                    style={{ width: 170, height: 170, marginTop: -20 }}
                  />
                </div>
                <h4 className="font-bold text-lg leading-tight">Where are you located?</h4>
                <p className="text-sm text-gray-500 max-w-xs leading-snug">
                  So our groomer doesn't wander around Pune like a lost pup 🐶 — sharing your area helps us assign the nearest available groomer to you.
                </p>
              </div>

              {/* GPS share button — PRIMARY */}
              <button
                onClick={() => {
                  if (!navigator.geolocation) {
                    setLocationStatus("error");
                    return;
                  }
                  setLocationStatus("loading");
                  navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                      const { latitude: lat, longitude: lng } = pos.coords;
                      let label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                      try {
                        const res = await fetch(
                          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                        );
                        const data = await res.json();
                        const addr = data.address;
                        label =
                          addr.neighbourhood ||
                          addr.suburb ||
                          addr.village ||
                          addr.town ||
                          addr.city ||
                          label;
                      } catch (_) {}
                      clearInvalid("location");
                      setForm((f) => ({ ...f, locationLabel: label, locationCoords: { lat, lng } }));
                      setLocationStatus("success");
                    },
                    () => setLocationStatus("error")
                  );
                }}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 transition-all font-semibold text-sm border-2"
                style={{
                  borderColor: locationStatus === "success" ? "#6B2FA0" : locationStatus === "error" ? "#ef4444" : "#6B2FA0",
                  background: locationStatus === "success"
                    ? "linear-gradient(145deg,#faf5ff,#f3e8ff)"
                    : locationStatus === "error"
                    ? "#fff5f5"
                    : "linear-gradient(145deg,#6B2FA0,#9B4FD0)",
                  color: locationStatus === "success" ? "#6B2FA0" : locationStatus === "error" ? "#ef4444" : "#ffffff",
                  boxShadow: locationStatus === "idle" ? "0 4px 16px rgba(107,47,160,0.25)" : "none",
                }}
              >
                {locationStatus === "loading" ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Detecting your location…
                  </>
                ) : locationStatus === "success" ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#ede9fe"/>
                      <path d="M7 12l3.5 3.5L17 8" stroke="#6B2FA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Location Detected!
                  </>
                ) : locationStatus === "error" ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#fee2e2"/>
                      <path d="M12 8v4m0 4h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Couldn't detect — tap to retry
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.8"/>
                      <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                    Share My Location
                  </>
                )}
              </button>

              {/* Detected location pill */}
              {form.locationLabel && locationStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
                  style={{ background: "#f3e8ff", color: "#6B2FA0" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#c084fc" stroke="#6B2FA0" strokeWidth="1.5"/>
                    <circle cx="12" cy="9" r="2" fill="#6B2FA0"/>
                  </svg>
                  {form.locationLabel}
                </motion.div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or select your area</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Area dropdown — SECONDARY */}
              <select
                value={form.locationLabel && !form.locationCoords ? form.locationLabel : ""}
                className={fieldClass("location", "w-full border rounded-xl px-4 py-3 text-gray-800")}
                style={{
                  borderColor: invalid.location
                    ? "#ef4444"
                    : form.locationLabel && !form.locationCoords
                    ? "#6B2FA0"
                    : "#e5e7eb",
                  boxShadow: invalid.location ? "0 0 0 3px rgba(239,68,68,0.12)" : undefined,
                }}
                onChange={(e) => {
                  clearInvalid("location");
                  setForm({ ...form, locationLabel: e.target.value, locationCoords: null });
                  setLocationStatus("idle");
                }}
              >
                <option value="">— Choose an area in Pune —</option>
                {[
                  "Aundh","Baner","Balewadi","Wakad","Hinjewadi","Pimple Saudagar",
                  "Kothrud","Karve Nagar","Warje","Bavdhan",
                  "Koregaon Park","Kalyani Nagar","Viman Nagar","Kharadi","Hadapsar",
                  "Shivajinagar","Deccan","FC Road","Camp","Swargate",
                  "Kondhwa","Undri","Wanowrie","NIBM","Katraj",
                  "Pimpri","Chinchwad","Nigdi","Bhosari",
                  "Other"
                ].map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>

              {/* Selected area pill (dropdown) */}
              {form.locationLabel && !form.locationCoords && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
                  style={{ background: "#f3e8ff", color: "#6B2FA0" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#c084fc" stroke="#6B2FA0" strokeWidth="1.5"/>
                    <circle cx="12" cy="9" r="2" fill="#6B2FA0"/>
                  </svg>
                  {form.locationLabel}, Pune
                </motion.div>
              )}

              {invalid.location && (
                <p className="text-red-500 text-xs text-center -mt-1">
                  Please share your location or select an area to continue.
                </p>
              )}

              <div className="flex justify-between pt-2">
                <button onClick={back} className="text-gray-500 text-sm">← Back</button>
                <button
                  onClick={() => {
                    if (!locationComplete) {
                      markInvalid(["location"]);
                      return;
                    }
                    next();
                  }}
                  className={`px-6 py-2 rounded-full font-semibold ${
                    locationComplete
                      ? "bg-sniffy-purple text-white"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 — Contact Details */}

          {step === 5 && (

            <div className="space-y-4">

              <h4 className="font-semibold text-lg">
                Contact Details
              </h4>

              <input
                placeholder="Your Name"
                className={fieldClass("name", "w-full border rounded-xl px-4 py-3")}
                style={fieldStyle("name")}
                onChange={(e)=>{
                  clearInvalid("name");
                  setForm({...form,name:e.target.value});
                }}
              />

              <input
                placeholder="Mobile Number"
                maxLength={10}
                className={fieldClass("phone", "w-full border rounded-xl px-4 py-3")}
                style={fieldStyle("phone")}
                onChange={(e)=>{
                  const value = e.target.value.replace(/\D/g,'')
                  clearInvalid("phone");
                  setForm({...form,phone:value})
                }}
              />

              <div
                className={fieldClass("petVaccinated", "w-full border rounded-xl pl-4 pr-1.5 py-1.5 flex items-center justify-between gap-3")}
                style={fieldStyle("petVaccinated")}
              >
                <span className="text-sm text-gray-700">
                  Pet vaccinated? <span className="text-red-500">*</span>
                </span>
                <div className="flex items-center rounded-full bg-gray-100 p-0.5 flex-shrink-0">
                  {(["yes", "no"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        clearInvalid("petVaccinated");
                        setForm({ ...form, petVaccinated: opt });
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        form.petVaccinated === opt
                          ? "bg-sniffy-purple text-white shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      {opt === "yes" ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>

              {submitError && (
                <p className="text-red-500 text-sm text-center">{submitError}</p>
              )}

              <button
                disabled={isSubmitting}
                onClick={() => {
                  if (!contactComplete) {
                    const missing: string[] = [];
                    if (!form.name.trim()) missing.push("name");
                    if (form.phone.length !== 10) missing.push("phone");
                    if (form.petVaccinated === "") missing.push("petVaccinated");
                    markInvalid(missing);
                    return;
                  }
                  handleSubmit();
                }}
                className={`w-full py-3 rounded-full font-semibold transition
                  ${
                    !contactComplete || isSubmitting
                    ? "bg-gray-300 text-gray-500"
                    : "bg-sniffy-purple text-white"
                  }`}
              >
                {isSubmitting ? "Confirming..." : "Confirm Booking"}
              </button>

              <button
                onClick={back}
                className="text-gray-500 text-sm"
              >
                ← Back
              </button>

            </div>

          )}

        </div>
      </div>
    </div>
  );
}