import React, { useState, useEffect } from 'react';
import { Briefcase, BrainCircuit, Clock, Plus } from 'lucide-react';
import { Job, Applicant } from '../types';
import { screenResume } from '../services/geminiService';

export function Recruitment({ jobs }: { jobs: Job[] }) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isScreening, setIsScreening] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [newJob, setNewJob] = useState({ title: '', department: '', location: 'Remote', type: 'Full-time', description: '' });
  const [showAddApp, setShowAddApp] = useState(false);
  const [editingApp, setEditingApp] = useState<Applicant | null>(null);
  const [newApp, setNewApp] = useState({ name: '', email: '', resume_text: '' });

  useEffect(() => {
    if (selectedJob) {
      fetch(`/api/applicants/${selectedJob.id}`).then(res => res.json()).then(setApplicants);
    }
  }, [selectedJob]);

  const handleAddApp = async () => {
    if (!selectedJob) return;
    await fetch('/api/applicants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newApp, job_id: selectedJob.id })
    });
    setShowAddApp(false);
    setNewApp({ name: '', email: '', resume_text: '' });
    fetch(`/api/applicants/${selectedJob.id}`).then(res => res.json()).then(setApplicants);
  };

  const handleEditApp = async () => {
    if (!editingApp || !selectedJob) return;
    await fetch(`/api/applicants/update/${editingApp.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingApp)
    });
    setEditingApp(null);
    fetch(`/api/applicants/${selectedJob.id}`).then(res => res.json()).then(setApplicants);
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJob)
    });
    setShowAdd(false);
    window.location.reload();
  };

  const handleEditJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    await fetch(`/api/jobs/${editingJob.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingJob)
    });
    setEditingJob(null);
    window.location.reload();
  };

  const handleScreen = async (applicant: Applicant) => {
    if (!selectedJob) return;
    setIsScreening(true);
    try {
      const result = await screenResume(selectedJob.description, applicant.resume_text);
      setApplicants(applicants.map(a => a.id === applicant.id ? { ...a, ai_score: result.score, ai_feedback: result.feedback } : a));
    } catch (error) {
      console.error('Screening failed:', error);
    } finally {
      setIsScreening(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-black/40 uppercase tracking-wider">Recruitment Pipeline</h3>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Post New Job</button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input required type="text" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="px-4 py-2 bg-black/5 rounded-xl text-sm" placeholder="Job Title" />
            <input required type="text" value={newJob.department} onChange={e => setNewJob({...newJob, department: e.target.value})} className="px-4 py-2 bg-black/5 rounded-xl text-sm" placeholder="Department" />
            <input required type="text" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="px-4 py-2 bg-black/5 rounded-xl text-sm" placeholder="Location" />
            <select value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})} className="px-4 py-2 bg-black/5 rounded-xl text-sm">
              <option>Full-time</option><option>Part-time</option><option>Contract</option>
            </select>
            <input required type="text" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="col-span-2 px-4 py-2 bg-black/5 rounded-xl text-sm" placeholder="Job Description" />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Post</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingJob && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Edit Job: {editingJob.title}</h4>
          <form onSubmit={handleEditJob} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input required type="text" value={editingJob.title} onChange={e => setEditingJob({...editingJob, title: e.target.value})} className="px-4 py-2 bg-black/5 rounded-xl text-sm" />
            <input required type="text" value={editingJob.department} onChange={e => setEditingJob({...editingJob, department: e.target.value})} className="px-4 py-2 bg-black/5 rounded-xl text-sm" />
            <input required type="text" value={editingJob.location} onChange={e => setEditingJob({...editingJob, location: e.target.value})} className="px-4 py-2 bg-black/5 rounded-xl text-sm" />
            <select value={editingJob.type} onChange={e => setEditingJob({...editingJob, type: e.target.value})} className="px-4 py-2 bg-black/5 rounded-xl text-sm">
              <option>Full-time</option><option>Part-time</option><option>Contract</option>
            </select>
            <input required type="text" value={editingJob.description} onChange={e => setEditingJob({...editingJob, description: e.target.value})} className="col-span-2 px-4 py-2 bg-black/5 rounded-xl text-sm" />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Update</button>
              <button type="button" onClick={() => setEditingJob(null)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-black/40 uppercase tracking-wider">Active Listings</h3>
          {jobs.map(job => (
            <button key={job.id} onClick={() => setSelectedJob(job)} className={`w-full text-left p-4 rounded-2xl border transition-all relative group ${selectedJob?.id === job.id ? 'bg-black border-black text-white shadow-lg' : 'bg-white border-black/5 hover:border-black/20'}`}>
              <p className="font-medium">{job.title}</p>
              <p className={`text-xs ${selectedJob?.id === job.id ? 'text-white/60' : 'text-black/40'}`}>{job.department} • {job.location}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setEditingJob(job); }}
                className="absolute right-2 top-2 p-1 text-black/20 hover:text-black group-hover:opacity-100 opacity-0 transition-opacity"
              >
                <Plus size={14} className="rotate-45" />
              </button>
            </button>
          ))}
        </div>
        <div className="lg:col-span-2">
          {selectedJob ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-black/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedJob.title}</h3>
                    <p className="text-sm text-black/40">{selectedJob.description.substring(0, 100)}...</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-black/40 uppercase tracking-wider">Applicants</h3>
                  <button onClick={() => setShowAddApp(true)} className="px-3 py-1 bg-black/5 text-black rounded-lg text-xs font-medium">Add Applicant</button>
                </div>

                {showAddApp && (
                  <div className="bg-black/5 p-4 rounded-xl space-y-3">
                    <input required type="text" value={newApp.name} onChange={e => setNewApp({...newApp, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-black/10 rounded-lg text-sm" placeholder="Applicant Name" />
                    <input required type="email" value={newApp.email} onChange={e => setNewApp({...newApp, email: e.target.value})} className="w-full px-3 py-2 bg-white border border-black/10 rounded-lg text-sm" placeholder="Email" />
                    <textarea required value={newApp.resume_text} onChange={e => setNewApp({...newApp, resume_text: e.target.value})} className="w-full px-3 py-2 bg-white border border-black/10 rounded-lg text-sm" placeholder="Paste Resume Text" rows={3} />
                    <div className="flex gap-2">
                      <button onClick={handleAddApp} className="flex-1 py-2 bg-black text-white rounded-lg text-xs font-medium">Save</button>
                      <button onClick={() => setShowAddApp(false)} className="flex-1 py-2 bg-black/10 text-black rounded-lg text-xs font-medium">Cancel</button>
                    </div>
                  </div>
                )}
                {editingApp && (
                  <div className="bg-black/5 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase">Edit Applicant: {editingApp.name}</h4>
                    <input required type="text" value={editingApp.name} onChange={e => setEditingApp({...editingApp, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-black/10 rounded-lg text-sm" />
                    <input required type="email" value={editingApp.email} onChange={e => setEditingApp({...editingApp, email: e.target.value})} className="w-full px-3 py-2 bg-white border border-black/10 rounded-lg text-sm" />
                    <textarea required value={editingApp.resume_text} onChange={e => setEditingApp({...editingApp, resume_text: e.target.value})} className="w-full px-3 py-2 bg-white border border-black/10 rounded-lg text-sm" rows={3} />
                    <div className="flex gap-2">
                      <button onClick={handleEditApp} className="flex-1 py-2 bg-black text-white rounded-lg text-xs font-medium">Update</button>
                      <button onClick={() => setEditingApp(null)} className="flex-1 py-2 bg-black/10 text-black rounded-lg text-xs font-medium">Cancel</button>
                    </div>
                  </div>
                )}
                {applicants.map(app => (
                  <div key={app.id} className="bg-white p-6 rounded-2xl border border-black/5 space-y-4 relative group">
                    <button 
                      onClick={() => setEditingApp(app)}
                      className="absolute right-4 top-4 p-1 text-black/20 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus size={14} className="rotate-45" />
                    </button>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center font-medium">{app.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium">{app.name}</p>
                          <p className="text-xs text-black/40">{app.email}</p>
                        </div>
                      </div>
                      <div>
                        {app.ai_score ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-100">
                            <BrainCircuit size={14} />
                            <span className="text-xs font-bold">{app.ai_score}% Match</span>
                          </div>
                        ) : (
                          <button onClick={() => handleScreen(app)} disabled={isScreening} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-xs font-medium disabled:opacity-50">
                            {isScreening ? <Clock size={14} className="animate-spin" /> : <BrainCircuit size={14} />} AI Screen
                          </button>
                        )}
                      </div>
                    </div>
                    {app.ai_feedback && <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100/50"><p className="text-xs text-purple-900 leading-relaxed italic">" {app.ai_feedback} "</p></div>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-black/10">
              <Briefcase size={48} className="text-black/10 mb-4" />
              <h3 className="text-lg font-medium text-black/40">Select a job to view applicants</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
