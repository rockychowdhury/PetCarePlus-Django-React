import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get('tran_id');
  const reason = searchParams.get('reason');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="flex justify-center">
          <XCircle className="h-24 w-24 text-red-500" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Payment Failed
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          We could not process your payment at this time. Please try again.
        </p>
        
        {reason && (
          <p className="mt-2 text-xs text-red-500">
            Reason: {reason.replace('_', ' ')}
          </p>
        )}
        
        {tranId && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <p className="text-sm font-medium text-gray-700">Transaction ID:</p>
            <p className="text-xs text-gray-500 font-mono mt-1">{tranId}</p>
          </div>
        )}
        
        <div className="mt-6 flex flex-col space-y-3">
          <button
            onClick={() => navigate(-1)} // Go back to try again
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/services')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Return to Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
