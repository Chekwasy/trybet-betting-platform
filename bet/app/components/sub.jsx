"use client"

import { useState, useEffect, MouseEvent } from 'react'; // Import useEffect
import axios from 'axios';
import Cookies from 'js-cookie';


export default function Sub() {
  const [selectedPlan, setSelectedPlan] = useState(''); // 'weekly' or 'monthly'
  const [PaystackPop, setPaystackPop] = useState(null); // State to hold the PaystackPop instance
  //to set message to display 
  const [msg, setMsg] = useState('This for popup message!');
  //control message open or close
  const [isOpen, setIsOpen] = useState(false);

  //handle close message popup
  const handleClose = () => {
    setIsOpen(false);
  };
  //Handle overlay click to close message popup
  const handleOverlayClick = (e) => {
    if ((e.target).classList.contains('popup-overlay')) {
      handleClose();
    }
  };

  // Dynamically imports PaystackPop only on the client-side
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure window object exists (client-side)
      import('@paystack/inline-js')
        .then((module) => {
          setPaystackPop(new module.default()); // Stores the PaystackPop instance in state
        })
        .catch((error) => {
          console.error("Failed to load PaystackPop:", error);
        });
    }
  }, []);

  const handleProceed = () => {
    if (selectedPlan) {
      axios.post('/api/initpay', {}, {
        headers: {
          'tok': Cookies.get('trybet_tok'),
          'Content-Type': 'application/json',
          'plan': selectedPlan,
        },
      })
      .then(async (response) => {
        if (PaystackPop) { // Ensures PaystackPop is loaded before using it
          PaystackPop.resumeTransaction(response.data.access_code, {
            // The onSuccess callback for payment confirmation
            onSuccess: (transaction) => {
            //Sending reference for final verification
            axios.post('/api/verify', {}, {
              headers: {
                'tok': Cookies.get('trybet_tok'),
                'Content-Type': 'application/json',
                reference: transaction.reference,
              },
            })
            .then(verifyResponse => {
              setMsg(verifyResponse.data.message);
              setIsOpen(true);
              // Redirect or update UI to reflect the new subscription status
            })
            .catch(verifyError => {
              console.error("Verification failed:", verifyError.message);
              setMsg("Payment successful, but verification failed. Please contact support.");
              setIsOpen(true);
            });
          }, onClose: () => {
            // This function is called if the user closes the pop-up without paying
            setMsg('Transaction canceled.');
            setIsOpen(true);
          },
          });
        } else {
          setMsg("Payment gateway not ready. Please try again.");
          setIsOpen(true);
        }
      })
      .catch(error => {
        console.error(error.message);
        setMsg("An error occurred. Please try again.");
        setIsOpen(true);
      });

    } else {
      setMsg('Please select a subscription plan first.');
      setIsOpen(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-300 to-gray-600 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Choose Your Plan
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Weekly Option Card */}
          <div
            className={`flex-1 p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out
              ${selectedPlan === 'weekly' ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-gray-300 hover:border-indigo-400'}`
            }
            onClick={() => setSelectedPlan('weekly')}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Weekly</h3>
            <p className="text-4xl font-extrabold text-indigo-700 mb-2">
              N250<span className="text-lg font-medium text-gray-500">/week</span>
            </p>
            <p className="text-gray-600">Perfect for short-term access.</p>
          </div>

          {/* Monthly Option Card */}
          <div
            className={`flex-1 p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out
              ${selectedPlan === 'monthly' ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-gray-300 hover:border-indigo-400'}`
            }
            onClick={() => setSelectedPlan('monthly')}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Monthly</h3>
            <p className="text-4xl font-extrabold text-indigo-700 mb-2">
              N800<span className="text-lg font-medium text-gray-500">/month</span>
            </p>
            <p className="text-gray-600">Best value for continuous access.</p>
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          disabled={!selectedPlan || !PaystackPop} // Disable if PaystackPop isn't loaded yet
          className={`w-full py-3 px-6 rounded-lg text-white font-semibold text-lg transition-all duration-300 ease-in-out
            ${selectedPlan && PaystackPop
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
              : 'bg-gray-400 cursor-not-allowed'}`
          }
        >
          Proceed
        </button>
      </div>
      {isOpen && (
        <div className="popup-overlay fixed top-0 left-0 w-full h-full bg-transparent flex items-center justify-center" onClick={handleOverlayClick}>
          <div className="popup-content bg-white rounded-lg shadow-md p-8 w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4" >
            <div className="flex justify-end">
              <button className="text-gray-500 hover:text-gray-700" onClick={handleClose} >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h2 className="text-lg font-bold mb-4">{msg}</h2>
          </div>
        </div>
      )}
    </div>
  );
}