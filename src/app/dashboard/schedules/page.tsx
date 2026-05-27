"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, Loader2 } from "lucide-react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00"
];

type VenueOption = { id: string; name: string };
type CourtOption = { id: string; name: string };
type SlotData = { court: string; status: string; customer: string; bookingId: string };
type BookingsMap = Record<string, Record<string, SlotData>>;

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay + (offset * 7));
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export default function SchedulesManagement() {
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [venueCourts, setVenueCourts] = useState<CourtOption[]>([]);
  const [selectedVenue, setSelectedVenue] = useState("");
  const [selectedCourt, setSelectedCourt] = useState("all");
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookingsMap, setBookingsMap] = useState<BookingsMap>({});
  const [loading, setLoading] = useState(true);

  const weekDates = getWeekDates(weekOffset);
  const weekStart = weekDates[0].toISOString().split('T')[0];
  const monthYear = weekDates[3].toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayDate = new Date().getDate();

  // Fetch venues on mount
  useEffect(() => {
    fetch('/api/venues')
      .then(res => res.json())
      .then(data => {
        const venueList = data.map((v: any) => ({ id: v.id, name: v.name }));
        setVenues(venueList);
        if (venueList.length > 0) setSelectedVenue(venueList[0].id);
      })
      .catch(console.error);
  }, []);

  // Fetch schedule data
  const fetchSchedule = useCallback(async () => {
    if (!selectedVenue) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        venueId: selectedVenue,
        weekStart,
      });
      if (selectedCourt !== 'all') params.set('courtId', selectedCourt);

      const res = await fetch(`/api/schedules?${params.toString()}`);
      const data = await res.json();
      setBookingsMap(data.bookings || {});
      setVenueCourts(data.courts || []);
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedVenue, selectedCourt, weekStart]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manajemen Jadwal</h1>
          <p className="text-muted-foreground mt-1">Manage court availability and view booking calendar.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Operational Hours
          </button>
          <button className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 glow flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Block Slot
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-xl flex flex-wrap gap-4 border border-white/5">
        <select 
          value={selectedVenue}
          onChange={(e) => { setSelectedVenue(e.target.value); setSelectedCourt('all'); }}
          className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground appearance-none min-w-[200px]"
        >
          {venues.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>

        <select 
          value={selectedCourt}
          onChange={(e) => setSelectedCourt(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground appearance-none min-w-[200px]"
        >
          <option value="all">All Courts</option>
          {venueCourts.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Calendar Header */}
      <div className="glass-panel rounded-xl border border-white/5 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {monthYear}
            </h2>
            <div className="flex bg-white/5 rounded-lg p-1">
              <button className="px-3 py-1 rounded-md text-sm font-medium bg-white/10 text-foreground">Week</button>
              <button className="px-3 py-1 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Day</button>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setWeekOffset(w => w - 1)}
              className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setWeekOffset(0)}
              className="px-3 h-8 rounded-lg border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors text-xs font-medium"
            >
              Today
            </button>
            <button 
              onClick={() => setWeekOffset(w => w + 1)}
              className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          /* Calendar Grid */
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Days Header */}
              <div className="grid grid-cols-8 border-b border-white/5 bg-black/40">
                <div className="p-3 text-xs font-medium text-muted-foreground text-center border-r border-white/5">
                  Time (GMT+7)
                </div>
                {weekDates.map((d, i) => {
                  const dateNum = d.getDate();
                  const isToday = dateNum === todayDate && weekOffset === 0;
                  return (
                    <div key={i} className={`p-3 text-center border-r border-white/5 ${isToday ? 'bg-primary/5' : ''}`}>
                      <div className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{days[d.getDay()]}</div>
                      <div className={`text-lg font-bold mt-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>{dateNum}</div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div className="divide-y divide-white/5">
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 group">
                    {/* Time label */}
                    <div className="p-3 text-xs font-medium text-muted-foreground text-center border-r border-white/5 flex items-center justify-center group-hover:bg-white/[0.02]">
                      {time}
                    </div>
                    
                    {/* Day cells for this time slot */}
                    {weekDates.map((d, i) => {
                      const dateKey = d.getDate().toString();
                      const isToday = dateKey === todayDate.toString() && weekOffset === 0;
                      const slotData = bookingsMap[dateKey]?.[time];
                      
                      return (
                        <div 
                          key={`${dateKey}-${time}`} 
                          className={`p-1.5 border-r border-white/5 relative h-16 group-hover:bg-white/[0.01] transition-colors ${isToday ? 'bg-primary/[0.02]' : ''}`}
                        >
                          {slotData ? (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`w-full h-full rounded-md p-1.5 flex flex-col justify-between cursor-pointer transition-colors ${
                                slotData.status === 'cancelled' 
                                  ? 'bg-red-500/20 border border-red-500/30 hover:bg-red-500/30'
                                  : 'bg-primary/20 border border-primary/30 hover:bg-primary/30'
                              }`}
                            >
                              <div className={`text-[10px] font-bold truncate ${slotData.status === 'cancelled' ? 'text-red-400' : 'text-primary'}`}>{slotData.court}</div>
                              <div className={`text-[10px] truncate ${slotData.status === 'cancelled' ? 'text-red-400/80' : 'text-primary/80'}`}>{slotData.customer}</div>
                            </motion.div>
                          ) : (
                            <div className="w-full h-full rounded-md border border-dashed border-transparent hover:border-white/20 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-all">
                              <Plus className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
