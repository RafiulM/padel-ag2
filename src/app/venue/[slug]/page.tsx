"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Phone, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

type Court = {
  id: string;
  name: string;
  price: number;
  type: string;
};

type VenueData = {
  id: string;
  name: string;
  slug: string;
  address: string;
  description: string;
  phone: string;
  openTime: string;
  closeTime: string;
  image: string | null;
  courts: Court[];
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function VenuePage() {
  const params = useParams();
  const slug = params?.slug as string || "demo-venue";

  const [venue, setVenue] = useState<VenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchVenue() {
      try {
        const res = await fetch(`/api/public/venues/${slug}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setVenue(data);
      } catch (err) {
        console.error("Failed to fetch venue:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchVenue();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Venue not found</h1>
        <p className="text-muted-foreground">The venue you are looking for does not exist or is not active.</p>
        <Link href="/" className="text-primary hover:underline">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: venue.image ? `url(${venue.image})` : undefined }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-black/30" />
        </div>
        
        <div className="container mx-auto px-6 h-full relative z-10 flex flex-col justify-end pb-12">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {venue.name}
            </motion.h1>
            <motion.div variants={fadeIn} className="flex flex-col md:flex-row gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{venue.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{venue.openTime} - {venue.closeTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>{venue.phone}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4">About the Venue</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {venue.description || 'Welcome to our padel venue. Book your court and start playing!'}
            </p>

            <h2 className="text-2xl font-bold mb-6">Available Courts</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {venue.courts.map((court) => (
                <div key={court.id} className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors border-l-4 border-l-primary group">
                  <h3 className="text-xl font-bold mb-2">{court.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Star className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />
                    <span>{court.type}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary mb-6 glow-sm">
                    Rp {court.price.toLocaleString("id-ID")} <span className="text-sm font-normal text-muted-foreground">/ hour</span>
                  </div>
                </div>
              ))}
              {venue.courts.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No courts available at this venue yet.
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar / CTA */}
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-8 rounded-3xl sticky top-24 border border-primary/20 bg-primary/5"
          >
            <h3 className="text-2xl font-bold mb-2 text-foreground">Ready to Play?</h3>
            <p className="text-muted-foreground mb-8">Select your preferred date and time to secure your slot instantly. No login required.</p>
            
            <Link 
              href={`/venue/${slug}/book`}
              className="w-full bg-primary text-primary-foreground py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 glow flex items-center justify-center"
            >
              Book a Court
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
