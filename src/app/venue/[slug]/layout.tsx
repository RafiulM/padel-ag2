import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VenueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Venue Minimal Navigation */}
      <nav className="sticky top-0 w-full z-50 glass-panel border-b-0 border-white/5 bg-background/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to PadelSpace</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs leading-none">P</span>
            </div>
            <span className="text-sm font-bold tracking-tight">PadelSpace</span>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      {/* Venue Minimal Footer */}
      <footer className="border-t border-white/10 py-8 bg-black/80 mt-auto">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Booking powered by PadelSpace.</p>
        </div>
      </footer>
    </div>
  );
}
