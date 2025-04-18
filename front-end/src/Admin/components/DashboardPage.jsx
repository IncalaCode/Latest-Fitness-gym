"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import StatsCards from "./StatsCards";
import { Users, UserCheck, Calendar, DollarSign } from "lucide-react";
import PendingApprovalsTab from "./tabs/PendingApprovalsTab";
import MembersTab from "./tabs/MembersTab";
import ExpiringMembershipsTab from "./tabs/ExpiringMembershipsTab";
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("members");
  const [stats, setStats] = useState({ totalMembers: 0, activeToday: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/admin/stats");
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      }
    };

    fetchStats();
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatsCards
          title="Total Members"
          value={stats.totalMembers.toLocaleString()}
          description="Active memberships in your facility"
          change="+12%" // You can replace with real logic later
          icon={<Users className="h-6 w-6 text-blue-500" />}
        />

        <StatsCards
          title="Active Today"
          value={stats.activeToday.toLocaleString()}
          description="Members who visited today"
          change="+8%" // You can replace with real logic later
          icon={<UserCheck className="h-6 w-6 text-green-500" />}
        />

        <StatsCards
          title="Monthly Revenue"
          value="$48,352"
          description="Total revenue this month"
          change="+4%"
          icon={<DollarSign className="h-6 w-6 text-green-500" />}
        />

        <StatsCards
          title="Bookings"
          value="324"
          description="Classes and spa bookings this week"
          change="-2%"
          isNegative
          icon={<Calendar className="h-6 w-6 text-purple-500" />}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("members")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "members"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "pending"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Approvals
            </button>
            <button
              onClick={() => setActiveTab("expiring")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "expiring"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Expiring Soon
            </button>
          </nav>
        </div>

        {activeTab === "members" && <MembersTab />}
        {activeTab === "pending" && <PendingApprovalsTab />}
        {activeTab === "expiring" && <ExpiringMembershipsTab />}
      </div>
    </div>
  );
}
