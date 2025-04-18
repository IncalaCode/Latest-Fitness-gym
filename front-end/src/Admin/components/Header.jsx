import { Search, Bell, Menu } from "lucide-react";

export default function Header({ toggleSidebar }) {
  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between px-6 py-4">
      <button className="md:hidden mr-4" onClick={toggleSidebar}>
        <span className="sr-only">Toggle sidebar</span>
        <Menu className="h-6 w-6" />
      </button>

      <div className="relative w-full max-w-md"></div>

      <div className="flex items-center">
        <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <span className="sr-only">View notifications</span>
          <div className="relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </div>
        </button>

        <div className="ml-4 flex items-center">
          <div className="ml-3 relative flex items-center">
            <div className="flex flex-col items-end mr-3">
              <span className="text-sm font-medium text-gray-700">
                Alex Johnson
              </span>
              <span className="text-xs text-gray-500">Admin</span>
            </div>
            <img
              className="h-10 w-10 rounded-full"
              src="/placeholder.svg?height=40&width=40"
              alt="User avatar"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
