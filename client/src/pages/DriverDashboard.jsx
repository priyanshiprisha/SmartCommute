import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Map from '../components/Map';
import { Car } from 'lucide-react';

function DriverDashboard() {
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routeDetails, setRouteDetails] = useState(null);
  const [activeRides, setActiveRides] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleLocationSelect = ({ origin, destination, distance, originCoords, destinationCoords }) => {
    if (origin !== undefined) setOrigin(origin);
    if (destination !== undefined) setDestination(destination);
    if (distance !== undefined) {
      setRouteDetails(prev => ({
        ...prev,
        distance
      }));
    }
    if (originCoords) setRouteDetails(prev => ({ ...prev, originCoords }));
    if (destinationCoords) setRouteDetails(prev => ({ ...prev, destinationCoords }));
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/rides/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          driverId: user._id,
          origin,
          destination,
          originCoords: routeDetails?.originCoords,
          destinationCoords: routeDetails?.destinationCoords,
          distance: routeDetails?.distance
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create ride');
      }

      const data = await response.json();
      setActiveRides([...activeRides, data]);
    } catch (error) {
      setError('Error creating ride. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Heading */}
      <div className="flex items-center gap-3 mb-8">
        <Car className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Driver Dashboard</h1>
      </div>

      {/* Notifications Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((notification) => (
              <li key={notification._id} className="p-2 border-b">
                {notification.message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No new notifications</p>
        )}
      </div>

      {/* Route Selection */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Set Your Route</h2>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Map
            origin={origin}
            destination={destination}
            isDriver={true}
            onLocationSelect={handleLocationSelect}
          />

          <div className="mt-4">
            <button
              onClick={handleRouteSubmit}
              disabled={!origin || !destination}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            >
              Set Route
            </button>
          </div>
        </div>

        {/* Active Rides Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Active Rides</h2>
          {activeRides.length === 0 ? (
            <p className="text-gray-500">No active rides</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRides.map((ride) => (
                <div key={ride._id} className="border p-4 rounded-lg">
                  <p className="font-semibold">From: {ride.origin}</p>
                  <p className="font-semibold">To: {ride.destination}</p>
                  <p className="text-gray-600">Status: {ride.status}</p>
                  {ride.passenger && (
                    <>
                      <p className="text-gray-600">Pickup: {ride.pickup}</p>
                      <p className="text-gray-600">Dropoff: {ride.dropoff}</p>
                      <p className="text-green-600 font-semibold">Fare: ${ride.fare}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;
