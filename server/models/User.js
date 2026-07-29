import mongoose from 'mongoose';

const masterPassengerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  passengerType: { type: String, default: 'Normal User' },
  name: { type: String, required: true },
  dob: { type: String, default: '' },
  age: { type: Number, default: 0 },
  gender: { type: String, default: 'Male' },
  berth: { type: String, default: 'No Preference' },
  meal: { type: String, default: 'Veg' },
  status: { type: String, default: 'Verified' },
  statusColor: { type: String, default: 'text-emerald-600' },
  idType: { type: String, default: 'AADHAR ID/VIRTUAL ID' },
  idNumber: { type: String, default: '' }
}, { timestamps: true });

const recentJourneySchema = new mongoose.Schema({
  id: { type: String, required: true },
  trainNo: { type: String, default: '' },
  fromCode: { type: String, required: true },
  fromCity: { type: String, default: '' },
  toCode: { type: String, required: true },
  toCity: { type: String, default: '' },
  classCode: { type: String, default: 'AC 3 Tier (3A)' },
  quota: { type: String, default: 'GENERAL' },
  addedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' },
  gender: { type: String, default: '' },
  dob: { type: String, default: '' },
  country: { type: String, default: 'India' },
  address: { type: String, default: '' },
  walletBalance: { type: Number, default: 10000 },
  lastUsernameChangeAt: { type: Date, default: Date.now },
  lastPasswordChangeAt: { type: Date, default: Date.now },
  masterPassengers: [masterPassengerSchema],
  recentJourneys: [recentJourneySchema],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
