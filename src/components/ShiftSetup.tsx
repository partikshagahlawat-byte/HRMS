import React, { useState, useEffect } from 'react';
import { Shift } from '../types';
import { Clock, Plus } from 'lucide-react';

export function ShiftSetup() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [newShift, setNewShift] = useState({ name: '', start_time: '09:00', end_time: '17:00' });

  const fetchData = () => {
    fetch('/api/shifts').then(res => res.json()).then(setShifts);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShift)
    });
    setShowAdd(false);
    fetchData();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;
    await fetch(`/api/shifts/${editingShift.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingShift)
    });
    setEditingShift(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Shift Configuration</h3>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium"><Plus size={18} /> Add Shift</button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Shift Name</label>
              <input required type="text" value={newShift.name} onChange={e => setNewShift({...newShift, name: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" placeholder="Morning" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Start Time</label>
              <input type="time" value={newShift.start_time} onChange={e => setNewShift({...newShift, start_time: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">End Time</label>
              <input type="time" value={newShift.end_time} onChange={e => setNewShift({...newShift, end_time: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingShift && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Edit Shift: {editingShift.name}</h4>
          <form onSubmit={handleEdit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Shift Name</label>
              <input required type="text" value={editingShift.name} onChange={e => setEditingShift({...editingShift, name: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Start Time</label>
              <input type="time" value={editingShift.start_time} onChange={e => setEditingShift({...editingShift, start_time: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">End Time</label>
              <input type="time" value={editingShift.end_time} onChange={e => setEditingShift({...editingShift, end_time: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Update</button>
              <button type="button" onClick={() => setEditingShift(null)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20} /></div>
                <h4 className="font-semibold">{s.name}</h4>
              </div>
              <button onClick={() => setEditingShift(s)} className="p-2 text-black/20 hover:text-black transition-colors" title="Edit Shift">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black/40">Start Time</span>
              <span className="font-medium">{s.start_time}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-black/40">End Time</span>
              <span className="font-medium">{s.end_time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
