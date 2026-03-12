import React, { useState, useEffect } from 'react';
import { PerformanceReview } from '../types';
import { Star, MessageSquare } from 'lucide-react';

export function Performance() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingRev, setEditingRev] = useState<PerformanceReview | null>(null);
  const [newRev, setNewRev] = useState({ employee_id: '', rating: 5, feedback: '' });

  const fetchData = () => {
    fetch('/api/performance').then(res => res.json()).then(setReviews);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRev)
    });
    setShowAdd(false);
    fetchData();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRev) return;
    await fetch(`/api/performance/${editingRev.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingRev)
    });
    setEditingRev(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Performance Reviews</h3>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">New Review</button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Employee ID</label>
              <input required type="number" value={newRev.employee_id} onChange={e => setNewRev({...newRev, employee_id: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Rating (1-5)</label>
              <input required type="number" min="1" max="5" value={newRev.rating} onChange={e => setNewRev({...newRev, rating: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Feedback</label>
              <input required type="text" value={newRev.feedback} onChange={e => setNewRev({...newRev, feedback: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingRev && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Edit Review: {editingRev.name}</h4>
          <form onSubmit={handleEdit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Rating (1-5)</label>
              <input required type="number" min="1" max="5" value={editingRev.rating} onChange={e => setEditingRev({...editingRev, rating: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Feedback</label>
              <input required type="text" value={editingRev.feedback} onChange={e => setEditingRev({...editingRev, feedback: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Update</button>
              <button type="button" onClick={() => setEditingRev(null)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6">
        {reviews.map(r => (
          <div key={r.id} className="bg-white p-6 rounded-2xl border border-black/5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center font-bold">{r.name.charAt(0)}</div>
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-black/40">{new Date(r.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={16} className={star <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-black/10'} />
                  ))}
                </div>
                <button onClick={() => setEditingRev(r)} className="p-2 text-black/20 hover:text-black transition-colors" title="Edit Review">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
            <div className="p-4 bg-black/[0.02] rounded-xl flex gap-3">
              <MessageSquare size={16} className="text-black/20 shrink-0 mt-1" />
              <p className="text-sm text-black/60 italic leading-relaxed">{r.feedback}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
