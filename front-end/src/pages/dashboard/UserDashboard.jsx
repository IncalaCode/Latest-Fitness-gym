import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { FiYoutube, FiHash, FiUser } from 'react-icons/fi';
import Navbar from '../../components/ui/Navbar';
import ProfileCard from './components/ProfileCard';
import CheckInCode from './components/CheckInCode';
import FitnessStats from './components/FitnessStats';
import RecentCheckIns from './components/RecentCheckIns';
import YouTubeQRScanner from './components/YouTubeQRScanner';
import { API_ENDPOINT_FUNCTION, GET_HEADER } from '../../config/config';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const headers = await GET_HEADER();
      const response = await fetch(API_ENDPOINT_FUNCTION('/dashboard'), {
        method: 'GET',
        headers: headers.headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      
      // Validate and sanitize the data
      if (data.data) {
        // Ensure all required fields exist with fallbacks
        const sanitizedData = {
          userData: {
            id: data.data.userData?.id || '',
            fullName: data.data.userData?.fullName || 'Member',
            email: data.data.userData?.email || '',
            phone: data.data.userData?.phone || '',
            emergencyContactName: data.data.userData?.emergencyContactName || '',
            emergencyContactPhone: data.data.userData?.emergencyContactPhone || '',
            emergencyContactRelationship: data.data.userData?.emergencyContactRelationship || '',
            address: data.data.userData?.address || '',
            fitnessGoals: data.data.userData?.fitnessGoals || '',
            medicalConditions: data.data.userData?.medicalConditions || '',
            photoUrl: data.data.userData?.photoUrl || '',
            membershipStatus: data.data.userData?.membershipStatus || 'Inactive',
            membershipType: data.data.userData?.membershipType || 'None',
            expirationDate: data.data.userData?.expirationDate || '',
            trainer: data.data.userData?.trainer || null
          },
          qrCodeData: data.data.qrCodeData || null,
          stats: data.data.stats || {},
          checkIns: data.data.checkIns || [],
          hasPendingInCashPayment: data.data.hasPendingInCashPayment || false,
          paymentMessage: data.data.paymentMessage || '',
          isRenewal: data.data.isRenewal || false
        };
        
        setDashboardData(sanitizedData);
      } else {
        throw new Error('Invalid dashboard data structure');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Unable to load dashboard</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  const { userData, qrCodeData, stats, checkIns, hasPendingInCashPayment, paymentMessage, isRenewal } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <motion.h1
            className="text-3xl font-bold text-center sm:text-left mb-4 sm:mb-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome back, {userData?.fullName || "Member"}
          </motion.h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              onClick={handleOpenScanner}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiYoutube className="mr-2" />
              Scan Workout Video
            </motion.button>
          </div>
        </div>

        {/* Trainer Information Section */}
        {userData?.trainer && (
          <motion.div
            className="mb-6 bg-gray-800 rounded-xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center mb-4">
              <FiUser className="text-blue-400 mr-2 text-xl" />
              <h2 className="text-xl font-bold text-white">Your Trainer</h2>
            </div>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-700 mr-4">
                {userData.trainer.photoUrl ? (
                  <img 
                    src={userData.trainer.photoUrl} 
                    alt={userData.trainer.fullName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {userData.trainer.fullName?.split(' ').map(name => name[0]).join('') || 'T'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{userData.trainer.fullName}</h3>
                <p className="text-gray-400 text-sm">{userData.trainer.specialization || 'Personal Trainer'}</p>
                <p className="text-gray-400 text-sm">{userData.trainer.email}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile-first order: CheckInCode first, then ProfileCard */}
          <div className="md:order-2 order-1">
            <CheckInCode 
              userData={userData} 
              qrCodeData={qrCodeData}
              hasPendingInCashPayment={hasPendingInCashPayment}
              paymentMessage={paymentMessage}
              isRenewal={isRenewal}
              variants={fadeIn} 
            />
          </div>
          
          <div className="md:order-1 order-2">
            <ProfileCard 
              fetchDashboardData={fetchDashboardData} 
              userData={userData} 
              variants={fadeIn} 
            />
          </div>
          
          <div className="md:order-3 order-3">
            <FitnessStats stats={stats} variants={fadeIn} />
          </div>
          
          <div className="md:order-4 order-4">
            <RecentCheckIns checkIns={checkIns} variants={fadeIn} />
          </div>
        </motion.div>
      </div>
      
      {/* YouTube QR Scanner Modal */}
      <YouTubeQRScanner 
        isOpen={showScanner} 
        onClose={handleCloseScanner} 
      />
    </div>
  );
};

export default UserDashboard;
