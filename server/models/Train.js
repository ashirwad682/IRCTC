// Express Server Mongoose Model - Train Inventory Schema

export const trainSchema = {
  number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Vande Bharat', 'Rajdhani', 'Tejas', 'Superfast', 'Duronto', 'Shatabdi'] },
  fromStation: { type: String, required: true, index: true },
  toStation: { type: String, required: true, index: true },
  departureTime: String,
  arrivalTime: String,
  duration: String,
  distanceKm: Number,
  punctualityScore: Number,
  hasPantry: Boolean,
  hasWifi: Boolean,
  classes: [
    {
      code: String,
      price: Number,
      availableBerths: Number,
      racCount: Number,
      waitingListCount: Number
    }
  ],
  coaches: [
    {
      code: String,
      classCode: String,
      totalSeats: Number
    }
  ]
};
