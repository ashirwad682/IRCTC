import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/api';
import { ArrowLeft, Printer, ChevronDown, ChevronUp, AlertCircle, FileText, CheckCircle2, XCircle, Train, RefreshCw, ShoppingBag, Hotel, Bus, Coffee, Trash2, IndianRupee, BadgeCheck, Clock, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function BookedTicketHistoryPage({ onBack, onViewTicket, onCancelTicket, userBookings = [], onClearAllBookings, onOrderFood, onCheckPnr, currentUser, onOpenLoginModal }) {
  const [selectedTab, setSelectedTab] = useState('upcoming'); // 'all', 'upcoming', 'past', 'refund'
  const [expandedPnr, setExpandedPnr] = useState(userBookings[0]?.pnr || '');
  const [showMoreTxnInfo, setShowMoreTxnInfo] = useState(false);
  const [activeActionModal, setActiveActionModal] = useState(null); // { type, booking }
  const [refundStatuses, setRefundStatuses] = useState({});  // { pnr: 'CREDITED' | 'PROCESSING' | 'INITIATED' }
  const [downloadingPnr, setDownloadingPnr] = useState(null);
  const [localUserBookings, setLocalUserBookings] = useState(userBookings);
  const [selectedNewBoardingStation, setSelectedNewBoardingStation] = useState('');

  useEffect(() => {
    setLocalUserBookings(userBookings);
  }, [userBookings]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto border-4 border-amber-50 shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              LOGIN REQUIRED TO VIEW BOOKINGS
            </h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Viewing booked tickets and electronic reservation slips is strictly restricted to logged-in IRCTC account owners for passenger privacy and security.
            </p>
          </div>

          {onOpenLoginModal && (
            <button
              onClick={onOpenLoginModal}
              className="w-full py-3.5 rounded-full bg-[#000066] hover:bg-blue-900 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              Sign In To IRCTC ➔
            </button>
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors block mx-auto cursor-pointer"
            >
              ← Back to Search
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleConfirmBoardingPointChange = (pnrToChange, newStationStr) => {
    if (!pnrToChange || !newStationStr) return;

    // Update local state immediately
    setLocalUserBookings(prev => prev.map(b => {
      if (b.pnr === pnrToChange) {
        return {
          ...b,
          boardingAt: newStationStr,
          boardingStation: typeof b.boardingStation === 'object' ? { ...b.boardingStation, name: newStationStr } : newStationStr,
          boardingStationName: newStationStr
        };
      }
      return b;
    }));

    // Update in localStorage
    try {
      const stored = localStorage.getItem('railx_user_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.map(b => {
          if (b.pnr === pnrToChange) {
            return {
              ...b,
              boardingAt: newStationStr,
              boardingStation: typeof b.boardingStation === 'object' ? { ...b.boardingStation, name: newStationStr } : newStationStr,
              boardingStationName: newStationStr
            };
          }
          return b;
        });
        localStorage.setItem('railx_user_bookings', JSON.stringify(updated));
      }
    } catch (e) {}

    // Synchronize API to MongoDB Cloud if server is available
    try {
      fetch(`${API_BASE_URL}/api/bookings/${pnrToChange}/boarding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardingAt: newStationStr })
      }).catch(() => {});
    } catch (e) {}

    alert(`✅ Boarding station updated successfully to "${newStationStr}" for PNR ${pnrToChange}!`);
    setActiveActionModal(null);
    setSelectedNewBoardingStation('');
  };

  // Load & simulate real-time refund progress for cancelled tickets
  useEffect(() => {
    const cancelledBookings = localUserBookings.filter(b => b.status === 'CANCELLED');
    const statuses = {};
    cancelledBookings.forEach(b => {
      // Simulate refund progression based on cancellation time
      const cancelledAt = b.cancelledAt ? new Date(b.cancelledAt) : null;
      if (!cancelledAt) {
        statuses[b.pnr] = 'INITIATED';
      } else {
        const minutesAgo = (Date.now() - cancelledAt.getTime()) / 60000;
        if (minutesAgo >= 30) statuses[b.pnr] = 'CREDITED';
        else if (minutesAgo >= 5) statuses[b.pnr] = 'PROCESSING';
        else statuses[b.pnr] = 'INITIATED';
      }
    });
    setRefundStatuses(statuses);
  }, [localUserBookings]);

  // Helper: compute refund amount from raw booking data using official IRCTC class rules
  function computeRefund(b) {
    if (b.refundInfo) {
      return {
        total: b.refundInfo.grossFare + (b.convenienceFee || 11.80),
        conv: b.convenienceFee || 11.80,
        basefare: b.refundInfo.grossFare,
        baseCancCharge: b.refundInfo.baseCancelCharge,
        gstAmount: b.refundInfo.gstAmount,
        cancCharge: b.refundInfo.totalDeduction,
        refundAmt: b.refundInfo.netRefund,
        paxCount: b.refundInfo.count || b.passengers?.length || 1,
        perPaxCharge: b.refundInfo.perPassengerBaseCharge || 180,
      };
    }

    const total = b.totalPaid || 0;
    const conv = b.convenienceFee != null ? b.convenienceFee : 11.80;
    const ins = b.insurancePremium != null ? b.insurancePremium : (0.45 * (b.passengers?.length || 1));
    const basefare = b.ticketFare != null ? b.ticketFare : Math.max(0, total - conv - ins);
    const paxCount = b.passengers?.length || 1;

    const cls = String(b.classCode || b.selectedClass || '3A').toUpperCase();
    let perPaxCharge = 180; // Default 3A / CC
    if (cls.includes('1A') || cls.includes('EC')) perPaxCharge = 240;
    else if (cls.includes('2A')) perPaxCharge = 200;
    else if (cls.includes('3A') || cls.includes('CC') || cls.includes('3E')) perPaxCharge = 180;
    else if (cls.includes('SL')) perPaxCharge = 120;
    else if (cls.includes('2S')) perPaxCharge = 60;

    const baseCancCharge = perPaxCharge * paxCount;
    const gstAmount = Math.round(baseCancCharge * 0.18 * 100) / 100;
    const cancCharge = Math.round((baseCancCharge + gstAmount) * 100) / 100;
    const refundAmt = Math.max(0, Math.round(basefare - cancCharge));

    return { total, conv, basefare, baseCancCharge, gstAmount, cancCharge, refundAmt, paxCount, perPaxCharge };
  }

  // Delete a single cancelled ticket record from localStorage
  function deleteCancelledRecord(pnr) {
    try {
      const stored = JSON.parse(localStorage.getItem('railx_user_bookings') || '[]');
      const updated = stored.filter(b => String(b.pnr) !== String(pnr));
      localStorage.setItem('railx_user_bookings', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error deleting record:', e);
    }
  }

  // Clear all cancelled tickets from localStorage
  function clearAllCancelledRecords() {
    try {
      const stored = JSON.parse(localStorage.getItem('railx_user_bookings') || '[]');
      const updated = stored.filter(b => b.status !== 'CANCELLED');
      localStorage.setItem('railx_user_bookings', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error clearing cancelled records:', e);
    }
  }

  // Download cancellation slip as PDF
  async function downloadCancelSlip(pnr) {
    const el = document.getElementById(`cancel-slip-${pnr}`);
    if (!el) return;
    setDownloadingPnr(pnr);
    try {
      // Temporarily show the hidden element
      el.style.display = 'block';
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false
      });
      el.style.display = 'none';
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const imgH = (canvas.height * pageW) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, imgH);
      pdf.save(`IRCTC_CancelSlip_${pnr}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setDownloadingPnr(null);
    }
  }

  // Print cancellation slip
  function printCancelSlip(pnr) {
    const el = document.getElementById(`cancel-slip-${pnr}`);
    if (!el) return;
    const printWin = window.open('', '_blank', 'width=800,height=900');
    printWin.document.write(`
      <html><head><title>IRCTC Cancellation Slip – PNR ${pnr}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #111; }
        .header { background: #0026cd; color: white; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px; }
        .header h1 { margin: 0; font-size: 18px; } .header p { margin: 4px 0 0; font-size: 12px; opacity: .8; }
        .section { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
        .section h2 { font-size: 12px; color: #64748b; text-transform: uppercase; margin: 0 0 10px; }
        .row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; } .value { font-weight: 700; color: #0f172a; }
        .refund { color: #059669; font-size: 16px; font-weight: 900; }
        .charge { color: #dc2626; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .cancelled { background: #fee2e2; color: #991b1b; }
        .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
      </style></head><body>
      ${el.innerHTML}
      </body></html>`);
    printWin.document.close();
    setTimeout(() => { printWin.focus(); printWin.print(); printWin.close(); }, 400);
  }


  // Helper: parse IRCTC berth string like CNF/A1/18/LB → { coach, seat, type }
  const parseBerthStr = (berthStr, classCode) => {
    const str = String(berthStr || '').trim();
    const cc = String(classCode || '').toUpperCase();
    let coach = 'B1', seat = '18', type = 'LB', status = 'CNF';
    if (str.includes('/')) {
      const parts = str.split('/');
      status = parts[0] || 'CNF';
      coach  = parts[1] || 'B1';
      seat   = parts[2] || '18';
      type   = parts[3] || 'LB';
    } else {
      const matchNum = str.match(/\d+/);
      if (matchNum) seat = matchNum[0];
      if (str.includes('UB') || str.includes('Upper') || str.includes('UPPER')) type = 'UB';
      else if (str.includes('MB') || str.includes('Middle') || str.includes('MIDDLE')) type = 'MB';
      else if (str.includes('SL') || str.includes('Side Lower')) type = 'SL';
      else if (str.includes('SU') || str.includes('Side Upper')) type = 'SU';
      else type = 'LB';
    }
    // 2A/1A: no Middle Berths — correct legacy MB → UB
    if ((cc.includes('2A') || cc.includes('1A')) && type === 'MB') type = 'UB';
    // Map code to full name
    const typeNames = { LB: 'Lower', UB: 'Upper', MB: 'Middle', SL: 'Side Lower', SU: 'Side Upper' };
    return { status, coach, seat, type, typeName: typeNames[type] || type };
  };

  // Dynamic user account bookings dataset
  const bookingsData = userBookings.map(b => {
    const classCode = b.classCode || b.selectedClass || '3A';
    const isCancelled = b.status === 'CANCELLED' || b.isCancelled === true;
    return {
    pnr: b.pnr,
    trainName: b.trainName || 'EXPRESS',
    trainNumber: b.trainNumber || '12301',
    fromCode: b.from?.split(' ')?.[0] || 'NDLS',
    fromCity: b.from || 'NEW DELHI',
    toCode: b.to?.split(' ')?.[0] || 'MMCT',
    toCity: b.to || 'MUMBAI CENTRAL',
    depTime: b.depTime || '08:00',
    depDate: b.date || new Date().toISOString().split('T')[0],
    arrTime: b.arrTime || '20:00',
    arrDate: b.date || new Date().toISOString().split('T')[0],
    duration: '12h 00m',
    status: isCancelled ? 'CANCELLED' : (b.status || 'BOOKED'),
    boardingStation: b.boardingAt || (b.boardingStation?.name ? `${b.boardingStation.name}${b.boardingStation.code ? ` (${b.boardingStation.code})` : ''}` : b.from || 'NEW DELHI'),
    passengerSummary: `${b.passengers?.length || 1} Adult | ${classCode} | ${b.quota || 'General'}`,
    dmrcEligible: !isCancelled,
    passengers: (b.passengers || []).map((p, idx) => {
      const berthStr = p.berth || '';
      const parsed = parseBerthStr(berthStr, classCode);
      // Current status: if booking cancelled → show CANCELLED for all passengers
      const currentStatus = isCancelled
        ? 'CANC'
        : (parsed.status.includes('CNF') ? 'CNF' : parsed.status.includes('RAC') ? `RAC/${idx + 1}` : parsed.status);
      return {
        num: idx + 1,
        name: p.name,
        age: p.age,
        gender: p.gender,
        bookingStatus: berthStr || `CNF/${parsed.coach}/${parsed.seat}/${parsed.type}`,
        coach: parsed.coach,
        berthNo: parsed.seat,
        berthType: parsed.typeName,
        catering: p.food || p.catering || 'NO_FOOD',
        concession: 'NOCONC',
        currentStatus
      };
    }),
    details: {
      txnId: b.txnId || `TXN_${b.pnr}`,
      ticketType: 'E-ticket',
      bookedOn: new Date().toLocaleDateString(),
      boardingDate: b.date || new Date().toLocaleDateString(),
      vikalpStatus: 'No',
      bookedFrom: 'IRCTC WEBSITE',
      chartingStatus: isCancelled ? 'Ticket Cancelled' : 'Chart Not Prepared',
      paymentMode: 'Net Banking / UPI',
      convenienceFee: b.convenienceFee != null ? b.convenienceFee.toFixed(2) : '11.80',
      insuranceFee: b.insurancePremium != null ? b.insurancePremium.toFixed(2) : (0.45 * (b.passengers?.length || 1)).toFixed(2),
      ticketFare: b.ticketFare != null ? b.ticketFare.toFixed(2) : b.totalPaid != null ? (b.totalPaid - (b.convenienceFee || 11.80) - (b.insurancePremium || 0.45 * (b.passengers?.length || 1))).toFixed(2) : '0.00',
      totalAmount: b.totalPaid != null ? b.totalPaid.toFixed(2) : '0.00'
    }
  };});

  const filteredBookings = bookingsData.filter(b => {
    if (selectedTab === 'upcoming') return b.status !== 'CANCELLED';
    if (selectedTab === 'past') return b.status === 'CANCELLED';
    if (selectedTab === 'refund') return b.status === 'CANCELLED';
    return true;
  });
  const cancelledBookings = userBookings.filter(b => b.status === 'CANCELLED' || b.isCancelled === true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title & Back Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-slate-100 border border-slate-300 text-slate-700 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                BOOKED TICKET HISTORY
              </h1>
              <p className="text-xs text-slate-500 font-bold">
                Official IRCTC E-Ticket Booking & Refund Records
              </p>
            </div>
          </div>

          {/* Actions & Last Transaction Summary Box */}
          <div className="flex items-center gap-3">

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5 min-w-[320px]">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-600 font-serif text-sm">Last Transaction Detail</span>
                <span className="text-[11px] text-slate-500 font-mono">Status: <strong className="text-slate-900">{userBookings.length > 0 ? userBookings[0].status || 'BOOKED' : 'No Bookings'}</strong></span>
              </div>

              <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                <p>Transaction ID: <strong className="text-slate-900">{userBookings.length > 0 ? (userBookings[0].txnId || 'TXN_' + userBookings[0].pnr) : 'None'}</strong></p>
                <p>Total Saved Tickets: <strong className="text-slate-900">{userBookings.length}</strong></p>
              </div>

              <button
                onClick={() => setShowMoreTxnInfo(!showMoreTxnInfo)}
                className="w-full py-1.5 bg-[#3b3dbf] hover:bg-blue-800 text-white rounded-xl text-[11px] font-black transition-colors cursor-pointer text-center"
              >
                ➕ FOR MORE INFORMATION Click Here
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4 space-y-4">
        
        {/* Blue Security Warning Banner */}
        <div className="bg-[#eef4ff] border border-blue-200 p-3.5 rounded-2xl text-xs font-extrabold text-[#0026cd] shadow-2xs leading-relaxed">
          Indian Railway, IRCTC or its employees never ask for any personal banking information, including detail Debit/Credit Card number, OTP, ATM PIN, the CVV number, PAN number and date of birth.
        </div>

        {/* Sub-Tabs Bar */}
        <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-black uppercase tracking-wider pt-2">
          <button
            onClick={() => setSelectedTab('all')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
              selectedTab === 'all' ? 'border-[#ff5500] text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ALL JOURNEYS
          </button>

          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
              selectedTab === 'upcoming' ? 'border-[#ff5500] text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            UPCOMING
          </button>

          <button
            onClick={() => setSelectedTab('past')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
              selectedTab === 'past' ? 'border-[#ff5500] text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            PAST JOURNEYS
          </button>

          <button
            onClick={() => setSelectedTab('refund')}
            className={`pb-2.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              selectedTab === 'refund' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            💳 REFUND STATUS
            {cancelledBookings.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                {cancelledBookings.length}
              </span>
            )}
          </button>
        </div>

        {/* ========== REFUND STATUS PANEL (shown only on refund tab) ========== */}
        {selectedTab === 'refund' && (
          <div className="space-y-4">

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-xl">💳</div>
                  <div>
                    <h2 className="text-base font-black uppercase tracking-tight">Check Refund Status</h2>
                    <p className="text-xs text-emerald-100 font-semibold">Instant Bank Refunds — IRCTC processes refunds within 24–48 hrs</p>
                  </div>
                </div>
                {cancelledBookings.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all cancelled ticket refund records? This cannot be undone.')) {
                        clearAllCancelledRecords();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[11px] font-black border border-white/20 cursor-pointer transition-all"
                  >
                    🗑️ Clear All
                  </button>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/10 rounded-2xl p-3">
                  <span className="text-xl font-black block">{cancelledBookings.length}</span>
                  <span className="text-[11px] text-emerald-100 font-semibold block">Cancelled Tickets</span>
                </div>
                <div className="bg-white/10 rounded-2xl p-3">
                  <span className="text-xl font-black block">
                    ₹{cancelledBookings.reduce((s, b) => s + computeRefund(b).refundAmt, 0).toFixed(0)}
                  </span>
                  <span className="text-[11px] text-emerald-100 font-semibold block">Total Refund</span>
                </div>
                <div className="bg-white/10 rounded-2xl p-3">
                  <span className="text-xl font-black block">
                    {Object.values(refundStatuses).filter(s => s === 'CREDITED').length}
                  </span>
                  <span className="text-[11px] text-emerald-100 font-semibold block">Credited</span>
                </div>
              </div>
            </div>

            {/* Refund Policy Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs font-semibold text-amber-900 flex gap-2">
              <span className="text-base">⚠️</span>
              <span>
                <strong>IRCTC Refund Policy:</strong> Cancellation charges are deducted as per Railway Refund Rules 2015.
                Convenience fee is non-refundable. UPI/Net Banking refunds are processed within 24–48 working hours.
              </span>
            </div>

            {/* No Cancelled Tickets */}
            {cancelledBookings.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl mb-3">✅</div>
                <h3 className="font-black text-slate-900 text-sm">No Cancelled Tickets</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">All your tickets are active. No refunds pending.</p>
              </div>
            )}

            {/* Refund Cards */}
            {cancelledBookings.map((rawBooking) => {
              const { total, conv, baseCancCharge, gstAmount, cancCharge, refundAmt, paxCount, perPaxCharge } = computeRefund(rawBooking);
              const status = refundStatuses[rawBooking.pnr] || 'INITIATED';
              const bd = bookingsData.find(x => x.pnr === rawBooking.pnr) || {};

              const statusConfig = {
                INITIATED: { label: 'Refund Initiated', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', icon: '🔄' },
                PROCESSING: { label: 'Processing at Bank', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', icon: '⏳' },
                CREDITED: { label: 'Amount Credited ✓', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', dot: 'bg-emerald-500', icon: '✅' },
              }[status];

              // Refund timeline steps
              const steps = [
                { label: 'Cancellation Confirmed', done: true },
                { label: 'Refund Initiated by IRCTC', done: status === 'INITIATED' || status === 'PROCESSING' || status === 'CREDITED' },
                { label: 'Processing at Payment Gateway', done: status === 'PROCESSING' || status === 'CREDITED' },
                { label: 'Amount Credited to Bank', done: status === 'CREDITED' },
              ];

              return (
                <div key={rawBooking.pnr} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">

                  {/* Card Header */}
                  <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 font-black text-xs">
                        ❌
                      </div>
                      <div>
                        <span className="font-black text-sm text-slate-900 block">{bd.trainName || rawBooking.trainName} ({bd.trainNumber || rawBooking.trainNumber})</span>
                        <span className="text-[11px] font-mono text-slate-500 font-bold">PNR: {rawBooking.pnr}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                        <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse inline-block`}></span>
                        {statusConfig.icon} {statusConfig.label}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete refund record for PNR ${rawBooking.pnr}? This cannot be undone.`)) {
                            deleteCancelledRecord(rawBooking.pnr);
                          }
                        }}
                        title="Delete this refund record"
                        className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center cursor-pointer transition-all text-xs font-black"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Left: Refund Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                        💰 Refund Breakdown
                      </h4>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs font-bold">
                        <div className="flex justify-between text-slate-700">
                          <span>Ticket Total Paid</span>
                          <span className="font-black text-slate-900">₹ {total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Convenience Fee (Non-Refundable)</span>
                          <span className="text-rose-600">– ₹ {conv.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Base Cancellation Fee (₹{perPaxCharge} × {paxCount} pax)</span>
                          <span className="text-rose-600">– ₹ {baseCancCharge.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-amber-700">
                          <span>GST on Cancellation Charges (18%)</span>
                          <span className="text-rose-600">– ₹ {gstAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                          <span className="font-black text-slate-900 text-sm">REFUND AMOUNT</span>
                          <span className="font-black text-emerald-700 text-base">₹ {refundAmt.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs font-semibold text-blue-800 space-y-1">
                        <p>💳 <strong>Refund To:</strong> Original Payment Source (UPI / Net Banking)</p>
                        <p>⏱️ <strong>Expected In:</strong> {status === 'CREDITED' ? 'Already Credited ✅' : '24–48 Working Hours'}</p>
                        <p>📋 <strong>TXN Ref:</strong> {rawBooking.txnId || `TXN_${rawBooking.pnr}`}</p>
                      </div>
                    </div>

                    {/* Right: Progress Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                        🏦 Instant Bank Refund Progress
                      </h4>
                      <div className="relative pl-5 space-y-0">
                        {steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-3 relative pb-4 last:pb-0">
                            {/* Vertical line */}
                            {i < steps.length - 1 && (
                              <div className={`absolute left-0 top-3.5 w-0.5 h-full -translate-x-[1px] ${step.done ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                            )}
                            {/* Dot */}
                            <div className={`relative z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 -ml-5 mt-0.5 ${
                              step.done
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'bg-white border-slate-300'
                            }`}>
                              {step.done && <span className="text-[9px] font-black">✓</span>}
                            </div>
                            {/* Label */}
                            <div className="flex-1 pt-0.5">
                              <span className={`text-xs font-bold block ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</span>
                              {step.done && i === steps.length - 1 && status === 'CREDITED' && (
                                <span className="text-[10px] text-emerald-600 font-black">₹ {refundAmt.toFixed(2)} credited successfully</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Instant Refund Banner */}
                      {status === 'CREDITED' ? (
                        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-3 text-center">
                          <span className="text-emerald-700 font-black text-sm block">✅ Refund Successfully Credited!</span>
                          <span className="text-emerald-600 font-semibold text-xs">₹ {refundAmt.toFixed(2)} has been returned to your account</span>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                          <span className="text-slate-700 font-black text-xs block">⚡ IRCTC Instant Refund Active</span>
                          <span className="text-slate-500 font-semibold text-[11px]">Your refund is being processed at priority. Check your bank statement within 48 hrs.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ─── Download / Print Cancellation Slip ─── */}
                  <div className="px-5 pb-5">
                    <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs text-slate-500 font-semibold">
                        📄 Download or Print your official IRCTC Cancellation Slip for PNR <span className="font-mono font-black text-slate-800">{rawBooking.pnr}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadCancelSlip(rawBooking.pnr)}
                          disabled={downloadingPnr === rawBooking.pnr}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0026cd] hover:bg-blue-800 text-white text-xs font-black transition-all cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4" />
                          {downloadingPnr === rawBooking.pnr ? 'Generating...' : 'Download PDF'}
                        </button>
                        <button
                          onClick={() => printCancelSlip(rawBooking.pnr)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black transition-all cursor-pointer shadow-md"
                        >
                          <Printer className="w-4 h-4" />
                          Print Slip
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ─── Hidden Printable Cancellation Slip ─── */}
                  <div
                    id={`cancel-slip-${rawBooking.pnr}`}
                    style={{ display: 'none', padding: '32px', fontFamily: 'Arial, sans-serif', color: '#111', background: '#fff' }}
                  >
                    {/* Slip Header */}
                    <div style={{ background: '#0026cd', color: '#fff', borderRadius: '10px', padding: '16px 22px', marginBottom: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>🚂 IRCTC E-TICKET CANCELLATION SLIP</div>
                          <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.85 }}>Indian Railway Catering and Tourism Corporation Ltd.</div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '11px', opacity: 0.8 }}>
                          <div style={{ fontWeight: 700 }}>PNR: {rawBooking.pnr}</div>
                          <div>Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 800 }}>❌ CANCELLED</span>
                      <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 800 }}>
                        {status === 'CREDITED' ? '✅ REFUND CREDITED' : status === 'PROCESSING' ? '⏳ REFUND PROCESSING' : '🔄 REFUND INITIATED'}
                      </span>
                    </div>

                    {/* Train Info */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Train Details</div>
                      {[
                        ['Train Name', `${bd.trainName || rawBooking.trainName} (${bd.trainNumber || rawBooking.trainNumber})`],
                        ['Route', `${rawBooking.from || bd.fromCity} ➔ ${rawBooking.to || bd.toCity}`],
                        ['Journey Date', rawBooking.date || bd.depDate || '—'],
                        ['Class', rawBooking.classCode || rawBooking.selectedClass || '—'],
                        ['Quota', rawBooking.quota || 'General (GN)'],
                      ].map(([l, v]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ color: '#64748b' }}>{l}</span>
                          <span style={{ fontWeight: 700 }}>{v}</span>
                        </div>
                      ))}
                    </div>

                    {/* Passengers */}
                    {rawBooking.passengers && rawBooking.passengers.length > 0 && (
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Cancelled Passengers</div>
                        {rawBooking.passengers.map((p, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #f8fafc' }}>
                            <span style={{ fontWeight: 700 }}>{i + 1}. {p.name}</span>
                            <span style={{ color: '#64748b' }}>Age: {p.age} | {p.gender} | {p.berth || 'CNF'}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Refund Breakdown */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Refund Calculation</div>
                      {[
                        ['Ticket Total Paid', `₹ ${total.toFixed(2)}`, '#0f172a'],
                        ['Convenience Fee (Non-Refundable)', `– ₹ ${conv.toFixed(2)}`, '#dc2626'],
                        [`Base Cancellation Charges (₹${perPaxCharge} × ${paxCount} pax)`, `– ₹ ${baseCancCharge.toFixed(2)}`, '#dc2626'],
                        ['GST on Cancellation Charges (18%)', `– ₹ ${gstAmount.toFixed(2)}`, '#dc2626'],
                      ].map(([l, v, c]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ color: '#64748b' }}>{l}</span>
                          <span style={{ fontWeight: 700, color: c }}>{v}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900, padding: '8px 0 0', marginTop: '4px', borderTop: '2px solid #e2e8f0' }}>
                        <span>NET REFUND AMOUNT</span>
                        <span style={{ color: '#059669' }}>₹ {refundAmt.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Transaction Info */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Transaction Details</div>
                      {[
                        ['Transaction ID', rawBooking.txnId || `TXN_${rawBooking.pnr}`],
                        ['Refund To', 'Original Payment Source (UPI / Net Banking)'],
                        ['Refund Status', status === 'CREDITED' ? 'Amount Credited ✓' : status === 'PROCESSING' ? 'Processing at Bank' : 'Refund Initiated'],
                        ['Processing Time', status === 'CREDITED' ? 'Already Credited' : '24–48 Working Hours'],
                      ].map(([l, v]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ color: '#64748b' }}>{l}</span>
                          <span style={{ fontWeight: 700 }}>{v}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                      <p style={{ fontWeight: 700, marginBottom: '2px' }}>This is an auto-generated IRCTC Cancellation Slip. No signature required.</p>
                      <p>For queries, contact IRCTC helpline: 139 | care@irctc.co.in | www.irctc.co.in</p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Bookings List */}
        {selectedTab !== 'refund' && (
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((b) => {
              const isExpanded = expandedPnr === b.pnr;
              const isBooked = b.status === 'BOOKED';

              return (
                <div
                  key={b.pnr}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200"
                >
                  {/* Collapsed Card Header */}
                  <div
                    onClick={() => setExpandedPnr(isExpanded ? null : b.pnr)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">{b.trainName} ({b.trainNumber})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          isBooked ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          STATUS: {b.status}
                        </span>
                      </div>

                      {/* Departure ➔ Duration ➔ Arrival */}
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                        <span>{b.depTime} | {b.fromCity} ({b.fromCode})</span>
                        <span className="text-slate-400 font-normal">— {b.duration} —</span>
                        <span>{b.arrTime} | {b.toCity} ({b.toCode})</span>
                      </div>
                      
                      <p className="text-[11px] text-slate-500 font-medium">{b.depDate} ➔ {b.arrDate}</p>
                    </div>

                    {/* PNR & Action Right */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-black text-[#ff5500]">
                          <span>PNR: {b.pnr}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const rawBooking = localUserBookings.find(raw => raw.pnr === b.pnr) || b;
                              if (onViewTicket) onViewTicket(rawBooking);
                            }}
                            className="p-1 hover:bg-orange-100 rounded cursor-pointer"
                            title="Print / View ERS Ticket"
                          >
                            <Printer className="w-4 h-4 text-[#ff5500]" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                          Boarding Station: {b.boardingStation}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Card Body */}
                  {isExpanded && b.passengers && (
                    <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/50 space-y-5 animate-in fade-in duration-150">
                      
                      {/* Eligible Banner & Class summary */}
                      <div className="space-y-2">
                        {b.dmrcEligible && (
                          <p className="text-xs font-bold text-emerald-700">
                            This PNR is eligible for DMRC ticket booking.
                          </p>
                        )}
                        <p className="text-xs font-extrabold text-slate-900">
                          {b.passengerSummary}
                        </p>
                      </div>

                      {/* Passenger Details Grid */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                        <h4 className="text-xs font-black text-slate-900 uppercase">Passenger Details</h4>
                        
                        <div className="space-y-2">
                          {b.passengers.map((p) => (
                            <div key={p.num} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                              <div className="flex items-center justify-between font-bold text-slate-900">
                                <span>{p.num}. {p.name} ({p.age}, {p.gender})</span>
                                <span className={`font-black ${
                                  p.currentStatus === 'CANC' ? 'text-red-600' :
                                  p.currentStatus?.startsWith('RAC') ? 'text-amber-600' :
                                  'text-emerald-700'
                                }`}>{p.bookingStatus}</span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium text-slate-600 pt-1 border-t border-slate-200/60">
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Berth/WL No</span>
                                  <strong className="text-slate-900">{p.berthNo}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Berth Type</span>
                                  <strong className="text-slate-900">{p.berthType}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Catering Service</span>
                                  <strong className="text-slate-900">{p.catering}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Current Status</span>
                                  <strong className={`font-black ${
                                    p.currentStatus === 'CANC' ? 'text-red-600' :
                                    p.currentStatus?.startsWith('RAC') ? 'text-amber-600' :
                                    'text-emerald-700'
                                  }`}>{p.currentStatus}</strong>
                                </div>
                              </div>

                              {p.policyNo && (
                                <p className="text-[10px] text-slate-500 font-mono pt-1">
                                  Policy No: <span className="font-bold text-slate-800">{p.policyNo}</span>
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Booking Details vs Payment Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Booking Details Card */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                          <h4 className="font-black text-slate-900 bg-slate-100 p-2 rounded-lg -mx-1 -mt-1">
                            Booking Details
                          </h4>

                          <div className="space-y-1.5 font-medium text-slate-700">
                            <div className="flex justify-between">
                              <span>Transaction ID</span>
                              <strong className="font-mono text-slate-900">{b.details.txnId}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Ticket Type</span>
                              <strong className="text-slate-900">{b.details.ticketType}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Booked On</span>
                              <strong className="text-slate-900">{b.details.bookedOn}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Date of Boarding</span>
                              <strong className="text-slate-900">{b.details.boardingDate}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Payment Details Card */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                          <h4 className="font-black text-slate-900 bg-slate-100 p-2 rounded-lg -mx-1 -mt-1">
                            Payment Details
                          </h4>

                          <div className="space-y-1.5 font-medium text-slate-700">
                            <div className="flex justify-between">
                              <span>Payment Mode</span>
                              <strong className="text-slate-900">{b.details.paymentMode}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Ticket Fare</span>
                              <strong className="font-mono text-slate-900">₹{b.details.ticketFare}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>IRCTC Convenience Fee (Incl. of GST)</span>
                              <strong className="font-mono text-slate-900">₹{b.details.convenienceFee}</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Travel Insurance Premium (Incl. of GST)</span>
                              <strong className="font-mono text-slate-900">₹{b.details.insuranceFee}</strong>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                              <span>Total Amount Paid</span>
                              <strong className="font-mono text-emerald-700 text-sm">₹{b.details.totalAmount}</strong>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => {
                            const rawBooking = localUserBookings.find(raw => raw.pnr === b.pnr) || b;
                            if (onViewTicket) onViewTicket(rawBooking);
                          }}
                          className="px-4 py-2 bg-[#000066] hover:bg-blue-900 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View / Print ERS Slip</span>
                        </button>
                    </div>

                    {/* Travel Insurance Card */}
                    {b.insurance && (
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <h4 className="font-black text-slate-900 bg-slate-100 p-2 rounded-lg -mx-1 -mt-1">
                          Travel Insurance (Incl. of GST)
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                          <div>
                            <p>Insurance Opted: <strong className="text-slate-900">{b.insurance.opted}</strong></p>
                            <p>Insurance Company: <strong className="text-[#0026cd]">{b.insurance.company}</strong> <a href="#nominee" className="text-blue-600 hover:underline font-bold ml-1">(Update Nominee)</a></p>
                            <p>Policy Issue date: <strong className="text-slate-900">{b.insurance.issueDate}</strong></p>
                          </div>
                          <div>
                            <p>Travel Insurance Premium (Incl. of GST): <strong className="font-mono text-slate-900">₹ {b.insurance.premium}</strong></p>
                            <p>Insurance (No of Psgn): <strong className="text-slate-900">{b.insurance.count}</strong></p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium pt-1">
                          Click Insurance Company name to submit nomination details. Link will be highlighted once Policy is issued by respective Insurance Company.
                        </p>
                      </div>
                    )}

                    {/* Interactive Action Pills Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {b.status === 'CANCELLED' || b.isCancelled ? (
                        <>
                          <span className="px-3.5 py-1.5 bg-rose-100 text-rose-800 rounded-full text-xs font-extrabold flex items-center gap-1">
                            ❌ Ticket Cancelled
                          </span>
                          <button
                            onClick={() => setActiveActionModal({ type: 'pnr_status', booking: b })}
                            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0026cd] rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Get PNR Status
                          </button>
                          <button
                            onClick={() => setActiveActionModal({ type: 'sms_sent', booking: b })}
                            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0026cd] rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Get SMS
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onCancelTicket && onCancelTicket(b)}
                            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0026cd] rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Cancel E-Ticket
                          </button>
                          <button
                            onClick={() => setActiveActionModal({ type: 'pnr_status', booking: b })}
                            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0026cd] rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Get PNR Status
                          </button>
                          <button
                            onClick={() => setActiveActionModal({ type: 'nosb_child', booking: b })}
                            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0026cd] rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Child (NOSB) Booking
                          </button>
                          <button
                            onClick={() => setActiveActionModal({ type: 'sms_sent', booking: b })}
                            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0026cd] rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Get SMS
                          </button>
                          <button
                            onClick={() => setActiveActionModal({ type: 'boarding_point', booking: b })}
                            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0026cd] rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Change Boarding Point
                          </button>
                          <button
                            onClick={() => onOrderFood ? onOrderFood(b) : setActiveActionModal({ type: 'ecatering', booking: b })}
                            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0026cd] rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Order Food - E-Catering
                          </button>
                          <button
                            onClick={() => setActiveActionModal({ type: 'retiring_room', booking: b })}
                            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0026cd] rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Book Retiring Room
                          </button>
                          <button
                            onClick={() => setActiveActionModal({ type: 'hotel_booking', booking: b })}
                            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0026cd] rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Book Hotel
                          </button>
                          <button
                            onClick={() => setActiveActionModal({ type: 'tourist_pkg', booking: b })}
                            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0026cd] rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Book Tourist Package
                          </button>
                          <button
                            onClick={() => setActiveActionModal({ type: 'bus_booking', booking: b })}
                            className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#0026cd] rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Book Bus
                          </button>

                          {b.dmrcEligible && (
                            <button
                              onClick={() => setActiveActionModal({ type: 'dmrc_ticket', booking: b })}
                              className="px-3.5 py-1.5 bg-[#eef4ff] border border-blue-300 hover:bg-blue-50 text-[#0026cd] rounded-full text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <span className="w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-bold">M</span>
                              <span>Book DMRC Ticket</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>

                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">No {selectedTab === 'past' ? 'past' : 'upcoming'} bookings found</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              {selectedTab === 'past' ? 'Cancelled or completed journeys will be displayed here.' : 'Train tickets booked in your account will appear here immediately after payment.'}
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="px-5 py-2.5 bg-[#000066] hover:bg-blue-900 text-white rounded-full text-xs font-black transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Book Train Ticket ➔</span>
              </button>
            )}
          </div>
        )}

      </div>
      )}

      {/* INTERACTIVE ACTION MODAL DIALOGS */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 font-sans relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0026cd] flex items-center justify-center font-black text-xs">
                  IR
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    {activeActionModal.type === 'pnr_status' && 'PNR Live Status Enquiry'}
                    {activeActionModal.type === 'nosb_child' && 'Child (NOSB) Ticket Booking'}
                    {activeActionModal.type === 'sms_sent' && 'E-Ticket SMS Sent'}
                    {activeActionModal.type === 'boarding_point' && 'Change Boarding Station'}
                    {activeActionModal.type === 'retiring_room' && 'Book Station Retiring Room'}
                    {activeActionModal.type === 'hotel_booking' && 'Book IRCTC Hotels'}
                    {activeActionModal.type === 'tourist_pkg' && 'Book IRCTC Tour Package'}
                    {activeActionModal.type === 'bus_booking' && 'Book Connecting Bus Ticket'}
                    {activeActionModal.type === 'dmrc_ticket' && 'DMRC Delhi Metro Transit QR'}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold font-mono">PNR: {activeActionModal.booking.pnr}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveActionModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Content */}
            {activeActionModal.type === 'pnr_status' && (
              <div className="space-y-3 text-xs font-bold text-slate-800">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                  <div className="flex justify-between"><span>Train:</span><span className="font-black text-slate-900">{activeActionModal.booking.trainNumber} - {activeActionModal.booking.trainName}</span></div>
                  <div className="flex justify-between"><span>Journey Date:</span><span className="font-black text-slate-900">{activeActionModal.booking.depDate}</span></div>
                  <div className="flex justify-between"><span>Class & Quota:</span><span className="font-black text-slate-900">{activeActionModal.booking.passengerSummary}</span></div>
                  <div className="flex justify-between"><span>Charting Status:</span><span className="font-extrabold text-amber-700">CHART NOT PREPARED</span></div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-black text-slate-900 uppercase block">Passenger Live Status:</span>
                  {(activeActionModal.booking.passengers || []).map((p, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <span>{p.num}. {p.name} ({p.gender}, {p.age})</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black">{p.bookingStatus || 'CNF/B1/18/LB'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeActionModal.type === 'nosb_child' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 font-medium">Add a child below 5 years (No Officer Seat/Berth allocated - Free Fare as per Indian Railway rules).</p>
                <div className="space-y-2">
                  <input type="text" placeholder="Child Full Name" className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Age (0-4 yrs)" className="p-2.5 rounded-xl border border-slate-300 font-bold text-xs" />
                    <select className="p-2.5 rounded-xl border border-slate-300 font-bold text-xs">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => { alert(`Child (NOSB) added successfully to PNR ${activeActionModal.booking.pnr}!`); setActiveActionModal(null); }}
                  className="w-full py-2.5 rounded-xl bg-[#0026cd] text-white font-black text-xs shadow-md cursor-pointer"
                >
                  Add Child to PNR
                </button>
              </div>
            )}

            {activeActionModal.type === 'sms_sent' && (
              <div className="space-y-3 text-xs text-center p-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h4 className="font-black text-slate-900 text-sm">SMS Sent Successfully!</h4>
                <p className="text-slate-600 font-medium">E-Ticket SMS with PNR {activeActionModal.booking.pnr} for {activeActionModal.booking.trainName} has been dispatched to your registered mobile number.</p>
                <button onClick={() => setActiveActionModal(null)} className="px-6 py-2 rounded-full bg-slate-900 text-white font-black text-xs">Close</button>
              </div>
            )}

            {activeActionModal.type === 'boarding_point' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 font-medium">Select a new boarding station along the route of Train {activeActionModal.booking.trainNumber}:</p>
                <select
                  value={selectedNewBoardingStation}
                  onChange={(e) => setSelectedNewBoardingStation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#0026cd]"
                >
                  <option value="">-- Select New Boarding Station --</option>
                  <option value="NEW DELHI (NDLS)">NEW DELHI (NDLS)</option>
                  <option value="FARIDABAD (FDB)">FARIDABAD (FDB)</option>
                  <option value="MATHURA JN (MTJ)">MATHURA JN (MTJ)</option>
                  <option value="KOTA JN (KOTA)">KOTA JN (KOTA)</option>
                  <option value="RATLAM JN (RTM)">RATLAM JN (RTM)</option>
                  <option value="VADODARA JN (BRC)">VADODARA JN (BRC)</option>
                  <option value="SURAT (ST)">SURAT (ST)</option>
                  <option value="VAPI (VAPI)">VAPI (VAPI)</option>
                  <option value="BORIVALI (BVI)">BORIVALI (BVI)</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const stnToSave = selectedNewBoardingStation || 'SURAT (ST)';
                    handleConfirmBoardingPointChange(activeActionModal.booking.pnr, stnToSave);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0026cd] hover:bg-blue-800 text-white font-black text-xs shadow-md cursor-pointer transition-colors"
                >
                  Confirm Boarding Change
                </button>
              </div>
            )}

            {activeActionModal.type === 'retiring_room' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-black text-slate-900 block">Station: {activeActionModal.booking.toCity} ({activeActionModal.booking.toCode})</span>
                  <span className="text-slate-500 font-semibold block">AC Deluxe Room / Executive Dormitory Bed available</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 border border-slate-300 rounded-xl text-center">
                    <span className="block font-black text-slate-900">AC Dormitory</span>
                    <span className="block font-extrabold text-blue-700">₹ 250 / 12 hrs</span>
                  </div>
                  <div className="p-2.5 border border-blue-500 bg-blue-50 rounded-xl text-center">
                    <span className="block font-black text-slate-900">Deluxe AC Room</span>
                    <span className="block font-extrabold text-blue-700">₹ 650 / 24 hrs</span>
                  </div>
                </div>
                <button
                  onClick={() => { alert(`Retiring Room booked at ${activeActionModal.booking.toCode} for PNR ${activeActionModal.booking.pnr}!`); setActiveActionModal(null); }}
                  className="w-full py-2.5 rounded-xl bg-[#0026cd] text-white font-black text-xs shadow-md cursor-pointer"
                >
                  Book Retiring Room (₹650)
                </button>
              </div>
            )}

            {activeActionModal.type === 'hotel_booking' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 font-medium">IRCTC Partner Hotels near {activeActionModal.booking.toCity}:</p>
                <div className="p-3 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50">
                  <div>
                    <span className="font-black text-slate-900 block">Hotel Rail Executive</span>
                    <span className="text-[10px] text-amber-600 font-bold block">4.8★ | 300m from Station</span>
                  </div>
                  <span className="font-black text-blue-900 text-sm">₹ 1,499</span>
                </div>
                <button
                  onClick={() => { alert(`Hotel booking confirmed near ${activeActionModal.booking.toCity}!`); setActiveActionModal(null); }}
                  className="w-full py-2.5 rounded-xl bg-[#0026cd] text-white font-black text-xs shadow-md cursor-pointer"
                >
                  Book Hotel Rooms
                </button>
              </div>
            )}

            {activeActionModal.type === 'tourist_pkg' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 font-medium">Featured IRCTC Tourist Packages:</p>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-1">
                  <span className="font-black text-slate-900 block">🇮🇳 Bharat Gaurav Pilgrimage Express</span>
                  <span className="text-[11px] text-slate-500 block">5 Days / 4 Nights | All Inclusive Meals & Sightseeing</span>
                  <span className="font-black text-emerald-700 text-sm block">₹ 8,999 / person</span>
                </div>
                <button
                  onClick={() => { alert("Tourist package enquiry sent to IRCTC Tourism!"); setActiveActionModal(null); }}
                  className="w-full py-2.5 rounded-xl bg-[#0026cd] text-white font-black text-xs shadow-md cursor-pointer"
                >
                  Book Tour Package
                </button>
              </div>
            )}

            {activeActionModal.type === 'bus_booking' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 font-medium">IRCTC Bus Connect for {activeActionModal.booking.toCity}:</p>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center">
                  <div>
                    <span className="font-black text-slate-900 block">Volvo AC Multi-Axle Sleeper</span>
                    <span className="text-[10px] text-slate-500 font-bold block">Departs 21:30 from Station Bus Stand</span>
                  </div>
                  <span className="font-black text-blue-900 text-sm">₹ 650</span>
                </div>
                <button
                  onClick={() => { alert(`Bus Ticket booked for connecting travel at ${activeActionModal.booking.toCity}!`); setActiveActionModal(null); }}
                  className="w-full py-2.5 rounded-xl bg-[#0026cd] text-white font-black text-xs shadow-md cursor-pointer"
                >
                  Book Bus Seat
                </button>
              </div>
            )}

            {activeActionModal.type === 'dmrc_ticket' && (
              <div className="space-y-3 text-xs text-center p-2">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto text-sm font-black">
                  M
                </div>
                <h4 className="font-black text-slate-900 text-sm uppercase">DMRC Delhi Metro Transit QR</h4>
                <p className="text-slate-600 font-medium text-[11px]">QR Metro Pass linked with PNR {activeActionModal.booking.pnr} for instant station entry.</p>
                <div className="w-36 h-36 bg-slate-100 border border-slate-300 rounded-2xl mx-auto flex items-center justify-center text-slate-400 font-bold">
                  [ Metro QR Code ]
                </div>
                <button
                  onClick={() => { alert(`DMRC Metro QR Pass for PNR ${activeActionModal.booking.pnr} saved to phone!`); setActiveActionModal(null); }}
                  className="px-6 py-2 rounded-full bg-[#0026cd] text-white font-black text-xs shadow-md cursor-pointer"
                >
                  Download Metro QR
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  </div>
);
}
