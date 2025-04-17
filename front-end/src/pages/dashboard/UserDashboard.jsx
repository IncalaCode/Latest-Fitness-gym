import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import Navbar from '../../components/ui/Navbar';
import ProfileCard from './components/ProfileCard';
import CheckInCode from './components/CheckInCode';
import FitnessStats from './components/FitnessStats';
import RecentCheckIns from './components/RecentCheckIns';
import UpcomingClasses from './components/UpcomingClasses';
import SpaBookings from './components/SpaBookings';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Fetch user data from localStorage
    const fetchUserData = () => {
      try {
        const authData = localStorage.getItem('auth');
        if (!authData) {
          window.location.href = '/login';
          return;
        }
        
        const parsedData = JSON.parse(authData);
        setUserData(parsedData.user);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        enqueueSnackbar('Failed to load user data', { variant: 'error' });
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [enqueueSnackbar]);

  // Mock data for the dashboard
  const mockCheckIns = [
    { date: 'April 14, 2023', time: '08:51 AM', duration: '1h 48m' },
    { date: 'April 12, 2023', time: '07:30 AM', duration: '1h 15m' },
    { date: 'April 10, 2023', time: '06:45 AM', duration: '2h 05m' },
  ];

  const mockSpaBookings = [
    { service: 'Deep Tissue Massage', provider: 'Sarah Johnson', date: 'April 16, 2023', time: '14:00 PM', status: 'Confirmed', location: 'Spa Room 3' },
    { service: 'Facial Treatment', provider: 'Michael Brown', date: 'April 20, 2023', time: '10:30 AM', status: 'Pending', location: 'Beauty Suite' },
  ];

  const mockClasses = [
    { name: 'Yoga Flow', date: 'April 10, 2023', time: '08:30 AM', instructor: 'Emma Wilson' },
    { name: 'HIIT Circuit', date: 'April 11, 2023', time: '10:00 AM', instructor: 'James Taylor' },
    { name: 'Spin Class', date: 'April 13, 2023', time: '17:30 PM', instructor: 'David Miller' },
  ];

  const mockStats = {
    totalCheckIns: 47,
    checkInsThisMonth: 12,
    averageDuration: '1h 35m',
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

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
          Welcome back, {userData?.fullName || 'Member'}
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Member Profile Card */}
          <ProfileCard userData={userData} variants={fadeIn} />
          
          {/* QR Check-in Code */}
          <CheckInCode userData={userData} variants={fadeIn} />
          
          {/* Fitness Stats */}
          <FitnessStats stats={mockStats} variants={fadeIn} />
          
          {/* Recent Check-ins */}
          <RecentCheckIns checkIns={mockCheckIns} variants={fadeIn} />
          
          {/* Upcoming Classes */}
          <UpcomingClasses classes={mockClasses} variants={fadeIn} />
          
          {/* Upcoming Spa Bookings */}
          <SpaBookings bookings={mockSpaBookings} variants={fadeIn} />
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;