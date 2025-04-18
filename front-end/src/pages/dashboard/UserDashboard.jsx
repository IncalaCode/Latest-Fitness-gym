import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import Navbar from '../../components/ui/Navbar';
import ProfileCard from './components/ProfileCard';
import CheckInCode from './components/CheckInCode';
import FitnessStats from './components/FitnessStats';
import RecentCheckIns from './components/RecentCheckIns';
import { API_ENDPOINT_FUNCTION, GET_HEADER } from '../../config/config';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
      setDashboardData(data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
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

  const { userData, qrCodeData, stats, checkIns, hasPendingInCashPayment } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.h1
          className="text-3xl font-bold mb-8 text-center sm:text-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome back, {userData?.fullName || "Member"}
        </motion.h1>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <ProfileCard fetchDashboardData={fetchDashboardData} userData={userData} variants={fadeIn} />
          
          <CheckInCode 
            userData={userData} 
            qrCodeData={qrCodeData}
            hasPendingInCashPayment={hasPendingInCashPayment}
            variants={fadeIn} 
          />
          
          <FitnessStats stats={stats} variants={fadeIn} />
          
          <RecentCheckIns checkIns={checkIns} variants={fadeIn} />
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;

