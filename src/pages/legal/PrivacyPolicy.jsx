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
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">2. Information We Collect</h2>
                <p>
                  <strong className="text-white">2.1 Personal Information:</strong> We may collect personal information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Full name</li>
                  <li>Contact information (email address, phone number, address)</li>
                  <li>Date of birth</li>
                  <li>Emergency contact information</li>
                  <li>Payment information</li>
                  <li>Health and fitness information</li>
                  <li>Profile photos (if provided)</li>
                </ul>
                <p>
                  <strong className="text-white">2.2 Usage Information:</strong> We may automatically collect certain information about how you access and use our services, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP address</li>
                  <li>Device information</li>
                  <li>Browser type</li>
                  <li>Pages viewed</li>
                  <li>Time spent on pages</li>
                  <li>Referring website</li>
                  <li>Facility access times</li>
                  <li>Class attendance</li>
                </ul>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">3. How We Use Your Information</h2>
                <p>
                  We may use the information we collect for various purposes, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Providing and maintaining our services</li>
                  <li>Processing membership applications and payments</li>
                  <li>Managing your account and membership</li>
                  <li>Sending administrative information</li>
                  <li>Providing customer support</li>
                  <li>Personalizing your experience</li>
                  <li>Sending promotional communications (with your consent)</li>
                  <li>Analyzing usage patterns to improve our services</li>
                  <li>Ensuring the security of our services</li>
                  <li>Complying with legal obligations</li>
                </ul>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">4. Information Sharing and Disclosure</h2>
                <p>
                  We may share your information in the following situations:
                </p>
                <p>
                  <strong className="text-white">4.1 Service Providers:</strong> We may share your information with third-party vendors, service providers, and contractors who perform services on our behalf.
                </p>
                <p>
                  <strong className="text-white">4.2 Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.
                </p>
                <p>
                  <strong className="text-white">4.3 Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.
                </p>
                <p>
                  <strong className="text-white">4.4 Protection of Rights:</strong> We may disclose your information to protect our rights, privacy, safety, or property, or that of our customers or others.
                </p>
                <p>
                  <strong className="text-white">4.5 With Your Consent:</strong> We may share your information with your consent or at your direction.
                </p>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">6. Your Privacy Rights</h2>
                <p>
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The right to access your personal information</li>
                  <li>The right to correct inaccurate information</li>
                  <li>The right to request deletion of your information</li>
                  <li>The right to restrict or object to processing</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent</li>
                </ul>
                <p>
                  To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
                </p>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">7. Children's Privacy</h2>
                <p>
                  Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we learn we have collected personal information from a child under 16, we will delete that information as quickly as possible.
                </p>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">8. Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </motion.section>
              
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