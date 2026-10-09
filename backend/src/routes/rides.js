import express from 'express';
import Ride from '../models/Ride.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const authenticateToken = require('../middleware/authMiddleware'); // Import authentication middleware

// Notify driver about booking (Requires authentication)
router.post('/notify-driver', authenticateToken, async (req, res) => {
  const { driverId, message } = req.body;

  try {
    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Store notification in the database
    const notification = new Notification({
      userId: driverId,
      message,
      read: false
    });
    await notification.save();

    res.status(200).json({ success: true, message: 'Notification sent to driver' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to calculate fare based on distance
function calculateFare(distance) {
  const baseRate = 20; // Base rate per kilometer in INR
  const minimumFare = 50; // Minimum fare in INR
  const calculatedFare = Math.max(distance * baseRate, minimumFare);
  return Math.round(calculatedFare); // Round to nearest rupee
}

// Create a new ride (driver)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { driverId, origin, destination, originCoords, destinationCoords } = req.body;

    // Verify driver
    const driver = await User.findById(driverId);
    if (!driver || driver.userType !== 'driver') {
      return res.status(400).json({ message: 'Invalid driver' });
    }

    // Calculate initial distance
    const distance = calculateDistance(
      originCoords.lat,
      originCoords.lng,
      destinationCoords.lat,
      destinationCoords.lng
    );

    // Calculate initial fare
    const fare = calculateFare(distance);

    const ride = new Ride({
      driver: driverId,
      origin,
      destination,
      originCoords,
      destinationCoords,
      status: 'available',
      fare,
      distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
    });

    await ride.save();

    const populatedRide = await Ride.findById(ride._id)
      .populate('driver', 'name vehicle')
      .lean();

    res.status(201).json(populatedRide);
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ message: 'Error creating ride', error: error.message });
  }
});

// Search for available rides (passenger)
router.post('/search', authenticateToken, async (req, res) => {
  try {
    // Find all available rides
    const availableRides = await Ride.find({ 
      status: 'available'
    })
    .populate('driver', 'name vehicle')
    .lean();

    // Map rides with calculated distances and fares
    const matchingRides = availableRides.map(ride => ({
      _id: ride._id,
      driverName: ride.driver.name,
      vehicle: ride.driver.vehicle,
      distance: ride.distance,
      origin: ride.origin,
      destination: ride.destination,
      fare: ride.fare
    }));

    res.json(matchingRides);
  } catch (error) {
    console.error('Error searching rides:', error);
    res.status(500).json({ message: 'Error searching rides' });
  }
});

// Book a ride (passenger)
router.post('/book', authenticateToken, async (req, res) => {
  try {
    const { rideId, passengerId, pickup, dropoff, pickupCoords, dropoffCoords } = req.body;
console.log("here");

    const ride = await Ride.findById(rideId).populate('driver', 'name vehicle');
    if (!ride || ride.status !== 'available') {
      return res.status(400).json({ message: 'Ride not available' });
    }

    // Verify passenger
    const passenger = await User.findById(passengerId);
    if (!passenger || passenger.userType !== 'passenger') {
      return res.status(400).json({ message: 'Invalid passenger' });
    }

    // Calculate actual trip distance
    const distance = calculateDistance(
      pickupCoords.lat,
      pickupCoords.lng,
      dropoffCoords.lat,
      dropoffCoords.lng
    );

    // Calculate final fare
    const fare = calculateFare(distance);

    // Update ride details
    ride.passenger = passengerId;
    ride.pickup = pickup;
    ride.dropoff = dropoff;
    ride.pickupCoords = pickupCoords;
    ride.dropoffCoords = dropoffCoords;
    ride.status = 'booked';
    ride.fare = Math.round(fare);
    ride.distance = Math.round(distance * 10) / 10;

    await ride.save();

    // Prepare response
    const bookingDetails = {
      _id: ride._id,
      driverName: ride.driver.name,
      vehicle: ride.driver.vehicle.model,
      licensePlate: ride.driver.vehicle.licensePlate,
      status: ride.status,
      fare: ride.fare,
      distance: ride.distance,
      pickup: ride.pickup,
      dropoff: ride.dropoff
    };

    res.json(bookingDetails);
  } catch (error) {
    console.error('Error booking ride:', error);
    res.status(500).json({ message: 'Error booking ride' });
  }
});

// Get all available rides
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'available' })
      .populate('driver', 'name vehicle')
      .lean();

    res.json(rides);
  } catch (error) {
    console.error('Error fetching available rides:', error);
    res.status(500).json({ message: 'Error fetching rides' });
  }
});

// Get active rides for a driver
router.get('/driver/:driverId', authenticateToken, async (req, res) => {
  try {
    const rides = await Ride.find({
      driver: req.params.driverId,
      status: { $in: ['available', 'booked', 'in-progress'] }
    })
    .populate('passenger', 'name')
    .lean();

    res.json(rides);
  } catch (error) {
    console.error('Error fetching driver rides:', error);
    res.status(500).json({ message: 'Error fetching rides' });
  }
});

// Get ride history for a passenger
router.get('/passenger/:passengerId', authenticateToken, async (req, res) => {
  try {
    const rides = await Ride.find({
      passenger: req.params.passengerId
    })
    .populate('driver', 'name vehicle')
    .lean();

    res.json(rides);
  } catch (error) {
    console.error('Error fetching passenger rides:', error);
    res.status(500).json({ message: 'Error fetching rides' });
  }
});

// Update ride status
router.patch('/:rideId/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'booked', 'in-progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ride = await Ride.findByIdAndUpdate(
      req.params.rideId,
      { status },
      { new: true }
    ).lean();

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Error updating ride status:', error);
    res.status(500).json({ message: 'Error updating ride status' });
  }
});

export default router;