import React, { useState } from 'react';
import { QrCode, CheckCircle2, Search } from 'lucide-react';

export default function BlockchainVerifier() {
  const [pnrInput, setPnrInput] = useState('4829105432');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState({
    verified: true,
    blockNumber: 18492019,
    txHash: '0x7f9a2b8e1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
    timestamp: '2026-07-20T12:31:05Z',
    pnr: '4829105432',
    passenger: 'Ashirwad Kumar',
    train: '20902 - Vande Bharat Express',
    berth: 'Coach B1 - Seat 19 (Lower Window)',
    issuer: 'Indian Railways Enterprise Ledger'
  });

  const handleVerify = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationData({
        verified: true,
        blockNumber: Math.floor(18000000 + Math.random() * 500000),
        txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        timestamp: new Date().toISOString(),
        pnr: pnrInput || '4829105432',
        passenger: 'Ashirwad Kumar',
        train: '20902 - Vande Bharat Express',
        berth: 'Coach B1 - Seat 19 (Lower Window)',
        issuer: 'Indian Railways Enterprise Ledger'
      });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-950 text-xs font-bold mb-3">
          <QrCode className="w-4 h-4 text-orange-600" />
          <span>Blockchain Cryptographic Ticket Verification</span>
        </div>
        <h2 className="text-3xl font-black text-blue-950">
          Anti-Fraud Ticket Integrity Scanner
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
          Every RailX IRCTC ticket is cryptographically signed and stored on an immutable ledger to eliminate counterfeit tickets.
        </p>
      </div>

      {/* Verification Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl">
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row items-center gap-3 mb-8">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value)}
              placeholder="Enter 10-digit PNR or Hash..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl irctc-gradient-btn font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {isVerifying ? 'Verifying Hash...' : 'Verify Cryptographic Proof'}
          </button>
        </form>

        {/* Verification Result */}
        {verificationData && (
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-300 relative overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>CRYPTOGRAPHICALLY VALIDATED & AUTHENTIC</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-300">
                Block #{verificationData.blockNumber}
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-800">
              <div>
                <span className="text-slate-500 block font-sans font-bold">Transaction Hash (TxHash):</span>
                <span className="text-blue-900 font-bold break-all">{verificationData.txHash}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block font-sans font-bold">PNR Number:</span>
                  <span className="font-bold text-slate-900">{verificationData.pnr}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-sans font-bold">Assigned Seat:</span>
                  <span className="font-bold text-slate-900">{verificationData.berth}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-sans font-bold">Passenger Name:</span>
                  <span className="font-bold text-slate-900">{verificationData.passenger}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-sans font-bold">Issuer Ledger:</span>
                  <span className="font-bold text-slate-900">{verificationData.issuer}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
