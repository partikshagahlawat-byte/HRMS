import React, { useState } from 'react';
import { BrainCircuit, Clock, CheckCircle2, Users } from 'lucide-react';
import { generateInterviewQuestions } from '../services/geminiService';

export function AITools() {
  const [role, setRole] = useState('');
  const [seniority, setSeniority] = useState('Senior');
  const [questions, setQuestions] = useState<{ technical: string[], behavioral: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const res = await generateInterviewQuestions(role, seniority);
      setQuestions(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-purple-500 rounded-2xl"><BrainCircuit className="text-white" /></div>
          <div>
            <h3 className="text-xl font-semibold">Interview Question Generator</h3>
            <p className="text-sm text-black/40">Generate tailored interview questions using AI</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <input type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none" placeholder="e.g. Frontend Developer" />
          <select value={seniority} onChange={e => setSeniority(e.target.value)} className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm focus:outline-none appearance-none">
            <option>Junior</option><option>Mid-Level</option><option>Senior</option><option>Lead / Manager</option>
          </select>
        </div>
        <button onClick={handleGenerate} disabled={loading || !role} className="w-full py-4 bg-black text-white rounded-2xl font-medium disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Clock className="animate-spin" /> : <BrainCircuit size={20} />} {loading ? 'Generating...' : 'Generate Questions'}
        </button>
      </div>
      {questions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-black/5">
            <h4 className="text-sm font-bold text-black/40 uppercase tracking-widest mb-6 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Technical</h4>
            <div className="space-y-4">{questions.technical.map((q, i) => <div key={i} className="p-4 bg-black/[0.02] rounded-2xl text-sm">{q}</div>)}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-black/5">
            <h4 className="text-sm font-bold text-black/40 uppercase tracking-widest mb-6 flex items-center gap-2"><Users size={16} className="text-blue-500" /> Behavioral</h4>
            <div className="space-y-4">{questions.behavioral.map((q, i) => <div key={i} className="p-4 bg-black/[0.02] rounded-2xl text-sm">{q}</div>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
