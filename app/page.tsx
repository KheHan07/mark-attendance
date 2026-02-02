'use client';
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5QrcodeScanType } from 'html5-qrcode';
import Link from 'next/link';

export default function Home() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready');

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
    setStatus('Sending Email...');
    setScanResult(`ID: ${barcodeId}`);
    try {
      const res = await fetch('/api/mark-attendance', {
        method: 'POST',
        body: JSON.stringify({ barcodeId }),
      });
      const data = await res.json();
      if (res.ok) {
        setScanResult(`✅ Arrived: ${data.student}`);
        setStatus('Email Sent!');
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) { setStatus('Network Error'); }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-md flex justify-end mb-6">
        <Link href="/marks">
          <button className="px-4 py-2 bg-blue-600 text-white rounded font-bold shadow">Teacher Dashboard &rarr;</button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-black">Gate Attendance</h1>
      <div id="reader" className="w-full max-w-md bg-white p-4 rounded shadow"></div>
      
      <div className="mt-4 p-4 bg-white rounded shadow w-full max-w-md text-center">
        <p className="font-bold text-lg text-blue-600">{status}</p>
        {scanResult && <p className="mt-2 text-gray-700">{scanResult}</p>}
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-black text-white rounded">Reset</button>
      </div>
    </main>
  );
}