import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StatsCards from "./StatsCards";
import { Users, UserCheck, Snowflake, UserCog, CreditCard } from "lucide-react";
import PendingApprovalsTab from "./tabs/PendingApprovalsTab";
import MembersTab from "./tabs/MembersTab";
import ExpiringMembershipsTab from "./tabs/ExpiringMembershipsTab";
import { API_ENDPOINT_FUNCTION, GET_HEADER } from "../../config/config";
import YouTubeQRGenerator from './tabs/YouTubeQRGenerator';
import { motion } from 'framer-motion';

export default function DashboardPage({ initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "members");
  const [stats, setStats] = useState({
    totalActiveMembers: 0,
    totalCheckInsToday: 0,
    totalFrozenMembers: 0,
    totalTrainers: 0,
    activeTrainers: 0,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
    inactiveTrainers: 0
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

  // Get user role from localStorage
  let userRole = null;
  try {
    const auth = JSON.parse(localStorage.getItem('auth'));
    userRole = auth?.user?.role;
  } catch (e) {}

  return (
    <div>
      {/* YouTube QR Generator Modal - For Testing */}
      <YouTubeQRGenerator
        isOpen={showGenerator}
        onClose={handleCloseGenerator}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <motion.button
          className="flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-800 text-amber-50 rounded-lg transition-colors text-sm sm:text-base"
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

      <div className={`grid grid-cols-1 md:grid-cols-2 ${userRole === 'Admin' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3 mb-8`}>
        <StatsCards
          title="Total Active Members"
          value={stats.totalActiveMembers.toLocaleString()}
          description="Not expired, not frozen"
          icon={<Users className="h-6 w-6 text-blue-500" />} />
        <StatsCards
          title="Total Check-Ins Today"
          value={stats.totalCheckInsToday.toLocaleString()}
          description="Unique QR scans today"
          icon={<UserCheck className="h-6 w-6 text-green-500" />} />
        <StatsCards
          title="Total Frozen Members"
          value={stats.totalFrozenMembers.toLocaleString()}
          description="Currently paused memberships"
          icon={<Snowflake className="h-6 w-6 text-cyan-500" />} />
        <StatsCards
          title="Total Trainers"
          value={stats.totalTrainers.toLocaleString()}
          description={`Active: ${stats.activeTrainers}, Inactive: ${stats.inactiveTrainers}`}
          icon={<UserCog className="h-6 w-6 text-purple-500" />} />
        {userRole === 'Admin' && (
          <StatsCards
            title="Total Revenue"
            value={`${(stats.totalRevenue || 0).toLocaleString()} ETB`}
            description="All completed payments"
            icon={<CreditCard className="h-6 w-6 text-amber-500" />} />
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex flex-nowrap -mb-px ">
            <button
              onClick={() => handleTabChange("members")}
              className={`py-4 px-4 md:px-6 text-xs md:text-sm font-medium whitespace-nowrap ${
                activeTab === "members"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Members
            </button>
            <button
              onClick={() => handleTabChange("pending")}
              className={`py-4 px-4 md:px-6 text-xs md:text-sm font-medium whitespace-nowrap ${
                activeTab === "pending"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Approvals
            </button>
            <button
              onClick={() => handleTabChange("expiring")}
              className={`py-4 px-4 md:px-6 text-xs md:text-sm font-medium whitespace-nowrap ${
                activeTab === "expiring"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Expiring Memberships
            </button>
          </nav>
        </div>

        <div className="w-full overflow-hidden">
          <div className="p-2 sm:p-4 md:p-6 w-full overflow-x-auto">
            {activeTab === "members" && <MembersTab />}
            {activeTab === "pending" && <PendingApprovalsTab />}
            {activeTab === "expiring" && <ExpiringMembershipsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
