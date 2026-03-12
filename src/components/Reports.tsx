import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const data = [
  { name: 'Mon', present: 45, absent: 5 },
  { name: 'Tue', present: 48, absent: 2 },
  { name: 'Wed', present: 42, absent: 8 },
  { name: 'Thu', present: 47, absent: 3 },
  { name: 'Fri', present: 44, absent: 6 },
];

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b'];

export function Reports() {
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-medium">HR Analytics & Reports</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-black/5">
          <h4 className="text-sm font-bold text-black/40 uppercase tracking-widest mb-6">Weekly Attendance Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="present" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-black/5">
          <h4 className="text-sm font-bold text-black/40 uppercase tracking-widest mb-6">Department Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'Engineering', value: 40 },
                  { name: 'HR', value: 15 },
                  { name: 'Design', value: 25 },
                  { name: 'Sales', value: 20 },
                ]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {COLORS.map((color, index) => <Cell key={index} fill={color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
