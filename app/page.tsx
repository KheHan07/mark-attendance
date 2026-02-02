'use client';
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5QrcodeScanType } from 'html5-qrcode';
import Link from 'next/link';

export default function Home() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready to Scan');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.CODE_128]
      },
      false
    );
    scanner.render(onScanSuccess, () => {});

    function onScanSuccess(decodedText: string) {
      scanner.clear(); 
      handleAttendance(decodedText);
    }
    return () => { scanner.clear().catch(console.error); };
  }, []);

  async function handleAttendance(barcodeId: string) {
    setIsProcessing(true);
    setStatus('Processing...');
    
    try {
      const res = await fetch('/api/mark-attendance', {
        method: 'POST',
        body: JSON.stringify({ barcodeId }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setScanResult(data.student);
        setStatus('✅ Success');
      } else {
        setScanResult(null);
        setStatus(`❌ ${data.error}`);
      }
    } catch (error) { setStatus('❌ Network Error'); }
    
    setIsProcessing(false);
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-50 to-blue-100 flex flex-col items-center p-6 font-sans">
      
      {/* Header Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Smart Attendance</h1>
          <p className="text-xs text-slate-500 uppercase tracking-wide">University Project</p>
        </div>
        <Link href="/marks">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl shadow-lg shadow-indigo-200 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
          </button>
        </Link>
      </div>

      {/* Scanner Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-600">Camera Active</span>
          <div className={`h-3 w-3 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
        </div>
        
        <div id="reader" className="w-full bg-black"></div>
        
        {/* Result Area */}
        <div className="p-6 text-center">
           <p className="text-sm text-slate-400 mb-2 uppercase tracking-widest font-bold">Status</p>
           
           {status === 'Ready to Scan' ? (
             <div className="inline-block px-4 py-2 bg-slate-100 rounded-full text-slate-500 font-medium">
               Ready to Scan
             </div>
           ) : status.includes('Success') ? (
             <div className="animate-bounce">
                <p className="text-3xl font-black text-indigo-600 mb-1">{scanResult}</p>
                <div className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                  Email Sent Successfully
                </div>
             </div>
           ) : (
             <div className="text-red-500 font-bold bg-red-50 p-2 rounded-lg">{status}</div>
           )}

           <button 
             onClick={() => window.location.reload()} 
             className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-semibold active:scale-95 transition-transform"
           >
             Scan Next Student
           </button>
        </div>
      </div>
    </main>
  );
}