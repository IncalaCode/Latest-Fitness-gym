import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  CreditCard,
  Package,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
} from "lucide-react";


const handleLogout = () => {
  localStorage.removeItem("auth");
  sessionStorage.clear();

  navigate("/login"); // redirect to login
};

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <div
      className={`bg-[#0f172a] text-white flex flex-col h-full transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } md:w-auto md:${isOpen ? "w-64" : "w-20"}`}
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
              className="text-white hover:text-gray-300"
            >
              <Menu size={20} />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-gray-300"
          >
            <Menu size={20} />
          </button>
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
            href="/admin/dashboard"
            icon={<LayoutDashboard size={20} />}
            text="Dashboard"
            active
            isOpen={isOpen}
          />
          <SidebarLink
            href="/admin/members"
            icon={<Users size={20} />}
            text="Members"
            isOpen={isOpen}
          />
          <SidebarLink
            href="/admin/trainers"
            icon={<UserCog size={20} />}
            text="Trainers"
            isOpen={isOpen}
          />
          <SidebarLink
            href="/admin/bookings"
            icon={<Calendar size={20} />}
            text="Bookings"
            isOpen={isOpen}
          />
          <SidebarLink
            href="/admin/payments"
            icon={<CreditCard size={20} />}
            text="Payments"
            isOpen={isOpen}
          />
          <SidebarLink
            href="/admin/inventory"
            icon={<Package size={20} />}
            text="Inventory"
            isOpen={isOpen}
          />
        </nav>

        <div className={`px-4 py-2 mt-6 ${!isOpen && "hidden"}`}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Support
          </p>
        </div>

        <nav className="mt-1">
          {/* <SidebarLink
            href="/admin/messages"
            icon={<MessageSquare size={20} />}
            text="Messages"
            isOpen={isOpen}
          /> */}
          <SidebarLink
            href="/admin/notifications"
            icon={<Bell size={20} />}
            text="Notifications"
            isOpen={isOpen}
          />
          <SidebarLink
            href="/admin/settings"
            icon={<Settings size={20} />}
            text="Settings"
            isOpen={isOpen}
          />
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700">
        <SidebarLink
          href="/admin/help"
          icon={<HelpCircle size={20} />}
          text="Help & Support"
          isOpen={isOpen}
        />
        <SidebarLink
          href="/logout"
          icon={<LogOut size={20} />}
          text="Logout"
          isOpen={isOpen}
          onClick={handleLogout}
        />
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, text, active = false, isOpen ,onClick }) {
  return (
    <Link
    onClick={onClick}
      href={href}
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
