import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Map from '../components/Map';
import PaymentForm from '../components/PaymentForm';
import { Users } from 'lucide-react';
import axios from 'axios';

function PassengerDashboard() {
  const { user } = useAuth();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [routeDetails, setRouteDetails] = useState({
    distance: null,
    originCoords: null,
    destinationCoords: null
  });
  const [availableRides, setAvailableRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableRides();
  }, []);

  const fetchAvailableRides = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/rides/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAvailableRides(response.data);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError('Error fetching available rides');
    }
  };

  const handleLocationSelect = ({ origin, destination, distance, originCoords, destinationCoords }) => {
    if (origin) setPickup(origin);
    if (destination) setDropoff(destination);
    setRouteDetails({ distance, originCoords, destinationCoords });
  };

  const searchRides = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/rides/available', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableRides(response.data.length > 0 ? response.data : []);
      if (response.data.length === 0) setError('No rides available at the moment. Please try again later.');
    } catch (err) {
      console.error('Error searching rides:', err);
      setError('Error searching rides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bookRide = async (rideId) => {
    if (!pickup || !dropoff || !routeDetails.originCoords || !routeDetails.destinationCoords) {
      setError('Please select valid pickup and dropoff locations');
      return;
    }
    setLoading(true);
    setError('');
  
    try {
      const response = await axios.post(
        'http://localhost:3000/api/rides/book',
        {
          rideId,
          passengerId: user._id,
          pickup,
          dropoff,
          pickupCoords: routeDetails.originCoords,
          dropoffCoords: routeDetails.destinationCoords,
          numPassengers: user.numPassengers,  // Send passenger count
          numLuggage: user.numLuggage        // Send luggage count
        },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
  
      setSelectedRide(response.data);
  
      // Notify driver about the new booking
      await axios.post('http://localhost:3000/api/notify-driver', {
        driverId: response.data.driverId,
        message: `New Ride Booked! ${user.numPassengers} passengers with ${user.numLuggage} luggage.`
      });
  
    } catch (err) {
      console.error('Error booking ride:', err);
      setError('Error booking ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const handlePaymentSuccess = () => {
    setSelectedRide(prev => ({ ...prev, status: 'paid' }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-green-600" />
        <h1 className="text-3xl font-bold">Passenger Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Find a Ride</h2>
          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}
          <Map origin={pickup} destination={dropoff} isDriver={false} onLocationSelect={handleLocationSelect} />
          <div className="mt-4">
            <button onClick={searchRides} disabled={loading} className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50">
              {loading ? 'Searching...' : 'Search Rides'}
            </button>
          </div>
        </div>

        {availableRides.length > 0 && !selectedRide && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Available Rides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRides.map((ride) => (
                <div key={ride._id} className="border p-4 rounded-lg hover:border-green-500 transition duration-200">
                  <p className="font-semibold">Driver: {ride.driver.name}</p>
                  <p className="text-gray-600">Vehicle: {ride.driver.vehicle.model}</p>
                  <p className="text-gray-600">From: {ride.origin}</p>
                  <p className="text-gray-600">To: {ride.destination}</p>
                  <p className="text-gray-600">Distance: {ride.distance} km</p>
                  <p className="text-lg font-bold text-green-600">Fare: ₹{ride.fare}</p>
                  <button onClick={() => bookRide(ride._id)} disabled={loading} className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50">
                    {loading ? 'Booking...' : 'Book Ride'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedRide && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Booked Ride Details</h2>
              <p className="font-semibold">Driver: {selectedRide.driverName}</p>
              <p className="text-gray-600">Vehicle: {selectedRide.vehicle}</p>
              <p className="text-gray-600">Status: {selectedRide.status}</p>
              <p className="text-lg font-bold text-green-600">Fare: ₹{selectedRide.fare}</p>
            </div>
            {selectedRide.status !== 'paid' && <PaymentForm amount={selectedRide.fare} rideId={selectedRide._id} onSuccess={handlePaymentSuccess} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default PassengerDashboard;
