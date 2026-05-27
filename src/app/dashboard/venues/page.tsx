"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Phone, Clock, MoreVertical, Edit, Trash, Loader2, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

type Venue = {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  phone: string;
  openTime: string;
  closeTime: string;
  courts: number;
  status: string;
  image: string | null;
};

export default function VenuesManagement() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [deletingVenueId, setDeletingVenueId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    description: "",
    phone: "",
    openTime: "06:00",
    closeTime: "23:00",
    status: "active",
    image: "",
  });

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/venues');
      const data = await res.json();
      setVenues(data);
    } catch (error) {
      console.error("Failed to fetch venues:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const openAddModal = () => {
    setEditingVenue(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      description: "",
      phone: "",
      openTime: "06:00",
      closeTime: "23:00",
      status: "active",
      image: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      address: venue.address,
      city: venue.city || "", // Assuming city might be missing in older data
      description: venue.description || "",
      phone: venue.phone,
      openTime: venue.openTime,
      closeTime: venue.closeTime,
      status: venue.status,
      image: venue.image || "",
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setDeletingVenueId(id);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingVenue ? `/api/venues/${editingVenue.id}` : '/api/venues';
      const method = editingVenue ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save venue');
      
      setIsModalOpen(false);
      fetchVenues();
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVenueId) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/venues/${deletingVenueId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete venue');
      
      setIsDeleteModalOpen(false);
      setDeletingVenueId(null);
      fetchVenues();
    } catch (error) {
      console.error(error);
      alert("Failed to delete venue. It might have associated courts or bookings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && venues.length === 0) {
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manajemen Venue</h1>
          <p className="text-muted-foreground mt-1">Manage your padel venues and locations.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 glow flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Venue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {venues.map((venue, i) => (
          <motion.div
            key={venue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-white/10 group hover:border-primary/50 transition-colors"
          >
            {/* Image header */}
            <div className="h-48 relative bg-white/5 border-b border-white/5 flex items-center justify-center overflow-hidden">
              {venue.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={venue.image} alt={venue.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="text-muted-foreground text-sm font-medium">No Image Uploaded</div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                  venue.status === 'active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {venue.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-black/50 text-white border border-white/20">
                  {venue.courts} Courts
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold">{venue.name}</h3>
                <button 
                  onClick={() => openDeleteModal(venue.id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-md hover:bg-white/5"
                  title="Delete Venue"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <span className="line-clamp-2">{venue.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0 text-primary" />
                  <span>{venue.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0 text-primary" />
                  <span>{venue.openTime} - {venue.closeTime}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-auto pt-4 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => openEditModal(venue)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-foreground py-2 rounded-lg text-sm font-medium transition-colors border border-white/5 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <Link href={`/dashboard/courts?venue=${venue.id}`} className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  View Courts
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
        {venues.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-muted-foreground glass-panel rounded-xl">
            No venues found. Create one to get started.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xl font-bold">{editingVenue ? 'Edit Venue' : 'Add New Venue'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="venue-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Venue Name *</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none" />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Full Address *</label>
                      <textarea required name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none resize-none h-20" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">City *</label>
                      <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">WhatsApp Phone *</label>
                      <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none" placeholder="+62 812..." />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Open Time *</label>
                      <input required type="time" name="openTime" value={formData.openTime} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none [color-scheme:dark]" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Close Time *</label>
                      <input required type="time" name="closeTime" value={formData.closeTime} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none [color-scheme:dark]" />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                      <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none resize-none h-20" />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Cover Image URL</label>
                      <input type="url" name="image" value={formData.image} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none" placeholder="https://..." />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                      <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none appearance-none">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/[0.02]">
                <button onClick={() => setIsModalOpen(false)} type="button" className="px-4 py-2 rounded-lg border border-white/10 text-foreground hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" form="venue-form" disabled={isSubmitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingVenue ? 'Save Changes' : 'Create Venue'}
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
                <h2 className="text-xl font-bold mb-2">Delete Venue?</h2>
                <p className="text-muted-foreground mb-6">Are you sure you want to delete this venue? This action cannot be undone.</p>
                
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
