import React from "react";
import { Check, X, Loader } from "lucide-react";
import usePendingApprovals from "../../../hooks/usePendingApprovals";

export default function PendingApprovalsTab() {
  const {
    pendingApprovals,
    loading,
    processingIds,
    handleApprove,
    handleReject
  } = usePendingApprovals();

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
          <p className="mt-2 text-gray-500">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
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
        <div className="overflow-x-auto">
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
                  {approval.user.fullName}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {approval.user.phone}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {approval.user.email}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {approval.planTitle}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {approval.createdAt}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  <div className="flex space-x-2">
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
      )}
    </div>
  );
}
