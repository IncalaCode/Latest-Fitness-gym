import { Bell } from "lucide-react";
export default function ExpiringMembershipsTab() {
  const expiringMemberships = [
    {
      id: 1,
      name: "Casey Johnson",
      phone: "+1 (555) 234-5678",
      membershipType: "Premium",
      expirationDate: "2023-04-10",
      daysRemaining: 3,
    },
    {
      id: 2,
      name: "Riley Davis",
      phone: "+1 (555) 345-6789",
      membershipType: "Standard",
      expirationDate: "2023-04-09",
      daysRemaining: 2,
    },
    {
      id: 3,
      name: "Morgan Wilson",
      phone: "+1 (555) 456-7890",
      membershipType: "Premium",
      expirationDate: "2023-04-08",
      daysRemaining: 1,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Expiring Memberships</h2>
        <span className="text-gray-500">
          {expiringMemberships.length} memberships expiring within 3 days
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
                Membership Type
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Expiration Date
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Days Remaining
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expiringMemberships.map((membership) => (
              <tr key={membership.id}>
                <td className="py-4 px-4 text-sm font-medium text-gray-900">
                  {membership.name}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {membership.phone}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {membership.membershipType}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {membership.expirationDate}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Expiring Soon
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {membership.daysRemaining} days
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Bell className="h-4 w-4 mr-1" />
                    Send Reminder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
