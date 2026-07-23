import React, { useState } from 'react';
import { X, Check, Info, ShieldCheck, ArrowRight, Sparkles, UserPlus, Trash2, AlertTriangle, TrendingUp } from 'lucide-react';

export default function CoachSeatSelector({ train, selectedClass, onClose, onProceedToPayment }) {
  const isWaitingList = selectedClass?.statusType === 'wl' || selectedClass?.status?.includes('WL');

  // Determine Coach Code Prefix & Layout Type based on Class
  const getCoachPrefix = (code) => {
    switch (code) {
      case 'SL': return 'S';
      case '3A': return 'B';
      case '3E': return 'M';
      case '2A': return 'A';
      case '1A': return 'H';
      case 'CC': return 'C';
      case 'EC': return 'E';
      default: return 'B';
    }
  };

  const coachPrefix = getCoachPrefix(selectedClass.code);
  const coachList = [`${coachPrefix}1`, `${coachPrefix}2`, `${coachPrefix}3`, `${coachPrefix}4`];

  const [activeCoach, setActiveCoach] = useState(coachList[0]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [filterType, setFilterType] = useState('all');

  // Waiting list passenger count state
  const [wlPassengerCount, setWlPassengerCount] = useState(1);

  // Generate seats dynamically based on class layout
  const generateSeats = () => {
    const seats = [];
    const isChairCar = selectedClass.code === 'CC' || selectedClass.code === 'EC';
    const totalSeats = isChairCar ? 72 : 60;

    for (let i = 1; i <= totalSeats; i++) {
      let type = 'MID';
      let isWindow = false;

      if (isChairCar) {
        if (i % 5 === 1 || i % 5 === 0) {
          type = 'WIN';
          isWindow = true;
        } else if (i % 5 === 2 || i % 5 === 4) {
          type = 'AIS';
        } else {
          type = 'MID';
        }
      } else if (selectedClass.code === '2A') {
        const mod = i % 6;
        if (mod === 1 || mod === 2) type = 'LOW';
        else if (mod === 3 || mod === 4) type = 'UPP';
        else if (mod === 5) { type = 'SLO'; isWindow = true; }
        else { type = 'SUP'; isWindow = true; }
      } else {
        const mod = i % 8;
        if (mod === 1 || mod === 4) type = 'LOW';
        else if (mod === 2 || mod === 5) type = 'MID';
        else if (mod === 3 || mod === 6) type = 'UPP';
        else if (mod === 7) { type = 'SLO'; isWindow = true; }
        else { type = 'SUP'; isWindow = true; }
      }

      // Simulate occupied seats (approx 35% occupied)
      const isOccupied = (i * 7 + activeCoach.charCodeAt(1)) % 3 === 0;

      seats.push({
        id: `${activeCoach}-${i}`,
        number: i,
        type,
        isWindow,
        isOccupied
      });
    }
    return seats;
  };

  const seats = generateSeats();

  const toggleSeat = (seat) => {
    if (seat.isOccupied) return;
    const exists = selectedSeats.find(s => s.id === seat.id);

    if (exists) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        alert('Maximum 6 berths can be booked per transaction as per IRCTC guidelines.');
        return;
      }
      setSelectedSeats([...selectedSeats, { ...seat, coach: activeCoach, code: `${activeCoach}-${seat.number}` }]);
    }
  };

  const handleWLProceed = () => {
    const dummySeats = Array.from({ length: wlPassengerCount }).map((_, idx) => ({
      id: `WL-${idx + 1}`,
      number: idx + 1,
      code: `WL-${selectedClass.code}-${idx + 1}`
    }));
    onProceedToPayment(train, selectedClass, dummySeats);
  };

  const handleAvailableProceed = () => {
    if (selectedSeats.length === 0) return;
    onProceedToPayment(train, selectedClass, selectedSeats);
  };

  const calculateTotal = () => {
    const count = isWaitingList ? wlPassengerCount : selectedSeats.length;
    const base = count * selectedClass.price;
    const convenience = count > 0 ? 15 : 0;
    const gst = Math.round(base * 0.05);
    return { base, convenience, gst, total: base + convenience + gst };
  };

  const totals = calculateTotal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden border border-slate-200 shadow-2xl my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-blue-950 text-white flex items-center justify-between border-b border-blue-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-orange-600 font-mono text-xs font-bold text-white">
                #{train.number}
              </span>
              <h2 className="text-base font-extrabold text-white">{train.name}</h2>
              <span className="px-2 py-0.5 rounded bg-blue-900 border border-blue-700 font-bold text-xs text-amber-300">
                Class: {selectedClass.name} ({selectedClass.code})
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              {train.fromName} ({train.from}) ➔ {train.toName} ({train.to}) • Dep: {train.departureTime}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {isWaitingList ? (
          /* WAITING LIST CARD (No seat map) */
          <div className="p-8 max-w-2xl mx-auto text-center space-y-6">
            
            <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle className="w-8 h-8 text-amber-600 animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl font-black text-blue-950">Waiting List Ticket ({selectedClass.status})</h3>
              <p className="text-xs text-slate-600 font-medium mt-1 max-w-md mx-auto">
                Physical seat berth numbers are not allocated for Waiting List tickets. Berths will be assigned upon chart preparation before departure.
              </p>
            </div>

            {/* AI Confirmation Probability Meter */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-amber-900">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  <span>AI Confirmation Probability Index</span>
                </span>
                <span className="font-mono font-black text-amber-800 text-sm">88% Chance</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-amber-200 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" style={{ width: '88%' }}></div>
              </div>
              <p className="text-[11px] text-amber-800 font-medium">
                High chance of confirmation (CNF) based on historical cancellations for {train.name} on this route.
              </p>
            </div>

            {/* Passenger Count Selector */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
              <div>
                <span className="block text-slate-900 text-sm">Select Number of Passengers</span>
                <span className="text-slate-500 font-normal">Maximum 6 passengers per ticket</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setWlPassengerCount(Math.max(1, wlPassengerCount - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-base hover:bg-slate-100 text-slate-800"
                >
                  -
                </button>
                <span className="font-mono font-black text-lg text-blue-950 px-2">{wlPassengerCount}</span>
                <button
                  type="button"
                  onClick={() => setWlPassengerCount(Math.min(6, wlPassengerCount + 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-base hover:bg-slate-100 text-slate-800"
                >
                  +
                </button>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5 text-left font-medium">
              <div className="flex justify-between text-slate-600">
                <span>Base Fare ({wlPassengerCount} Passenger{wlPassengerCount > 1 ? 's' : ''}):</span>
                <span className="font-mono font-bold text-slate-900">₹{totals.base}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IRCTC Convenience Fee:</span>
                <span className="font-mono font-bold text-slate-900">₹{totals.convenience}</span>
              </div>
              <div className="flex justify-between text-blue-950 font-black text-sm pt-2 border-t border-slate-100">
                <span>Total Payable:</span>
                <span className="font-mono text-orange-600 text-base">₹{totals.total}</span>
              </div>
            </div>

            {/* Action CTA */}
            <button
              onClick={handleWLProceed}
              className="w-full py-3.5 rounded-2xl irctc-gradient-btn font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Proceed to Book Waiting List Ticket</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        ) : (
          /* AVAILABLE SEAT LAYOUT MAP */
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Coach Layout Map (Col 8) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Coach Selector Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase text-slate-500 mr-1">Coach:</span>
                  {coachList.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setActiveCoach(c);
                        setSelectedSeats([]);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                        activeCoach === c
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 text-[11px] font-bold">
                  <span className="text-slate-500 mr-1">Filter:</span>
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-2 py-0.5 rounded ${filterType === 'all' ? 'bg-blue-950 text-white' : 'bg-white text-slate-700'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType('window')}
                    className={`px-2 py-0.5 rounded ${filterType === 'window' ? 'bg-blue-950 text-white' : 'bg-white text-slate-700'}`}
                  >
                    Window / Lower
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 py-2 text-xs font-bold text-slate-600 bg-slate-50 rounded-xl border border-slate-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-500 inline-block"></span> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300 inline-block"></span> Occupied
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-orange-600 inline-block"></span> Selected
                </span>
              </div>

              {/* 2D Visual Coach Grid */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 overflow-x-auto">
                <div className="min-w-[500px]">
                  
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 mb-3 px-2">
                    <span>◄ Engine Direction</span>
                    <span>Coach {activeCoach} ({selectedClass.name})</span>
                    <span>Entry Door ►</span>
                  </div>

                  <div className="grid grid-cols-10 gap-2">
                    {seats.map((seat) => {
                      const isSelected = selectedSeats.some(s => s.id === seat.id);
                      return (
                        <button
                          key={seat.id}
                          disabled={seat.isOccupied}
                          onClick={() => toggleSeat(seat)}
                          className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-0.5 ${
                            seat.isOccupied
                              ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                              : isSelected
                              ? 'bg-orange-600 border-orange-700 text-white shadow-md scale-105'
                              : 'bg-white border-slate-200 hover:border-orange-500 text-slate-800 shadow-2xs'
                          }`}
                        >
                          <span className="font-mono font-extrabold text-xs">{seat.number}</span>
                          <span className={`text-[9px] font-bold uppercase ${isSelected ? 'text-orange-100' : 'text-slate-500'}`}>
                            {seat.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              </div>

            </div>

            {/* Right: Selected Berths & Checkout Summary (Col 4) */}
            <div className="lg:col-span-4 bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-black text-blue-950">Selected Berths ({selectedSeats.length})</h3>
                  <span className="text-xs text-slate-500 font-bold">Max 6</span>
                </div>

                {selectedSeats.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <UserPlus className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-medium">Click on any available berth in the layout to select seats.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedSeats.map((s, idx) => (
                      <div key={s.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-black text-blue-950">Passenger {idx + 1}</span>
                          <p className="text-slate-500 text-[11px] font-medium">{s.code} ({s.type})</p>
                        </div>
                        <button onClick={() => toggleSeat(s)} className="text-rose-600 hover:text-rose-800 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs font-medium text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Ticket Fare:</span>
                    <span className="font-mono font-bold text-slate-900">₹{totals.base}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IRCTC Convenience Fee:</span>
                    <span className="font-mono font-bold text-slate-900">₹{totals.convenience}</span>
                  </div>
                  <div className="flex justify-between text-blue-950 font-black text-sm pt-2 border-t border-slate-200">
                    <span>Total Payable:</span>
                    <span className="font-mono text-orange-600 text-base">₹{totals.total}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  disabled={selectedSeats.length === 0}
                  onClick={handleAvailableProceed}
                  className={`w-full py-3.5 rounded-2xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                    selectedSeats.length > 0
                      ? 'irctc-gradient-btn active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Proceed to Payment ({selectedSeats.length} Seats)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
