import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Ride from '../models/Ride.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const router = express.Router();

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Razorpay credentials are not properly configured');
  process.exit(1);
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Create Razorpay order
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, rideId } = req.body;

    // Verify the ride exists and is booked
    const ride = await Ride.findById(rideId);
    if (!ride || ride.status !== 'booked') {
      return res.status(400).json({ message: 'Invalid ride or ride status' });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to smallest currency unit (paise)
      currency: 'INR',
      receipt: `ride_${rideId}`,
      notes: {
        rideId: rideId
      }
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
});

// Verify payment
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      rideId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Update ride status
      await Ride.findByIdAndUpdate(rideId, {
        status: 'paid',
        paymentStatus: 'completed',
        paymentId: razorpay_payment_id
      });

      res.json({
        status: 'success',
        message: 'Payment verified successfully'
      });
    } else {
      await Ride.findByIdAndUpdate(rideId, {
        paymentStatus: 'failed',
        paymentError: 'Signature verification failed'
      });

      res.status(400).json({
        status: 'error',
        message: 'Invalid signature'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

export default router;