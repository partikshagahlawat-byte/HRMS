import React, { useState } from 'react';
import { UserPlus, Edit2, X } from 'lucide-react';
import { Employee } from '../types';

export function EmployeeList({ employees, onRefresh }: { employees: Employee[], onRefresh: () => void }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [newEmp, setNewEmp] = useState({ name: '', email: '', role: '', department: '', salary: 50000 });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp)
    });
    setShowAddModal(false);
    setNewEmp({ name: '', email: '', role: '', department: '', salary: 50000 });
    onRefresh();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    await fetch(`/api/employees/${editingEmp.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingEmp)
    });
    setEditingEmp(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Employee Directory</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors"
        >
          <UserPlus size={18} />
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-black/5 bg-black/[0.02]">
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase tracking-wider">Role & Dept</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase tracking-wider">Salary</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-black/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center font-medium">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{emp.name}</p>
                        <p className="text-xs text-black/40">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{emp.role}</p>
                    <p className="text-xs text-black/40">{emp.department}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    ${emp.salary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                      emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-black/40">
                    {new Date(emp.joined_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setEditingEmp(emp)}
                      className="p-2 text-black/20 hover:text-black transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="text-black/40 hover:text-black"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Full Name</label>
                <input required type="text" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none" placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Email Address</label>
                <input required type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none" placeholder="john@nexus.ai" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Role</label>
                  <input required type="text" value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none" placeholder="Engineer" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Department</label>
                  <input required type="text" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none" placeholder="Engineering" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Salary</label>
                <input required type="number" value={newEmp.salary} onChange={e => setNewEmp({...newEmp, salary: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-black/5 text-black font-medium rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-black text-white font-medium rounded-xl">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingEmp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Employee</h3>
              <button onClick={() => setEditingEmp(null)} className="text-black/40 hover:text-black"><X size={20} /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Full Name</label>
                <input required type="text" value={editingEmp.name} onChange={e => setEditingEmp({...editingEmp, name: e.target.value})} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Email Address</label>
                <input required type="email" value={editingEmp.email} onChange={e => setEditingEmp({...editingEmp, email: e.target.value})} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Role</label>
                  <input required type="text" value={editingEmp.role} onChange={e => setEditingEmp({...editingEmp, role: e.target.value})} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Department</label>
                  <input required type="text" value={editingEmp.department} onChange={e => setEditingEmp({...editingEmp, department: e.target.value})} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Salary</label>
                  <input required type="number" value={editingEmp.salary} onChange={e => setEditingEmp({...editingEmp, salary: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">Status</label>
                  <select value={editingEmp.status} onChange={e => setEditingEmp({...editingEmp, status: e.target.value})} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingEmp(null)} className="flex-1 px-4 py-3 bg-black/5 text-black font-medium rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-black text-white font-medium rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
