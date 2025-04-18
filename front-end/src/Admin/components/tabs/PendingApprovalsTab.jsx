import { Check, X } from "lucide-react";
export default function PendingApprovalsTab() {
  const pendingApprovals = [
    {
      id: 1,
      name: "Alex Morgan",
      phone: "+1 (555) 123-4567",
      email: "alex.morgan@example.com",
      membershipType: "Premium",
      registrationDate: "2023-04-05",
    },
    {
      id: 2,
      name: "Jordan Smith",
      phone: "+1 (555) 987-6543",
      email: "jordan.smith@example.com",
      membershipType: "Standard",
      registrationDate: "2023-04-06",
    },
    {
      id: 3,
      name: "Taylor Lee",
      phone: "+1 (555) 456-7890",
      email: "taylor.lee@example.com",
      membershipType: "Premium",
      registrationDate: "2023-04-07",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Pending Approvals</h2>
        <span className="text-gray-500">
          {pendingApprovals.length} pending registrations
        </span>
      </div>

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
                  {approval.name}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {approval.phone}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {approval.email}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {approval.membershipType}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {approval.registrationDate}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
