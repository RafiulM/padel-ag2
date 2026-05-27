"use client";

import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  CreditCard, 
  CalendarDays, 
  TrendingUp,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

type Stat = {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: any;
};

type Booking = {
  id: string;
  customer: string;
  court: string;
  time: string;
  status: string;
  amount: string;
};

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stat[]>([
    { title: "Today's Bookings", value: "-", change: "+0%", trend: "up", icon: CalendarDays },
    { title: "Upcoming Bookings", value: "-", change: "+0%", trend: "up", icon: Users },
    { title: "Estimated Revenue", value: "-", change: "+0%", trend: "up", icon: TrendingUp },
    { title: "Pending Payments", value: "-", change: "+0%", trend: "down", icon: CreditCard },
  ]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/bookings/recent')
        ]);
        
        const statsData = await statsRes.json();
        const bookingsData = await bookingsRes.json();

        setStats([
          { title: "Today's Bookings", value: statsData.todaysBookings, change: "+20%", trend: "up", icon: CalendarDays },
          { title: "Upcoming Bookings", value: statsData.upcomingBookings, change: "+12%", trend: "up", icon: Users },
          { title: "Estimated Revenue", value: statsData.estimatedRevenue, change: "+8%", trend: "up", icon: TrendingUp },
          { title: "Pending Payments", value: statsData.pendingPayments, change: "-2", trend: "down", icon: CreditCard },
        ]);
        setRecentBookings(bookingsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening at your venue today.</p>
        </div>
        <Link 
          href="/dashboard/bookings" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors glow flex items-center gap-2"
        >
          View All Bookings
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-5 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-muted-foreground text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Bookings & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel rounded-xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-bold">Recent Bookings</h2>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-white/5 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Booking ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Court & Time</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium">{booking.id}</td>
                    <td className="px-6 py-4">{booking.customer}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{booking.court}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{booking.time}</div>
                    </td>
                    <td className="px-6 py-4">{booking.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        booking.status === 'confirmed' 
                          ? 'bg-primary/10 text-primary border-primary/20' 
                          : booking.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No recent bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions / Notices */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-xl p-6 flex flex-col gap-6"
        >
          <div>
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/dashboard/bookings" className="w-full flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10">
                <span className="font-medium text-sm">Verify Manual Payments</span>
                <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold">{stats.find(s => s.title === 'Pending Payments')?.value || 0}</span>
              </Link>
              <Link href="/dashboard/schedules" className="w-full flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10">
                <span className="font-medium text-sm">Update Schedules</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link href="/dashboard/courts" className="w-full flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10">
                <span className="font-medium text-sm">Manage Courts</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 blur-xl rounded-full"></div>
              <h3 className="text-primary font-bold mb-1 relative z-10">Pro Tip</h3>
              <p className="text-xs text-primary/80 relative z-10 leading-relaxed">
                Add clear photos to your courts to increase booking conversion rates by up to 30%.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
