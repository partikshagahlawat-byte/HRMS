import React, { useState, useEffect } from 'react';
import { Payroll } from '../types';
import { DollarSign, Download } from 'lucide-react';

export function PayrollManagement() {
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingPay, setEditingPay] = useState<Payroll | null>(null);
  const [newPay, setNewPay] = useState({ employee_id: '', month: 'March', year: 2026, net_pay: '' });

  const fetchData = () => {
    fetch('/api/payroll').then(res => res.json()).then(setPayroll);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/payroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPay)
    });
    setShowAdd(false);
    fetchData();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPay) return;
    await fetch(`/api/payroll/${editingPay.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingPay)
    });
    setEditingPay(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Payroll Overview</h3>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Process Payroll</button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Employee ID</label>
              <input required type="number" value={newPay.employee_id} onChange={e => setNewPay({...newPay, employee_id: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Month</label>
              <input required type="text" value={newPay.month} onChange={e => setNewPay({...newPay, month: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Net Pay</label>
              <input required type="number" value={newPay.net_pay} onChange={e => setNewPay({...newPay, net_pay: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingPay && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Edit Payroll: {editingPay.name}</h4>
          <form onSubmit={handleEdit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Month</label>
              <input required type="text" value={editingPay.month} onChange={e => setEditingPay({...editingPay, month: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Net Pay</label>
              <input required type="number" value={editingPay.net_pay} onChange={e => setEditingPay({...editingPay, net_pay: Number(e.target.value)})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Status</label>
              <select value={editingPay.status} onChange={e => setEditingPay({...editingPay, status: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm">
                <option>Pending</option><option>Paid</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Update</button>
              <button type="button" onClick={() => setEditingPay(null)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black/[0.02] border-b border-black/5">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Employee</th>
              <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Month</th>
              <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Base Salary</th>
              <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Net Pay</th>
              <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {payroll.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4 text-sm text-black/40">{p.month} {p.year}</td>
                <td className="px-6 py-4 text-sm">${p.salary.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-bold text-emerald-600">${p.net_pay.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    p.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>{p.status}</span>
                </td>
                <td className="px-6 py-4 text-right flex gap-2 justify-end">
                  <button onClick={() => setEditingPay(p)} className="p-2 text-black/20 hover:text-black" title="Edit"><DollarSign size={18} /></button>
                  <button className="p-2 text-black/20 hover:text-black" title="Download"><Download size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
