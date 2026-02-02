// src/app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function Home() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready to Scan');

  useEffect(() => {
    // 1. Define the formats we want to support (Barcodes + QR)
    const formatsToSupport = [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
      Html5QrcodeSupportedFormats.CODE_128, // Common for ID cards
      Html5QrcodeSupportedFormats.CODE_39
    ];

    // 2. Initialize Scanner with these formats
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 }, // Made it wider for barcodes
        formatsToSupport: formatsToSupport,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      scanner.clear(); 
      handleAttendance(decodedText);
    }

    function onScanFailure(error: any) {
      // This function runs every single frame the camera doesn't see a code.
      // It is normal to see errors here until a code is detected.
      // console.warn(error); 
    }

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner. ", error));
    };
  }, []);

  async function handleAttendance(barcodeId: string) {
    setStatus('Processing...');
    setScanResult(`Scanned: ${barcodeId}`); // Show the user what was scanned immediately
    
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
        setStatus(`❌ ${data.error || 'Student not found'}`);
      }
    } catch (error) {
      setStatus('❌ Network Error');
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-black">Student Attendance</h1>
      
      {/* Scanner Box */}
      <div id="reader" className="w-full max-w-md bg-white p-4 rounded-lg shadow-lg"></div>

      {/* Status Display */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow w-full max-w-md text-center">
        <p className="text-gray-500 text-sm">Status:</p>
        <p className="text-lg font-semibold text-blue-600">{status}</p>
        
        {scanResult && (
          <div className="mt-4 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-700">
            {scanResult}
          </div>
        )}

        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Scan Next Student
        </button>
      </div>
    </main>
  );
}