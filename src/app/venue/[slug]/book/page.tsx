"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, ChevronRight, Clock, User, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

type Court = {
  id: string;
  name: string;
  price: number;
  type: string;
};

type TimeSlot = {
  id: string;
  time: string;
  startTime: string;
  endTime: string;
  available: boolean;
};

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string || "demo-venue";

  const [step, setStep] = useState(1);
  const [courts, setCourts] = useState<Court[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [slotDuration, setSlotDuration] = useState(90);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [selectedCourt, setSelectedCourt] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // Fetch courts on mount
  useEffect(() => {
    async function fetchCourts() {
      try {
        const res = await fetch(`/api/public/venues/${slug}`);
        if (!res.ok) throw new Error('Venue not found');
        const data = await res.json();
        setCourts(data.courts);
      } catch (err) {
        console.error("Failed to fetch courts:", err);
      } finally {
        setLoadingCourts(false);
      }
    }
    fetchCourts();
  }, [slug]);

  // Fetch available slots when court + date selected
  useEffect(() => {
    if (!selectedCourt || !selectedDate) {
      setTimeSlots([]);
      return;
    }

    async function fetchSlots() {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const params = new URLSearchParams({ courtId: selectedCourt, date: selectedDate });
        const res = await fetch(`/api/public/venues/${slug}/slots?${params.toString()}`);
        const data = await res.json();
        setTimeSlots(data.slots || []);
        setSlotDuration(data.slotDurationMinutes || 90);
      } catch (err) {
        console.error("Failed to fetch slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedCourt, selectedDate, slug]);

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const selectedCourtData = courts.find(c => c.id === selectedCourt);
  const totalPrice = selectedCourtData ? Math.round((selectedCourtData.price / 60) * slotDuration) : 0;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedCourtData) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: selectedCourt,
          bookingDate: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          durationMinutes: slotDuration,
          customerName,
          customerPhone,
          notes: customerNotes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to create booking');
        return;
      }

      const data = await res.json();
      router.push(`/venue/${slug}/booking/${data.booking.id}`);
    } catch (err) {
      console.error("Failed to create booking:", err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCourts) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Book a Court</h1>
        <p className="text-muted-foreground">Complete the steps below to secure your slot.</p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 -z-10 rounded-full" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />
        
        {[
          { num: 1, label: "Court", icon: <CheckCircle2 className="w-5 h-5" /> },
          { num: 2, label: "Date & Time", icon: <Clock className="w-5 h-5" /> },
          { num: 3, label: "Details", icon: <User className="w-5 h-5" /> },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-background px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= s.num ? 'bg-primary text-primary-foreground border-primary glow-sm' : 'bg-background text-muted-foreground border-white/20'}`}>
              {step > s.num ? s.icon : s.num}
            </div>
            <span className={`text-sm ${step >= s.num ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-3xl">
        {/* Step 1: Select Court */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-6">Select a Court</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {courts.map(court => (
                <div 
                  key={court.id}
                  onClick={() => setSelectedCourt(court.id)}
                  className={`p-6 rounded-2xl cursor-pointer border-2 transition-all ${selectedCourt === court.id ? 'border-primary bg-primary/10 glow-sm' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                >
                  <h3 className="text-xl font-bold mb-2">{court.name}</h3>
                  <div className="text-primary font-medium">Rp {court.price.toLocaleString("id-ID")} / hr</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-6">Select Date & Time</h2>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Date</label>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 w-full md:w-1/2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="bg-transparent border-none outline-none w-full text-foreground"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {loadingSlots ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : selectedDate ? (
              <>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Available Slots ({slotDuration} mins)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.id}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 px-4 rounded-xl text-center font-medium transition-all ${
                        !slot.available 
                          ? 'bg-white/5 text-muted-foreground opacity-50 cursor-not-allowed' 
                          : selectedSlot?.id === slot.id
                            ? 'bg-primary text-primary-foreground glow-sm'
                            : 'bg-white/10 hover:bg-white/20 text-foreground'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                  {timeSlots.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-4">
                      No slots available for this date.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Select a date to see available time slots.</p>
            )}
          </motion.div>
        )}

        {/* Step 3: Customer Details */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-6">Your Details</h2>
            
            <form id="booking-form" onSubmit={handleConfirm} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">WhatsApp Number *</label>
                <input 
                  type="tel" 
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                  placeholder="081234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Additional Notes (Optional)</label>
                <textarea 
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors min-h-[100px] resize-none"
                  placeholder="Any special requests?"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-8">
                <h3 className="font-bold mb-4 border-b border-white/10 pb-4">Booking Summary</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Court</span>
                    <span className="font-medium">{selectedCourtData?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{selectedSlot?.time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{slotDuration} mins</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="font-bold">Total Pay</span>
                  <span className="text-2xl font-bold text-primary">Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
          {step > 1 ? (
            <button 
              onClick={handleBack}
              className="px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-colors"
            >
              Back
            </button>
          ) : <div></div>}

          {step < 3 ? (
            <button 
              onClick={handleNext}
              disabled={(step === 1 && !selectedCourt) || (step === 2 && (!selectedDate || !selectedSlot))}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              type="submit"
              form="booking-form"
              disabled={submitting}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 glow flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'Creating...' : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
