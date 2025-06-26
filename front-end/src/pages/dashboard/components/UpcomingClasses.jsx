import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';

const UpcomingClasses = ({ classes, variants }) => {
  return (
    <motion.div 
      className="bg-gray-800 rounded-xl p-6 shadow-lg"
      variants={variants}
    >
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FiCalendar className="mr-2" /> Upcoming Classes
      </h2>
      <div className="space-y-4">
        {classes.map((cls, index) => (
          <div key={index} className="border-b border-gray-700 pb-3 last:border-0">
            <p className="font-medium">{cls.name}</p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-gray-400 text-sm">{cls.date} — {cls.time}</p>
              <span className="text-xs text-gray-400">
                {cls.instructor}
              </span>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 text-red-500 hover:text-red-400 text-sm font-medium flex items-center">
        Book More Classes
      </button>
    </motion.div>
  );
};

export default UpcomingClasses;