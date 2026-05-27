"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MoreHorizontal, CheckCircle2, XCircle, Clock, Loader2, Edit, Trash, AlertCircle, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

type Booking = {
  id: string;
  date: string;
  time: string;
  customer: string;
  phone: string;
  court: string;
  venue: string;
  amount: number;
  status: string;
  notes?: string | null;
};

type Summary = {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
};

export default function BookingsManagement() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  // Modal states
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    notes: "",
  });

  const fetchBookings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (dateFilter) params.set('date', dateFilter);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/bookings?${params.toString()}`);
      const data = await res.json();
      setAllBookings(data.bookings);
      setSummary(data.summary);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, searchTerm]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleVerifyPayment = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      if (res.ok) {
        fetchBookings(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to verify payment:", error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      customerName: booking.customer,
      customerPhone: booking.phone,
      notes: booking.notes || "",
    });
    setIsEditModalOpen(true);
    setOpenDropdownId(null);
  };

  const openDeleteModal = (id: string) => {
    setDeletingBookingId(id);
    setIsDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update booking');
      
      setIsEditModalOpen(false);
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBookingId) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/bookings/${deletingBookingId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete booking');
      
      setIsDeleteModalOpen(false);
      setDeletingBookingId(null);
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert("Failed to delete booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manajemen Booking</h1>
          <p className="text-muted-foreground mt-1">View and manage all customer bookings and payments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="text-sm text-muted-foreground mb-1">Total Bookings</div>
          <div className="text-2xl font-bold">{summary.total}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div className="text-sm text-primary/80 mb-1">Pending Verification</div>
          <div className="text-2xl font-bold text-primary">{summary.pending}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-green-500/20 bg-green-500/5">
          <div className="text-sm text-green-500/80 mb-1">Confirmed</div>
          <div className="text-2xl font-bold text-green-500">{summary.confirmed}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <div className="text-sm text-red-500/80 mb-1">Cancelled</div>
          <div className="text-2xl font-bold text-red-500">{summary.cancelled}</div>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden flex flex-col border border-white/5">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/[0.01]">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by ID, Customer Name, or Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground appearance-none flex-1 lg:flex-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Payment</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground appearance-none flex-1 lg:flex-none [color-scheme:dark]" 
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-muted-foreground bg-white/5 uppercase border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Booking Details</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Court & Venue</th>
                <th className="px-6 py-4 font-medium">Total Price</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allBookings.map((booking, i) => (
                <motion.tr 
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">{booking.id}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.date} • {booking.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{booking.customer}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{booking.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{booking.court}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{booking.venue}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">
                    Rp {booking.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        booking.status === 'confirmed' 
                          ? 'bg-primary/10 text-primary border-primary/20' 
                          : booking.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          : booking.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {booking.status === 'confirmed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {booking.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                        {booking.status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
                        {booking.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {booking.status === 'pending' ? 'Pending Payment' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    {booking.status === 'pending' ? (
                      <button 
                        onClick={() => handleVerifyPayment(booking.id)}
                        className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors mr-2"
                      >
                        Verify Payment
                      </button>
                    ) : null}
                    <button 
                      onClick={() => setOpenDropdownId(openDropdownId === booking.id ? null : booking.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-white/5"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {openDropdownId === booking.id && (
                      <div className="absolute right-6 top-10 mt-2 w-48 bg-background border border-white/10 rounded-lg shadow-xl z-10 py-1 overflow-hidden">
                        <button 
                          onClick={() => openEditModal(booking)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" /> Edit Details
                        </button>
                        {booking.status !== 'cancelled' && (
                          <button 
                            onClick={() => { handleCancelBooking(booking.id); setOpenDropdownId(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-yellow-500 hover:bg-yellow-500/10 flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" /> Cancel Booking
                          </button>
                        )}
                        <button 
                          onClick={() => openDeleteModal(booking.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Trash className="w-4 h-4" /> Delete Record
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
              {allBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">{allBookings.length}</span> of <span className="font-medium text-foreground">{summary.total}</span> results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-white/10 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-white/10 text-sm text-foreground bg-white/5 hover:bg-white/10 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Customer Details Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xl font-bold">Edit Customer Details</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <form id="edit-booking-form" onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Customer Name *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.customerName} 
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">WhatsApp Phone *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.customerPhone} 
                      onChange={(e) => setFormData({...formData, customerPhone: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                    <textarea 
                      value={formData.notes} 
                      onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none resize-none h-24" 
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/[0.02]">
                <button onClick={() => setIsEditModalOpen(false)} type="button" className="px-4 py-2 rounded-lg border border-white/10 text-foreground hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" form="edit-booking-form" disabled={isSubmitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Delete Booking Record?</h2>
                <p className="text-muted-foreground mb-6">Are you sure you want to permanently delete this booking record? This action cannot be undone.</p>
                
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 rounded-lg border border-white/10 text-foreground hover:bg-white/5 transition-colors font-medium w-full">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 w-full disabled:opacity-50">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Delete Record
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
