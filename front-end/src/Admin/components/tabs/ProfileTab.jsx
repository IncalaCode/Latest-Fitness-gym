import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useAdminProfile } from '../../hooks/useAdminProfile';
import { User, Lock, Save } from 'lucide-react';

export default function ProfileTab() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [adminData, setAdminData] = useState(null);
  const { updateAdminProfile, loading } = useAdminProfile();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Load admin data from localStorage
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const parsedData = JSON.parse(authData);
        if (parsedData.user) {
          setAdminData(parsedData.user);
          setFormData({
            firstName: parsedData.user.firstName || '',
            lastName: parsedData.user.lastName || '',
            password: '',
            confirmPassword: ''
          });
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match if changing password
    if (formData.password && formData.password !== formData.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { 
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }
    
    // Only send fields that have values
    const updateData = {};
    if (formData.firstName) updateData.firstName = formData.firstName;
    if (formData.lastName) updateData.lastName = formData.lastName;
    if (formData.password) updateData.password = formData.password;
    
    // Don't submit if no changes
    if (Object.keys(updateData).length === 0) {
      enqueueSnackbar('No changes to update', { 
        variant: 'info',
        autoHideDuration: 3000
      });
      return;
    }
    
    const result = await updateAdminProfile(updateData);
    
    if (result && result.success) {
      // Update local state with new data
      setAdminData(result.data);
      
      // Update localStorage with new user data
      try {
        const authData = JSON.parse(localStorage.getItem('auth'));
        authData.user = result.data;
        localStorage.setItem('auth', JSON.stringify(authData));
        
        // Refresh the header component to show updated name
        if (window.refreshAdminHeader) {
          window.refreshAdminHeader();
        }
      } catch (error) {
        console.error('Error updating local storage:', error);
      }
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    }
  };

  if (!adminData) {
    return <div className="flex justify-center items-center h-full">Loading profile...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Profile</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
            <User size={20} className="mr-2" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={adminData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
            <Lock size={20} className="mr-2" />
            Change Password
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Leave blank if you don't want to change your password</p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? (
              <>Processing...</>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
