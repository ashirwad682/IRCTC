import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
  name: { type: String, default: 'PASSENGER' },
  age: { type: Number, default: 21 },
  gender: { type: String, default: 'M' },
  berth: { type: String, default: 'CNF' },
  status: { type: String, default: 'CNF' },
  food: { type: String, default: 'NO FOOD' }
});

const bookingSchema = new mongoose.Schema({
  pnr: { type: String, required: true, unique: true, index: true },
  userId: { type: String, default: '' },
  username: { type: String, required: true, index: true },
  trainNumber: { type: String, required: true },
  trainName: { type: String, default: 'EXPRESS TRAIN' },
  from: { type: String, required: true },
  to: { type: String, required: true },
  boardingAt: { type: String, default: '' },
  boardingDate: { type: String, default: '' },
  boardingDepTime: { type: String, default: '' },
  depTime: { type: String, default: '08:00' },
  arrTime: { type: String, default: '20:00' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  classCode: { type: String, default: '3A' },
  quota: { type: String, default: 'GENERAL (GN)' },
  passengers: [passengerSchema],
  ticketFare: { type: Number, default: 0 },
  convenienceFee: { type: Number, default: 35.40 },
  insurancePremium: { type: Number, default: 0.90 },
  totalPaid: { type: Number, default: 0 },
  txnId: { type: String, default: () => `TXN_${Date.now()}` },
  status: { type: String, default: 'BOOKED' },
  bookingDate: { type: String, default: () => new Date().toISOString() },
  isCancelled: { type: Boolean, default: false },
  cancellationDetails: {
    cancellationId: String,
    cancelledAt: String,
    grossFare: Number,
    baseCancelCharge: Number,
    gst18: Number,
    totalDeduction: Number,
    netRefund: Number
  }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
