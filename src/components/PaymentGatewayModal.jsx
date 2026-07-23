import React, { useState } from 'react';
import { ArrowLeft, Check, ShieldCheck, Lock, CreditCard, Smartphone, CheckCircle2, ChevronRight, Info, Train, Clock, HelpCircle, X, User } from 'lucide-react';
import { getEffectiveSeatStatus } from '../services/seatInventoryService';

export default function PaymentGatewayModal({ bookingRequest, onClose, onPaymentSuccess }) {
  const [selectedGateway, setSelectedGateway] = useState('ipay'); // 'ipay', 'paytm', 'payu', 'razorpay', 'phonepe'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');

  // Extract train and passenger information
  const train = bookingRequest?.train || {};
  const trainName = train?.name || 'GRAND TRUNK EXP';
  const trainNumber = train?.number || '12616';
  const fromCode = train?.from || 'NDLS';
  const fromName = train?.fromName || 'NEW DELHI';
  const toCode = train?.to || 'MAS';
  const toName = train?.toName || 'MGR CHENNAI CTL';
  const departureTime = train?.departureTime || '04:10 PM';
  const arrivalTime = train?.arrivalTime || '04:40 AM';
  const duration = train?.duration || '12:30 Hrs';

  const classCode = bookingRequest?.selectedClass?.code || 'SL';
  const className = bookingRequest?.selectedClass?.name || 'Sleeper (SL)';
  const selectedClassStatus = bookingRequest?.selectedClassStatus || bookingRequest?.selectedClass?.status || 'AVAILABLE 10';
  const passengers = bookingRequest?.passengers && Array.isArray(bookingRequest.passengers) && bookingRequest.passengers.length > 0
    ? bookingRequest.passengers
    : [{ name: 'ASHIRWAD KUMAR', age: 21, gender: 'Male', nationality: 'India', berth: 'No preference' }];
  const boardingStationObj = bookingRequest?.boardingStation || {};
  const boardingStationName = boardingStationObj.name || fromName || 'NEW DELHI';
  const journeyDate = bookingRequest?.journeyDate || train?.journeyDate || '';
  const boardingStationDate = boardingStationObj.date || journeyDate || 'Wed, 22 Jul 2026';

  const quotaRaw = bookingRequest?.quota || bookingRequest?.selectedQuota || 'GN';
  const formatQuota = (q) => {
    const s = String(q || 'GN').toUpperCase();
    if (s.includes('TQ') || s.includes('TATKAL')) return 'TATKAL (TQ)';
    if (s.includes('PT') || s.includes('PREMIUM')) return 'PREMIUM TATKAL (PT)';
    if (s.includes('LD') || s.includes('LADIES')) return 'LADIES (LD)';
    if (s.includes('SS') || s.includes('SENIOR')) return 'SENIOR CITIZEN (SS)';
    if (s.includes('HP') || s.includes('PHYSICAL')) return 'HANDICAPPED (HP)';
    return 'GENERAL (GN)';
  };
  const quotaDisplay = formatQuota(quotaRaw);

  const travelInsurance = bookingRequest?.travelInsurance ?? true;
  const insurancePremium = bookingRequest?.insurancePremium != null
    ? bookingRequest.insurancePremium
    : (travelInsurance ? 0.45 * passengers.length : 0);
  const convenienceFee = bookingRequest?.convenienceFee || 11.80;
  const ticketFare = bookingRequest?.ticketFare != null
    ? bookingRequest.ticketFare
    : Math.max(0, (bookingRequest?.totalFare || 901.80) - convenienceFee - insurancePremium);
  const totalFare = bookingRequest?.totalFare || (ticketFare + convenienceFee + insurancePremium);

  // Use journey date passed from search results page, fallback to today
  const resolvedJourneyDate = journeyDate || bookingRequest?.journeyDate || new Date().toISOString().split('T')[0];

  // ⚡ Live Real-Time Seat Status Calculation (Microsecond Memory Cache)
  const effectiveSeatStatus = getEffectiveSeatStatus(
    trainNumber,
    classCode,
    selectedClassStatus,
    journeyDate
  );

  const handlePay = () => {
    setIsProcessing(true);

    // Generate PNR and booking data immediately
    const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const confirmedBooking = {
      pnr,
      trainNumber: trainNumber,
      trainName: trainName,
      from: `${fromName} (${fromCode})`,
      to: `${toName} (${toCode})`,
      boardingStation: boardingStationObj,
      boardingAt: `${boardingStationName}${boardingStationObj.code ? ` (${boardingStationObj.code})` : ''}`,
      boardingDate: boardingStationDate,
      boardingDepTime: boardingStationObj.departureTime || departureTime,
      depTime: departureTime,
      arrTime: arrivalTime,
      date: journeyDate,
      classCode: classCode,
      quota: quotaDisplay,
      passengers: passengers.map((p) => ({
        name: p.name || `Passenger`,
        age: p.age || 21,
        gender: p.gender || 'Male',
        berth: p.berth || 'No preference',
        status: p.status || '',
        food: p.food || 'No Food',
      })),
      selectedClassStatus: selectedClassStatus,
      reservationChoice: bookingRequest?.reservationChoice || 'NONE',
      totalPaid: totalFare,
      ticketFare: ticketFare,
      convenienceFee: convenienceFee,
      insurancePremium: insurancePremium,
      txnId: `TXN_${Date.now()}`,
      qrHash: `IRCTC_HASH_${pnr}_CONFIRMED`
    };

    // Trigger ticket modal open instantly
    onPaymentSuccess(confirmedBooking);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#eef4ff] flex flex-col min-h-screen">
      
      {/* Main Payment Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        
        {/* Back Pill Button */}
        <div className="mb-4">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-full text-xs font-extrabold text-[#0026cd] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Payment Gateways Selection (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section 1: IRCTC iPay */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#0026cd]" />
                  <h3 className="text-sm font-black text-slate-900">Payment Method</h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold block">Payable Amount</span>
                  <span className="text-base font-black text-[#0026cd] font-mono">₹{totalFare.toFixed(2)}</span>
                </div>
              </div>

              {/* Option 1: IRCTC iPay Card */}
              <div
                onClick={() => setSelectedGateway('ipay')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  selectedGateway === 'ipay'
                    ? 'border-[#0026cd] bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="gatewaySelect"
                    checked={selectedGateway === 'ipay'}
                    onChange={() => setSelectedGateway('ipay')}
                    className="w-4.5 h-4.5 text-[#0026cd] mt-1 cursor-pointer shrink-0"
                  />

                  {/* IRCTC iPay Official Logo Badge */}
                  <IRCTCiPayLogo />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">IRCTC iPay</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-black text-[10px]">
                        RECOMMENDED
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                      PG Charges (Upto): UPI & RuPay(DC): Nil | DC: 0.4% &lt;= ₹2000 & 0.9% &gt; ₹2000 | CC: 1.8% | NB: ₹10 | Autopay: 1.8% (Including UPI) | UPI-CC & UPI-CL: 1% | + GST @ 18%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Multiple Payment Service */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Smartphone className="w-4 h-4 text-[#0026cd]" />
                <h3 className="text-sm font-black text-slate-900">Multiple payment service</h3>
              </div>

              {/* Provider Grid Cards with Official Vector Logos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Provider 1: Paytm */}
                <div
                  onClick={() => setSelectedGateway('paytm')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 ${
                    selectedGateway === 'paytm'
                      ? 'border-[#0026cd] bg-blue-50/60 ring-2 ring-blue-500/30 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <PaytmLogo />
                  <span className="text-[11px] font-extrabold text-slate-800">Paytm</span>
                </div>

                {/* Provider 2: PayU */}
                <div
                  onClick={() => setSelectedGateway('payu')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 ${
                    selectedGateway === 'payu'
                      ? 'border-[#0026cd] bg-blue-50/60 ring-2 ring-blue-500/30 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <PayULogo />
                  <span className="text-[11px] font-extrabold text-slate-800">PayU</span>
                </div>

                {/* Provider 3: Razorpay */}
                <div
                  onClick={() => setSelectedGateway('razorpay')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 ${
                    selectedGateway === 'razorpay'
                      ? 'border-[#0026cd] bg-blue-50/60 ring-2 ring-blue-500/30 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <RazorpayLogo />
                  <span className="text-[11px] font-extrabold text-slate-800">Razorpay</span>
                </div>

                {/* Provider 4: PhonePe */}
                <div
                  onClick={() => setSelectedGateway('phonepe')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 ${
                    selectedGateway === 'phonepe'
                      ? 'border-[#0026cd] bg-blue-50/60 ring-2 ring-blue-500/30 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <PhonePeLogo />
                  <span className="text-[11px] font-extrabold text-slate-800">PhonePe</span>
                </div>

              </div>
            </div>

            {/* Processing State Feedback */}
            {isProcessing && (
              <div className="p-4 bg-blue-900 text-white rounded-2xl flex items-center justify-center gap-3 animate-pulse">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold font-mono">{processStep}</span>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: 1:1 Match Official IRCTC Booking Review Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#fff8f0] rounded-3xl border border-amber-200/90 p-5 shadow-sm space-y-4 sticky top-6">
              
              {/* Stepper Header */}
              <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 border-b border-amber-200/60 pb-3">
                <span className="text-slate-400 font-bold">1 Review</span>
                <span>---------</span>
                <span className="text-[#0026cd] font-black underline underline-offset-4">2 Payment</span>
                <span>---------</span>
                <span className="text-slate-400">3 Confirm</span>
              </div>

              {/* Title Header */}
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-amber-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                  ::
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Booking Review</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Review and confirm your booking</p>
                </div>
              </div>

              {/* Dynamic Seat Availability Status & RAC/WL Message Banner */}
              <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
                effectiveSeatStatus.isAvailable
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : effectiveSeatStatus.isRac
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="flex items-center justify-between font-black text-xs">
                  <span className="uppercase tracking-wider">SEAT BOOKING STATUS</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black ${
                    effectiveSeatStatus.isAvailable
                      ? 'bg-emerald-200 text-emerald-900 border border-emerald-400'
                      : effectiveSeatStatus.isRac
                      ? 'bg-amber-200 text-amber-950 border border-amber-400'
                      : 'bg-rose-200 text-rose-950 border border-rose-400'
                  }`}>
                    {effectiveSeatStatus.statusText}
                  </span>
                </div>
                <p className="text-[11px] font-extrabold leading-snug">
                  {effectiveSeatStatus.isAvailable
                    ? '✅ Confirmed Berth Allotment Guaranteed upon payment.'
                    : effectiveSeatStatus.isRac
                    ? '⚠️ RAC Ticket (Reservation Against Cancellation). Sitting accommodation guaranteed. Berth will be allotted upon chart preparation.'
                    : '⏳ Waitlisted Ticket. Ticket will be queued under Waitlist and confirmed automatically upon passenger cancellation.'}
                </p>
              </div>

              {/* Train Details */}
              <div className="space-y-2 border-b border-amber-200/60 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0026cd]">{trainName.toUpperCase()} ({trainNumber})</span>
                  <span className="text-[11px] font-bold text-[#0026cd] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Train schedule</span>
                  </span>
                </div>

                {/* Route Times Container */}
                {(() => {
                  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const dDate = journeyDate ? new Date(journeyDate + 'T00:00:00') : new Date();
                  const depFormatted = `${days[dDate.getDay()]}, ${dDate.getDate()} ${months[dDate.getMonth()]}`;

                  let addDays = 0;
                  if (departureTime && arrivalTime) {
                    const [depH, depM] = departureTime.split(':').map(Number);
                    const [arrH, arrM] = arrivalTime.split(':').map(Number);
                    if (!isNaN(depH) && !isNaN(arrH) && (arrH * 60 + (arrM || 0) < depH * 60 + (depM || 0))) {
                      addDays = 1;
                    }
                  }

                  const aDate = new Date(dDate);
                  aDate.setDate(aDate.getDate() + addDays);
                  const arrFormatted = `${days[aDate.getDay()]}, ${aDate.getDate()} ${months[aDate.getMonth()]}`;

                  return (
                    <div className="bg-white/80 p-3 rounded-xl border border-amber-200/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <div>
                          <span className="block font-black text-slate-900">{departureTime}</span>
                          <span className="text-[10px] text-slate-500">{depFormatted}</span>
                        </div>
                        <div className="text-center text-[10px] font-bold text-slate-400">
                          <span>{duration}</span>
                          <div className="w-16 h-0.5 bg-blue-300 mx-auto my-0.5"></div>
                        </div>
                        <div className="text-right">
                          <span className="block font-black text-slate-900">{arrivalTime}</span>
                          <span className="text-[10px] text-slate-500">{arrFormatted}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 pt-1 border-t border-slate-100">
                        <span>{fromCode} {fromName}</span>
                        <span>{toCode} {toName}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="text-[11px] font-bold text-slate-700 space-y-0.5 pt-1">
                  <p>Class <span className="font-extrabold text-slate-900">{className}</span> Quota <span className="font-extrabold text-[#0026cd]">{quotaDisplay}</span></p>
                  <p>Boarding <span className="font-extrabold text-[#0026cd]">{boardingStationName} | {boardingStationDate}</span></p>
                </div>
              </div>

              {/* Passengers List Card */}
              <div className="space-y-1.5 border-b border-amber-200/60 pb-3">
                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">PASSENGERS</h4>
                <div className="bg-[#fffdfa] p-3 rounded-2xl border border-amber-200/60 space-y-2">
                  {passengers.map((p, idx) => {
                    const foodMap = { VEG: 'Veg Meal', NON_VEG: 'Non-Veg', JAIN: 'Jain Meal', NO_FOOD: 'No Food' };
                    const foodText = p.food ? ` | ${foodMap[p.food] || p.food}` : '';
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                        <span className="font-black text-slate-900 uppercase">{p.name}</span>
                        <span className="text-[11px] text-slate-600 font-extrabold">
                          Age {p.age} | {p.gender} | {p.nationality || 'India'} | {p.berth || 'No preference'}{foodText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fare Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase">Fare Summary</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-bold">
                    <span>Ticket Fare</span>
                    <span className="font-mono text-slate-900">₹{ticketFare.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Convenience Fee (Incl. of GST)</span>
                    <span className="font-mono">₹{convenienceFee.toFixed(2)}</span>
                  </div>
                  {(bookingRequest?.insurancePremium != null ? bookingRequest.insurancePremium > 0 : (bookingRequest?.travelInsurance ?? true)) && (
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Travel Insurance Premium (Incl. of GST)</span>
                      <span className="font-mono">
                        ₹{(bookingRequest?.insurancePremium != null ? bookingRequest.insurancePremium : (0.45 * passengers.length)).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm font-black text-[#0026cd] pt-2 border-t border-amber-200/60">
                    <span>Payable Amount</span>
                    <span className="font-mono text-base">₹{totalFare.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">Inclusive of all taxes</span>
                </div>
              </div>

              {/* View Cancellation Policy */}
              <div>
                <a
                  href="#cancellation-policy"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("IRCTC Cancellation Policy: Flat Rs 180 fee per passenger for 3AC class if cancelled 48h prior.");
                  }}
                  className="text-xs font-bold text-[#0026cd] hover:underline block"
                >
                  View Cancellation Policy
                </a>
              </div>

              {/* Bottom Pay & Book Pill Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-[#3b3dbf] hover:bg-blue-800 text-white font-black text-sm rounded-full transition-all shadow-md cursor-pointer text-center"
                >
                  Pay & Book
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

/* Vector Brand Logos Components */

function PaytmLogo() {
  return (
    <div className="h-10 w-full bg-[#002e6e] rounded-xl flex items-center justify-center p-1.5 shadow-2xs">
      <svg className="h-4.5 w-auto" viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.5 10H5v30h5v-11h4.5c4.7 0 8.5-3.8 8.5-8.5S19.2 10 14.5 10zm0 12H10v-7h4.5c2.5 0 4.5 2 4.5 4.5s-2 2.5-4.5 2.5z" fill="#00BAF2"/>
        <path d="M43.5 21.5c-2.3 0-4.3 1.1-5.5 2.8V22H33v18h5v-9.5c0-3.3 2.5-6 5.8-6h.7v-5h-1c-.3 0-.7 0-1 .1z" fill="#00BAF2"/>
        <path d="M57.5 21.5c-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5 8.5-3.8 8.5-8.5-3.8-8.5-8.5-8.5zm0 12c-2 0-3.5-1.5-3.5-3.5s1.5-3.5 3.5-3.5 3.5 1.5 3.5 3.5-1.6 3.5-3.5 3.5z" fill="#00BAF2"/>
        <path d="M72 15v7h-3v5h3v13h5V27h4v-5h-4v-7h-5z" fill="#00BAF2"/>
        <path d="M96 22l-4.5 11.5L87 22h-5.5l7.5 17.5L83.5 45H89l12.5-23H96z" fill="#00BAF2"/>
        <path d="M107 10v30h5V24h7v16h5V24h7v16h5V19h-24V10h-5z" fill="#00BAF2"/>
        <path d="M125 10h22v6h-8.5v24h-5V16H125v-6z" fill="#00BAF2"/>
        <path d="M150 10h8v30h-8V10z" fill="#00BAF2"/>
      </svg>
    </div>
  );
}

function PayULogo() {
  return (
    <div className="h-10 w-full bg-[#a3c644] rounded-xl flex items-center justify-center p-1.5 shadow-2xs">
      <span className="font-black text-2xl tracking-tighter text-[#1f2937] italic font-sans">
        Pay<span className="text-[#0026cd]">U</span>
      </span>
    </div>
  );
}

function RazorpayLogo() {
  return (
    <div className="h-10 w-full bg-[#0c2340] rounded-xl flex items-center justify-center p-1.5 shadow-2xs gap-1">
      <svg className="h-4 w-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 80L50 20L80 80L55 80L50 45L35 80H20Z" fill="#0284C7" />
        <path d="M50 45L65 80H80L50 20V45Z" fill="#38BDF8" />
      </svg>
      <span className="font-black text-white text-xs tracking-tight font-sans">Razorpay</span>
    </div>
  );
}

function PhonePeLogo() {
  return (
    <div className="h-10 w-full bg-[#5f259f] rounded-xl flex items-center justify-center p-1.5 shadow-2xs gap-1.5">
      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-black text-[#5f259f] text-[10px]">
        पे
      </div>
      <span className="font-black text-white text-xs tracking-tight">PhonePe</span>
    </div>
  );
}

function IRCTCiPayLogo() {
  return (
    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#001780] via-[#0026cd] to-[#000a4d] text-white flex flex-col items-center justify-center p-1.5 shadow-md shrink-0 border border-blue-400/40">
      <span className="text-[10px] font-black tracking-widest text-amber-400 leading-tight">IRCTC</span>
      <span className="text-sm font-black text-white tracking-wide">iPay</span>
    </div>
  );
}
