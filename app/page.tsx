// src/app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function Home() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Waiting for camera...');

  useEffect(() => {
    // 1. Configure to support BOTH QR Codes and Standard Barcodes (Lines)
    const formatsToSupport = [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13
    ];

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        formatsToSupport: formatsToSupport 
      },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      // DEBUG: Alert immediately to prove the camera works
      alert(`Scanned Code: ${decodedText}`);
      
      scanner.clear(); 
      handleAttendance(decodedText);
    }

    function onScanFailure(error: any) {
      // Keep this empty so it doesn't spam errors while searching
    }

    return () => {
      scanner.clear().catch(err => console.error(err));
    };
  }, []);

  async function handleAttendance(barcodeId: string) {
    setStatus('Sending to Server...');
    
    try {
      const response = await fetch('/api/mark-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcodeId }),
      });

      const data = await response.json();

      if (response.ok) {
        setScanResult(`✅ Success! Student: ${data.student}`);
        setStatus('Email Sent!');
        alert("Success! Email sent.");
      } else {
        setScanResult('❌ Error in Database');
        setStatus(data.error || 'Check server logs');
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      setScanResult('❌ Network Error');
      alert("Network Error: Could not reach the server.");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-black">Scanner Debug Mode</h1>
      
      {/* Scanner Box */}
      <div id="reader" className="w-full max-w-md bg-white p-4 rounded-lg shadow-lg"></div>

      <div className="mt-6 p-4 bg-white rounded-lg shadow w-full max-w-md text-center">
        <p className="text-gray-500 text-sm">Status:</p>
        <p className="text-lg font-semibold text-blue-600">{status}</p>
        
        {scanResult && (
          <div className="mt-4 p-2 bg-green-100 border border-green-400 rounded text-green-700">
            {scanResult}
          </div>
        )}
             <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Reset Scanner
        </button>
      </div>
    </main>
  );
}