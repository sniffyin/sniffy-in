import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { name: string; phone: string };
  onSuccess: () => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: BookingModalProps) {
  const [formData, setFormData] = useState({
    petType: 'Dog',
    breed: '',
    age: '',
    medical: '',
    city: 'Pune',
    package: 'Spa Bath - ₹799',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!initialData?.name || !initialData?.phone) {
        alert('Please provide your name and phone number first.');
        return;
      }

      const ageNumber = Number(formData.age);
      if (Number.isNaN(ageNumber)) {
        alert('Please enter a valid age');
        return;
      }

      const bookingData = {
        name: initialData.name,
        phone: initialData.phone,
        pet_type: formData.petType,
        breed: formData.breed,
        age: ageNumber,
        medical: formData.medical || '',
        city: formData.city,
        package: formData.package,
      };

      // ✅ 1. SAVE TO DATABASE (SOURCE OF TRUTH)
      const { error } = await supabase.from('bookings').insert([bookingData]);
      if (error) throw error;

      // ✅ 2. SEND TELEGRAM NOTIFICATION (NON-BLOCKING)
      try {
        await supabase.functions.invoke('booking-telegram', {
          body: bookingData,
        });
      } catch (telegramError) {
        console.warn('Telegram notification failed:', telegramError);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-sniffy-purple">
                  Complete Your Booking
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {initialData && (
                  <div className="bg-sniffy-yellow/10 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Booking for:</span>{' '}
                      {initialData.name}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Phone:</span>{' '}
                      {initialData.phone}
                    </p>
                  </div>
                )}

                {/* Pet Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Type
                  </label>
                  <select
                    value={formData.petType}
                    onChange={(e) =>
                      setFormData({ ...formData, petType: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Dog</option>
                    <option>Cat</option>
                  </select>
                </div>

                {/* Breed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breed
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.breed}
                    onChange={(e) =>
                      setFormData({ ...formData, breed: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="30"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Medical */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Conditions
                  </label>
                  <textarea
                    rows={3}
                    value={formData.medical}
                    onChange={(e) =>
                      setFormData({ ...formData, medical: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Pune</option>
                  </select>
                </div>

                {/* Package */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package
                  </label>
                  <select
                    value={formData.package}
                    onChange={(e) =>
                      setFormData({ ...formData, package: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Spa Bath - ₹799</option>
                    <option>Hair Cut - ₹999</option>
                    <option>Spa Bath + Hair Cut - ₹1299</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-sniffy-purple to-sniffy-yellow text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Booking'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
