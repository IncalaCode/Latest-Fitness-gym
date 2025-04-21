import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StatsCards from "./StatsCards";
import { Users, UserCheck, Calendar, DollarSign } from "lucide-react";
import PendingApprovalsTab from "./tabs/PendingApprovalsTab";
import MembersTab from "./tabs/MembersTab";
import ExpiringMembershipsTab from "./tabs/ExpiringMembershipsTab";
import { API_ENDPOINT_FUNCTION, GET_HEADER } from "../../config/config";
import YouTubeQRGenerator from './tabs/YouTubeQRGenerator';
import { motion } from 'framer-motion';

export default function DashboardPage({ initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "members");
  const [stats, setStats] = useState({ 
    totalMembers: 0, 
    activeToday: 0,
    monthlyRevenue: 0,
    weeklyBookings: 0,
    memberChange: "+0%",
    activeChange: "+0%",
    revenueChange: "+0%",
    bookingsChange: "+0%"
  });
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    // Update active tab when initialTab prop changes
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleCloseGenerator = () => {
    setShowGenerator(false);
  };

  const handleOpenGenerator = () => {
    setShowGenerator(true);
  };


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const options = await GET_HEADER({ isJson: true });
        const res = await axios.get(
          API_ENDPOINT_FUNCTION("/admin/stats"),
          options
        );
        
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      }
    };

    fetchStats();
  }, []);

  // Handle tab change without redirecting
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
    {/* YouTube QR Generator Modal - For Testing */}
    <YouTubeQRGenerator
        isOpen={showGenerator}
        onClose={handleCloseGenerator}
      />
            <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <motion.button
          className="flex items-center justify-center px-4 py-2 bg-gray-800 text-amber-50 rounded-lg transition-colors"
          onClick={handleOpenGenerator}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Generate QR
        </motion.button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatsCards
          title="Total Members"
          value={stats.totalMembers.toLocaleString()}
          description="Active memberships in your facility"
          change={stats.memberChange}
          icon={<Users className="h-6 w-6 text-blue-500" />}
        />

        <StatsCards
          title="Active Today"
          value={stats.activeToday.toLocaleString()}
          description="Members who visited today"
          change={stats.activeChange}
          icon={<UserCheck className="h-6 w-6 text-green-500" />}
        />

        <StatsCards
          title="Monthly Revenue"
          value={`${stats.monthlyRevenue.toLocaleString()} ETB`}
          description="Total revenue this month"
          change={stats.revenueChange}
          icon={<DollarSign className="h-6 w-6 text-green-500" />}
          isNegative={stats.revenueChange && stats.revenueChange.includes('-')}
        />

        <StatsCards
          title="Check-ins"
          value={stats.weeklyBookings.toLocaleString()}
          description="Check-ins this week"
          change={stats.bookingsChange}
          isNegative={stats.bookingsChange && stats.bookingsChange.includes('-')}
          icon={<Calendar className="h-6 w-6 text-purple-500" />}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => handleTabChange("members")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "members"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Members
            </button>
            <button
              onClick={() => handleTabChange("pending")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "pending"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Approvals
            </button>
            <button
              onClick={() => handleTabChange("expiring")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "expiring"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Expiring Memberships
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "members" && <MembersTab />}
          {activeTab === "pending" && <PendingApprovalsTab />}
          {activeTab === "expiring" && <ExpiringMembershipsTab />}
        </div>
      </div>
    </div>
  );
}
