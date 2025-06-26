import { Menu } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header({ toggleSidebar }) {
  const [user, setUser] = useState({
    name: "Admin",
    email: "",
    role: "Admin"
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh header data - can be called from other components
  const refreshHeaderData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Expose the refresh function to the window object so it can be called from other components
  useEffect(() => {
    window.refreshAdminHeader = refreshHeaderData;
    return () => {
      delete window.refreshAdminHeader;
    };
  }, []);

  useEffect(() => {
    // Get user data from localStorage
    const getAuthData = async () => {
      try {
        const authData = await localStorage.getItem("auth");
        if (authData) {
          const parsedAuth = JSON.parse(authData);
          if (parsedAuth.user) {
            const firstName = parsedAuth.user.firstName || '';
            const lastName = parsedAuth.user.lastName || '';
            const fullName = firstName && lastName 
              ? `${firstName} ${lastName}` 
              : parsedAuth.user.fullName || parsedAuth.user.email.split('@')[0];
            
            setUser({
              name: fullName,
              email: parsedAuth.user.email,
              role: parsedAuth.user.role
            });
          }
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    };

    getAuthData();
  }, [refreshTrigger]); // Re-run when refreshTrigger changes

  // Get first letter of name for avatar
  const getInitial = () => {
    return user.name.charAt(0).toUpperCase();
  };

  // Generate a background color based on the name
  const getAvatarColor = () => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-red-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500'
    ];
    
    // Simple hash function to get consistent color for the same name
    const hash = user.name.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };

  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between px-6 py-4">
      {/* <button className="md:hidden mr-4" onClick={toggleSidebar}>
        <span className="sr-only">Toggle sidebar</span>
        <Menu className="h-6 w-6" />
      </button> */}

      <div className="relative w-full max-w-md"></div>

      <div className="flex items-center">
        <div className="flex items-center">
          <div className="relative flex items-center">
            <div className="flex flex-col items-end mr-3">
              <span className="text-sm font-medium text-gray-700">
                {user.name}
              </span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor()}`}>
              {getInitial()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
