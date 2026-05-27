"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Copy, CreditCard, ExternalLink, QrCode, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

type BookingDetails = {
  id: string;
  venueName: string;
  courtName: string;
  date: string;
  time: string;
  totalPrice: number;
  status: string;
  customerName: string;
  customerPhone: string;
};

type PaymentInfo = {
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  qrisImageUrl: string | null;
  whatsappNumber: string;
  instructions: string;
};

function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default function BookingStatusPage() {
  const params = useParams();
  const bookingId = params?.bookingId as string || "BK-12345";
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/public/bookings/${bookingId}`);
        if (!res.ok) throw new Error('Booking not found');
        const data = await res.json();
        setBooking(data.booking);
        setPayment(data.payment);
      } catch (err) {
        console.error("Failed to fetch booking:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  const handleCopy = () => {
    if (payment?.accountNumber) {
      navigator.clipboard.writeText(payment.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking || !payment) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Booking not found</h1>
        <p className="text-muted-foreground">The booking ID you provided does not exist.</p>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hello, I would like to confirm my payment for booking ID: ${booking.id}.\n\nVenue: ${booking.venueName}\nCourt: ${booking.courtName}\nDate: ${booking.date}\nTime: ${booking.time}`
  );
  const whatsappUrl = `https://wa.me/${payment.whatsappNumber}?text=${whatsappMessage}`;

  const statusConfig = {
    pending: { label: 'Pending Payment', icon: <ClockIcon className="w-8 h-8" />, color: 'yellow-500', bgColor: 'yellow-500/20' },
    confirmed: { label: 'Confirmed', icon: <CheckCircle2 className="w-8 h-8" />, color: 'green-500', bgColor: 'green-500/20' },
    cancelled: { label: 'Cancelled', icon: <ClockIcon className="w-8 h-8" />, color: 'red-500', bgColor: 'red-500/20' },
    completed: { label: 'Completed', icon: <CheckCircle2 className="w-8 h-8" />, color: 'blue-500', bgColor: 'blue-500/20' },
  };

  const currentStatus = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${currentStatus.bgColor} text-${currentStatus.color} mb-6`}>
          {currentStatus.icon}
        </div>
        <h1 className="text-3xl font-bold mb-2">{currentStatus.label}</h1>
        <p className="text-muted-foreground">
          {booking.status === 'pending' 
            ? 'Your booking is reserved for the next 15 minutes. Please complete your payment to confirm.'
            : booking.status === 'confirmed'
            ? 'Your booking has been confirmed. See you on the court!'
            : 'Your booking status has been updated.'
          }
        </p>
        <div className="mt-4 inline-block bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm">
          Booking ID: <span className="font-mono text-primary font-bold">{booking.id}</span>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Booking Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 md:p-8 rounded-3xl h-fit"
        >
          <h2 className="text-xl font-bold mb-6">Booking Summary</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Venue</div>
              <div className="font-medium">{booking.venueName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Court</div>
              <div className="font-medium">{booking.courtName}</div>
            </div>
            <div className="flex gap-8">
              <div>
                <div className="text-sm text-muted-foreground">Date</div>
                <div className="font-medium">{booking.date}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Time</div>
                <div className="font-medium">{booking.time}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
            <span className="font-bold">Total Payment</span>
            <span className="text-2xl font-bold text-primary">
              Rp {booking.totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
        </motion.div>

        {/* Payment Instructions */}
        {booking.status === 'pending' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 md:p-8 rounded-3xl bg-primary/5 border border-primary/20"
          >
            <h2 className="text-xl font-bold mb-6">Payment Method</h2>
            
            <div className="space-y-6">
              {/* Bank Transfer */}
              {payment.bankName && (
                <div className="bg-background rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-primary font-medium mb-4">
                    <CreditCard className="w-4 h-4" /> Bank Transfer
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">Bank {payment.bankName}</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold tracking-wider font-mono">{payment.accountNumber}</span>
                    <button 
                      onClick={handleCopy}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="text-sm">a.n <span className="font-medium">{payment.accountName}</span></div>
                </div>
              )}

              {/* QRIS */}
              {payment.qrisImageUrl && (
                <div className="bg-background rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-primary font-medium mb-4">
                    <QrCode className="w-4 h-4" /> Pay with QRIS
                  </div>
                  <div className="flex justify-center bg-white p-4 rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={payment.qrisImageUrl} 
                      alt="QRIS" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Action / Next Steps */}
      {booking.status === 'pending' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-6">
            Already paid? Confirm your payment by sending the receipt via WhatsApp.
          </p>
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-[#25D366] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#25D366]/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,211,102,0.3)] items-center gap-2"
          >
            Confirm via WhatsApp <ExternalLink className="w-5 h-5" />
          </a>
        </motion.div>
      )}
    </div>
  );
}
