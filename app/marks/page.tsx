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

  useEffect(() => {
    supabase.from('students').select('*').order('barcode_id').then(({ data }) => {
      if (data) setStudents(data);
    });
  }, []);

  function handleChange(index: number, field: string, value: string) {
    const newStudents = [...students];
    newStudents[index][field] = parseInt(value) || 0;
    setStudents(newStudents);
  }

  async function saveMarks(student: any) {
    alert('Saving...');
    await fetch('/api/update-marks', { method: 'POST', body: JSON.stringify(student) });
    alert('Saved!');
  }

  async function sendEmail(student: any) {
    if (!confirm(`Send report to parent?`)) return;
    alert('Sending...');
    const res = await fetch('/api/send-report', { method: 'POST', body: JSON.stringify(student) });
    if (res.ok) alert('✅ Sent!');
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <Link href="/">
        <button className="mb-4 px-4 py-2 bg-gray-200 text-black rounded">&larr; Back to Scanner</button>
      </Link>
      <h1 className="text-2xl font-bold mb-4 text-black">Teacher Dashboard</h1>

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="p-3">Name</th>
              <th className="p-3">Math</th><th className="p-3">Sci</th><th className="p-3">Hist</th><th className="p-3">Eng</th><th className="p-3">ICT</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.barcode_id} className="border-b text-black">
                <td className="p-3">{s.name}</td>
                {['math','science','history','english','ict'].map(sub => (
                  <td key={sub} className="p-1">
                    <input type="number" value={s[sub]} onChange={(e) => handleChange(i, sub, e.target.value)}
                      className="w-14 p-1 border rounded text-center" />
                  </td>
                ))}
                <td className="p-3 flex gap-2">
                  <button onClick={() => saveMarks(s)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Save</button>
                  <button onClick={() => sendEmail(s)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Email</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}