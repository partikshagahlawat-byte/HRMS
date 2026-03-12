import React from 'react';
import { Users, Briefcase, BrainCircuit, Plus, FileText, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { Employee, Job } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#000000', '#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export function Dashboard({ employees, jobs }: { employees: Employee[], jobs: Job[] }) {
  const deptData = employees.reduce((acc: any[], emp) => {
    const existing = acc.find(d => d.name === emp.department);
    if (existing) existing.value++;
    else acc.push({ name: emp.department, value: 1 });
    return acc;
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Employees" value={employees.length.toString()} icon={<Users className="text-blue-500" />} trend="+2 this month" />
        <StatCard label="Open Positions" value={jobs.length.toString()} icon={<Briefcase className="text-emerald-500" />} trend="3 active listings" />
        <StatCard label="AI Screenings" value="24" icon={<BrainCircuit className="text-purple-500" />} trend="Last 7 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
            <h3 className="text-sm font-bold text-black/30 uppercase tracking-widest mb-8">Department Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-black/5">
              <h3 className="text-sm font-semibold text-black/40 uppercase tracking-wider mb-6">Recent Hires</h3>
              <div className="space-y-4">
                {employees.slice(0, 3).map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center font-medium">{emp.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium">{emp.name}</p>
                        <p className="text-xs text-black/50">{emp.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-black/40">{emp.department}</p>
                      <p className="text-[10px] text-black/30">Joined {new Date(emp.joined_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-black/5">
              <h3 className="text-sm font-semibold text-black/40 uppercase tracking-wider mb-6">Active Jobs</h3>
              <div className="space-y-4">
                {jobs.slice(0, 3).map(job => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-black/50">{job.location} • {job.type}</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md uppercase tracking-wider">{job.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-black text-white p-8 rounded-[32px] shadow-2xl shadow-black/20">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <QuickAction icon={<Plus size={18} />} label="Add Employee" />
              <QuickAction icon={<FileText size={18} />} label="Post New Job" />
              <QuickAction icon={<Calendar size={18} />} label="Approve Leaves" />
              <QuickAction icon={<DollarSign size={18} />} label="Run Payroll" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
            <h3 className="text-xs font-bold text-black/30 uppercase tracking-widest mb-6">AI Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-xs font-medium text-purple-900 leading-relaxed">
                  "Retention rate is up 12% this quarter. Engineering department shows highest engagement scores."
                </p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-xs font-medium text-emerald-900 leading-relaxed">
                  "Average time-to-hire decreased by 4 days since implementing AI screening."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-medium transition-all group">
      <span className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white group-hover:text-black transition-all">{icon}</span>
      {label}
    </button>
  );
}

function StatCard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-black/5 rounded-lg">{icon}</div>
        <span className="text-xs font-medium text-black/40">{trend}</span>
      </div>
      <p className="text-3xl font-light tracking-tight mb-1">{value}</p>
      <p className="text-sm text-black/50">{label}</p>
    </div>
  );
}
