import mongoose from 'mongoose';

const cancellationSchema = new mongoose.Schema({
  cancellationId:   { type: String, required: true, unique: true, index: true },
  pnr:              { type: String, required: true, index: true },
  username:         { type: String, required: true, index: true },

  // Train & Journey details
  trainNumber:      String,
  trainName:        String,
  from:             String,
  to:               String,
  journeyDate:      String,   // original journey date (YYYY-MM-DD)
  date:             String,   // kept for backward compat
  classCode:        String,

  // Full Fare Breakdown
  ticketFare:       { type: Number, default: 0 },
  convenienceFee:   { type: Number, default: 0 },
  insurancePremium: { type: Number, default: 0 },
  totalPaid:        { type: Number, default: 0 },
  grossFare:        { type: Number, required: true },
  baseCancelCharge: { type: Number, required: true },
  cgst9:            { type: Number, default: 0 },
  sgst9:            { type: Number, default: 0 },
  gst18:            { type: Number, required: true },
  totalDeduction:   { type: Number, required: true },
  netRefund:        { type: Number, required: true },

  // Cancellation timestamp — stored in multiple formats for easy display
  cancelledAt:      { type: String, default: () => new Date().toISOString() },  // full ISO string
  cancelledDate:    { type: String, default: '' },   // e.g. "28-Jul-2026"
  cancelledTime:    { type: String, default: '' },   // e.g. "18:43:33"
  cancelledDateIST: { type: String, default: '' },   // full human label "28 Jul 2026, 06:43 PM"

  // Cancel reason & refund info
  cancelReason:     { type: String, default: 'Change of Travel Plan' },
  refundMode:       { type: String, default: 'Original Payment Source (Bank/UPI)' },
  refundEta:        { type: String, default: '2-3 Business Days' },
  passengerCount:   { type: Number, default: 1 },

  cancelledPassengers: { type: Array, default: [] }
}, { timestamps: true });

export default mongoose.model('Cancellation', cancellationSchema);
