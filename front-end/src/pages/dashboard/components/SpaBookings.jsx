import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin } from 'react-icons/fi';
import { PrimaryButton } from '../../../components/ui/Buttons';

const SpaBookings = ({ bookings, variants }) => {
  return (
    <motion.div 
      className="bg-gray-800 rounded-xl p-6 shadow-lg md:col-span-2 lg:col-span-3"
      variants={variants}
    >
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FiMapPin className="mr-2" /> Upcoming Spa Bookings
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Service</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Provider</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {bookings.map((booking, index) => (
              <tr key={index}>
                <td className="px-4 py-4 whitespace-nowrap">{booking.service}</td>
                <td className="px-4 py-4 whitespace-nowrap">{booking.provider}</td>
                <td className="px-4 py-4 whitespace-nowrap">{booking.date}</td>
                <td className="px-4 py-4 whitespace-nowrap">{booking.time}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    booking.status === 'Confirmed' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{booking.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bookings.length === 0 && (
        <p className="text-gray-400 text-center py-4">No upcoming spa bookings</p>
      )}
      <div className="mt-4 flex justify-end">
        <PrimaryButton colorScheme="redOrange">
          Book Spa Service
        </PrimaryButton>
      </div>
    </motion.div>
  );
};

export default SpaBookings;