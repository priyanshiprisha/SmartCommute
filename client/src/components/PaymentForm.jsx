import { useState, useEffect } from 'react';
import axios from 'axios';

function PaymentForm({ amount, rideId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await initializeRazorpay();
      if (!res) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Create order
      const { data } = await axios.post(
        'http://localhost:3000/api/payment/create-order',
        {
          amount,
          rideId
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'RideShare',
        description: 'Ride Payment',
        order_id: data.orderId,
        handler: async (response) => {
          try {
            // Verify payment
            await axios.post(
              'http://localhost:3000/api/payment/verify',
              {
                ...response,
                rideId
              },
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );

            onSuccess();
          } catch (error) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#059669'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-600">Amount to pay:</p>
        <p className="text-2xl font-bold text-green-600">₹{amount.toFixed(2)}</p>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}

export default PaymentForm;