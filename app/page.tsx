'use client';
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5QrcodeScanType } from 'html5-qrcode';
import Link from 'next/link';

export default function Home() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (!showScanner) return;
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.CODE_128],
        videoConstraints: {
          facingMode: "environment" 
        }
      },
      false
    );

    setTimeout(() => {
        const stopBtn = document.getElementById("html5-qrcode-button-camera-stop");
        if(stopBtn) stopBtn.style.display = "none";
    }, 500);

    scanner.render(onScanSuccess, (err) => {
        // Ignore errors while scanning
    });

    function onScanSuccess(decodedText: string) {
      scanner.clear(); 
      setShowScanner(false);
      handleAttendance(decodedText);
    }

    return () => { scanner.clear().catch(console.error); };
  }, [showScanner]);

  async function handleAttendance(barcodeId: string) {
    setIsProcessing(true);
    setStatus('Marking Attendance...');
    
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
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 font-sans">
      
      {/* Header */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-5 mb-6 flex justify-between items-center border border-slate-100">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">EduTrack</h1>
        <Link href="/marks">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md transition-all">
            Dashboard
          </button>
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative min-h-[400px] flex flex-col">
        
        {/* State A: Start Screen (Default) */}
        {!showScanner && !scanResult && !isProcessing && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-indigo-50 p-6 rounded-full mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Ready to Scan</h2>
            <p className="text-slate-500 mb-8 text-sm">Tap the button below to open the camera and mark attendance.</p>
            <button 
              onClick={() => setShowScanner(true)}
              className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform"
            >
              Start Attendance Scanner
            </button>
          </div>
        )}

        {/* State B: Scanner Active */}
        {showScanner && (
          <div className="flex-1 bg-black relative flex flex-col">
            <div className="p-4 flex justify-between items-center text-white z-10 bg-black/50 backdrop-blur-sm">
              <span className="text-sm font-medium">Scanning...</span>
              <button 
                onClick={() => setShowScanner(false)} 
                className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30"
              >
                Cancel
              </button>
            </div>
            <div id="reader" className="flex-1 w-full h-full bg-black"></div>
          </div>
        )}

        {/* State C: Processing / Result */}
        {(scanResult || isProcessing) && !showScanner && (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
             {isProcessing ? (
                <div className="animate-pulse">
                  <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h2 className="text-lg font-bold text-indigo-900">Processing...</h2>
                </div>
             ) : (
                <div className="animate-bounce-short">
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 mb-1">{scanResult}</h2>
                  <p className="text-green-600 font-bold mb-8">Marked Present & Email Sent!</p>
                  
                  <button 
                    onClick={() => { setScanResult(null); setShowScanner(true); }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700"
                  >
                    Scan Next Student
                  </button>
                </div>
             )}
           </div>
        )}

      </div>
      
      <p className="mt-6 text-xs text-slate-400 font-medium">EduTrack System © 2026</p>
    </main>
  );
}