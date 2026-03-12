/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, LayoutDashboard, MessageSquare, Search, BrainCircuit, 
  Clock, DollarSign, Calendar, Star, FileText, LogOut, Lock, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Employee, Job, User } from './types';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { Recruitment } from './components/Recruitment';
import { AITools } from './components/AITools';
import { HRAssistant } from './components/HRAssistant';
import { Attendance } from './components/Attendance';
import { LeaveManagement } from './components/LeaveManagement';
import { PayrollManagement } from './components/PayrollManagement';
import { ShiftSetup } from './components/ShiftSetup';
import { Performance } from './components/Performance';
import { Reports } from './components/Reports';
import { Documentation } from './components/Documentation';
import { Profile } from './components/Profile';

type View = 'dashboard' | 'employees' | 'recruitment' | 'ai-tools' | 'chat' | 'attendance' | 'leaves' | 'payroll' | 'shifts' | 'performance' | 'reports' | 'docs' | 'profile';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      if (parsed.role === 'Employee') setActiveView('profile');
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'Admin') fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, jobRes] = await Promise.all([fetch('/api/employees'), fetch('/api/jobs')]);
      setEmployees(await empRes.json());
      setJobs(await jobRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_user');
    setUser(null);
  };

  if (!user) return <Login onLogin={(u) => { 
    setUser(u); 
    localStorage.setItem('nexus_user', JSON.stringify(u)); 
    if (u.role === 'Employee') setActiveView('profile');
  }} />;

  const isAdmin = user.role === 'Admin';

  return (
    <div className="flex h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans">
      <aside className="w-64 bg-white border-r border-black/5 flex flex-col overflow-y-auto">
        <div className="p-6 flex items-center gap-3 sticky top-0 bg-white z-10">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center"><BrainCircuit className="text-white w-5 h-5" /></div>
          <h1 className="text-xl font-semibold tracking-tight">HRMS</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 pb-6">
          <SectionLabel label="Personal" />
          <NavItem icon={<Star size={18} />} label="My Profile" active={activeView === 'profile'} onClick={() => setActiveView('profile')} />
          <NavItem icon={<Calendar size={18} />} label="My Leaves" active={activeView === 'leaves'} onClick={() => setActiveView('leaves')} />
          <NavItem icon={<MessageSquare size={18} />} label="AI Assistant" active={activeView === 'chat'} onClick={() => setActiveView('chat')} />

          {isAdmin && (
            <>
              <SectionLabel label="Admin Dashboard" />
              <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
              <NavItem icon={<Users size={18} />} label="Employees" active={activeView === 'employees'} onClick={() => setActiveView('employees')} />
              <NavItem icon={<Briefcase size={18} />} label="Recruitment" active={activeView === 'recruitment'} onClick={() => setActiveView('recruitment')} />
              
              <SectionLabel label="Operations" />
              <NavItem icon={<Clock size={18} />} label="Attendance" active={activeView === 'attendance'} onClick={() => setActiveView('attendance')} />
              <NavItem icon={<DollarSign size={18} />} label="Payroll" active={activeView === 'payroll'} onClick={() => setActiveView('payroll')} />
              <NavItem icon={<Clock size={18} />} label="Shift Setup" active={activeView === 'shifts'} onClick={() => setActiveView('shifts')} />
              
              <SectionLabel label="Talent & Strategy" />
              <NavItem icon={<Star size={18} />} label="Performance" active={activeView === 'performance'} onClick={() => setActiveView('performance')} />
              <NavItem icon={<BrainCircuit size={18} />} label="AI Tools" active={activeView === 'ai-tools'} onClick={() => setActiveView('ai-tools')} />
              <NavItem icon={<LayoutDashboard size={18} />} label="Reports" active={activeView === 'reports'} onClick={() => setActiveView('reports')} />
              <NavItem icon={<FileText size={18} />} label="Documentation" active={activeView === 'docs'} onClick={() => setActiveView('docs')} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-black/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium capitalize">{activeView.replace('-', ' ')}</h2>
            {isAdmin && <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded uppercase tracking-widest">Admin Mode</span>}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 w-4 h-4" />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-black/5 rounded-full text-sm focus:outline-none w-64" />
            </div>
            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center font-bold text-xs">
              {user.email.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeView === 'profile' && <Profile user={user} />}
              {activeView === 'dashboard' && isAdmin && <Dashboard employees={employees} jobs={jobs} />}
              {activeView === 'employees' && isAdmin && <EmployeeList employees={employees} onRefresh={fetchData} />}
              {activeView === 'recruitment' && isAdmin && <Recruitment jobs={jobs} />}
              {activeView === 'ai-tools' && isAdmin && <AITools />}
              {activeView === 'chat' && <HRAssistant />}
              {activeView === 'attendance' && isAdmin && <Attendance />}
              {activeView === 'leaves' && <LeaveManagement />}
              {activeView === 'payroll' && isAdmin && <PayrollManagement />}
              {activeView === 'shifts' && isAdmin && <ShiftSetup />}
              {activeView === 'performance' && isAdmin && <Performance />}
              {activeView === 'reports' && isAdmin && <Reports />}
              {activeView === 'docs' && <Documentation />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <p className="px-4 pt-6 pb-2 text-[10px] font-bold text-black/30 uppercase tracking-widest">{label}</p>;
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-black/60 hover:bg-black/5 hover:text-black'}`}>
      {icon} {label}
    </button>
  );
}

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('admin@nexus.ai');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) onLogin(await res.json());
    else setError('Invalid email or password');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[32px] p-10 shadow-2xl shadow-black/5">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/20"><BrainCircuit className="text-white w-10 h-10" /></div>
          <h1 className="text-3xl font-bold tracking-tight">HRMS</h1>
          <p className="text-black/40 text-sm mt-2">Sign in to your workspace</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5" placeholder="admin@nexus.ai" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5" placeholder="••••••••" />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}
          <button type="submit" className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-black/80 transition-all shadow-xl shadow-black/10">Continue to Dashboard</button>
        </form>
      </motion.div>
    </div>
  );
}
