import React, { useState, useEffect } from 'react';
import { LeaveRequest } from '../types';
import { Check, X, Clock } from 'lucide-react';

export function LeaveManagement() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const [newLeave, setNewLeave] = useState({ employee_id: '', type: 'Annual', start_date: '', end_date: '', reason: '' });

  const fetchData = () => {
    fetch('/api/leaves').then(res => res.json()).then(setLeaves);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLeave)
    });
    setShowAdd(false);
    fetchData();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeave) return;
    await fetch(`/api/leaves/${editingLeave.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingLeave)
    });
    setEditingLeave(null);
    fetchData();
  };

  const handleAction = async (id: number, status: string) => {
    await fetch('/api/leaves/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Leave Approvals</h3>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Request Leave</button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Employee ID</label>
              <input required type="number" value={newLeave.employee_id} onChange={e => setNewLeave({...newLeave, employee_id: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Type</label>
              <select value={newLeave.type} onChange={e => setNewLeave({...newLeave, type: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm">
                <option>Annual</option><option>Sick</option><option>Unpaid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Reason</label>
              <input required type="text" value={newLeave.reason} onChange={e => setNewLeave({...newLeave, reason: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Start Date</label>
              <input required type="date" value={newLeave.start_date} onChange={e => setNewLeave({...newLeave, start_date: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">End Date</label>
              <input required type="date" value={newLeave.end_date} onChange={e => setNewLeave({...newLeave, end_date: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2 items-end">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Submit</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingLeave && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Edit Request: {editingLeave.name}</h4>
          <form onSubmit={handleEdit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Type</label>
              <select value={editingLeave.type} onChange={e => setEditingLeave({...editingLeave, type: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm">
                <option>Annual</option><option>Sick</option><option>Unpaid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Reason</label>
              <input required type="text" value={editingLeave.reason} onChange={e => setEditingLeave({...editingLeave, reason: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Status</label>
              <select value={editingLeave.status} onChange={e => setEditingLeave({...editingLeave, status: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm">
                <option>Pending</option><option>Approved</option><option>Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Start Date</label>
              <input required type="date" value={editingLeave.start_date} onChange={e => setEditingLeave({...editingLeave, start_date: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">End Date</label>
              <input required type="date" value={editingLeave.end_date} onChange={e => setEditingLeave({...editingLeave, end_date: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2 items-end">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Update</button>
              <button type="button" onClick={() => setEditingLeave(null)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {leaves.map(l => (
          <div key={l.id} className="bg-white p-6 rounded-2xl border border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center font-bold text-lg">{l.name.charAt(0)}</div>
              <div>
                <p className="font-medium">{l.name}</p>
                <p className="text-xs text-black/40">{l.type} Leave • {l.start_date} to {l.end_date}</p>
                <p className="text-sm mt-1 text-black/60 italic">"{l.reason}"</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setEditingLeave(l)}
                className="p-2 text-black/20 hover:text-black transition-colors"
                title="Edit Request"
              >
                <Clock size={18} />
              </button>
              {l.status === 'Pending' ? (
                <>
                  <button onClick={() => handleAction(l.id, 'Approved')} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100"><Check size={20} /></button>
                  <button onClick={() => handleAction(l.id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><X size={20} /></button>
                </>
              ) : (
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase ${
                  l.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>{l.status}</span>
              )}
            </div>
          </div>
        ))}
        {leaves.length === 0 && <div className="text-center p-12 text-black/30">No leave requests found.</div>}
      </div>
    </div>
  );
}
