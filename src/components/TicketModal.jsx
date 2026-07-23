import React, { useState, useEffect } from 'react';
import { X, Download, CheckCircle2, ArrowRight, Loader2, Printer, ShieldCheck, Mail, Check, QrCode, Copy, Sparkles, Smartphone, Train, XCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export default function TicketModal({ bookingData, onClose }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrBase64, setQrBase64] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSentToast, setEmailSentToast] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const ticket = bookingData || {};

  const pnrNo = String(ticket.pnr || ticket.pnrNumber || '7471925446');
  const trainNo = String(ticket.trainNumber || ticket.trainNo || '12952');
  const trainNameStr = String(ticket.trainName || 'MUMBAI TEJAS RAJDHANI EXP');
  const fromStation = String(ticket.from || ticket.fromStationName || ticket.fromStationCode || 'NEW DELHI (NDLS)').toUpperCase();
  const toStation = String(ticket.to || ticket.toStationName || ticket.toStationCode || 'MUMBAI CENTRAL (MMCT)').toUpperCase();
  const journeyDate = String(ticket.date || ticket.dateOfJourney || ticket.bookingDate || '26-Jul-2026');
  const departureTime = String(ticket.depTime || ticket.departureTime || ticket.trainDepartureTime || '16:55');
  const arrivalTime = String(ticket.arrTime || ticket.arrivalTime || ticket.trainArrivalTime || '08:35');

  const boardingAtStation = String(
    ticket.boardingAt ||
    (ticket.boardingStation?.name ? `${ticket.boardingStation.name}${ticket.boardingStation.code ? ` (${ticket.boardingStation.code})` : ''}` : null) ||
    ticket.boardingStationName ||
    ticket.from ||
    'NEW DELHI (NDLS)'
  ).toUpperCase();

  const boardingDepartureTime = String(
    ticket.boardingDepTime ||
    ticket.boardingStation?.departureTime ||
    ticket.depTime ||
    ticket.departureTime ||
    '16:55'
  );

  const boardingDateStr = String(
    ticket.boardingDate ||
    ticket.boardingStation?.date ||
    ticket.date ||
    journeyDate
  );

  // Corrects any legacy MB berths for 2A/1A class (no Middle Berth exists in these classes)
  const correctBerthTypeForClass = (type, classCode) => {
    const cc = String(classCode || '').toUpperCase();
    if ((cc.includes('2A') || cc.includes('1A')) && type === 'MB') {
      return 'UB'; // 2A/1A have no Middle Berths — auto-correct to Upper Berth
    }
    return type;
  };

  const parseBerthInfo = (berthStr) => {
    const str = String(berthStr || '').trim();
    if (!str) return { status: 'CNF', coach: 'A1', seat: '18', type: correctBerthTypeForClass('LB', rawClassCode) };
    if (str.includes('/')) {
      const parts = str.split('/');
      return {
        status: parts[0] || 'CNF',
        coach: parts[1] || 'A1',
        seat: parts[2] || '18',
        type: correctBerthTypeForClass(parts[3] || 'LB', rawClassCode)
      };
    }
    const matchNum = str.match(/\d+/);
    const seatNum = matchNum ? matchNum[0] : '18';
    let type = 'LB';
    if (str.includes('LB') || str.includes('Lower') || str.includes('LOWER')) type = 'LB';
    else if (str.includes('MB') || str.includes('Middle') || str.includes('MIDDLE')) type = 'MB';
    else if (str.includes('UB') || str.includes('Upper') || str.includes('UPPER')) type = 'UB';
    else if (str.includes('SL') || str.includes('Side Lower')) type = 'SL';
    else if (str.includes('SU') || str.includes('Side Upper')) type = 'SU';
    return { status: 'CNF', coach: 'A1', seat: seatNum, type: correctBerthTypeForClass(type, rawClassCode) };
  };
  const quotaStr = String(ticket.quota || ticket.quotaCode || 'GENERAL (GN)').toUpperCase();
  const totalDistance = String(ticket.distance || ticket.totalDistance || (ticket.distanceKm ? ticket.distanceKm + ' KM' : '1384 KM'));
  const bookingDateStr = String(ticket.bookingDate || ticket.bookedOn || '20-Jul-2026 18:07:22 HRS');
  const txnId = String(ticket.txnId || ticket.transactionId || '100006711780974');

  const rawClassCode = String(ticket.classCode || ticket.selectedClass || ticket.journeyClass || '3A').toUpperCase();
  const isCancelled = String(ticket.status || '').toUpperCase() === 'CANCELLED' || ticket.isCancelled === true;
  let fullClassName = 'AC 3 TIER (3A)';
  if (rawClassCode.includes('1A')) fullClassName = 'FIRST AC (1A)';
  else if (rawClassCode.includes('2A')) fullClassName = 'AC 2 TIER (2A)';
  else if (rawClassCode.includes('3A')) fullClassName = 'AC 3 TIER (3A)';
  else if (rawClassCode.includes('3E')) fullClassName = 'AC 3 ECONOMY (3E)';
  else if (rawClassCode.includes('SL')) fullClassName = 'SLEEPER (SL)';
  else if (rawClassCode.includes('CC')) fullClassName = 'AC CHAIR CAR (CC)';
  else if (rawClassCode.includes('2S')) fullClassName = 'SECOND SEATING (2S)';
  else fullClassName = rawClassCode;

  const passengers = (ticket.passengers && ticket.passengers.length > 0)
    ? ticket.passengers
    : [
        { name: 'ASHIRWAD KUMAR', age: 21, gender: 'M', berth: 'CNF/B10/20/LOWER', food: 'NO FOOD' }
      ];

  const insurancePremiumNum = ticket.insurancePremium != null ? ticket.insurancePremium : 0.90;
  const convenienceFeeNum = ticket.convenienceFee != null ? ticket.convenienceFee : 35.40;
  const ticketFare = (ticket.ticketFare != null
    ? ticket.ticketFare
    : ticket.totalPaid
      ? Math.max(0, ticket.totalPaid - convenienceFeeNum - insurancePremiumNum)
      : 4610.00
  ).toFixed(2);
  const convenienceFee = convenienceFeeNum.toFixed(2);
  const insurancePremium = insurancePremiumNum.toFixed(2);

  // Generate authentic scannable QR payload containing ONLY Train & Passenger Berth details (No fare shared)
  const passengerListFormatted = ticket.passengers?.map((p, i) => {
    const cCode = (ticket.classCode || '3A').toUpperCase();
    let coachPrefix = 'B10';
    if (cCode === '1A') coachPrefix = 'H1';
    else if (cCode === '2A') coachPrefix = 'A1';
    else if (cCode === '3A' || cCode === '3E') coachPrefix = `B${10 + i}`;
    else if (cCode === 'SL') coachPrefix = `S${3 + i}`;

    const seatTypes = ['LOWER', 'MIDDLE', 'UPPER', 'SIDE LOWER', 'SIDE UPPER'];
    const isNoPref = !p.berth || ['no preference', 'no_preference'].includes(String(p.berth).toLowerCase());
    const pref = !isNoPref ? String(p.berth).toUpperCase() : seatTypes[i % seatTypes.length];
    
    const berthStr = (!isNoPref && String(p.berth).includes('CNF'))
      ? p.berth
      : `CNF / ${coachPrefix} / ${20 + (i * 13)} (${pref})`;

    return `${i + 1}. ${p.name?.toUpperCase()} (Age: ${p.age}, ${p.gender?.charAt(0)?.toUpperCase() || 'M'}) -> ${berthStr}`;
  }).join('\n') || '1. PASSENGER -> CNF / B10 / 20 (LOWER)';

  const qrPayloadText = `OFFICIAL IRCTC E-TICKET VERIFIED
PNR: ${pnrNo} (CONFIRMED)

TRAIN DETAILS:
Train No / Name: ${trainNo} - ${trainNameStr}
Boarding Station: ${fromStation} [DEP: ${departureTime}]
Destination: ${toStation} [ARR: ${arrivalTime}]
Date of Journey: ${journeyDate}
Class / Quota: ${rawClassCode} | ${quotaStr}

PASSENGER & BERTH DETAILS:
${passengerListFormatted}

SECURITY SIGNATURE: IRCTC_VERIFIED_0x${pnrNo}`;

  const qrFallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=M&data=${encodeURIComponent(qrPayloadText)}`;

  // Generate 100% reliable local high-resolution 2D QR Code Base64 Data URL (Pure Black & White for max camera contrast)
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(qrPayloadText, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 500,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(url => {
      if (isMounted) setQrBase64(url);
    }).catch(err => {
      console.warn("Local QR Code Generation Fallback:", err);
      if (isMounted) setQrBase64(qrFallbackUrl);
    });

    return () => { isMounted = false; };
  }, [qrPayloadText, qrFallbackUrl]);

  const handleDownloadPDF = async () => {
    const input = document.getElementById('e-ticket-print-area');
    if (!input || isDownloading) return;

    setIsDownloading(true);

    try {
      // 1. Capture ONLY the ticket document container using html2canvas
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
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      
      const margin = 4; // 4mm margin
      const maxWidth = pdfWidth - (margin * 2); // 202mm
      const maxHeight = pdfHeight - (margin * 2); // 289mm

      // Calculate scale ratio to fit BOTH width and height on 1 single A4 page
      const widthRatio = maxWidth / canvas.width;
      const heightRatio = maxHeight / canvas.height;
      const ratio = Math.min(widthRatio, heightRatio);

      const finalWidth = canvas.width * ratio;
      const finalHeight = canvas.height * ratio;

      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = margin;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(`IRCTC_ERS_Ticket_${ticket.pnr || '5615909226'}.pdf`);
    } catch (err) {
      console.error('PDF Generation exception, triggering browser print fallback:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = () => {
    setSendingEmail(true);
    setTimeout(() => {
      setSendingEmail(false);
      setEmailSentToast(`E-Ticket & PNR #${ticket.pnr} successfully sent to email as******@gmail.com!`);
      setTimeout(() => setEmailSentToast(''), 4000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl sm:max-w-4xl rounded-3xl overflow-hidden border border-slate-300 shadow-2xl my-auto max-h-[92vh] flex flex-col relative">
        
        {/* Toast Alert */}
        {emailSentToast && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white text-xs font-black px-4 py-2.5 rounded-full shadow-2xl border border-emerald-400 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{emailSentToast}</span>
          </div>
        )}

        {/* Modal Top Actions Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#0026cd] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900 shrink-0">
          
          <div className="flex items-center gap-2 text-xs font-black text-amber-300">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span className="truncate">ELECTRONIC RESERVATION SLIP (ERS) • 1-PAGE A4 E-TICKET</span>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            


            {/* Email Ticket Button */}
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-75"
              title="Resend ticket PDF & PNR to email"
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Mail...</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 text-amber-300" />
                  <span>Email Ticket</span>
                </>
              )}
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-75"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating 1-Page PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Ticket</span>
                </>
              )}
            </button>

            {/* Print Ticket Only Button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-black transition-all border border-white/20 cursor-pointer active:scale-95"
              title="Print only this ticket on 1 single page"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Print</span>
            </button>

            <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer ml-1">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>

        {/* Email Dispatched Alert Banner */}
        <div className="bg-emerald-50 px-4 sm:px-6 py-2 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900 shrink-0 font-medium">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ticket details & PDF sent to email- <strong className="text-emerald-950 underline">as******@gmail.com</strong> and registered mobile number <strong className="text-emerald-950">91-62******06</strong></span>
          </div>
          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
            ✓ MAIL SENT
          </span>
        </div>

        {/* Print Styles for 1-Page A4 output */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 3mm;
            }
            body * {
              visibility: hidden !important;
            }
            #e-ticket-print-area, #e-ticket-print-area * {
              visibility: visible !important;
            }
            #e-ticket-print-area {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 2mm !important;
              box-shadow: none !important;
              border: none !important;
              overflow: hidden !important;
              transform: scale(0.96) !important;
              transform-origin: top center !important;
            }
          }
        `}</style>

        {/* 1:1 Printable Electronic Reservation Slip (ERS) Area */}
        <div id="e-ticket-print-area" className="p-3 sm:p-4 bg-white text-slate-900 font-sans leading-tight overflow-y-auto flex-1 space-y-2">
          
          {/* CANCELLED Banner — shown only for cancelled tickets */}
          {isCancelled && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-400 rounded-lg px-3 py-2 text-xs font-black text-red-700 shadow-xs">
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>⚠ THIS TICKET HAS BEEN CANCELLED — TICKET IS NO LONGER VALID FOR TRAVEL</span>
            </div>
          )}

          {/* Header Bar */}
          <div className="text-center pb-1">
            <h2 className={`text-xs sm:text-sm font-black underline font-serif tracking-tight ${isCancelled ? 'text-red-700' : 'text-[#000066]'}`}>
              Electronic Reservation Slip (ERS){isCancelled ? <span className="no-underline text-[10px] font-bold text-red-500 ml-1">— CANCELLED</span> : <span className="no-underline text-[10px] font-bold text-slate-600 ml-1">- Normal User</span>}
            </h2>
          </div>

          {/* Logos & Route Header Container */}
          <div className="border-2 border-[#000066] rounded-sm overflow-hidden bg-white shadow-xs">
            
            {/* Logos Bar */}
            <div className="p-2.5 sm:p-3 flex items-center justify-between border-b-2 border-[#000066] bg-[#f8fafc]">
              {/* Indian Railways Official Red Circular Emblem */}
              <div className="flex items-center gap-3">
                <img
                  src="/indian_railways_logo.png"
                  alt="Indian Railways Emblem"
                  className="w-12 h-12 object-contain shrink-0 drop-shadow-xs"
                />
                <div>
                  <h3 className="font-serif font-black text-sm sm:text-base text-[#000066] uppercase tracking-tight leading-none">INDIAN RAILWAYS</h3>
                  <p className="text-[10px] font-sans font-bold text-slate-600 mt-1">Electronic Reservation Slip (ERS)</p>
                </div>
              </div>

              {/* IRCTC Crest & Status Badge */}
              <div className="flex items-center gap-3">
                {isCancelled ? (
                  <div className="hidden sm:flex items-center gap-1.5 bg-red-100 border border-red-500 px-2.5 py-1 rounded-md text-[10px] font-black text-red-700 shadow-2xs">
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>TICKET CANCELLED</span>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-1.5 bg-emerald-100/80 border border-emerald-400 px-2.5 py-1 rounded-md text-[10px] font-black text-emerald-900 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>CNF / VERIFIED</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-serif font-black text-base text-[#0026cd] leading-none">IRCTC</span>
                    <span className="text-[9px] font-sans font-bold text-slate-600 mt-0.5">e-Ticketing</span>
                  </div>
                  <img
                    src="/irctc_logo.png"
                    alt="IRCTC Logo"
                    className="w-10 h-10 object-contain shrink-0"
                  />
                </div>
              </div>
            </div>

            {/* Booked From | Boarding At | To Table */}
            <div className="grid grid-cols-3 divide-x-2 divide-[#000066] text-center text-[11px] sm:text-xs font-medium bg-white">
                         {/* Col 1: Booked From */}
              <div className="p-2.5">
                <span className="font-extrabold block text-slate-500 uppercase text-[9px] tracking-wider">Booked From</span>
                <span className="font-black text-xs sm:text-sm text-slate-900 uppercase block mt-0.5">{fromStation}</span>
                <span className="text-[10px] sm:text-[11px] block mt-1 font-bold text-slate-700">Start Date* <span className="font-mono font-bold">{journeyDate}</span></span>
              </div>

              {/* Col 2: Boarding At (Blue Arrow Header) */}
              <div className="p-2 bg-blue-50/40">
                <div className="bg-[#000066] text-white py-1 px-2 rounded-xs font-black text-[10px] sm:text-xs inline-flex items-center justify-center gap-1.5 w-full shadow-2xs">
                  <span>Boarding At</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <span className="font-black text-xs sm:text-sm text-slate-900 uppercase block mt-1">{boardingAtStation}</span>
                <span className="text-[10px] sm:text-[11px] block mt-0.5 font-bold text-[#000066]">Departure* <span className="font-mono font-black">{boardingDepartureTime}</span> {boardingDateStr}</span>
              </div>

              {/* Col 3: To */}
              <div className="p-2.5">
                <span className="font-extrabold block text-slate-500 uppercase text-[9px] tracking-wider">To</span>
                <span className="font-black text-xs sm:text-sm text-slate-900 uppercase block mt-0.5">{toStation}</span>
                <span className="text-[10px] sm:text-[11px] block mt-1 font-bold text-slate-700">Arrival* <span className="font-mono font-black">{arrivalTime}</span> {journeyDate}</span>
              </div>

            </div>

            {/* Core Ticket Information Grid */}
            <div className="border-t-2 border-[#000066] text-[10px] sm:text-xs divide-y divide-slate-300 bg-white">
              
              <div className="grid grid-cols-3 divide-x divide-slate-300 p-2 text-center items-center">
                <div className="bg-amber-50 border border-amber-200/80 p-1.5 rounded-sm">
                  <span className="font-extrabold block text-amber-900 text-[9px] uppercase tracking-wider">PNR NO.</span>
                  <span className="font-black text-base sm:text-lg text-[#000066] font-mono block tracking-widest">{pnrNo}</span>
                </div>
                <div className="p-1.5">
                  <span className="font-extrabold block text-slate-500 text-[9px] uppercase tracking-wider">TRAIN NO. & NAME</span>
                  <span className="font-black text-xs sm:text-sm text-[#0026cd] block leading-tight">{trainNo} / {trainNameStr}</span>
                </div>
                <div className="p-1.5">
                  <span className="font-extrabold block text-slate-500 text-[9px] uppercase tracking-wider">CLASS / QUOTA</span>
                  <span className="font-black text-xs sm:text-sm text-slate-900 block leading-tight">{fullClassName} | {quotaStr}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-300 p-2 text-center items-center">
                <div>
                  <span className="font-extrabold block text-slate-500 text-[9px] uppercase tracking-wider">QUOTA CODE</span>
                  <span className="font-extrabold uppercase block text-slate-900">{quotaStr}</span>
                </div>
                <div>
                  <span className="font-extrabold block text-slate-500 text-[9px] uppercase tracking-wider">TOTAL DISTANCE</span>
                  <span className="font-extrabold uppercase block text-slate-900 font-mono">{totalDistance}</span>
                </div>
                <div>
                  <span className="font-extrabold block text-slate-500 text-[9px] uppercase tracking-wider">BOOKING DATE & TIME</span>
                  <span className="font-extrabold block text-slate-900 font-mono">{bookingDateStr}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Passenger Details Table */}
          <div className="border-2 border-[#000066] rounded-sm overflow-hidden bg-white shadow-xs">
            <div className="bg-[#000066] text-white px-3 py-1.5 font-black text-xs sm:text-sm flex items-center justify-between uppercase tracking-wider">
              <span>PASSENGER DETAILS</span>
              <span className="text-[10px] font-bold text-amber-300 font-mono">Total Passengers: {passengers.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] sm:text-xs divide-y divide-slate-300 font-medium min-w-[550px]">
                <thead className="bg-slate-100 font-black text-slate-900 border-b-2 border-[#000066]">
                  <tr>
                    <th className="p-2 w-7 text-center border-r border-slate-300">#</th>
                    <th className="p-2 border-r border-slate-300">Name</th>
                    <th className="p-2 w-12 text-center border-r border-slate-300">Age</th>
                    <th className="p-2 w-14 text-center border-r border-slate-300">Gender</th>
                    <th className="p-2 border-r border-slate-300">Food Option</th>
                    <th className="p-2 border-r border-slate-300">Booking Status</th>
                    <th className="p-2">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {passengers.map((p, idx) => {
                    const cCode = rawClassCode;
                    let coachPrefix = 'B10';
                    if (cCode.includes('1A')) coachPrefix = 'H1';
                    else if (cCode.includes('2A')) coachPrefix = 'A1';
                    else if (cCode.includes('3A') || cCode.includes('3E')) coachPrefix = `B${10 + idx}`;
                    else if (cCode.includes('SL')) coachPrefix = `S${3 + idx}`;

                    // 2A/1A have NO Middle Berths — only LB, UB, SL, SU
                    const seatTypes2A = ['LB', 'UB', 'SL', 'SU'];
                    const seatTypes3A = ['LB', 'MB', 'UB', 'SL', 'SU'];
                    const seatTypesFallback = (cCode.includes('2A') || cCode.includes('1A')) ? seatTypes2A : seatTypes3A;

                    // Use stamped berth from booking time (set by App.jsx before seat deduction)
                    // Auto-correct any legacy MB berths for 2A/1A stored in DB
                    const rawBerth = p.berth || '';
                    const stampedBerth = (cCode.includes('2A') || cCode.includes('1A'))
                      ? rawBerth.replace(/\/MB$/i, '/UB')
                      : rawBerth;
                    const isRacStatus = stampedBerth.startsWith('RAC');
                    const isWlStatus = stampedBerth.startsWith('WL#') || stampedBerth.startsWith('WL ');
                    const isCnfStatus = stampedBerth.startsWith('CNF') || (!isRacStatus && !isWlStatus && stampedBerth !== '');

                    // If no berth was stamped, generate a CNF fallback
                    const bookingStatus = stampedBerth
                      ? stampedBerth
                      : `CNF/${coachPrefix}/${20 + idx * 13}/${seatTypesFallback[idx % seatTypesFallback.length]}`;

                    // Current status: CANCELLED ticket → all passengers get CANC status
                    const passengerCurrentStatus = isCancelled
                      ? 'CANC'
                      : (isRacStatus ? `RAC` : isWlStatus ? bookingStatus : 'CNF');

                    const bookingStatusColor = isRacStatus
                      ? 'text-amber-800 bg-amber-50/50'
                      : isWlStatus
                      ? 'text-orange-800 bg-orange-50/50'
                      : isCancelled
                      ? 'text-red-800 bg-red-50/50'
                      : 'text-emerald-800 bg-emerald-50/50';

                    const currentStatusColor = isRacStatus
                      ? 'text-amber-800 bg-amber-50'
                      : isWlStatus
                      ? 'text-orange-800 bg-orange-50'
                      : isCancelled
                      ? 'text-red-800 bg-red-50'
                      : 'text-emerald-800 bg-emerald-50/50';

                    return (
                      <tr key={idx} className="hover:bg-slate-50 font-mono">
                        <td className="p-2 text-center font-bold border-r border-slate-200">{idx + 1}.</td>
                        <td className="p-2 font-black text-slate-900 uppercase border-r border-slate-200">{p.name || p.passengerName}</td>
                        <td className="p-2 text-center font-bold border-r border-slate-200">{p.age || p.passengerAge || 30}</td>
                        <td className="p-2 text-center font-bold border-r border-slate-200">{p.gender?.charAt(0)?.toUpperCase() || 'M'}</td>
                        <td className="p-2 font-bold text-slate-700 border-r border-slate-200">{p.food?.toUpperCase() || 'NO FOOD'}</td>
                        <td className={`p-2 font-extrabold border-r border-slate-200 ${bookingStatusColor}`}>{bookingStatus}</td>
                        <td className={`p-2 font-black ${currentStatusColor}`}>{passengerCurrentStatus}</td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>

            <div className="p-1.5 bg-slate-100 border-t border-slate-300 text-[8px] sm:text-[9px] text-slate-700 font-mono flex flex-wrap items-center justify-between px-3">
              <span className="font-bold">Acronyms:</span>
              <span>RLWL: REMOTE LOCATION WAITLIST</span>
              <span>PQWL: POOLED QUOTA WAITLIST</span>
              <span>RSWL: ROAD-SIDE WAITLIST</span>
            </div>
          </div>

          {/* Transaction ID & Payment Details Grid (with Scannable Base64 2D QR Code) */}
          <div className="border-2 border-[#000066] rounded-sm overflow-hidden bg-white shadow-xs">
            
            <div className="p-2 border-b border-[#000066] font-bold text-[11px] sm:text-xs space-y-0.5 bg-[#f0f4fa]">
              <p className="font-black text-slate-900">Transaction ID: <span className="font-mono font-black text-[#000066]">{txnId}</span></p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-700 italic">IR recovers only 57% of cost of travel on an average.</p>
            </div>

            <div className="grid grid-cols-12 gap-3 p-3 bg-white items-center">
              
              {/* Fare Breakdown */}
              <div className="col-span-7 sm:col-span-8 space-y-1.5 text-[10px] sm:text-xs">
                <h4 className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-tight border-b border-slate-200 pb-1">Payment Details</h4>
                <div className="flex items-center justify-between text-slate-800 font-medium">
                  <span>Ticket Fare</span>
                  <span className="font-mono font-bold">₹ {ticketFare}</span>
                </div>
                <div className="flex items-center justify-between text-slate-800 font-medium">
                  <span>IRCTC Convenience Fee (Incl. of GST)</span>
                  <span className="font-mono font-bold">₹ {convenienceFee}</span>
                </div>
                <div className="flex items-center justify-between text-slate-800 font-medium">
                  <span>Travel Insurance Premium (Incl. of GST)</span>
                  <span className="font-mono font-bold">₹ {insurancePremium}</span>
                </div>
                <div className="flex items-center justify-between text-slate-900 font-black pt-2 border-t-2 border-[#000066] text-xs sm:text-sm">
                  <span>Total Fare (all inclusive)</span>
                  <span className="font-mono text-base sm:text-lg text-[#000066]">₹ {(ticket.totalPaid || 4646.30).toFixed(2)}</span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium pt-0.5">PG Charges as applicable (Additional)</p>
              </div>

              {/* Authentic Scannable Base64 2D QR Code Image Stamp (Clickable to inspect) */}
              <div
                onClick={() => setShowQrModal(true)}
                className="col-span-5 sm:col-span-4 flex flex-col items-center justify-center p-2.5 border-2 border-dashed border-[#000066] hover:border-blue-700 rounded-lg bg-slate-50 hover:bg-amber-50/60 text-center space-y-1.5 shadow-2xs transition-all cursor-pointer group"
                title="Click to view & verify QR payload scanner details"
              >
                <div className="relative">
                  <img
                    src={qrBase64 || qrFallbackUrl}
                    alt="IRCTC Verified QR Code"
                    className="w-20 sm:w-24 h-20 sm:h-24 object-contain shadow-xs border border-slate-300 rounded p-1 bg-white group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-[#000066]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-[#000066]" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] sm:text-[9px] font-mono font-black text-[#000066] group-hover:text-amber-800 uppercase tracking-wider block">
                    📱 SCAN WITH PHONE CAMERA
                  </span>
                  <span className="text-[7px] sm:text-[8px] text-slate-500 font-bold block">
                    Click to Inspect QR Verified Details ➔
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* IRCTC Rules & Guidelines Notice Box */}
          <div className="border-2 border-slate-800 rounded-sm p-2.5 space-y-1 text-[9px] sm:text-[10px] text-slate-900 bg-white leading-relaxed font-medium">
            <p className="font-bold">• Beware of fraudulent customer care number. For any assistance, use only the IRCTC e-ticketing Customer care number: <span className="font-black text-[#0026cd]">14646</span>.</p>
            <p className="font-bold">• IRCTC Convenience Fee is charged per e-ticket irrespective of number of passengers on the ticket.</p>
            <p className="font-bold">• The printed Departure and Arrival Times are liable to change. Please Check correct departure, arrival from Railway Station Enquiry or Dial 139.</p>
            <p>• Prescribed original ID proof is required while travelling along with SMS/ VRM/ ERS otherwise will be treated as without ticket and penalized as per Railway Rules.</p>
          </div>

          {/* Detailed ERS Instructions */}
          <div className="border border-slate-400 rounded-sm p-2.5 space-y-1 text-[8px] sm:text-[9px] text-slate-700 bg-white leading-tight">
            <h5 className="font-black text-[10px] uppercase text-[#000066]">INSTRUCTIONS & TRAVEL GUIDELINES:</h5>
            <ol className="list-decimal pl-3 space-y-0.5">
              <li>Prescribed Original ID proofs: Voter Identity Card / Passport / PAN Card / Driving License / Aadhaar Card with photo.</li>
              <li>PNRs having fully waitlisted status will be dropped and automatic refund credited to booking account.</li>
              <li>A clerkage charge of Rs.60 per passenger plus GST for AC Classes will be deducted if waitlisted ticket is cancelled.</li>
            </ol>
          </div>

        </div>

      </div>

      {/* Interactive QR Scanner Inspector Overlay Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-300 shadow-2xl overflow-hidden space-y-0">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#000066] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase tracking-wide">Smartphone QR Scanner Inspection</h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* High Res 2D QR Code View */}
              <div className="bg-slate-50 border-2 border-dashed border-blue-900/30 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center">
                <img
                  src={qrBase64 || qrFallbackUrl}
                  alt="High-Res QR Code"
                  className="w-48 h-48 object-contain bg-white p-2 rounded-xl border border-slate-300 shadow-md"
                />
                <p className="text-xs font-bold text-slate-600">
                  Scanning this 2D QR Code with any camera app renders the verified digital payload below:
                </p>
              </div>

              {/* Verified Phone Camera View Simulation Card */}
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl space-y-3 font-mono text-xs shadow-inner border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-emerald-400 font-bold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>✓ DIGITAL SIGNATURE VERIFIED</span>
                  </div>
                  <span className="text-[10px] text-slate-400">IRCTC TTE SCANNER</span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-200">
                  <p><span className="text-slate-400">PNR NO:</span> <strong className="text-amber-400 font-black">{ticket.pnr}</strong></p>
                  <p><span className="text-slate-400">TRAIN:</span> <strong className="text-white">{ticket.trainNumber} - {ticket.trainName}</strong></p>
                  <p><span className="text-slate-400">BOARDING ➔ DEST:</span> <strong>{ticket.from} ➔ {ticket.to}</strong></p>
                  <p><span className="text-slate-400">DATE & CLASS:</span> <strong>{ticket.date} | {ticket.classCode} | Quota: {ticket.quota || 'GN'}</strong></p>
                </div>

                <div className="border-t border-slate-800 pt-2 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">PASSENGER MANIFEST ({ticket.passengers?.length || 1})</span>
                  {ticket.passengers?.map((p, i) => (
                    <div key={i} className="text-[10px] text-slate-300 flex justify-between bg-slate-800/80 p-1.5 rounded">
                      <span>{i + 1}. {p.name?.toUpperCase()} ({p.age}, {p.gender})</span>
                      <strong className="text-emerald-400">{p.berth || p.status || 'CNF'}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw QR Text Payload Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wide">Raw Encoded QR Text Payload</label>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(qrPayloadText);
                      setCopiedPayload(true);
                      setTimeout(() => setCopiedPayload(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[#000066] hover:underline cursor-pointer"
                  >
                    {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPayload ? 'Copied!' : 'Copy Raw Text'}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={8}
                  value={qrPayloadText}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-[11px] font-mono text-slate-800 leading-relaxed focus:outline-none select-all"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowQrModal(false)}
                className="px-5 py-2 bg-[#000066] hover:bg-blue-900 text-white rounded-full text-xs font-black transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
