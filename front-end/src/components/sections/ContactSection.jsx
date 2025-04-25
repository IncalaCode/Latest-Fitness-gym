import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PrimaryButton } from '../ui/Buttons';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    console.log('Form submitted:', formData);
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    // Show success message
    alert('Thank you for your message! We will get back to you soon.');
  };

  // Animation variants - adjusted for mobile compatibility
  const fadeIn = {
    hidden: { opacity: 0, y: 10 }, // Reduced y offset for mobile
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 } // Slightly faster animation
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 20 }, // Reduced x offset for mobile
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 // Faster stagger for mobile
      }
    }
  };

  return (
    <section id="contact" className="py-10 sm:py-20 bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-2xl sm:text-4xl font-bold text-white text-center mb-8 sm:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          Contact Us
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Information */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            className="order-2 lg:order-1"
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Get In Touch</h3>
            <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
              Have questions about our services or ready to start your fitness journey? 
              Reach out to us and our team will get back to you as soon as possible.
            </p>
            
            <motion.div 
              className="space-y-4 sm:space-y-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div className="flex items-start" variants={fadeIn}>
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="text-white text-lg sm:text-xl" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-medium text-white">Location</h4>
                  <p className="text-gray-300 text-sm sm:text-base">Hawassa city 05, main road</p>
                  <p className="text-gray-300 text-sm sm:text-base">Hawassa, Ethiopia</p>
                </div>
              </motion.div>
              
              <motion.div className="flex items-start" variants={fadeIn}>
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex items-center justify-center flex-shrink-0">
                  <FiPhone className="text-white text-lg sm:text-xl" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-medium text-white">Phone</h4>
                  <p className="text-gray-300 text-sm sm:text-base">0722072324</p>
                </div>
              </motion.div>
              
              <motion.div className="flex items-start" variants={fadeIn}>
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex items-center justify-center flex-shrink-0">
                  <FiMail className="text-white text-lg sm:text-xl" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-medium text-white">Email</h4>
                  <p className="text-gray-300 text-sm sm:text-base break-words">Info@latestfitnessethiopia.com</p>
                </div>
              </motion.div>
              
              <motion.div className="flex items-start" variants={fadeIn}>
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex items-center justify-center flex-shrink-0">
                  <FiClock className="text-white text-lg sm:text-xl" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-medium text-white">Hours</h4>
                  <p className="text-gray-300 text-sm sm:text-base"><span className="font-medium">Gym:</span> 6:00 AM - 10:00 PM Daily</p>
                  <p className="text-gray-300 text-sm sm:text-base"><span className="font-medium">Spa:</span> 10:00 AM - 8:00 PM Daily</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div 
            className="bg-gray-800 rounded-lg p-5 sm:p-8 shadow-lg order-1 lg:order-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInRight}
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Send Us a Message</h3>
            <form onSubmit={handleSubmit}>
              <motion.div 
                className="mb-3 sm:mb-4"
                variants={fadeIn}
              >
                <label htmlFor="name" className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 sm:py-3 px-3 sm:px-4 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </motion.div>
              
              <motion.div 
                className="mb-3 sm:mb-4"
                variants={fadeIn}
              >
                <label htmlFor="email" className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 sm:py-3 px-3 sm:px-4 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </motion.div>
              
              <motion.div 
                className="mb-3 sm:mb-4"
                variants={fadeIn}
              >
                <label htmlFor="phone" className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 sm:py-3 px-3 sm:px-4 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </motion.div>
              
              <motion.div 
                className="mb-4 sm:mb-6"
                variants={fadeIn}
              >
                <label htmlFor="message" className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 sm:py-3 px-3 sm:px-4 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                ></textarea>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PrimaryButton colorScheme="redOrange" className="w-full py-2 sm:py-3 text-sm sm:text-base">
                  Send Message
                </PrimaryButton>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;