import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    userType: 'passenger',
    numPassengers: '',  // New field for passengers
    numLuggage: '',     // New field for passengers
    vehicle: {
      model: '',
      licensePlate: ''
    }
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();
  if (!register) {
    console.error("register function not found in AuthContext");
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name.includes("vehicle.")) { // Instead of `name.startsWith`
      const field = name.split(".")[1]; // Extract field name
      setFormData((prev) => ({
        ...prev,
        vehicle: {
          ...prev.vehicle,
          [field]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(formData);
      if (user.userType === 'driver') {
        navigate('/driver/dashboard');
      } else {
        navigate('/passenger/dashboard');
      }
    } catch (err) {
      setError('Error creating account');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <UserPlus className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                id="userType"
                name="userType"
                required
                value={formData.userType}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="passenger">Passenger</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            {/* Additional Fields for Passengers */}
            {formData.userType === 'passenger' && (
              <>
                <div>
                  <label htmlFor="numPassengers" className="block text-sm font-medium text-gray-700">
                    Number of Passengers
                  </label>
                  <input
                    id="numPassengers"
                    name="numPassengers"
                    type="number"
                    min="1"
                    required
                    value={formData.numPassengers}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="numLuggage" className="block text-sm font-medium text-gray-700">
                    Number of Luggage
                  </label>
                  <input
                    id="numLuggage"
                    name="numLuggage"
                    type="number"
                    min="0"
                    required
                    value={formData.numLuggage}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Additional Fields for Drivers */}
            {formData.userType === 'driver' && (
              <>
                <div>
                  <label htmlFor="vehicle.model" className="block text-sm font-medium text-gray-700">
                    Vehicle Model
                  </label>
                  <input
                    id="vehicle.model"
                    name="vehicle.model"
                    type="text"
                    required
                    value={formData.vehicle.model}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="vehicle.licensePlate" className="block text-sm font-medium text-gray-700">
                    License Plate
                  </label>
                  <input
                    id="vehicle.licensePlate"
                    name="vehicle.licensePlate"
                    type="text"
                    required
                    value={formData.vehicle.licensePlate}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
