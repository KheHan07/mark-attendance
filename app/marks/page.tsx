'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MarksPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase.from('students').select('*').order('barcode_id');
    if (data) setStudents(data);
    setLoading(false);
  }

  function handleChange(index: number, field: string, value: string) {
    const newStudents = [...students];
    newStudents[index][field] = parseInt(value) || 0;
    setStudents(newStudents);
  }

  async function saveMarks(student: any) {
    // Show a quick visual feedback instead of alert
    const btn = document.getElementById(`save-${student.barcode_id}`) as HTMLButtonElement;
    if(btn) { btn.innerText = "Saving..."; btn.disabled = true; }
    
    await fetch('/api/update-marks', { method: 'POST', body: JSON.stringify(student) });
    
    if(btn) { btn.innerText = "Saved!"; btn.classList.add('bg-green-600'); setTimeout(() => {
        btn.innerText = "Save"; btn.disabled = false; btn.classList.remove('bg-green-600');
    }, 2000); }
  }

  async function sendEmail(student: any) {
    if (!confirm(`Send report card to ${student.name}'s parent?`)) return;
    await fetch('/api/send-report', { method: 'POST', body: JSON.stringify(student) });
    alert('✅ Report Sent!');
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
              <span>←</span> Scanner
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Teacher Dashboard</h1>
        </div>

        {loading ? (
            <div className="text-center p-10 text-slate-400">Loading students...</div>
        ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                  {['Math', 'Sci', 'Hist', 'Eng', 'ICT'].map(h => (
                    <th key={h} className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">{h}</th>
                  ))}
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, i) => (
                  <tr key={s.barcode_id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-700">{s.name}</td>
                    {['math','science','history','english','ict'].map(sub => (
                      <td key={sub} className="p-2 text-center">
                        <input 
                          type="number" 
                          value={s[sub]} 
                          onChange={(e) => handleChange(i, sub, e.target.value)}
                          className="w-12 h-10 text-center bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm" 
                        />
                      </td>
                    ))}
                    <td className="p-4 text-right space-x-2">
                      <button 
                        id={`save-${s.barcode_id}`}
                        onClick={() => saveMarks(s)} 
                        className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => sendEmail(s)} 
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Email Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </main>
  );
}