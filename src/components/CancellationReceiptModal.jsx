import React, { useState, useEffect } from 'react';
import { X, Download, Printer, CheckCircle2, FileText, User, ShieldCheck, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export default function CancellationReceiptModal({ pnrData, onClose }) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [qrBase64, setQrBase64] = useState('');

  const cancelId = pnrData?.cancelId || ('CAN' + String(pnrData?.pnr || '8849102941').slice(-6) + '94');
  const pnr = pnrData?.pnr || pnrData?.pnrNumber || '8849102941';
  const trainNo = pnrData?.trainNumber || '12952';
  const trainName = pnrData?.trainName || 'MUMBAI RAJDHANI';
  const classCode = pnrData?.classCode || pnrData?.journeyClass || '3A';
  const quota = pnrData?.quota || 'GN';
  const cancelledDate = pnrData?.cancelledDate || '21-Jul-2026, 14:30';
  const passengers = pnrData?.passengers || pnrData?.passengerList || [
    { name: 'PASSENGER 1', age: 30, gender: 'M', berth: 'CNF/B10/20' }
  ];

  // Financial calculations with 18% GST (Calculated strictly on Base Ticket Cost)
  const cDetails = pnrData?.cancellationDetails || {};
  const totalPaid = Number(cDetails.totalPaid || pnrData?.totalPaid || 2186.30);
  const convFee = Number(cDetails.nonRefundableFees || pnrData?.convenienceFee || 36.30);
  const ticketFare = Number(cDetails.ticketFare || cDetails.grossFare || pnrData?.ticketFare || Math.max(0, totalPaid - convFee));

  let baseFeePerPsg = 180;
  const cls = String(classCode).toUpperCase();
  if (cls.includes('1A') || cls.includes('EC')) baseFeePerPsg = 240;
  else if (cls.includes('2A')) baseFeePerPsg = 200;
  else if (cls.includes('3A') || cls.includes('CC') || cls.includes('3E')) baseFeePerPsg = 180;
  else if (cls.includes('SL')) baseFeePerPsg = 120;
  else if (cls.includes('2S')) baseFeePerPsg = 60;

  const baseCancelCharge = cDetails.baseCancelCharge != null ? cDetails.baseCancelCharge : (baseFeePerPsg * passengers.length);
  const cgst9 = cDetails.cgst9 != null ? cDetails.cgst9 : Math.round(baseCancelCharge * 0.09 * 100) / 100;
  const sgst9 = cDetails.sgst9 != null ? cDetails.sgst9 : Math.round(baseCancelCharge * 0.09 * 100) / 100;
  const gstAmount = cDetails.gst18 != null ? cDetails.gst18 : Math.round((cgst9 + sgst9) * 100) / 100;
  const totalDeduction = cDetails.totalDeduction != null ? cDetails.totalDeduction : Math.round((baseCancelCharge + gstAmount) * 100) / 100;
  const netRefund = cDetails.netRefund != null ? cDetails.netRefund : Math.max(0, Math.round((ticketFare - totalDeduction) * 100) / 100);

  // Generate 2D QR Code
  useEffect(() => {
    let isMounted = true;
    const qrPayload = `OFFICIAL IRCTC CANCELLATION SLIP
CANCEL REF ID: ${cancelId}
PNR: ${pnr}
TRAIN: ${trainNo} - ${trainName}
DATE: ${cancelledDate}
PASSENGERS: ${passengers.map(p => p.name || p.passengerName).join(', ')}
TICKET FARE: ₹${ticketFare}
BASE FEE: ₹${baseCancelCharge}
18% GST: ₹${gstAmount}
TOTAL DEDUCTED: ₹${totalDeduction}
NET REFUND: ₹${netRefund}
STATUS: CANCELLED / REFUND PROCESSED`;

    QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 400,
      color: { dark: '#000000', light: '#FFFFFF' }
    }).then(url => {
      if (isMounted) setQrBase64(url);
    }).catch(err => console.warn(err));

    return () => { isMounted = false; };
  }, [cancelId, pnr, trainNo, trainName, cancelledDate, passengers, ticketFare, baseCancelCharge, gstAmount, totalDeduction, netRefund]);

  // Download 1-Page A4 PDF
  const handleDownloadPdf = async () => {
    const input = document.getElementById('cancellation-modal-print-area');
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
      pdf.save(`IRCTC_Cancellation_Slip_${pnr}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Action Toolbar Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 px-6 py-4 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-400 flex items-center justify-center font-black">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider">OFFICIAL CANCELLATION & REFUND SLIP</h2>
              <p className="text-[11px] text-blue-200 font-medium">PNR: <span className="font-mono font-black text-amber-300">{pnr}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          
          <div id="cancellation-modal-print-area" className="relative bg-white border border-slate-300 rounded-2xl p-6 shadow-md text-slate-900 overflow-hidden">
            
            {/* Official Indian Railways Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none z-0">
              <img src="/indian_railways_logo.png" alt="Indian Railways Watermark" className="w-96 h-96 object-contain" />
            </div>

            <div className="relative z-10 space-y-5">

              {/* Header Logos */}
              <div className="border-b-2 border-blue-900 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/indian_railways_logo.png" alt="Indian Railways Logo" className="w-14 h-14 object-contain shrink-0" />
                  <div>
                    <h1 className="text-sm sm:text-base font-black text-[#000066] uppercase tracking-tight">INDIAN RAILWAYS CATERING AND TOURISM CORPORATION LTD.</h1>
                    <p className="text-[10px] font-bold text-slate-600">A Government of India Enterprise (CIN: L74899DL1999GOI101707)</p>
                    <p className="text-[10px] font-mono font-black text-rose-700 uppercase">OFFICIAL ELECTRONIC RESERVATION SLIP (ERS) — CANCELLATION & REFUND ADVICE</p>
                  </div>
                </div>

                {qrBase64 && (
                  <div className="text-center shrink-0">
                    <img src={qrBase64} alt="Cancellation QR Code" className="w-20 h-20 mx-auto border border-slate-300 rounded p-1 bg-white" />
                    <span className="text-[8px] font-mono font-bold text-slate-500 block">SCANNABLE REFUND VERIFIED</span>
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
                <span className="font-mono font-black text-slate-900">{cancelId}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600 block">DATE & TIME:</span>
                <span className="font-bold text-slate-900">{cancelledDate}</span>
              </div>
            </div>

            {/* PNR & Journey Grid */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">PNR NUMBER</span>
                <span className="font-mono font-black text-slate-900">{pnr}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">TRAIN NO & NAME</span>
                <span className="font-extrabold text-slate-900">{trainNo} - {trainName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">CLASS / QUOTA</span>
                <span className="font-bold text-slate-800">{classCode} | {quota}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">REFUND MODE</span>
                <span className="font-bold text-slate-800">Original Source (Bank/UPI)</span>
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
                  {passengers.map((p, idx) => (
                    <tr key={idx} className="border-b border-slate-200 font-medium">
                      <td className="p-2 border border-slate-300 font-bold">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-bold text-slate-900">{p.name || p.passengerName}</td>
                      <td className="p-2 border border-slate-300">{p.age || p.passengerAge || 30} / {p.gender || p.passengerGender || 'M'}</td>
                      <td className="p-2 border border-slate-300 font-bold text-slate-700">{p.berth || p.seat || 'CNF'}</td>
                      <td className="p-2 border border-slate-300 font-black text-rose-700 bg-rose-50">CANCELLED</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Itemized Financial & 18% GST Charge Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-900" />
                  <span>ITEMIZED CANCELLATION & GST CHARGE BREAKDOWN</span>
                </span>
                <span className="text-[10px] font-mono font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">18% GST INCLUDED</span>
              </h3>

              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-300">
                    <th className="p-2 border border-slate-300">Description</th>
                    <th className="p-2 border border-slate-300 text-center">Rate / Rule</th>
                    <th className="p-2 border border-slate-300 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  <tr>
                    <td className="p-2 border border-slate-300 font-black text-blue-950">Ticket Fare (Selected Passengers / Base Ticket Cost)</td>
                    <td className="p-2 border border-slate-300 text-center font-bold text-blue-900">Base Ticket Fare</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-black text-blue-950">₹{ticketFare.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 font-bold text-slate-800">Flat Base Cancellation Fee</td>
                    <td className="p-2 border border-slate-300 text-center text-slate-500">Official IRCTC Tariff</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold text-rose-700">- ₹{baseCancelCharge.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="p-2 border border-slate-300 font-black text-amber-900">GST on Cancellation Charge (18%) <span className="text-[10px] font-normal text-amber-700 block">(CGST @ 9% + SGST @ 9%)</span></td>
                    <td className="p-2 border border-slate-300 text-center font-bold text-amber-800">18.00%</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-black text-amber-900">- ₹{gstAmount.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-rose-50 font-black text-rose-950">
                    <td className="p-2 border border-slate-300">Total Cancellation & GST Charges Deducted</td>
                    <td className="p-2 border border-slate-300 text-center text-rose-800">Base Fee + 18% GST</td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-xs text-rose-800">- ₹{totalDeduction.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-emerald-100 text-emerald-950 font-black text-sm">
                    <td className="p-2.5 border border-slate-300 uppercase">NET REFUND AMOUNT CREDITED TO BANK / UPI</td>
                    <td className="p-2.5 border border-slate-300 text-center text-emerald-800 text-xs">Direct Account Refund</td>
                    <td className="p-2.5 border border-slate-300 text-right font-mono text-base text-emerald-700">₹{netRefund.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Guidelines */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-0.5 font-medium">
              <p className="font-bold text-slate-800">Terms & Refund Guidelines:</p>
              <p>1. As per Ministry of Railways rules, 18% GST is levied on applicable ticket cancellation charges.</p>
              <p>2. Refund amount will be credited to the original payment source within 2-3 working days.</p>
            </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
