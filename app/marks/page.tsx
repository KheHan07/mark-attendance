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

  useEffect(() => { fetchData(); }, []);

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

  async function saveMarks(student: any, btnId: string) {
    const btn = document.getElementById(btnId) as HTMLButtonElement;
    if(btn) { btn.innerText = "Saving..."; btn.disabled = true; }
    
    await fetch('/api/update-marks', { method: 'POST', body: JSON.stringify(student) });
    
    if(btn) { 
        btn.innerText = "Saved!"; 
        btn.classList.add('bg-green-600', 'text-white'); 
        setTimeout(() => {
            btn.innerText = "Save"; 
            btn.disabled = false; 
            btn.classList.remove('bg-green-600', 'text-white');
        }, 2000); 
    }
  }

  async function sendEmail(student: any) {
    if (!confirm(`Send report card to ${student.name}'s parent?`)) return;
    await fetch('/api/send-report', { method: 'POST', body: JSON.stringify(student) });
    alert('✅ Report Sent!');
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-50 z-10 py-2">
          <Link href="/">
            <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm">
              <span>←</span> Scanner
            </button>
          </Link>
          <h1 className="text-xl font-black text-slate-800">Teacher Dashboard</h1>
        </div>

        {loading ? (
            <div className="text-center p-10 text-slate-400">Loading students...</div>
        ) : (
        <>
          {/* MOBILE VIEW: Card Layout (Visible on small screens) */}
          <div className="md:hidden space-y-4">
            {students.map((s, i) => (
              <div key={s.barcode_id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{s.name}</h3>
                    <p className="text-xs text-slate-400">ID: {s.barcode_id}</p>
                  </div>
                  <button onClick={() => sendEmail(s)} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold">
                    Email Report
                  </button>
                </div>
                
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {['math','science','history','english','ict'].map((sub) => (
                    <div key={sub} className="text-center">
                      <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">{sub.substring(0,3)}</label>
                      <input 
                        type="number" 
                        value={s[sub]} 
                        onChange={(e) => handleChange(i, sub, e.target.value)}
                        className="w-full bg-slate-100 rounded-lg py-2 text-center text-sm font-bold text-black focus:ring-2 focus:ring-indigo-500 outline-none" 
                      />
                    </div>
                  ))}
                </div>

                <button 
                  id={`save-mobile-${s.barcode_id}`}
                  onClick={() => saveMarks(s, `save-mobile-${s.barcode_id}`)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold active:scale-95 transition-transform"
                >
                  Save Changes
                </button>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: Table Layout (Visible on larger screens) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Student Name</th>
                  {['Math', 'Sci', 'Hist', 'Eng', 'ICT'].map(h => (
                    <th key={h} className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">{h}</th>
                  ))}
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, i) => (
                  <tr key={s.barcode_id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-700">{s.name}</td>
                    {['math','science','history','english','ict'].map(sub => (
                      <td key={sub} className="p-2 text-center">
                        <input 
                          type="number" 
                          value={s[sub]} 
                          onChange={(e) => handleChange(i, sub, e.target.value)}
                          className="w-14 h-10 text-center bg-slate-100 rounded-lg text-black font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                      </td>
                    ))}
                    <td className="p-4 text-right space-x-2">
                      <button 
                        id={`save-desk-${s.barcode_id}`}
                        onClick={() => saveMarks(s, `save-desk-${s.barcode_id}`)} 
                        className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-black"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => sendEmail(s)} 
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100"
                      >
                        Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
        )}
      </div>
    </main>
  );
}