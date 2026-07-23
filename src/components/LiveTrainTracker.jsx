import React, { useState, useEffect } from 'react';
import { Radio, MapPin, Gauge, Clock, Train, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function LiveTrainTracker({ train, onBack }) {
  const currentTrain = train || {
    number: '20902',
    name: 'Vande Bharat Express',
    type: 'Vande Bharat',
    from: 'ADI',
    to: 'MMCT',
    liveStatus: {
      currentStation: 'Surat (ST)',
      statusText: 'On Time',
      delayMinutes: 0,
      nextStation: 'Vapi (VAPI)',
      speed: 130,
      platform: 'Platform 1'
    },
    intermediateStations: [
      { name: 'Ahmedabad (ADI)', arr: 'Start', dep: '06:10', platform: 'P1', distance: '0 km', passed: true },
      { name: 'Vadodara (BRC)', arr: '07:00', dep: '07:05', platform: 'P2', distance: '100 km', passed: true },
      { name: 'Surat (ST)', arr: '08:55', dep: '08:58', platform: 'P1', distance: '230 km', isCurrent: true },
      { name: 'Vapi (VAPI)', arr: '10:02', dep: '10:04', platform: 'P2', distance: '325 km' },
      { name: 'Borivali (BVI)', arr: '11:00', dep: '11:02', platform: 'P7', distance: '463 km' },
      { name: 'Mumbai Central (MMCT)', arr: '11:35', dep: 'End', platform: 'P5', distance: '493 km' }
    ]
  };

  const [simulatedSpeed, setSimulatedSpeed] = useState(currentTrain.liveStatus.speed);
  const [pulsePing, setPulsePing] = useState(true);

  // Simulated Socket.IO real-time telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedSpeed(prev => Math.floor(125 + Math.random() * 10));
      setPulsePing(p => !p);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const coachPosition = [
    { code: 'ENG', label: 'Loco Engine', type: 'engine' },
    { code: 'E1', label: 'Exec Chair Car', type: 'passenger' },
    { code: 'C1', label: 'Chair Car', type: 'passenger' },
    { code: 'C2', label: 'Chair Car', type: 'passenger', highlight: true },
    { code: 'C3', label: 'Chair Car', type: 'passenger' },
    { code: 'C4', label: 'Chair Car', type: 'passenger' },
    { code: 'PAN', label: 'Pantry Car', type: 'service' },
    { code: 'C5', label: 'Chair Car', type: 'passenger' },
    { code: 'C6', label: 'Chair Car', type: 'passenger' },
    { code: 'GUARD', label: 'Guard Van', type: 'service' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Train Search</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-900">
          <span className={`w-2.5 h-2.5 rounded-full ${pulsePing ? 'bg-emerald-500 shadow-md shadow-emerald-500' : 'bg-emerald-600'}`}></span>
          <span>Socket.IO Live Satellite Telemetry Active</span>
        </div>
      </div>

      {/* Main GPS Live Status Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl mb-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-950 font-mono font-bold text-xs border border-blue-200">
                #{currentTrain.number}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-blue-950">
                {currentTrain.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Official IRCTC Live Satellite GPS Radar • Platform Guidance
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-black text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{currentTrain.liveStatus.statusText}</span>
            </div>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-1">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Current Station</span>
            </div>
            <p className="text-lg font-black text-slate-900 font-mono">{currentTrain.liveStatus.currentStation}</p>
            <p className="text-[11px] text-orange-600 font-bold mt-0.5">{currentTrain.liveStatus.platform}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-1">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>Live Speed</span>
            </div>
            <p className="text-lg font-black text-slate-900 font-mono">{simulatedSpeed} km/h</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">High Speed Corridor</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-1">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Next Halt</span>
            </div>
            <p className="text-lg font-black text-slate-900 font-mono">{currentTrain.liveStatus.nextStation}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">ETA: 42 mins</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Punctuality Rating</span>
            </div>
            <p className="text-lg font-black text-emerald-700 font-mono">99.4%</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">IRCTC Gold Tier</p>
          </div>

        </div>
      </div>

      {/* Platform Coach Position Radar Visualizer */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 mb-8 shadow-sm">
        <h3 className="text-sm font-extrabold text-blue-950 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Train className="w-4 h-4 text-orange-600" />
            <span>Platform Coach Position Radar ({currentTrain.liveStatus.platform})</span>
          </span>
          <span className="text-xs text-slate-500 font-semibold">Engine Movement: Left to Right ▶</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4 font-medium">
          Locate exactly where your reserved coach will halt on the platform.
        </p>

        {/* Coach Train Track */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-[700px]">
            {coachPosition.map((c, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-[85px] transition-all ${
                  c.highlight
                    ? 'irctc-gradient-btn text-white font-bold shadow-md'
                    : c.type === 'engine'
                    ? 'bg-blue-900 border-blue-900 text-white font-bold'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <span className="font-mono font-bold text-xs">{c.code}</span>
                <span className="text-[9px] uppercase tracking-tighter text-slate-500 mt-1 truncate max-w-full font-bold">
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Route Timeline Stations */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-extrabold text-blue-950 mb-6">
          Detailed Route Halt Timeline
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {currentTrain.intermediateStations.map((st, idx) => {
            const isCurrent = st.isCurrent;
            const isPassed = st.passed;

            return (
              <div key={idx} className="relative flex items-center justify-between">
                
                {/* Timeline Dot */}
                <div className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-orange-600 border-orange-400 ring-4 ring-orange-100'
                    : isPassed
                    ? 'bg-emerald-600 border-emerald-500'
                    : 'bg-white border-slate-300'
                }`}>
                  {isPassed && <span className="text-[10px] text-white font-bold">✓</span>}
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>}
                </div>

                <div className="pl-4">
                  <h4 className={`text-sm font-bold ${isCurrent ? 'text-orange-600' : isPassed ? 'text-slate-500' : 'text-blue-950'}`}>
                    {st.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Platform {st.platform} • Distance {st.distance}
                  </p>
                </div>

                <div className="text-right font-mono text-xs">
                  <p className="text-slate-900 font-bold">Arr: {st.arr}</p>
                  <p className="text-slate-500">Dep: {st.dep}</p>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
