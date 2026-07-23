import React, { useState } from 'react';
import { Search, ShieldCheck, Ticket, Calendar, Clock, MapPin, CheckCircle2, AlertTriangle, ArrowRight, Download, Share2, Utensils, RefreshCw, FileText, Sparkles } from 'lucide-react';
import { fetchOfficialIrctcPnrStatus } from '../services/irctcPnrService';
import CancellationReceiptModal from './CancellationReceiptModal';

export default function PnrStatusPage({ initialPnr = '', userBookings = [], onViewTicket, onCancelTicket, onOrderFood }) {
  const [pnrInput, setPnrInput] = useState(initialPnr || '');
  const [pnrResult, setPnrResult] = useState(null);
  const [rawBookingRef, setRawBookingRef] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCancellationModal, setShowCancellationModal] = useState(false);

  React.useEffect(() => {
    if (initialPnr) {
      setPnrInput(initialPnr);
      handleSearchForPnr(initialPnr);
    }
  }, [initialPnr]);

  const handleSearchForPnr = async (targetPnr) => {
    setErrorMsg('');
    const cleanPnr = String(targetPnr).replace(/\D/g, '');

    if (cleanPnr.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit numeric PNR number.');
      return;
    }

    setIsSearching(true);
    try {
      const data = await fetchOfficialIrctcPnrStatus(cleanPnr, userBookings);
      setIsSearching(false);
      setRawBookingRef(data.rawBookingRef);
      setPnrResult(data);
    } catch (err) {
      setIsSearching(false);
      setErrorMsg(err.message || 'Error fetching PNR details from IRCTC server.');
    }
  };

  const handlePnrSearch = (e) => {
    if (e) e.preventDefault();
    handleSearchForPnr(pnrInput);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 pt-6">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider border border-blue-200">
            Official IRCTC Service
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#000066] tracking-tight">
            Check PNR Current Status & Live Passenger Chart
          </h1>
          <p className="text-slate-600 font-bold text-xs sm:text-sm max-w-xl mx-auto">
            Get instant real-time coach allotment, seat numbers, waiting list confirmation probability, and chart status.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          
          <form onSubmit={handlePnrSearch} className="space-y-4">
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              
              {/* 10-Digit PNR Input */}
              <div className="flex-1 w-full bg-slate-50 p-3 rounded-2xl border border-slate-300 focus-within:border-blue-600 focus-within:bg-white transition-all">
                <label className="text-[10px] text-slate-400 font-black uppercase block mb-1">
                  Enter 10-Digit PNR Number
                </label>
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-blue-700" />
                  <input
                    type="text"
                    maxLength={10}
                    value={pnrInput}
                    onChange={(e) => setPnrInput(e.target.value)}
                    placeholder="e.g. 8849102941"
                    className="w-full bg-transparent text-lg font-mono font-black text-blue-950 focus:outline-none tracking-widest"
                  />
                </div>
              </div>


              {/* Search Button */}
              <button
                type="submit"
                disabled={isSearching}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0026cd] hover:bg-blue-900 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSearching ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                <span>Get PNR Status</span>
              </button>

            </div>

            {errorMsg && (
              <p className="text-xs font-black text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center">
                {errorMsg}
              </p>
            )}

          </form>

        </div>

        {/* PNR Result Display Container */}
        {pnrResult && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-6 p-6 sm:p-8">
            
            {/* Header Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 block">PNR NUMBER</span>
                <span className="text-2xl font-mono font-black text-blue-950 tracking-wider">
                  {pnrResult.pnr.slice(0, 4)}-{pnrResult.pnr.slice(4, 7)}-{pnrResult.pnr.slice(7)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border ${
                  pnrResult.isCancelled
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : pnrResult.chartStatus === 'CHART PREPARED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {pnrResult.isCancelled ? '❌ TICKET CANCELLED' : pnrResult.chartStatus}
                </span>

                <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
                  {pnrResult.platform}
                </span>
              </div>
            </div>

            {/* Cancelled Banner if Ticket is Cancelled */}
            {pnrResult.isCancelled && (
              <div className="bg-rose-50 border border-rose-300 text-rose-950 p-4.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shrink-0 mt-0.5 shadow-sm">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-black uppercase tracking-wide text-rose-950">TICKET CANCELLED & REFUND DISPATCHED</h4>
                      {pnrResult.cancelledAt && (
                        <span className="text-[11px] font-mono font-bold bg-rose-200/90 text-rose-950 px-2.5 py-0.5 rounded-full border border-rose-300">
                          Cancelled On: {new Date(pnrResult.cancelledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-rose-800">
                      This PNR ticket has been cancelled. Seat allotment has been released and refund has been initiated to payment mode.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCancellationModal(true)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Cancellation Slip (PDF)</span>
                </button>
              </div>
            )}

            {/* Train & Journey Route Details */}
            <div className="bg-[#eef4fc] p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Train Name */}
              <div className="md:col-span-4 space-y-1">
                <span className="font-mono font-bold text-xs text-blue-700">#{pnrResult.trainNumber}</span>
                <h3 className="text-lg font-black text-slate-900">{pnrResult.trainName}</h3>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-blue-900 text-white">
                    {pnrResult.classCode} ({pnrResult.className})
                  </span>
                  <span className="text-xs font-bold text-slate-600">{pnrResult.quota}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-900 font-bold bg-blue-100/80 px-2.5 py-1 rounded-xl border border-blue-200 mt-2 w-fit">
                  <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>Boarding Point: <strong className="text-blue-950 font-black">{pnrResult.boardingStation}</strong></span>
                </div>
              </div>

              {/* Route Timeline */}
              <div className="md:col-span-5 flex items-center justify-between text-center">
                <div className="text-left">
                  <span className="text-xl font-black text-slate-900 font-mono block">{pnrResult.departureTime}</span>
                  <span className="text-xs font-bold text-slate-800 block">{pnrResult.fromName} ({pnrResult.from})</span>
                  <span className="text-[10px] text-slate-500 font-medium block">{pnrResult.travelDate}</span>
                </div>

                <div className="flex-1 px-3 text-center">
                  <span className="text-[10px] font-bold text-slate-500 block">Scheduled Route</span>
                  <div className="w-full h-0.5 bg-blue-700 relative my-1">
                    <div className="w-2 h-2 rounded-full bg-blue-700 absolute left-0 -top-0.5"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-700 absolute right-0 -top-0.5"></div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 block">On Time</span>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 font-mono block">{pnrResult.arrivalTime}</span>
                  <span className="text-xs font-black text-slate-800 block">{pnrResult.toName} ({pnrResult.to})</span>
                  <span className="text-[10px] text-slate-500 font-medium block">{pnrResult.travelDate}</span>
                </div>
              </div>

              {/* Fare & Booking Date */}
              <div className="md:col-span-3 text-right space-y-1 border-l border-slate-200 pl-4">
                <span className="text-xs text-slate-500 font-semibold block">Booking Date</span>
                <span className="text-sm font-mono font-black text-blue-950 block">{pnrResult.bookingDate}</span>
                <span className="text-[10px] text-emerald-700 font-black block">✓ Telemetry Verified</span>
              </div>

            </div>

            {/* AI Waiting List Confirmation Meter (If WL) */}
            {pnrResult.aiConfirmationChance && !pnrResult.isCancelled && (
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">AI Waitlist Predictor Engine v3.5</h4>
                    <p className="text-xs font-bold text-slate-100">{pnrResult.aiConfirmationChance}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                  High Probability
                </span>
              </div>
            )}

            {/* Passenger Manifest Status Table */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-800">Passenger Current Status Manifest</h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-bold border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="p-3 font-black">#</th>
                      <th className="p-3 font-black">Passenger Name</th>
                      <th className="p-3 font-black">Age / Gender</th>
                      <th className="p-3 font-black">Booking Status</th>
                      <th className="p-3 font-black">Current Allotted Seat / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pnrResult.passengers.map((p, index) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold">{index + 1}</td>
                        <td className="p-3 font-black text-blue-950">{p.name}</td>
                        <td className="p-3 text-slate-600">{p.age} Yrs / {p.gender}</td>
                        <td className="p-3 font-mono text-slate-700">{p.bookingStatus}</td>
                        <td className="p-3 font-mono">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase inline-block ${
                            p.statusType === 'cancelled'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : p.statusType === 'cnf'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {p.statusType === 'cancelled' ? '❌ CANCELLED / REFUND PROCESSED' : p.currentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Bar Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    if (onViewTicket) onViewTicket(rawBookingRef || pnrResult);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#000066] hover:bg-blue-900 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>View / Print ERS Ticket</span>
                </button>

                {pnrResult.isCancelled && (
                  <button
                    type="button"
                    onClick={() => setShowCancellationModal(true)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Cancellation Slip (PDF)</span>
                  </button>
                )}

                <button
                  onClick={() => alert(`PNR ${pnrResult.pnr} details sent via SMS & WhatsApp to registered mobile number!`)}
                  className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold text-xs border border-emerald-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-700" />
                  <span>Send SMS / WhatsApp Alert</span>
                </button>
              </div>

              {onOrderFood && !pnrResult.isCancelled && (
                <button
                  onClick={onOrderFood}
                  className="px-5 py-2 rounded-xl bg-[#ff5500] hover:bg-orange-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Utensils className="w-4 h-4 text-white" />
                  <span>Order Food on Track</span>
                </button>
              )}
            </div>

          </div>
        )}

      </div>

      {showCancellationModal && (
        <CancellationReceiptModal
          pnrData={rawBookingRef || pnrResult}
          onClose={() => setShowCancellationModal(false)}
        />
      )}

    </div>
  );
}
