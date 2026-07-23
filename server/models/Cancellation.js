import mongoose from 'mongoose';

const cancellationSchema = new mongoose.Schema({
  cancellationId: { type: String, required: true, unique: true, index: true },
  pnr: { type: String, required: true, index: true },
  username: { type: String, required: true, index: true },
  trainNumber: String,
  trainName: String,
  from: String,
  to: String,
  date: String,
  classCode: String,
  grossFare: { type: Number, required: true },
  baseCancelCharge: { type: Number, required: true },
  gst18: { type: Number, required: true },
  totalDeduction: { type: Number, required: true },
  netRefund: { type: Number, required: true },
  cancelledPassengers: Array,
  cancelledAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export default mongoose.model('Cancellation', cancellationSchema);
