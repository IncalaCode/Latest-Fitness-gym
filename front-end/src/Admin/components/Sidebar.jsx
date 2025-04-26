import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Settings,
  Menu,
} from "lucide-react";

export default function Sidebar({ isOpen, toggleSidebar, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); 
    };
    
    // Check on initial load
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [isOpen, setIsOpen]);
  
  // Function to check if a route is active
  const isRouteActive = (route) => {
    if (route === "/admin-dashboard" && location.pathname === "/admin-dashboard") {
      return true;
    }
    // For other routes, check if the pathname includes the route
    return route !== "/admin-dashboard" && location.pathname.includes(route);
  };
  
  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("auth");
    sessionStorage.clear();
    
    // Show logout notification
    enqueueSnackbar("Logged out successfully", { 
      variant: "success",
      autoHideDuration: 3000
    });
    
    closeLogoutModal();
    navigate("/login"); // redirect to login
  };
  
  // Handle link click on mobile - close sidebar after navigation
  const handleLinkClick = () => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button - Fixed position */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed z-20 bottom-6 right-6 bg-[#0f172a] text-white p-3 rounded-full shadow-lg hover:bg-[#0f172a] transition-all duration-300"
          aria-label="Toggle Sidebar"
        >
          {isOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar - Hidden by default on mobile */}
      <div
        className={`bg-[#0f172a] text-white flex flex-col h-full transition-all duration-300 
          ${isOpen ? "w-64" : "w-20"} 
          ${isMobile ? (isOpen ? "translate-x-0" : "translate-x-[-100%]") : ""} 
          fixed md:relative z-10 shadow-lg md:shadow-none
          md:w-auto md:${isOpen ? "w-64" : "w-20"}`}
      >
        <div
          className={`p-6 flex items-center ${
            isOpen ? "justify-between" : "justify-center"
          }`}
        >
          {isOpen ? (
            <>
              <h1 className="text-xl font-bold">Latest Fitness</h1>
              <button
                onClick={toggleSidebar}
                className="text-white ml-8 hover:text-gray-300 transition-transform duration-200"
              >
                <ChevronLeft size={24} />
              </button>
            </>
          ) : (
            !isMobile && (
              <button
                onClick={toggleSidebar}
                className="text-white hover:text-gray-300 transition-transform duration-200"
              >
                <Menu size={24} />
              </button>
            )
          )}
        </div>

        <div className="flex-1 ">
          <div className={`px-4 py-2 ${!isOpen && "hidden"}`}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Main
            </p>
          </div>

          <nav className="mt-1">
            <SidebarLink
              to="/admin-dashboard"
              icon={<LayoutDashboard size={20} />}
              text="Dashboard"
              active={isRouteActive("/admin-dashboard")}
              isOpen={isOpen}
              onClick={handleLinkClick}
            />
            <SidebarLink
              to="/admin/check-ins"
              icon={<Calendar size={20} />}
              text="Check-ins"
              active={isRouteActive("/admin/check-ins")}
              isOpen={isOpen}
              onClick={handleLinkClick}
            />
            <SidebarLink
              to="/admin/members"
              icon={<Users size={20} />}
              text="Members"
              active={isRouteActive("/admin/members")}
              isOpen={isOpen}
              onClick={handleLinkClick}
            />

           <SidebarLink
              to="/admin/pending-approvals"
              icon={<CreditCard size={20} />}
              text="Pending Approvals"
              active={isRouteActive("/admin/pending-approvals")}
              isOpen={isOpen}
              onClick={handleLinkClick}
            />
            <SidebarLink
              to="/admin/expiring-memberships"
              icon={<UserCog size={20} />}
              text="Expiring Memberships"
              active={isRouteActive("/admin/expiring-memberships")}
              isOpen={isOpen}
              onClick={handleLinkClick}
            />

            <SidebarLink
              to="/admin/profile"
              icon={<Settings size={20} />}
              text="Profile Settings"
              active={isRouteActive("/admin/profile")}
              isOpen={isOpen}
              onClick={handleLinkClick}
            />
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={openLogoutModal}
            className={`flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${!isOpen ? "justify-center" : ""}`}
            title={!isOpen ? "Logout" : ""}
          >
            <span className={`${isOpen ? "mr-3" : ""}`}><LogOut size={20} /></span>
            {isOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Logout</h3>
              <button 
                onClick={closeLogoutModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-5">
              <p className="text-gray-600">Are you sure you want to logout?</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeLogoutModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SidebarLink({ to, icon, text, active = false, isOpen, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-sm ${
        active
          ? "bg-gray-800 text-white"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      } rounded-md transition-colors ${!isOpen ? "justify-center" : ""}`}
      title={!isOpen ? text : ""}
    >
      <span className={`${isOpen ? "mr-3" : ""}`}>{icon}</span>
      {isOpen && text}
    </Link>
  );
}
