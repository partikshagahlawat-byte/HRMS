/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Employee } from '../types';
import { User as UserIcon, Mail, Briefcase, Building, Calendar, DollarSign, Save, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  user: User;
}

export function Profile({ user }: ProfileProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
  });

  useEffect(() => {
    if (user.employee_id) {
      fetch(`/api/employees/${user.employee_id}`)
        .then(res => res.json())
        .then(data => {
          setEmployee(data);
          setFormData({
            name: data.name,
            email: data.email,
            role: data.role,
            department: data.department,
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user.employee_id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...employee,
          ...formData
        })
      });
      if (res.ok) {
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>;

  if (!employee) return (
    <div className="bg-white p-8 rounded-3xl border border-black/5 text-center">
      <ShieldCheck className="mx-auto text-black/20 mb-4" size={48} />
      <h3 className="text-xl font-semibold">Admin Account</h3>
      <p className="text-black/40 mt-2">This account is not linked to an employee record.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-3xl bg-black flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-black/10">
            {employee.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{employee.name}</h2>
            <p className="text-black/40 font-medium">{employee.role} • {employee.department}</p>
            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-100">
                {employee.status}
              </span>
              <span className="px-3 py-1 bg-black/5 text-black/40 text-[10px] font-bold rounded-full uppercase tracking-wider">
                ID: #{employee.id}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-black/30 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-black/30 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-black/30 uppercase tracking-widest ml-1">Role</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                <input 
                  type="text" 
                  value={formData.role}
                  readOnly
                  className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl text-sm opacity-50 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-black/30 uppercase tracking-widest ml-1">Department</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                <input 
                  type="text" 
                  value={formData.department}
                  readOnly
                  className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl text-sm opacity-50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-10 py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-black/80 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
            >
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-black/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Calendar size={20} /></div>
            <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Joined Date</p>
          </div>
          <p className="text-xl font-bold">{new Date(employee.joined_date).toLocaleDateString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-black/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><DollarSign size={20} /></div>
            <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Annual Salary</p>
          </div>
          <p className="text-xl font-bold">${employee.salary.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-black/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><ShieldCheck size={20} /></div>
            <p className="text-xs font-bold text-black/30 uppercase tracking-widest">Account Type</p>
          </div>
          <p className="text-xl font-bold">{user.role}</p>
        </div>
      </div>
    </div>
  );
}
