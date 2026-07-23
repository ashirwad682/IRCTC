import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { XCircle, Search, ShieldCheck, AlertCircle, FileText, CheckCircle2, Clock, Train, User, DollarSign, ArrowRight, RefreshCcw, Info, Download, AlertTriangle, Lock, Printer, Loader2, Ticket } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { adjustSeatsOnCancellation } from '../services/seatInventoryService';

const sampleBookings = [];

export default function CancelTicketPage({ userBookings = [], prefillPnr = null, currentUser = null, onOpenLoginModal, onOrderFood, onBackToSearch, onTicketCancelled }) {
  const [pnrInput, setPnrInput] = useState(prefillPnr || '');
  const [trainNoInput, setTrainNoInput] = useState('');
  const [searchedBooking, setSearchedBooking] = useState(null);
  const [selectedPassengers, setSelectedPassengers] = useState({});
  const [cancelReason, setCancelReason] = useState('Change of Travel Plan');
  const [errorMsg, setErrorMsg] = useState('');
  const [cancellationResult, setCancellationResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [qrBase64, setQrBase64] = useState('');
  const [ticketFilter, setTicketFilter] = useState('ALL'); // 'ALL' | 'BOOKED' | 'CANCELLED'

  // Auto-select ticket from user bookings on load or prefill
  useEffect(() => {
    const targetPnr = prefillPnr || userBookings[0]?.pnr;
    if (targetPnr) {
      setPnrInput(targetPnr);
      handleSearchPnr(targetPnr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillPnr, userBookings]);

  // Generate 2D QR Code for Cancellation Slip
  useEffect(() => {
    if (!cancellationResult) return;
    let isMounted = true;
    const qrPayload = `IRCTC E-TICKET CANCELLATION SLIP
CANCEL REF ID: ${cancellationResult.cancelId}
PNR: ${cancellationResult.pnr}
TRAIN: ${cancellationResult.trainNumber} - ${cancellationResult.trainName}
CANCELLED DATE: ${cancellationResult.cancelledDate}
PASSENGERS: ${cancellationResult.cancelledPassengers?.map(p => p.name).join(', ')}
GROSS FARE: ₹${cancellationResult.refundInfo.grossFare}
BASE CANCEL CHARGE: ₹${cancellationResult.refundInfo.baseCancelCharge}
GST ON CANCEL CHARGE (18%): ₹${cancellationResult.refundInfo.gstAmount}
TOTAL DEDUCTION: ₹${cancellationResult.refundInfo.totalDeduction}
NET REFUND CREDITED: ₹${cancellationResult.refundInfo.netRefund}
STATUS: CANCELLED / REFUND INITIATED`;

    QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 400,
      color: { dark: '#000000', light: '#FFFFFF' }
    }).then(url => {
      if (isMounted) setQrBase64(url);
    }).catch(err => {
      console.warn("QR Generation error:", err);
    });

    return () => { isMounted = false; };
  }, [cancellationResult]);

  // Download PDF Cancellation Slip
  const handleDownloadCancellationPdf = async () => {
    const input = document.getElementById('cancel-ticket-print-area');
    if (!input || isDownloadingPdf) return;

    setIsDownloadingPdf(true);

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 4;
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - (margin * 2);

      const widthRatio = maxWidth / canvas.width;
      const heightRatio = maxHeight / canvas.height;
      const ratio = Math.min(widthRatio, heightRatio);

      const finalWidth = canvas.width * ratio;
      const finalHeight = canvas.height * ratio;

      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = margin;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(`IRCTC_Cancellation_Slip_${cancellationResult?.pnr || 'PNR'}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Quick lookup helper
  const handleQuickLookup = (pnr) => {
    setPnrInput(pnr);
    handleSearchPnr(pnr);
  };

  const handleSearchPnr = (targetPnr = pnrInput) => {
    setErrorMsg('');
    setCancellationResult(null);
    const cleanPnr = targetPnr.trim().replace(/\D/g, '');

    if (!cleanPnr || cleanPnr.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit PNR number.');
      setSearchedBooking(null);
      return;
    }

    // Must be logged in to cancel a ticket
    if (!currentUser?.username) {
      setSearchedBooking(null);
      setErrorMsg('🔒 Please log in to your IRCTC account to search and cancel tickets.');
      if (onOpenLoginModal) onOpenLoginModal();
      return;
    }

    // Lookup ONLY in current user's bookings — filter localStorage by username
    const localTickets = (() => {
      try {
        const stored = JSON.parse(localStorage.getItem('railx_user_bookings') || '[]');
        // Keep only tickets that belong to the logged-in user
        return stored.filter(b =>
          !b.username || b.username === currentUser.username
        );
      } catch { return []; }
    })();

    // userBookings prop is already filtered by username from App.jsx
    const allUserTickets = [
      ...userBookings,
      // Add any local-only tickets that aren't already in the server list
      ...localTickets.filter(lt => !userBookings.some(ub => ub.pnr === lt.pnr))
    ];

    const match = allUserTickets.find(b => String(b.pnr).replace(/\D/g, '') === cleanPnr);

    if (match) {
      setSearchedBooking(match);
      setTrainNoInput(match.trainNumber || '');

      const isTicketCancelled = match.status === 'CANCELLED' || match.isCancelled ||
        (match.passengers && match.passengers.length > 0 && match.passengers.every(p => String(p.status || p.berth || '').toUpperCase().includes('CAN')));

      if (isTicketCancelled) {
        // Auto-populate cancellationResult so the full E-Ticket Cancellation Slip, PDF Download, and Print buttons NEVER disable after refresh!
        const cDetails = match.cancellationDetails || {};
        const cancelId = cDetails.cancellationId || match.cancelId || ('CAN' + String(match.pnr || '92839191').slice(-6) + '91');
        const psgList = match.passengers || [];
        const totalFare = Number(
          match.ticketFare ||
          (match.totalPaid != null && match.convenienceFee != null
            ? match.totalPaid - match.convenienceFee
            : match.totalPaid || 1200)
        );
        const grossFare = cDetails.grossFare || totalFare;
        const baseCancelCharge = cDetails.baseCancelCharge || (180 * Math.max(1, psgList.length));
        const gstAmount = cDetails.gst18 || Math.round(baseCancelCharge * 0.18);
        const totalDeduction = cDetails.totalDeduction || (baseCancelCharge + gstAmount);
        const netRefund = cDetails.netRefund || Math.max(0, grossFare - totalDeduction);

        setCancellationResult({
          cancelId,
          pnr: match.pnr,
          trainName: match.trainName || 'MUMBAI TEJAS RAJDHANI EXP',
          trainNumber: match.trainNumber || '12952',
          cancelledDate: cDetails.cancelledAt
            ? new Date(cDetails.cancelledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : (match.cancelledDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })),
          cancelledPassengers: psgList,
          refundInfo: {
            grossFare,
            baseCancelCharge,
            gstAmount,
            totalDeduction,
            netRefund,
            count: psgList.length
          },
          refundMode: 'Original Payment Source (Bank/UPI)',
          refundEta: '2-3 Business Days'
        });
      } else {
        // Active ticket: reset cancellationResult so passenger selection form displays
        setCancellationResult(null);
        const psgList = match.passengers || [];
        const initialSelection = {};
        psgList.forEach((p, idx) => {
          initialSelection[idx] = p.status !== 'CANCELLED';
        });
        setSelectedPassengers(initialSelection);
      }
    } else {
      setSearchedBooking(null);
      setErrorMsg(`❌ PNR ${cleanPnr} was not found in your account (${currentUser.username}). You can only cancel tickets booked through your logged-in account.`);
    }
  };

  const togglePassenger = (idx) => {
    setSelectedPassengers(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // IRCTC Official Cancellation Charge Calculator (Base Ticket Cost + 18% GST)
  const calculateRefund = () => {
    if (!searchedBooking) return { totalPaid: 0, ticketFare: 0, grossFare: 0, convenienceFee: 0, baseCancelCharge: 0, cgstAmount: 0, sgstAmount: 0, gstAmount: 0, totalDeduction: 0, netRefund: 0, count: 0, perPassengerFare: 0, perPassengerBaseCharge: 0 };
    
    const psgList = searchedBooking.passengers || [];
    const selectedCount = Object.values(selectedPassengers).filter(Boolean).length;
    if (selectedCount === 0 || psgList.length === 0) return { totalPaid: 0, ticketFare: 0, grossFare: 0, convenienceFee: 0, baseCancelCharge: 0, cgstAmount: 0, sgstAmount: 0, gstAmount: 0, totalDeduction: 0, netRefund: 0, count: 0, perPassengerFare: 0, perPassengerBaseCharge: 0 };

    const totalPaid = Number(searchedBooking.totalPaid || 2186.30);
    const convenienceFee = Number(searchedBooking.convenienceFee != null ? searchedBooking.convenienceFee : 35.40);
    const insurancePremium = Number(searchedBooking.insurancePremium != null ? searchedBooking.insurancePremium : 0.90);
    const nonRefundableFees = convenienceFee + insurancePremium;

    // Base Ticket Cost (Ticket Fare only — excluding non-refundable fees)
    const baseTicketFare = Number(searchedBooking.ticketFare || Math.max(0, totalPaid - nonRefundableFees));
    const perPassengerFare = Math.round((baseTicketFare / psgList.length) * 100) / 100;
    const selectedTicketFare = Math.round(perPassengerFare * selectedCount * 100) / 100;

    // Official Flat Base Cancellation Charges per passenger (IRCTC 2026 Tariff)
    let perPassengerBaseCharge = 180; // Default 3A/CC/3E
    const cls = String(searchedBooking.classCode || searchedBooking.selectedClass || '3A').toUpperCase();
    if (cls.includes('1A') || cls.includes('EC')) perPassengerBaseCharge = 240;
    else if (cls.includes('2A')) perPassengerBaseCharge = 200;
    else if (cls.includes('3A') || cls.includes('CC') || cls.includes('3E')) perPassengerBaseCharge = 180;
    else if (cls.includes('SL')) perPassengerBaseCharge = 120;
    else if (cls.includes('2S')) perPassengerBaseCharge = 60;

    const baseCancelCharge = perPassengerBaseCharge * selectedCount;
    const cgstAmount = Math.round((baseCancelCharge * 0.09) * 100) / 100; // CGST 9%
    const sgstAmount = Math.round((baseCancelCharge * 0.09) * 100) / 100; // SGST 9%
    const gstAmount = Math.round((cgstAmount + sgstAmount) * 100) / 100; // Total 18% GST
    const totalDeduction = Math.round((baseCancelCharge + gstAmount) * 100) / 100;

    // Net Refund calculated strictly on Ticket Fare (Base Ticket Cost)
    const netRefund = Math.max(0, Math.round((selectedTicketFare - totalDeduction) * 100) / 100);

    return {
      totalPaid,
      ticketFare: selectedTicketFare,
      grossFare: selectedTicketFare,
      convenienceFee,
      insurancePremium,
      nonRefundableFees,
      perPassengerFare,
      perPassengerBaseCharge,
      baseCancelCharge,
      cgstAmount,
      sgstAmount,
      gstAmount,
      totalDeduction,
      netRefund,
      count: selectedCount
    };
  };

  const handleConfirmCancellation = () => {
    if (searchedBooking?.status === 'CANCELLED') {
      setErrorMsg('This ticket has already been cancelled.');
      return;
    }

    const refundInfo = calculateRefund();
    if (refundInfo.count === 0) {
      setErrorMsg('Please select at least one passenger to cancel.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const cancelId = 'CAN' + Math.floor(10000000 + Math.random() * 90000000);
      const now = new Date();
      
      const result = {
        cancelId,
        pnr: searchedBooking.pnr,
        trainName: searchedBooking.trainName,
        trainNumber: searchedBooking.trainNumber,
        cancelledDate: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        cancelledPassengers: searchedBooking.passengers.filter((_, idx) => selectedPassengers[idx]),
        refundInfo,
        refundMode: 'Original Payment Source (Bank/UPI)',
        refundEta: '2-3 Business Days'
      };

      // Restore seat inventory count
      adjustSeatsOnCancellation(
        searchedBooking.trainNumber,
        searchedBooking.classCode || searchedBooking.selectedClass || '3A',
        searchedBooking.date,
        refundInfo.count
      );

      // Persist cancellation status into MongoDB Atlas Cloud Database
      try {
        fetch(`${API_BASE_URL}/api/bookings/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pnr: searchedBooking.pnr,
            username: currentUser?.username || 'ashirwad_irctc'
          })
        }).catch(err => console.warn("MongoDB Cloud cancel error:", err));
      } catch (e) {
        console.warn("MongoDB Atlas cancellation sync notice:", e);
      }

      // Persist cancellation status into localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('railx_user_bookings') || '[]');
        const updated = stored.map(b => {
          if (String(b.pnr).replace(/\D/g, '') === String(searchedBooking.pnr).replace(/\D/g, '')) {
            return {
              ...b,
              status: 'CANCELLED',
              passengers: (b.passengers || []).map(p => ({
                ...p,
                status: 'CANCELLED',
                berth: 'CANCELLED / REFUND PROCESSED'
              }))
            };
          }
          return b;
        });
        localStorage.setItem('railx_user_bookings', JSON.stringify(updated));
        // Dispatch storage event to trigger reactivity in App
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Error saving cancellation status:', e);
      }

      if (onTicketCancelled) {
        onTicketCancelled(searchedBooking.pnr, result);
      }

      setSearchedBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
      setCancellationResult(result);
    }, 1200);
  };

  const refundDetails = calculateRefund();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border-4 border-rose-50 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              LOGIN REQUIRED TO CANCEL TICKET
            </h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Ticket cancellation is strictly restricted to logged-in IRCTC account owners for passenger data safety and fraud prevention.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs space-y-1 font-medium text-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>IRCTC Security Advisory:</span>
            </div>
            <p>You can only view and cancel E-tickets that were booked through your verified account.</p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => onOpenLoginModal && onOpenLoginModal()}
              className="w-full py-3.5 bg-[#0026cd] hover:bg-blue-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🔒 LOG IN TO YOUR IRCTC ACCOUNT</span>
            </button>

            <button
              onClick={onBackToSearch}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-extrabold text-xs transition-colors cursor-pointer"
            >
              Back to Home Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Title Card */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-blue-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Cancel E-Ticket Portal</h1>
                <p className="text-xs text-blue-200 font-medium mt-0.5">Official IRCTC Counter & Online Ticket Cancellation Engine</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant Auto-Refund Dispatch</span>
          </div>
        </div>

        {/* IRCTC Official Notice Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-amber-950">Important Cancellation Rules (Railway Passengers Rules 2026)</h4>
            <p className="text-[11px] text-amber-800 font-medium">
              E-Tickets can be cancelled online up to chart preparation (usually 4 hours prior to departure). Flat cancellation fee is levied based on class of travel (1A/EC: ₹240, 2A: ₹200, 3A/CC: ₹180, SL: ₹120, 2S: ₹60).
            </p>
          </div>
        </div>

        {/* Account Tickets Selector View (Shows All Booked & Cancelled Tickets) */}
        {userBookings.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Ticket className="w-4.5 h-4.5 text-[#000066]" />
                <span>Your Account Tickets (Booked & Cancelled)</span>
              </h2>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTicketFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    ticketFilter === 'ALL'
                      ? 'bg-[#000066] text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Tickets ({userBookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTicketFilter('BOOKED')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    ticketFilter === 'BOOKED'
                      ? 'bg-emerald-700 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Booked ({userBookings.filter(b => b.status !== 'CANCELLED' && !b.isCancelled).length})
                </button>
                <button
                  type="button"
                  onClick={() => setTicketFilter('CANCELLED')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    ticketFilter === 'CANCELLED'
                      ? 'bg-rose-700 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancelled ({userBookings.filter(b => b.status === 'CANCELLED' || b.isCancelled).length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userBookings
                .filter(b => {
                  const isCancelled = b.status === 'CANCELLED' || b.isCancelled === true;
                  if (ticketFilter === 'BOOKED') return !isCancelled;
                  if (ticketFilter === 'CANCELLED') return isCancelled;
                  return true;
                })
                .map((b) => {
                  const isSelected = searchedBooking?.pnr === b.pnr;
                  const isCancelled = b.status === 'CANCELLED' || b.isCancelled === true;
                  return (
                    <div
                      key={b.pnr}
                      onClick={() => handleQuickLookup(b.pnr)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-900 bg-blue-50/80 ring-2 ring-blue-900/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span className="font-black text-slate-900 text-sm truncate max-w-[190px]">{b.trainName || 'Train'}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          isCancelled ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isCancelled ? '❌ CANCELLED' : '✅ BOOKED'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 mt-2 pt-2 border-t border-slate-200/80">
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px]">Train No / PNR</span>
                          <strong className="text-slate-900 font-mono">{b.trainNumber || '12952'} • {b.pnr}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px]">Journey Date</span>
                          <strong className="text-slate-900">{b.date || b.bookingDate || '—'}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {userBookings.length === 0 && !cancellationResult && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">No Active Tickets Found</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              You currently have no active tickets booked in your account ({currentUser?.username}).
            </p>
            {onBackToSearch && (
              <button
                type="button"
                onClick={onBackToSearch}
                className="px-5 py-2.5 bg-[#000066] hover:bg-blue-900 text-white rounded-full text-xs font-black transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Book Train Ticket ➔</span>
              </button>
            )}
          </div>
        )}

        {/* Step 2: Searched Ticket & Passenger Selection */}
        {searchedBooking && !cancellationResult && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Ticket Header summary */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black">
                    <Train className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{searchedBooking.trainNumber} - {searchedBooking.trainName}</h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {searchedBooking.from} ➔ {searchedBooking.to} | Date: {searchedBooking.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-lg text-[11px] font-black">{searchedBooking.classCode || searchedBooking.selectedClass || 'N/A'}</span>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-[11px] font-black">{searchedBooking.quota || 'General (GN)'}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${searchedBooking.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>{searchedBooking.status || 'BOOKED'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">PNR Number</span>
                  <span className="font-mono font-black text-slate-900">{searchedBooking.pnr}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Journey Date</span>
                  <span className="font-semibold text-slate-800">{searchedBooking.date || searchedBooking.bookingDate || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Ticket Fare</span>
                  <span className="font-black text-slate-900">₹{
                    searchedBooking.ticketFare != null
                      ? Number(searchedBooking.ticketFare).toFixed(2)
                      : searchedBooking.totalPaid != null
                        ? (searchedBooking.totalPaid - (searchedBooking.convenienceFee || 0)).toFixed(2)
                        : '—'
                  }</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Chart Status</span>
                  <span className="font-bold text-emerald-700">NOT PREPARED</span>
                </div>
              </div>
            </div>

            {/* Select Passengers to Cancel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Select Passenger(s) for Cancellation</h3>
                <span className="text-[11px] font-bold text-slate-500">Check box to cancel ticket</span>
              </div>

              <div className="space-y-2">
                {searchedBooking.passengers.map((p, idx) => {
                  const psgList = searchedBooking.passengers || [];
                  const totalFare = Number(
                    searchedBooking.ticketFare ||
                    (searchedBooking.totalPaid != null && searchedBooking.convenienceFee != null
                      ? searchedBooking.totalPaid - searchedBooking.convenienceFee
                      : searchedBooking.totalPaid || 1200)
                  );
                  const perFare = Math.round(totalFare / psgList.length);
                  const cls2 = String(searchedBooking.classCode || searchedBooking.selectedClass || '3A').toUpperCase();
                  let pCharge = 180;
                  if (cls2.includes('1A') || cls2.includes('EC')) pCharge = 240;
                  else if (cls2.includes('2A')) pCharge = 200;
                  else if (cls2.includes('SL')) pCharge = 120;
                  else if (cls2.includes('2S')) pCharge = 60;
                  const pGst = Math.round(pCharge * 0.18);
                  const pRefund = Math.max(0, perFare - pCharge - pGst);

                  return (
                  <label
                    key={idx}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedPassengers[idx]
                        ? 'bg-rose-50/60 border-rose-300 text-rose-950 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!selectedPassengers[idx]}
                        onChange={() => togglePassenger(idx)}
                        className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">{p.name}</span>
                        <span className="text-[11px] text-slate-500 font-medium">Age: {p.age} | {p.gender} | Berth: {p.berth || p.seat || 'CNF'}</span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      {/* Per-passenger charge breakdown pill */}
                      {selectedPassengers[idx] && p.status !== 'CANCELLED' && (
                        <div className="text-[10px] text-right leading-tight">
                          <div className="text-slate-500 font-semibold">Fare: <span className="font-mono text-slate-800">₹{perFare}</span></div>
                          <div className="text-rose-600 font-bold">Cancel Fee: <span className="font-mono">-₹{pCharge + pGst}</span></div>
                          <div className="text-emerald-700 font-black">Refund: <span className="font-mono">₹{pRefund}</span></div>
                        </div>
                      )}
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                        p.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.status || 'CNF'}
                      </span>
                    </div>
                  </label>
                  );
                })}
              </div>
            </div>

            {/* Reason selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="Change of Travel Plan">Change of Travel Plan</option>
                <option value="Train Delayed / Cancelled">Train Delayed / Cancelled</option>
                <option value="Booked Alternate Ticket">Booked Alternate Ticket</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Other Personal Reasons">Other Personal Reasons</option>
              </select>
            </div>

            {/* Real-time Refund Breakdown Card (Base Charge + 18% GST) */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-lg">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>Refund Calculation Breakdown</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono">PER PASSENGER • 18% GST</span>
              </h4>

              <div className="space-y-2 text-xs">
                {/* Per-passenger fare */}
                <div className="flex justify-between text-slate-300">
                  <span>Fare per Passenger</span>
                  <span className="font-mono font-bold">₹{refundDetails.perPassengerFare}</span>
                </div>

                {/* Passengers selected */}
                <div className="flex justify-between text-slate-300">
                  <span>Passengers Selected</span>
                  <span className="font-mono font-bold">× {refundDetails.count}</span>
                </div>

                <div className="flex justify-between text-white font-semibold border-t border-slate-700 pt-2">
                  <span>Gross Ticket Fare ({refundDetails.count} pax)</span>
                  <span className="font-mono font-bold">₹{refundDetails.grossFare}</span>
                </div>

                {/* Per-passenger cancel charge breakdown */}
                <div className="bg-rose-900/30 rounded-xl p-2.5 space-y-1.5 border border-rose-800/40">
                  <div className="flex justify-between text-rose-300 font-bold text-[11px]">
                    <span>Cancel Charge / Passenger ({searchedBooking.classCode || '3A'})</span>
                    <span className="font-mono">₹{refundDetails.perPassengerBaseCharge}</span>
                  </div>
                  <div className="flex justify-between text-amber-300 text-[11px]">
                    <span>GST @ 18% / Passenger</span>
                    <span className="font-mono">₹{Math.round(refundDetails.perPassengerBaseCharge * 0.18)}</span>
                  </div>
                  <div className="flex justify-between text-rose-200 font-black text-[11px] border-t border-rose-800/40 pt-1">
                    <span>Total Charge / Passenger</span>
                    <span className="font-mono">₹{refundDetails.perPassengerBaseCharge + Math.round(refundDetails.perPassengerBaseCharge * 0.18)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-slate-400 font-semibold">
                  <span>Base Cancel Fee × {refundDetails.count} pax</span>
                  <span className="font-mono font-bold text-rose-400">- ₹{refundDetails.baseCancelCharge}</span>
                </div>

                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>GST (CGST 9% + SGST 9%) × {refundDetails.count} pax</span>
                  <span className="font-mono font-bold">- ₹{refundDetails.gstAmount}</span>
                </div>

                <div className="flex justify-between text-rose-400 font-bold border-t border-slate-800/80 pt-2">
                  <span>Total Cancellation Charges Deducted</span>
                  <span className="font-mono font-black">- ₹{refundDetails.totalDeduction}</span>
                </div>

                <div className="border-t border-slate-700 pt-2.5 flex justify-between text-sm font-black text-emerald-400">
                  <span>NET PAYABLE REFUND AMOUNT CREDITED</span>
                  <span className="font-mono text-lg text-emerald-400">₹{refundDetails.netRefund}</span>
                </div>
              </div>
            </div>

            {/* Submit Cancellation Button */}
            {searchedBooking.status === 'CANCELLED' ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-xs font-black">This ticket has already been cancelled and refunded. No further cancellation can be processed.</span>
                </div>
                <button
                  type="button"
                  onClick={onBackToSearch}
                  className="px-4 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onBackToSearch}
                  className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 font-extrabold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Keep Ticket
                </button>

                <button
                  type="button"
                  disabled={isProcessing || refundDetails.count === 0}
                  onClick={handleConfirmCancellation}
                  className={`px-6 py-3 rounded-2xl font-black text-xs text-white transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                    isProcessing || refundDetails.count === 0
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      <span>Processing Cancellation...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Confirm Ticket Cancellation (₹{refundDetails.netRefund} Refund)</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        )}

        {/* Step 3: Cancellation Success Result & Refund Receipt */}
        {cancellationResult && (
          <div className="space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Top Action Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">E-TICKET CANCELLATION SUCCESSFUL</h2>
                  <p className="text-xs font-bold text-slate-500">Ref ID: <span className="font-mono text-blue-900 font-black">{cancellationResult.cancelId}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isDownloadingPdf}
                  onClick={handleDownloadCancellationPdf}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Cancellation Slip (PDF)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Official Printable 1-Page A4 Cancellation & Refund E-Slip */}
            <div id="cancel-ticket-print-area" className="relative bg-white rounded-3xl border border-slate-300 p-6 shadow-xl text-slate-900 overflow-hidden">
              
              {/* Official Indian Railways Watermark Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none z-0">
                <img src="/indian_railways_logo.png" alt="Indian Railways Watermark" className="w-96 h-96 object-contain" />
              </div>

              <div className="relative z-10 space-y-5">

                {/* Official IRCTC Logo Header */}
                <div className="border-b-2 border-blue-900 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/indian_railways_logo.png" alt="Indian Railways Logo" className="w-14 h-14 object-contain shrink-0" />
                    <div>
                      <h1 className="text-base font-black text-[#000066] uppercase tracking-tight">INDIAN RAILWAYS CATERING AND TOURISM CORPORATION LTD.</h1>
                      <p className="text-[11px] font-bold text-slate-600">A Government of India Enterprise (CIN: L74899DL1999GOI101707)</p>
                      <p className="text-[10px] font-mono font-black text-rose-700 uppercase">OFFICIAL ELECTRONIC RESERVATION SLIP (ERS) — CANCELLATION & REFUND ADVICE</p>
                    </div>
                  </div>

                  {qrBase64 && (
                    <div className="text-center">
                      <img src={qrBase64} alt="Cancellation QR Code" className="w-20 h-20 mx-auto border border-slate-300 rounded p-1 bg-white" />
                      <span className="text-[9px] font-mono font-bold text-slate-500 block">SCANNABLE REFUND VERIFIED</span>
                    </div>
                  )}
                </div>

              {/* Status & Cancellation Ref Bar */}
              <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl flex flex-wrap items-center justify-between text-xs gap-2">
                <div>
                  <span className="font-bold text-rose-900 block">CANCELLATION STATUS:</span>
                  <span className="font-mono font-black text-rose-700 text-sm">CANCELLED / REFUND DISPATCHED</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600 block">CANCELLATION REF ID:</span>
                  <span className="font-mono font-black text-slate-900">{cancellationResult.cancelId}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600 block">DATE & TIME OF CANCELLATION:</span>
                  <span className="font-bold text-slate-900">{cancellationResult.cancelledDate}</span>
                </div>
              </div>

              {/* PNR & Train Details Grid */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">PNR NUMBER</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{cancellationResult.pnr}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">TRAIN NUMBER & NAME</span>
                  <span className="font-extrabold text-slate-900">{cancellationResult.trainNumber} - {cancellationResult.trainName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">CLASS / QUOTA</span>
                  <span className="font-bold text-slate-800">{searchedBooking?.classCode || searchedBooking?.selectedClass || '3A'} | {searchedBooking?.quota || 'GN'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">REFUND MODE</span>
                  <span className="font-bold text-slate-800">{cancellationResult.refundMode}</span>
                </div>
              </div>

              {/* Cancelled Passengers Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-900" />
                  <span>CANCELLED PASSENGER DETAILS</span>
                </h3>
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-blue-900 text-white font-bold">
                      <th className="p-2 border border-slate-300">#</th>
                      <th className="p-2 border border-slate-300">Passenger Name</th>
                      <th className="p-2 border border-slate-300">Age / Gender</th>
                      <th className="p-2 border border-slate-300">Booking Status</th>
                      <th className="p-2 border border-slate-300">Current Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancellationResult.cancelledPassengers.map((p, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 font-medium">
                        <td className="p-2 border border-slate-300 font-bold">{idx + 1}</td>
                        <td className="p-2 border border-slate-300 font-bold text-slate-900">{p.name}</td>
                        <td className="p-2 border border-slate-300">{p.age} / {p.gender}</td>
                        <td className="p-2 border border-slate-300 font-bold text-slate-700">{p.berth || p.seat || 'CNF'}</td>
                        <td className="p-2 border border-slate-300 font-black text-rose-700 bg-rose-50">CANCELLED</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Detailed Financial & 18% GST Breakdown Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-900" />
                    <span>ITEMIZED CANCELLATION & GST CHARGE BREAKDOWN</span>
                  </span>
                  <span className="text-[10px] font-mono font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">OFFICIAL IRCTC ADVICE</span>
                </h3>

                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-300">
                      <th className="p-2.5 border border-slate-300">Description</th>
                      <th className="p-2.5 border border-slate-300 text-center">Rate / Rule</th>
                      <th className="p-2.5 border border-slate-300 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    <tr>
                      <td className="p-2.5 border border-slate-300 font-black text-blue-950">Ticket Fare (Selected Passengers / Base Ticket Cost)</td>
                      <td className="p-2.5 border border-slate-300 text-center font-bold text-blue-900">Base Ticket Fare</td>
                      <td className="p-2.5 border border-slate-300 text-right font-mono font-black text-blue-950">₹{(cancellationResult.refundInfo.ticketFare || cancellationResult.refundInfo.grossFare || 2150.00).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 border border-slate-300 font-bold text-slate-800">Flat Base Cancellation Fee (Official IRCTC Tariff)</td>
                      <td className="p-2.5 border border-slate-300 text-center text-slate-500">Tariff Rule 2026</td>
                      <td className="p-2.5 border border-slate-300 text-right font-mono font-bold text-rose-700">- ₹{(cancellationResult.refundInfo.baseCancelCharge).toFixed(2)}</td>
                    </tr>
                    <tr className="bg-amber-50/50">
                      <td className="p-2.5 border border-slate-300 font-black text-amber-900">GST on Cancellation Charge (18%) <span className="text-[10px] font-normal text-amber-700 block">(CGST @ 9% + SGST @ 9%)</span></td>
                      <td className="p-2.5 border border-slate-300 text-center font-bold text-amber-800">18.00% GST</td>
                      <td className="p-2.5 border border-slate-300 text-right font-mono font-black text-amber-900">- ₹{(cancellationResult.refundInfo.gstAmount).toFixed(2)}</td>
                    </tr>
                    <tr className="bg-rose-50 font-black text-rose-950">
                      <td className="p-2.5 border border-slate-300">Total Cancellation & GST Charges Deducted</td>
                      <td className="p-2.5 border border-slate-300 text-center text-rose-800">Base Fee + 18% GST</td>
                      <td className="p-2.5 border border-slate-300 text-right font-mono text-sm text-rose-800">- ₹{(cancellationResult.refundInfo.totalDeduction).toFixed(2)}</td>
                    </tr>
                    <tr className="bg-emerald-100 text-emerald-950 font-black text-sm">
                      <td className="p-3 border border-slate-300 uppercase">NET REFUND AMOUNT CREDITED TO BANK / UPI</td>
                      <td className="p-3 border border-slate-300 text-center text-emerald-800 text-xs">Original Payment Source</td>
                      <td className="p-3 border border-slate-300 text-right font-mono text-base text-emerald-700">₹{(cancellationResult.refundInfo.netRefund).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Official Cancellation Terms & Footer Notice */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-1 font-medium">
                <p className="font-bold text-slate-800">Terms & Refund Guidelines:</p>
                <p>1. As per Ministry of Railways rules, 18% GST is levied on applicable ticket cancellation charges.</p>
                <p>2. Refund amount will be credited to the original payment source (Bank Account / UPI / IRCTC Wallet) within 2-3 working days.</p>
                <p>3. For any grievance, write to care@irctc.co.in or call 14567 / 0755-6610661.</p>
              </div>

              </div>

            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onOrderFood}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Order Food via E-Catering</span>
              </button>

              <button
                type="button"
                onClick={onBackToSearch}
                className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-black text-xs transition-colors cursor-pointer shadow-md"
              >
                Back to Home
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
