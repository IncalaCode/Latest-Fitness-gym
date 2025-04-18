import { MoreHorizontal } from "lucide-react";

export default function MembersTab() {
  const members = [
    {
      id: 1,
      name: "Olivia Johnson",
      email: "olivia.johnson@example.com",
      membershipType: "Premium",
      status: "Active",
      lastVisit: "Today",
    },
    {
      id: 2,
      name: "Noah Williams",
      email: "noah.williams@example.com",
      membershipType: "Standard",
      status: "Expiring Soon",
      lastVisit: "Yesterday",
    },
    {
      id: 3,
      name: "Emma Brown",
      email: "emma.brown@example.com",
      membershipType: "Premium",
      status: "Active",
      lastVisit: "3 days ago",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Recent Members</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium">
          Add Member
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Member
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Membership Type
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Last Visit
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={`/placeholder.svg?height=40&width=40&text=${member.name.charAt(
                          0
                        )}`}
                        alt=""
                      />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">
                        {member.name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm">{member.membershipType}</td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      member.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {member.lastVisit}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  <button className="text-gray-400 hover:text-gray-500">
                    <MoreHorizontal className="h-5 w-5" />
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
