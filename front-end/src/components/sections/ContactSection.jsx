import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PrimaryButton } from '../ui/Buttons';
import { gradients } from '../../utils/themeColors';
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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl font-bold text-white text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          Contact Us
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <h3 className="text-2xl font-semibold text-white mb-6">Get In Touch</h3>
            <p className="text-gray-300 mb-8">
              Have questions about our services or ready to start your fitness journey? 
              Reach out to us and our team will get back to you as soon as possible.
            </p>
            
            <motion.div 
              className="space-y-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div className="flex items-start" variants={fadeIn}>
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-full mr-4 flex items-center justify-center">
                  <FiMapPin className="text-white text-xl" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-white">Location</h4>
                  <p className="text-gray-300">Hawassa city 05, main road</p>
                  <p className="text-gray-300">Hawassa, Ethiopia</p>
                </div>
              </motion.div>
              
              <motion.div className="flex items-start" variants={fadeIn}>
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-full mr-4 flex items-center justify-center">
                  <FiPhone className="text-white text-xl" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-white">Phone</h4>
                  <p className="text-gray-300">0722072324</p>
                </div>
              </motion.div>
              
              <motion.div className="flex items-start" variants={fadeIn}>
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-full mr-4 flex items-center justify-center">
                  <FiMail className="text-white text-xl" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-white">Email</h4>
                  <p className="text-gray-300">Info@latestfitnessethiopia.com</p>
                </div>
              </motion.div>
              
              <motion.div className="flex items-start" variants={fadeIn}>
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-full mr-4 flex items-center justify-center">
                  <FiClock className="text-white text-xl" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-white">Hours</h4>
                  <p className="text-gray-300"><span className="font-medium">Gym:</span> 6:00 AM - 10:00 PM Daily</p>
                  <p className="text-gray-300"><span className="font-medium">Spa:</span> 10:00 AM - 8:00 PM Daily</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div 
            className="bg-gray-800 rounded-lg p-8 shadow-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0, x: 50 },
              visible: { 
                opacity: 1, 
                x: 0,
                transition: { duration: 0.6 }
              }
            }}
          >
            <h3 className="text-2xl font-semibold text-white mb-6">Send Us a Message</h3>
            <form onSubmit={handleSubmit}>
              <motion.div 
                className="mb-4"
                variants={fadeIn}
              >
                <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </motion.div>
              
              <motion.div 
                className="mb-4"
                variants={fadeIn}
              >
                <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </motion.div>
              
              <motion.div 
                className="mb-4"
                variants={fadeIn}
              >
                <label htmlFor="phone" className="block text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </motion.div>
              
              <motion.div 
                className="mb-6"
                variants={fadeIn}
              >
                <label htmlFor="message" className="block text-gray-300 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                ></textarea>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PrimaryButton colorScheme="redOrange" className="w-full py-3">
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
