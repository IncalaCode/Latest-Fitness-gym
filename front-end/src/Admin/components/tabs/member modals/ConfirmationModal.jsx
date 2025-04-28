"use client";

import { useState } from "react";

export default function ConfirmationModal({
  packageDetails,
  member,
  onConfirm,
  onCancel,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmClick = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error during confirmation:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!packageDetails) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <h3 className="text-xl font-bold">Confirm Your Purchase</h3>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-500">You are about to purchase</p>
              <h4 className="text-xl font-bold text-gray-800">
                {packageDetails.type}
              </h4>
              <p className="text-lg font-medium text-gray-700">
                {packageDetails.duration}
              </p>
            </div>

            <div className="mb-4 border-t border-b border-gray-200 py-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Package:</span>
                <span className="font-medium">{packageDetails.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{packageDetails.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender Pricing:</span>
                <span className="font-medium capitalize">
                  {packageDetails.gender}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member:</span>
                <span className="font-medium">{member?.name}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{packageDetails.price} Birr</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmClick}
              disabled={isProcessing}
              className="flex-1 rounded-lg bg-green-600 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 flex justify-center items-center"
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Confirm Purchase"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
