import { db } from '@/db';
import { venues } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'All Venues | PadelSpace',
  description: 'Browse and book padel courts from top venues.',
};

export default async function VenuesPage() {
  const activeVenues = await db.query.venues.findMany({
    where: eq(venues.isActive, true),
    orderBy: (venues, { desc }) => [desc(venues.createdAt)],
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="w-full z-50 glass-panel border-b border-white/10 bg-black/80 sticky top-0">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-primary-foreground font-bold text-lg leading-none">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">PadelSpace</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/venues" className="text-foreground transition-colors font-semibold">Venues</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16 pb-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 mt-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-primary mb-6">
              Book Instantly
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Explore Padel Venues</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find the perfect padel court near you. View schedules, check availability, and book your game in seconds.
            </p>
          </div>

          {activeVenues.length === 0 ? (
            <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 max-w-3xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No venues found</h3>
              <p className="text-muted-foreground text-lg">We're currently expanding. Check back soon for new padel venues in your area!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeVenues.map((venue) => (
                <Link 
                  key={venue.id} 
                  href={`/venue/${venue.slug}`}
                  className="group flex flex-col glass-panel rounded-3xl overflow-hidden hover:bg-white/[0.08] transition-all hover:-translate-y-1 border border-white/10 shadow-lg shadow-black/20"
                >
                  <div className="relative h-56 w-full bg-black/50 overflow-hidden">
                    {venue.imageUrl ? (
                      <img 
                        src={venue.imageUrl} 
                        alt={venue.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/40 text-muted-foreground bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-20">
                        <span className="font-medium tracking-wide">PadelSpace</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                    
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20 text-white shadow-sm flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-primary" />
                        {venue.city}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1 relative bg-black/40">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{venue.name}</h3>
                    
                    <div className="flex items-start gap-2.5 text-muted-foreground text-sm mb-4">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                      <span className="line-clamp-2 leading-relaxed">{venue.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-muted-foreground text-sm mb-8">
                      <Clock className="w-4 h-4 shrink-0 text-primary/70" />
                      <span>{venue.openTime} - {venue.closeTime}</span>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-sm font-semibold">
                      <span className="text-foreground group-hover:text-primary transition-colors">Book Court</span>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black/80 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs leading-none">P</span>
              </div>
              <span className="text-lg font-bold tracking-tight">PadelSpace</span>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} PadelSpace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
