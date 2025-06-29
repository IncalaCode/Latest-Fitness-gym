import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiEdit } from 'react-icons/fi';
import EditProfileModal from './EditProfileModal';
import useProfileUpdate from '../../../hooks/useProfileUpdate';
import { IMAGE_URL } from '../../../config/config';

const ProfileCard = ({ fetchDashboardData , userData, variants }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { updateProfile, isLoading } = useProfileUpdate(userData?.id ,fetchDashboardData);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Updated handleSubmit function to handle both profile and password data
  const handleSubmit = async (profileData, passwordData) => {
    try {
      await updateProfile(profileData, passwordData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Default values in case userData is incomplete
  const {
    fullName = 'Daniel Gezahegn',
    email = 'daniel.g@example.com',
    photoUrl = null,
    membershipType = 'Premium',
    membershipStatus = 'Active',
    expirationDate = 'May 15, 2025'
  } = userData || {};

  return (
    <>
      <motion.div 
        className="bg-gray-800 rounded-xl p-6 shadow-lg"
        variants={variants}
      >
      {/* Card Header */}
      <div className="flex items-center mb-6">
        <FiUser className="text-gray-400 mr-2" />
        <h2 className="text-lg font-medium text-gray-300">Member Profile</h2>
      </div>
      
      {/* Profile Picture */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700">
          {photoUrl ? (
            <img 
              src={IMAGE_URL +  photoUrl} 
              alt={fullName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {fullName.split(' ').map(name => name[0]).join('')}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* User Info */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-1">{fullName}</h3>
        <p className="text-gray-400 text-sm">{email}</p>
      </div>
      
      {/* Membership Info */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400">Membership</span>
          <span className="font-semibold text-white">{membershipType}</span>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400">Status</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            membershipStatus === 'Active' 
              ? 'bg-green-500 text-white' 
              : membershipStatus === 'Pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-red-500 text-white'
          }`}>
            {membershipStatus}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Expires</span>
          <span className="text-white">{expirationDate}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Passes</span>
          <span className="text-white">{userData?.totalPasses || 0}</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3">
        <button 
          className="w-full py-2 px-4 bg-transparent border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors flex items-center justify-center"
          onClick={handleOpenModal}
        >
          <FiEdit className="mr-2" /> Edit Profile
        </button>
      </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userData={userData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </>
  );
};

export default ProfileCard;
