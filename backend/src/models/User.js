import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['driver', 'passenger'],
    required: true
  },
  vehicle: {
    type: {
      model: String,
      licensePlate: String
    },
    required: function() {
      return this.userType === 'driver';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);