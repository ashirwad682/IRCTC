import React, { useState } from 'react';
import { Undo2, X, CheckCircle2, Clock, Download } from 'lucide-react';
import CancellationReceiptModal from './CancellationReceiptModal';

export default function RefundStatusModal({ onClose, userBookings = [] }) {
  const [activeReceiptBooking, setActiveReceiptBooking] = useState(null);

  // Only show real cancelled tickets from the user's actual bookings
  const cancelledTickets = userBookings.filter(b => b.status === 'CANCELLED' || b.isCancelled === true);

  // Compute refund amount per ticket accurately
  function computeRefund(b) {
    if (b.cancellationDetails) {
      return {
        total: b.cancellationDetails.totalPaid || b.totalPaid || 2186.30,
        cancCharge: b.cancellationDetails.totalDeduction || 424.80,
        refundAmt: b.cancellationDetails.netRefund || 1725.20
      };
    }
    const total = b.totalPaid || 2186.30;
    const conv = b.convenienceFee || 35.40;
    const ticketFare = b.ticketFare || Math.max(0, total - conv);
    const paxCount = (b.passengers || []).length || 1;
    const cCode = (b.classCode || '3A').toUpperCase();
    const perPaxMap = { '1A': 240, 'EC': 240, '2A': 200, '3A': 180, '3E': 180, 'CC': 180, 'SL': 120, '2S': 60 };
    const baseCanc = (perPaxMap[cCode] || 180) * paxCount;
    const gst = Math.round(baseCanc * 0.18 * 100) / 100;
    const cancCharge = Math.round((baseCanc + gst) * 100) / 100;
    const refundAmt = Math.max(0, Math.round((ticketFare - cancCharge) * 100) / 100);
    return { total, cancCharge, refundAmt };
  }

  const totalRefunded = cancelledTickets.reduce((s, b) => {
    const { refundAmt } = computeRefund(b);
    return s + refundAmt;
  }, 0);

  // Delete a single record from localStorage
  function deleteRecord(pnr) {
    if (!window.confirm(`Delete refund record for PNR ${pnr}? This cannot be undone.`)) return;
    try {
      const stored = JSON.parse(localStorage.getItem('railx_user_bookings') || '[]');
      const updated = stored.filter(b => String(b.pnr) !== String(pnr));
      localStorage.setItem('railx_user_bookings', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error deleting record:', e);
    }
  }

  // Clear all cancelled records
  function clearAll() {
    if (!window.confirm('Clear all cancelled ticket refund records? This cannot be undone.')) return;
    try {
      const stored = JSON.parse(localStorage.getItem('railx_user_bookings') || '[]');
      const updated = stored.filter(b => b.status !== 'CANCELLED');
      localStorage.setItem('railx_user_bookings', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      onClose();
    } catch (e) {
      console.error('Error clearing cancelled records:', e);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 my-8 space-y-6">

        {/* Header */}
        <div className="bg-[#000066] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-black">
              <Undo2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">Check Refund Status</h2>
              <span className="text-xs font-bold text-slate-300">Instant Bank Refunds — Live IRCTC CRS Log</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-slate-50">

          {cancelledTickets.length === 0 ? (
            /* Empty state */
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-3xl">✅</div>
              <h3 className="font-black text-slate-900">No Cancelled Tickets</h3>
              <p className="text-xs text-slate-500 font-semibold">All your tickets are active. No refunds pending.</p>
            </div>
          ) : (
            <>
              {/* Summary Banner */}
              <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Refund</span>
                  <span className="text-xl font-mono font-black text-emerald-600 block">₹{totalRefunded.toFixed(0)}</span>
                </div>
                <div className="border-x border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Cancelled Tickets</span>
                  <span className="text-xl font-mono font-black text-amber-600 block">{cancelledTickets.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Processing Speed</span>
                  <span className="text-xs font-black text-blue-900 block mt-1">Instant (IMPS / UPI)</span>
                </div>
              </div>

              {/* List Header with Clear All */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Cancelled Tickets History ({cancelledTickets.length})
                </h3>
                <button
                  onClick={clearAll}
                  className="text-[11px] font-black text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                >
                  🗑️ Clear All
                </button>
              </div>

              {/* Ticket Cards */}
              <div className="space-y-4">
                {cancelledTickets.map((b) => {
                  const { total, cancCharge, refundAmt } = computeRefund(b);
                  const pnr = b.pnr;
                  const trainName = b.trainName || 'EXPRESS';
                  const trainNumber = b.trainNumber || '';
                  const from = b.from || 'Origin';
                  const to = b.to || 'Destination';
                  const date = b.date || '';

                  return (
                    <div key={pnr} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">

                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-blue-800">PNR: {pnr}</span>
                            <span className="font-black text-slate-900 text-sm">
                              {trainNumber ? `#${trainNumber} - ` : ''}{trainName}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-600 block mt-0.5">
                            {from} ➔ {to}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                            ✅ REFUND INITIATED
                          </span>
                          <button
                            onClick={() => deleteRecord(pnr)}
                            title="Delete this record"
                            className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center cursor-pointer text-xs"
                          >
                            🗑
                          </button>
                        </div>
                      </div>

                      {/* Refund Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Journey Date</span>
                          <span className="font-bold text-slate-800">{date}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Original Fare</span>
                          <span className="font-mono font-bold text-slate-700">₹{total.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Cancellation Fee</span>
                          <span className="font-mono font-bold text-rose-600">-₹{cancCharge.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Refund Amount</span>
                          <span className="font-mono font-black text-emerald-700 text-sm">₹{refundAmt.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Status Row */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-600 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Refund dispatched to original payment source within 24–48 hrs</span>
                        </span>
                        <button
                          onClick={() => setActiveReceiptBooking(b)}
                          className="text-[11px] font-black text-[#283593] hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt (PDF)</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#283593] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>

      {/* Official IRCTC Cancellation Slip PDF Modal */}
      {activeReceiptBooking && (
        <CancellationReceiptModal
          pnrData={activeReceiptBooking}
          onClose={() => setActiveReceiptBooking(null)}
        />
      )}
    </div>
  );
}
