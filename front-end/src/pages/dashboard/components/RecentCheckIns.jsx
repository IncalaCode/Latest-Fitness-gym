import React from 'react';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';

const RecentCheckIns = ({ checkIns, variants }) => {
  return (
    <motion.div 
      className="bg-gray-800 rounded-xl p-6 shadow-lg"
      variants={variants}
    >
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FiClock className="mr-2" /> Recent Check-ins
      </h2>
      <div className="space-y-4">
        {checkIns.map((checkIn, index) => (
          <div key={index} className="border-b border-gray-700 pb-3 last:border-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{checkIn.date}</p>
                <p className="text-gray-400 text-sm">{checkIn.time}</p>
              </div>
              <div className="bg-gray-700 px-2 py-1 rounded text-sm">
                {checkIn.duration}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 text-red-500 hover:text-red-400 text-sm font-medium flex items-center">
        View Full History
      </button>
    </motion.div>
  );
};

export default RecentCheckIns;