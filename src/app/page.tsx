"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, CreditCard, LayoutDashboard, Smartphone, Users } from "lucide-react";
import Link from "next/link";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-panel border-b-0 border-white/5 bg-background/50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg leading-none">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight">PadelSpace</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/register" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors glow">
              Register Venue
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-4xl mx-auto flex flex-col items-center"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground mb-8">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                The #1 Padel Management Platform in Indonesia
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
                Manage Your Padel Venue with <span className="gradient-text">Absolute Ease</span>
              </motion.h1>
              
              <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                Stop relying on chaotic WhatsApp chats. Automate your bookings, manage courts, and increase your revenue with a professional booking platform.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/register" className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 glow flex items-center justify-center gap-2">
                  Daftar Sekarang <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#features" className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 px-8 py-4 rounded-full text-lg font-medium transition-colors text-center">
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Showcase */}
        <section id="features" className="py-24 bg-black/50 border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything You Need</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Built specifically for padel venue owners to streamline operations and enhance customer experience.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: <CalendarCheck className="w-6 h-6 text-primary" />,
                  title: "Real-time Scheduling",
                  desc: "Customers can see available slots and book instantly without back-and-forth messaging."
                },
                {
                  icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
                  title: "Admin Dashboard",
                  desc: "A powerful, intuitive dashboard to manage all your courts, schedules, and bookings."
                },
                {
                  icon: <CreditCard className="w-6 h-6 text-primary" />,
                  title: "Manual Payments",
                  desc: "Easily accept bank transfers and QRIS. Verify payments with a single click."
                },
                {
                  icon: <Smartphone className="w-6 h-6 text-primary" />,
                  title: "Mobile Friendly",
                  desc: "Optimized for mobile devices, so your customers can book from anywhere, anytime."
                },
                {
                  icon: <Users className="w-6 h-6 text-primary" />,
                  title: "No Login Required",
                  desc: "Remove friction. Customers can book their favorite court by just providing their name and WhatsApp."
                },
                {
                  icon: <ArrowRight className="w-6 h-6 text-primary" />,
                  title: "Public Landing Page",
                  desc: "Get a dedicated, professional public page for your venue instantly upon registration."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel p-8 rounded-3xl hover:bg-white/[0.05] transition-colors group cursor-default"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] opacity-30 pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Get your venue online in minutes, not days.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              {[
                {
                  step: "01",
                  title: "Claim Your Space",
                  desc: "Register your venue details, upload photos, and set your operational hours."
                },
                {
                  step: "02",
                  title: "Setup Your Courts",
                  desc: "Add your padel courts, define pricing, and configure available booking slots."
                },
                {
                  step: "03",
                  title: "Receive Bookings",
                  desc: "Share your dedicated link and start receiving bookings automatically 24/7."
                }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-3xl font-bold text-primary mb-6 glow shadow-primary/20 relative z-10">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to scale your venue?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10">Join other forward-thinking padel venue owners who have modernized their booking operations.</p>
            <Link href="/register" className="inline-flex bg-background text-foreground px-10 py-5 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-xl">
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black/80">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs leading-none">P</span>
              </div>
              <span className="text-lg font-bold tracking-tight">PadelSpace</span>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} PadelSpace. All rights reserved.</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">Privacy</Link>
              <Link href="#" className="hover:text-foreground">Terms</Link>
              <Link href="#" className="hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
