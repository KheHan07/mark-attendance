'use client';
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5QrcodeScanType } from 'html5-qrcode';

export default function Home() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready to Scan');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        // THIS LINE REMOVES THE FILE UPLOAD BUTTON
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
        ]
      },
      false
    );

    scanner.render(onScanSuccess, (err) => { /* ignore failures */ });

    function onScanSuccess(decodedText: string) {
      scanner.clear(); 
      handleAttendance(decodedText);
    }

    return () => {
      scanner.clear().catch(err => console.error("Scanner cleanup error", err));
    };
  }, []);

  async function handleAttendance(barcodeId: string) {
    setStatus('Processing...');
    setScanResult(`Scanned: ${barcodeId}`); 
    
    try {
      const response = await fetch('/api/mark-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcodeId }),
      });

      const data = await response.json();

      if (response.ok) {
        setScanResult(`✅ Success! Marked ${data.student}`);
        setStatus('Email sent to parent.');
      } else {
        // Show the actual error message from the server
        setScanResult('❌ Failed');
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus('❌ Network Error (Check your internet)');
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-black">Student Attendance</h1>
      <div id="reader" className="w-full max-w-md bg-white p-4 rounded-lg shadow-lg"></div>
      <div className="mt-6 p-4 bg-white rounded-lg shadow w-full max-w-md text-center">
        <p className="text-gray-500 text-sm">Status:</p>
        <p className="text-lg font-semibold text-blue-600">{status}</p>
        {scanResult && (
          <div className="mt-4 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-700">
            {scanResult}
          </div>
        )}
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-black text-white rounded">Scan Next</button>
      </div>
    </main>
  );
}