import React from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2 } from 'react-icons/fi';
import { PrimaryButton } from '../../../components/ui/Buttons';

const FitnessStats = ({ stats, variants }) => {
  return (
    <motion.div 
      className="bg-gray-800 rounded-xl p-6 shadow-lg"
      variants={variants}
    >
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FiBarChart2 className="mr-2" /> Fitness Stats
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Check-ins</p>
          <p className="text-2xl font-bold">{stats.totalCheckIns}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">This Month</p>
          <p className="text-2xl font-bold">{stats.checkInsThisMonth}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 col-span-2">
          <p className="text-gray-400 text-sm">Average Session</p>
          <p className="text-2xl font-bold">{stats.averageDuration}</p>
        </div>
      </div>
      {/* <PrimaryButton 
        colorScheme="redOrange" 
        className="w-full flex items-center justify-center"
      >
        View Fitness Report
      </PrimaryButton> */}
    </motion.div>
  );
};

export default FitnessStats;