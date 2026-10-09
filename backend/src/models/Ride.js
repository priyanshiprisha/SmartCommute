import mongoose from 'mongoose';

const coordinateSchema = new mongoose.Schema({
  lat: Number,
  lng: Number
});

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  originCoords: {
    type: coordinateSchema,
    required: true
  },
  destinationCoords: {
    type: coordinateSchema,
    required: true
  },
  pickup: {
    type: String
  },
  dropoff: {
    type: String
  },
  pickupCoords: {
    type: coordinateSchema
  },
  dropoffCoords: {
    type: coordinateSchema
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'in-progress', 'completed', 'cancelled', 'paid'],
    default: 'available'
  },
  fare: {
    type: Number,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  paymentError: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Ride', rideSchema);