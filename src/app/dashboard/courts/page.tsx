"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, MoreHorizontal, Check, X, Loader2, Edit, Trash, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

type Court = {
  id: string;
  name: string;
  description: string;
  venue: string;
  venueId: string;
  price: number;
  type: string;
  status: string;
};

type VenueOption = {
  id: string;
  name: string;
};

export default function CourtsManagement() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [venueFilter, setVenueFilter] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [deletingCourtId, setDeletingCourtId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    venueId: "",
    description: "",
    pricePerHour: 0,
    isActive: true,
  });

  const fetchCourts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (venueFilter) params.set('venueId', venueFilter);
      const res = await fetch(`/api/courts?${params.toString()}`);
      const data = await res.json();
      setCourts(data);
    } catch (error) {
      console.error("Failed to fetch courts:", error);
    } finally {
      setLoading(false);
    }
  }, [venueFilter]);

  useEffect(() => {
    // Fetch venues for the filter dropdown
    fetch('/api/venues')
      .then(res => res.json())
      .then(data => setVenues(data.map((v: any) => ({ id: v.id, name: v.name }))))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  const openAddModal = () => {
    setEditingCourt(null);
    setFormData({
      name: "",
      venueId: venues.length > 0 ? venues[0].id : "",
      description: "",
      pricePerHour: 150000,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (court: Court) => {
    setEditingCourt(court);
    setFormData({
      name: court.name,
      venueId: court.venueId,
      description: court.description || "",
      pricePerHour: court.price,
      isActive: court.status === 'active',
    });
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const openDeleteModal = (id: string) => {
    setDeletingCourtId(id);
    setIsDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingCourt ? `/api/courts/${editingCourt.id}` : '/api/courts';
      const method = editingCourt ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save court');
      
      setIsModalOpen(false);
      fetchCourts();
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourtId) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/courts/${deletingCourtId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete court');
      
      setIsDeleteModalOpen(false);
      setDeletingCourtId(null);
      fetchCourts();
    } catch (error) {
      console.error(error);
      alert("Failed to delete court. It might have associated bookings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && courts.length === 0) {
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manajemen Lapangan</h1>
          <p className="text-muted-foreground mt-1">Manage your courts, pricing, and availability.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 glow flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Court
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden flex flex-col border border-white/5">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.01]">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search courts..." 
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <select 
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground w-full sm:w-auto appearance-none"
            >
              <option value="">All Venues</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            <button className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm hover:bg-white/10 transition-colors flex items-center gap-2 text-foreground">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-white/5 uppercase border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Court Name</th>
                <th className="px-6 py-4 font-medium">Venue</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Price/Hour</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {courts.map((court, i) => (
                <motion.tr 
                  key={court.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">{court.name.charAt(6) || court.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{court.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{court.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{court.venue}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-foreground">
                      {court.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    Rp {court.price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      court.status === 'active' 
                        ? 'bg-primary/10 text-primary border-primary/20' 
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>
                      {court.status === 'active' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {court.status === 'active' ? 'Active' : 'Maintenance'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setOpenDropdownId(openDropdownId === court.id ? null : court.id)}
                      className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/5 focus:opacity-100"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {openDropdownId === court.id && (
                      <div className="absolute right-6 top-10 mt-2 w-48 bg-background border border-white/10 rounded-lg shadow-xl z-10 py-1 overflow-hidden">
                        <button 
                          onClick={() => openEditModal(court)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" /> Edit Court
                        </button>
                        <button 
                          onClick={() => openDeleteModal(court.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Trash className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
              {courts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No courts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">{courts.length}</span> of <span className="font-medium text-foreground">{courts.length}</span> results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-white/10 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-white/10 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xl font-bold">{editingCourt ? 'Edit Court' : 'Add New Court'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="court-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Venue *</label>
                    <select 
                      required 
                      name="venueId" 
                      value={formData.venueId} 
                      onChange={handleInputChange} 
                      disabled={!!editingCourt}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none appearance-none disabled:opacity-50"
                    >
                      <option value="" disabled>Select Venue</option>
                      {venues.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Court Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none" placeholder="e.g. Court 1 - Indoor" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Description / Type *</label>
                    <input required type="text" name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none" placeholder="e.g. Indoor panoramic court" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Price per Hour (Rp) *</label>
                    <input required type="number" name="pricePerHour" value={formData.pricePerHour || ''} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none" placeholder="150000" />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="isActive" 
                      name="isActive" 
                      checked={formData.isActive} 
                      onChange={handleInputChange} 
                      className="w-4 h-4 accent-primary"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-foreground">Court is active and bookable</label>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/[0.02]">
                <button onClick={() => setIsModalOpen(false)} type="button" className="px-4 py-2 rounded-lg border border-white/10 text-foreground hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" form="court-form" disabled={isSubmitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCourt ? 'Save Changes' : 'Create Court'}
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
                <h2 className="text-xl font-bold mb-2">Delete Court?</h2>
                <p className="text-muted-foreground mb-6">Are you sure you want to delete this court? This action cannot be undone.</p>
                
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 rounded-lg border border-white/10 text-foreground hover:bg-white/5 transition-colors font-medium w-full">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 w-full disabled:opacity-50">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Delete
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
