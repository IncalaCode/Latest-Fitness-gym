import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MembersTab from "./tabs/MembersTab";
import PackagesTab from "./tabs/PackagesTab";
import PendingApprovalsTab from "./tabs/PendingApprovalsTab";
import ExpiringMembershipsTab from "./tabs/ExpiringMembershipsTab";
import ProfileTab from "./tabs/ProfileTab";
import CheckInsTab from "./tabs/CheckInsTab";
import TrainersTab from "./tabs/TrainersTab";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/admin/members")) return "members";
    if (path.startsWith("/admin/trainers")) return "trainers";
    if (path.startsWith("/admin/packages")) return "packages";
    if (path.startsWith("/admin/payment")) return "payment";
    if (path.startsWith("/admin/pending-approvals")) return "pending";
    if (path.includes("/admin/expiring-memberships")) return "expiring";
    if (path.includes("/admin/check-ins")) return "check-ins";
    if (path.includes("/admin/profile")) return "profile";
    return null; // Default to showing children
  };
  
  const activeTab = getActiveTab();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        setIsOpen={setSidebarOpen} // Added setIsOpen prop
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === "members" && <MembersTab />}
          {activeTab === "trainers" && <TrainersTab />}
          {activeTab === "packages" && <PackagesTab />}
          {activeTab === "pending" && <PendingApprovalsTab />}
          {activeTab === "expiring" && <ExpiringMembershipsTab />}
          {activeTab === "check-ins" && <CheckInsTab />}
          {activeTab === "profile" && <ProfileTab />}
          {!activeTab && children}
        </main>
      </div>
    </div>
  );
}
