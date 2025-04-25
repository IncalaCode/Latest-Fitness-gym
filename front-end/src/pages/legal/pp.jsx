import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';
 const PrivacyPolicy = () => {
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
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Home Icon */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <motion.div
            className="bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHome className="text-white text-xl" />
          </motion.div>
        </Link>
      </div>
      
      {/* Main Content */}
      <main className="flex-grow py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div 
            className="bg-gray-800 rounded-xl p-8 md:p-12 shadow-2xl"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
              <p className="text-gray-400">
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-8 text-gray-300"
            >
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
                <p>
                  Latest Fitness ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our mobile application, or become a member of our fitness facilities located in Hawassa, Ethiopia.
                </p>
                <p>
                  Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access our services.
                </p>
              </motion.section>
              
              {/* Rest of the content remains the same */}
              {/* ... */}
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">9. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p>
                  Latest Fitness<br />
                  Hawassa City Center<br />
                  Near Lake Hawassa, Main Road<br />
                  Hawassa, Ethiopia<br />
                  Email: info@latestfitnesshawassa.com<br />
                  Phone: +251 911 123 456
                </p>
              </motion.section>
            </motion.div>
            
            <div className="mt-12 text-center">
              <Link to="/" className="text-red-500 hover:text-red-400 font-medium">
                Return to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Footer with copyright */}
      <footer className="py-6 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Latest Fitness. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;