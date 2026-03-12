import React, { useState, useEffect } from 'react';
import { AttendanceStats, AttendanceRaw, AttendanceSheetItem } from '../types';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export function Attendance() {
  const [stats, setStats] = useState<AttendanceStats[]>([]);
  const [raw, setRaw] = useState<AttendanceRaw[]>([]);
  const [sheet, setSheet] = useState<AttendanceSheetItem[]>([]);
  const [view, setView] = useState<'stats' | 'raw' | 'sheet'>('sheet');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingAtt, setEditingAtt] = useState<AttendanceRaw | null>(null);
  const [newAtt, setNewAtt] = useState({ employee_id: '', status: 'On Time', clock_in: '09:00', clock_out: '17:00' });

  const fetchData = () => {
    fetch('/api/attendance').then(res => res.json()).then(setStats);
    fetch('/api/attendance/raw').then(res => res.json()).then(setRaw);
  };

  const fetchSheet = () => {
    fetch(`/api/attendance/sheet?date=${selectedDate}`).then(res => res.json()).then(setSheet);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (view === 'sheet') fetchSheet();
  }, [selectedDate, view]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAtt)
    });
    setShowAdd(false);
    fetchData();
    if (view === 'sheet') fetchSheet();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAtt) return;
    await fetch(`/api/attendance/${editingAtt.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingAtt)
    });
    setEditingAtt(null);
    fetchData();
    if (view === 'sheet') fetchSheet();
  };

  const handleUpsert = async (employeeId: number, status: string) => {
    await fetch('/api/attendance/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: employeeId,
        date: selectedDate,
        status: status,
        clock_in: status === 'Absent' ? null : '09:00',
        clock_out: status === 'Absent' ? null : '17:00'
      })
    });
    fetchSheet();
    fetchData();
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Attendance Management</h3>
        <div className="flex gap-4 items-center">
          <div className="flex bg-black/5 p-1 rounded-xl">
            <button onClick={() => setView('sheet')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'sheet' ? 'bg-white shadow-sm' : 'text-black/40'}`}>Attendance Sheet</button>
            <button onClick={() => setView('stats')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'stats' ? 'bg-white shadow-sm' : 'text-black/40'}`}>Department Stats</button>
            <button onClick={() => setView('raw')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'raw' ? 'bg-white shadow-sm' : 'text-black/40'}`}>Daily Logs</button>
          </div>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Manual Entry</button>
        </div>
      </div>

      {view === 'sheet' && (
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-black/5">
          <div className="flex items-center gap-2">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-black/5 rounded-lg"><ChevronLeft size={18} /></button>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-black/5 rounded-xl text-sm font-medium focus:outline-none"
            />
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-black/5 rounded-lg"><ChevronRight size={18} /></button>
          </div>
          <div className="h-4 w-px bg-black/10" />
          <p className="text-sm text-black/40 font-medium">Quick Mark: Click on status to update</p>
        </div>
      )}

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Employee ID</label>
              <input required type="number" value={newAtt.employee_id} onChange={e => setNewAtt({...newAtt, employee_id: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" placeholder="1" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Status</label>
              <select value={newAtt.status} onChange={e => setNewAtt({...newAtt, status: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm">
                <option>On Time</option><option>Late</option><option>Absent</option><option>On Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Clock In</label>
              <input type="time" value={newAtt.clock_in} onChange={e => setNewAtt({...newAtt, clock_in: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingAtt && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Edit Log: {editingAtt.name}</h4>
          <form onSubmit={handleEdit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Status</label>
              <select value={editingAtt.status} onChange={e => setEditingAtt({...editingAtt, status: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm">
                <option>On Time</option><option>Late</option><option>Absent</option><option>On Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Clock In</label>
              <input type="time" value={editingAtt.clock_in} onChange={e => setEditingAtt({...editingAtt, clock_in: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Clock Out</label>
              <input type="time" value={editingAtt.clock_out} onChange={e => setEditingAtt({...editingAtt, clock_out: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Update</button>
              <button type="button" onClick={() => setEditingAtt(null)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {view === 'sheet' && (
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black/[0.02] border-b border-black/5">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Department</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {sheet.map(item => (
                <tr key={item.employee_id} className="hover:bg-black/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-[10px] text-black/40">ID: {item.employee_id}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-black/40">{item.department}</td>
                  <td className="px-6 py-4">
                    {item.status ? (
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        item.status === 'On Time' ? 'bg-emerald-50 text-emerald-600' :
                        item.status === 'Late' ? 'bg-amber-50 text-amber-600' : 
                        item.status === 'On Leave' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-600'
                      }`}>{item.status}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-black/20 uppercase tracking-wider">Not Marked</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpsert(item.employee_id, 'On Time')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${item.status === 'On Time' ? 'bg-emerald-500 text-white' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
                      >P</button>
                      <button 
                        onClick={() => handleUpsert(item.employee_id, 'Late')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${item.status === 'Late' ? 'bg-amber-500 text-white' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
                      >L</button>
                      <button 
                        onClick={() => handleUpsert(item.employee_id, 'Absent')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${item.status === 'Absent' ? 'bg-red-500 text-white' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
                      >A</button>
                      <button 
                        onClick={() => handleUpsert(item.employee_id, 'On Leave')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${item.status === 'On Leave' ? 'bg-purple-500 text-white' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
                      >O</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map(s => (
            <div key={s.department} className="bg-white p-6 rounded-2xl border border-black/5">
              <h4 className="font-semibold mb-4">{s.department}</h4>
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="Present" value={s.on_time + s.late} icon={<CheckCircle className="text-emerald-500" size={14} />} />
                <StatItem label="Absent" value={s.absent} icon={<XCircle className="text-red-500" size={14} />} />
                <StatItem label="On Time" value={s.on_time} icon={<Clock className="text-blue-500" size={14} />} />
                <StatItem label="Late" value={s.late} icon={<AlertCircle className="text-amber-500" size={14} />} />
                <StatItem label="On Leave" value={s.on_leave} icon={<Calendar className="text-purple-500" size={14} />} />
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'raw' && (
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black/[0.02] border-b border-black/5">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Clock In</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Clock Out</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/40 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {raw.map(r => (
                <tr key={r.id} className="group hover:bg-black/[0.01] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{r.name}</td>
                  <td className="px-6 py-4 text-sm text-black/40">{r.date}</td>
                  <td className="px-6 py-4 text-sm">{r.clock_in || '-'}</td>
                  <td className="px-6 py-4 text-sm">{r.clock_out || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      r.status === 'On Time' ? 'bg-emerald-50 text-emerald-600' :
                      r.status === 'Late' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setEditingAtt(r)}
                      className="p-2 text-black/20 hover:text-black transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Clock size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="p-3 bg-black/[0.02] rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-black/50">{label}</span>
      </div>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}
