import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';

const RecentCheckIns = ({ checkIns = [], variants }) => {
  const [showAllHistory, setShowAllHistory] = useState(false);
  
  // Sort check-ins by date (newest first)
  // The controller already provides sorted data, but we'll ensure it here
  const sortedCheckIns = [...checkIns].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB - dateA;
  });
  
  // Get only the last 10 check-ins when not showing all
  const limitedCheckIns = showAllHistory 
    ? sortedCheckIns 
    : sortedCheckIns.filter((_, index) => index < 10);
  
  // Group check-ins by date
  const groupedCheckIns = limitedCheckIns.reduce((groups, checkIn) => {
    const date = checkIn.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(checkIn);
    return groups;
  }, {});

  // Convert grouped check-ins to array for rendering
  const checkInDays = Object.keys(groupedCheckIns).map(date => ({
    date,
    checkIns: groupedCheckIns[date]
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-xl shadow-lg p-6"
      variants={variants}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FiClock className="mr-2 text-blue-400" />
          Recent Check-ins
        </h3>
        {checkIns.length > 10 && (
          <button 
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showAllHistory ? 'Show Recent' : 'View Full History'}
          </button>
        )}
      </div>

      {checkInDays.length > 0 ? (
        <div className="space-y-4">
          {checkInDays.map((day, index) => (
            <div key={day.date} className="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="text-sm font-medium text-gray-300 mb-2">{day.date}</h4>
                <div className="space-y-2">
                  {day.checkIns.map((checkIn) => (
                    <div 
                      key={checkIn.id} 
                      className="flex justify-between items-center bg-gray-700 p-3 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{checkIn.time}</p>
                        <p className="text-xs text-gray-300">{checkIn.area || 'Main Gym'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-300">No check-in history available</p>
        </div>
      )}
      
      {showAllHistory && checkIns.length > 10 && (
        <div className="mt-4 text-center">
          <button 
            onClick={() => setShowAllHistory(false)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Show Recent Check-ins
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RecentCheckIns;