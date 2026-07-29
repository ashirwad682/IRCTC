import mongoose from 'mongoose';

const stationStopSchema = new mongoose.Schema({
  seq: { type: Number, required: true },
  stationCode: { type: String, required: true },
  stationName: { type: String, required: true },
  arrivalTime: { type: String, default: '00:00:00' },
  departureTime: { type: String, default: '00:00:00' },
  distance: { type: Number, default: 0 }
}, { _id: false });

const trainScheduleSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true, index: true },
  trainName: { type: String, required: true },
  sourceStation: {
    code: { type: String, required: true, index: true },
    name: { type: String, required: true }
  },
  destinationStation: {
    code: { type: String, required: true, index: true },
    name: { type: String, required: true }
  },
  totalDistance: { type: Number, default: 0 },
  totalStops: { type: Number, default: 0 },
  stops: [stationStopSchema]
}, {
  timestamps: true
});

// Compound indexes for searching trains between stations
trainScheduleSchema.index({ 'stops.stationCode': 1 });
trainScheduleSchema.index({ 'sourceStation.code': 1, 'destinationStation.code': 1 });

const TrainSchedule = mongoose.models.TrainSchedule || mongoose.model('TrainSchedule', trainScheduleSchema);

export default TrainSchedule;
