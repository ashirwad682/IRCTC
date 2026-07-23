import React, { useState } from 'react';
import { ShieldCheck, Server, Database, ArrowRight, Play, Terminal } from 'lucide-react';

export default function IrctcArchitectureView() {
  const [activeApiStep, setActiveApiStep] = useState(1);
  const [isExecutingSim, setIsExecutingSim] = useState(false);

  const steps = [
    {
      id: 1,
      title: '1. Seat Inventory Query',
      endpoint: 'POST /api/v1/irctc/check-availability',
      request: `{
  "trainNumber": "20902",
  "source": "ADI",
  "destination": "MMCT",
  "date": "2026-07-25",
  "class": "3A",
  "quota": "GN"
}`,
      response: `{
  "status": "SUCCESS",
  "irctcTxnId": "IRCTC_883920194",
  "availableBerths": 42,
  "racCount": 0,
  "fareAmount": 2150.00,
  "cacheTtlMs": 3000
}`
    },
    {
      id: 2,
      title: '2. Seat Hold & Lock (10 Min Window)',
      endpoint: 'POST /api/v1/irctc/hold-seat',
      request: `{
  "irctcTxnId": "IRCTC_883920194",
  "passengers": [
    { "name": "Ashirwad Kumar", "age": 28, "gender": "M", "berthPreference": "LB" }
  ],
  "seatPreferences": ["WINDOW"]
}`,
      response: `{
  "status": "HELD",
  "holdToken": "HOLD_883920194_9921",
  "lockExpiry": "2026-07-20T12:41:00Z",
  "assignedBerth": "B1-19 (Lower)"
}`
    },
    {
      id: 3,
      title: '3. Official PNR Reservation & Ticket Generation',
      endpoint: 'POST /api/v1/irctc/reserve-pnr',
      request: `{
  "holdToken": "HOLD_883920194_9921",
  "paymentTxnRef": "PAY_9918237190",
  "irctcUserAuth": "BEARER_TOKEN_XXXXX"
}`,
      response: `{
  "status": "CONFIRMED",
  "pnr": "4829105432",
  "bookingTime": "2026-07-20T12:31:05Z",
  "irctcQrHash": "0x7f9a2b8e1c3d...",
  "ticketPdfUrl": "/api/v1/tickets/4829105432.pdf"
}`
    }
  ];

  const handleRunSimulation = () => {
    setIsExecutingSim(true);
    setActiveApiStep(1);
    setTimeout(() => {
      setActiveApiStep(2);
      setTimeout(() => {
        setActiveApiStep(3);
        setIsExecutingSim(false);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-950 text-xs font-bold mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Official IRCTC Integration Architecture</span>
        </div>
        <h2 className="text-3xl font-black text-blue-950">
          How RailX Bridges With Official Indian Railways CRS
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
          Seat inventory, PNR allocations, and fare calculations remain in the central Indian Railways Database. RailX functions as an ultra-fast enterprise gateway.
        </p>
      </div>

      {/* Visual System Architecture Diagram */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl mb-8">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-6 text-center">
          End-to-End Reservation System Sequence Flow
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center relative">
          
          {/* Node 1: User */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center relative group">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center font-bold text-lg mb-2">
              👤
            </div>
            <h4 className="text-xs font-bold text-blue-950">User Client</h4>
            <p className="text-[10px] text-slate-500">Web / Mobile App</p>
          </div>

          <div className="hidden md:flex justify-center text-orange-600">
            <ArrowRight className={`w-6 h-6 ${isExecutingSim ? 'animate-bounce' : ''}`} />
          </div>

          {/* Node 2: RailX Backend Queue */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center relative shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 mx-auto flex items-center justify-center mb-2">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-blue-950">RailX Express Queue</h4>
            <p className="text-[10px] text-slate-500">Rate Limiter & Redis Cache</p>
          </div>

          <div className="hidden md:flex justify-center text-orange-600">
            <ArrowRight className={`w-6 h-6 ${isExecutingSim ? 'animate-bounce' : ''}`} />
          </div>

          {/* Node 3: Official IRCTC API */}
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-center relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-orange-700">Official IRCTC Gateway</h4>
            <p className="text-[10px] text-slate-500">Indian Railways CRS DB</p>
          </div>

        </div>

        {/* Action Trigger */}
        <div className="mt-8 text-center">
          <button
            onClick={handleRunSimulation}
            disabled={isExecutingSim}
            className="px-6 py-3 rounded-2xl irctc-gradient-btn font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-2 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isExecutingSim ? 'Simulating Live Bridge Handshake...' : 'Run Live Handshake Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Interactive API Payload Sandbox */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
            <Terminal className="w-4 h-4 text-orange-600" />
            <span>Official IRCTC REST API Sandbox Payload</span>
          </div>

          <div className="flex gap-2">
            {steps.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveApiStep(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeApiStep === s.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Step {s.id}
              </button>
            ))}
          </div>
        </div>

        {/* Step Details */}
        {steps.map(s => {
          if (s.id !== activeApiStep) return null;
          return (
            <div key={s.id} className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-blue-950">{s.title}</span>
                <span className="font-mono text-orange-600 font-bold">{s.endpoint}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Request */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Request Payload (JSON)</span>
                  <pre className="text-xs font-mono text-cyan-300 overflow-x-auto">
                    {s.request}
                  </pre>
                </div>

                {/* Response */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-2">IRCTC Response Callback</span>
                  <pre className="text-xs font-mono text-emerald-300 overflow-x-auto">
                    {s.response}
                  </pre>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
