import React, { useState, useEffect } from 'react';
import { HRDocument } from '../types';
import { FileText, Download, Search, Plus } from 'lucide-react';

export function Documentation() {
  const [docs, setDocs] = useState<HRDocument[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingDoc, setEditingDoc] = useState<HRDocument | null>(null);
  const [newDoc, setNewDoc] = useState({ name: '', type: 'Policy', url: '#' });

  const fetchData = () => {
    fetch('/api/documents').then(res => res.json()).then(setDocs);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDoc)
    });
    setShowAdd(false);
    fetchData();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    await fetch(`/api/documents/${editingDoc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingDoc)
    });
    setEditingDoc(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Policy & Documentation</h3>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium"><Plus size={18} /> Upload Doc</button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Document Name</label>
              <input required type="text" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" placeholder="Employee Handbook" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Type</label>
              <select value={newDoc.type} onChange={e => setNewDoc({...newDoc, type: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm">
                <option>Policy</option><option>Legal</option><option>Guide</option><option>Form</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">URL / Link</label>
              <input required type="text" value={newDoc.url} onChange={e => setNewDoc({...newDoc, url: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" placeholder="#" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Save</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingDoc && (
        <div className="bg-white p-6 rounded-2xl border border-black/5">
          <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Edit Document: {editingDoc.name}</h4>
          <form onSubmit={handleEdit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Document Name</label>
              <input required type="text" value={editingDoc.name} onChange={e => setEditingDoc({...editingDoc, name: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">Type</label>
              <select value={editingDoc.type} onChange={e => setEditingDoc({...editingDoc, type: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm">
                <option>Policy</option><option>Legal</option><option>Guide</option><option>Form</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-black/40 uppercase mb-1">URL / Link</label>
              <input required type="text" value={editingDoc.url} onChange={e => setEditingDoc({...editingDoc, url: e.target.value})} className="w-full px-4 py-2 bg-black/5 rounded-xl text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">Update</button>
              <button type="button" onClick={() => setEditingDoc(null)} className="px-4 py-2 bg-black/5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map(doc => (
          <div key={doc.id} className="bg-white p-6 rounded-2xl border border-black/5 hover:border-black/20 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-black/5 rounded-xl text-black/40 group-hover:bg-black group-hover:text-white transition-colors">
                <FileText size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingDoc(doc)} className="p-2 text-black/20 hover:text-black" title="Edit"><Plus size={18} className="rotate-45" /></button>
                <button className="p-2 text-black/20 hover:text-black" title="Download"><Download size={18} /></button>
              </div>
            </div>
            <h4 className="font-semibold text-sm mb-1">{doc.name}</h4>
            <p className="text-xs text-black/40 uppercase font-bold tracking-wider">{doc.type}</p>
            <p className="text-[10px] text-black/20 mt-4">Updated {new Date(doc.date).toLocaleDateString()}</p>
          </div>
        ))}
        {docs.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-dashed border-black/10">
            <p className="text-black/40">No documents uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
