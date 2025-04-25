
import React, { useState } from "react";
import { Check, X, Loader, Eye, ExternalLink, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Dialog } from "@headlessui/react";
import usePendingApprovals from "../../../hooks/usePendingApprovals";
import { IMAGE_URL } from "../../../config/config";

export default function PendingApprovalsTab() {
  const {
    pendingApprovals,
    loading,
    processingIds,
    handleApprove,
    handleReject
  } = usePendingApprovals();

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const openImageModal = (payment) => {
    setSelectedPayment(payment);
    setShowImageModal(true);
  };

  const openDetailsModal = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy • h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
          <p className="mt-2 text-gray-500">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h2 className="text-xl font-bold">Pending Approvals</h2>
        <span className="text-gray-500">
          {pendingApprovals.length} pending registrations
        </span>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pending approvals at this time
        </div>
      ) : (
        <>
          {/* Desktop Table View - Hidden on small screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                    Full Name
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                    Phone Number
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                    Email
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                    Membership Type
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                    Payment Method
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                    Registration Date
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingApprovals.map((approval) => (
                  <tr key={approval.id}>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                      {approval.user?.fullName || "N/A"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {approval.user?.phone || "N/A"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {approval.user?.email || "N/A"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {approval.planTitle || "N/A"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        approval.paymentMethod === 'online' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {approval.paymentMethod === 'online' ? 'Online' : 'In Cash'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        approval.paymentstatus === 'approvalPending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {approval.paymentstatus === 'approvalPending' ? 'Approval Pending' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {formatDate(approval.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {approval.paymentimage && (
                          <button
                            className="inline-flex items-center px-2 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={() => openImageModal(approval)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="inline-flex items-center px-2 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          onClick={() => openDetailsModal(approval)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button 
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleApprove(approval.id)}
                          disabled={processingIds.includes(approval.id)}
                        >
                          {processingIds.includes(approval.id) ? (
                            <Loader className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </button>
                        <button 
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleReject(approval.id)}
                          disabled={processingIds.includes(approval.id)}
                        >
                          {processingIds.includes(approval.id) ? (
                            <Loader className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Shown only on small screens */}
          <div className="md:hidden space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{approval.user?.fullName || "N/A"}</h3>
                      <p className="text-sm text-gray-500 mt-1">{approval.user?.email || "N/A"}</p>
                    </div>
                    <div className="flex space-x-1">
                      {approval.paymentimage && (
                        <button
                          className="p-1.5 rounded-full text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={() => openImageModal(approval)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="p-1.5 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        onClick={() => openDetailsModal(approval)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm">{approval.user?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Membership</p>
                      <p className="text-sm">{approval.planTitle || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Method</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        approval.paymentMethod === 'online' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {approval.paymentMethod === 'online' ? 'Online' : 'In Cash'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        approval.paymentstatus === 'approvalPending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {approval.paymentstatus === 'approvalPending' ? 'Approval Pending' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Registration Date</p>
                    <p className="text-sm">{formatDate(approval.createdAt)}</p>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button 
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleApprove(approval.id)}
                      disabled={processingIds.includes(approval.id)}
                    >
                      {processingIds.includes(approval.id) ? (
                        <Loader className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Approve
                    </button>
                    <button 
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleReject(approval.id)}
                      disabled={processingIds.includes(approval.id)}
                    >
                      {processingIds.includes(approval.id) ? (
                        <Loader className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 mr-1" />
                      )}
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Payment Image Modal */}
      <Dialog
        open={showImageModal}
        onClose={closeImageModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative bg-white rounded-lg w-full max-w-3xl mx-auto p-4 md:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium">
                Payment Proof
              </Dialog.Title>
              <button
                onClick={closeImageModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              {selectedPayment && (
                <img
                  src={IMAGE_URL + "/" + selectedPayment.paymentimage}
                  alt="Payment Proof"
                  className="max-w-full max-h-[60vh] object-contain mx-auto"
                />
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={closeImageModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 w-full sm:w-auto"
              >
                Close
              </button>
              {selectedPayment && (
                <button
                  onClick={() => {
                    closeImageModal();
                    handleApprove(selectedPayment.id);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full sm:w-auto"
                  disabled={selectedPayment && processingIds.includes(selectedPayment.id)}
                >
                  {selectedPayment && processingIds.includes(selectedPayment.id) ? (
                    <span className="flex items-center justify-center">
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Approve Payment"
                  )}
                </button>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Payment Details Modal */}
      <Dialog
        open={showDetailsModal}
        onClose={closeDetailsModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative bg-white rounded-lg w-full max-w-2xl mx-auto p-4 md:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium">
                Payment Details
              </Dialog.Title>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedPayment && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium mb-3">User Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{selectedPayment.user?.fullName || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium break-words">{selectedPayment.user?.email || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedPayment.user?.phone || "N/A"}</p>
                      </div>
                      {selectedPayment.user?.emergencyContact && (
                        <div>
                          <p className="text-sm text-gray-500">Emergency Contact</p>
                          <p className="font-medium">{selectedPayment.user.emergencyContact}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium mb-3">Payment Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Membership Plan</p>
                        <p className="font-medium">{selectedPayment.planTitle || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium">{selectedPayment.amount} {selectedPayment.currency || "ETB"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium capitalize">{selectedPayment.paymentMethod || "N/A"}</p>
                      </div>
                      {selectedPayment.gender && (
                        <div>
                          <p className="text-sm text-gray-500">Gender</p>
                          <p className="font-medium">{selectedPayment.gender || "N/A"}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium capitalize">{selectedPayment.paymentstatus || ""}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={closeDetailsModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 w-full sm:w-auto"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      closeDetailsModal();
                      handleReject(selectedPayment.id);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 w-full sm:w-auto"
                    disabled={processingIds.includes(selectedPayment.id)}
                  >
                    {processingIds.includes(selectedPayment.id) ? (
                      <span className="flex items-center justify-center">
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Reject"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      closeDetailsModal();
                      handleApprove(selectedPayment.id);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full sm:w-auto"
                    disabled={processingIds.includes(selectedPayment.id)}
                  >
                    {processingIds.includes(selectedPayment.id) ? (
                      <span className="flex items-center justify-center">
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Approve"
                    )}
                  </button>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}