import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';

const TermsAndConditions = () => {
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
              <h1 className="text-4xl font-bold text-white mb-4">Terms and Conditions</h1>
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
                  Welcome to Latest Fitness. These Terms and Conditions govern your use of our website, mobile applications, and services, as well as your membership at our fitness facilities located in Hawassa, Ethiopia.
                </p>
                <p>
                  By accessing our services or becoming a member, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services.
                </p>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">2. Membership Terms</h2>
                <p>
                  <strong className="text-white">2.1 Eligibility:</strong> Membership is available to individuals who are at least 16 years of age. Members under 18 years of age require parental or guardian consent.
                </p>
                <p>
                  <strong className="text-white">2.2 Membership Fees:</strong> Membership fees are due according to the payment schedule selected at registration. We reserve the right to modify our fees with 30 days' notice.
                </p>
                <p>
                  <strong className="text-white">2.3 Membership Duration:</strong> Unless otherwise specified, memberships are for a minimum term of 3 months and will automatically renew on a month-to-month basis thereafter.
                </p>
                <p>
                  <strong className="text-white">2.4 Cancellation:</strong> Memberships may be canceled with 30 days' written notice after the minimum term has been completed. Early termination fees may apply for cancellations during the minimum term.
                </p>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">3. Facility Rules and Conduct</h2>
                <p>
                  <strong className="text-white">3.1 Facility Access:</strong> Members must present valid identification or use their membership card to access our facilities.
                </p>
                <p>
                  <strong className="text-white">3.2 Proper Conduct:</strong> Members are expected to conduct themselves in a respectful manner. Harassment, intimidation, or discrimination against staff or other members will not be tolerated.
                </p>
                <p>
                  <strong className="text-white">3.3 Dress Code:</strong> Appropriate athletic attire and closed-toe athletic shoes are required in workout areas. Swimwear is restricted to pool areas.
                </p>
                <p>
                  <strong className="text-white">3.4 Equipment Use:</strong> Members are expected to use equipment properly, follow all posted instructions, and return equipment to its designated location after use.
                </p>
                <p>
                  <strong className="text-white">3.5 Personal Belongings:</strong> Latest Fitness is not responsible for lost, stolen, or damaged personal property. Lockers are available for day use only.
                </p>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">4. Health and Safety</h2>
                <p>
                  <strong className="text-white">4.1 Health Assessment:</strong> Members are encouraged to consult with a physician before beginning any exercise program.
                </p>
                <p>
                  <strong className="text-white">4.2 Medical Conditions:</strong> Members must disclose relevant medical conditions that may affect their ability to safely participate in fitness activities.
                </p>
                <p>
                  <strong className="text-white">4.3 Injuries:</strong> Any injuries occurring on the premises must be reported to staff immediately.
                </p>
                <p>
                  <strong className="text-white">4.4 Hygiene:</strong> Members are required to wipe down equipment after use with the provided sanitizing materials and maintain personal hygiene.
                </p>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">5. Classes and Personal Training</h2>
                <p>
                  <strong className="text-white">5.1 Reservations:</strong> Some classes require advance reservations. Members who cannot attend a reserved class should cancel at least 2 hours in advance.
                </p>
                <p>
                  <strong className="text-white">5.2 Personal Training:</strong> Personal training sessions are subject to separate agreements and fees. Cancellations with less than 24 hours' notice may result in forfeiture of the session.
                </p>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">6. Limitation of Liability</h2>
                <p>
                  <strong className="text-white">6.1 Assumption of Risk:</strong> Members acknowledge that participation in physical activities carries inherent risks. Members assume all risks associated with using the facilities and services.
                </p>
                <p>
                  <strong className="text-white">6.2 Waiver:</strong> To the extent permitted by law, members waive any claims against Latest Fitness for injuries or damages resulting from the use of our facilities or services, except in cases of gross negligence.
                </p>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">7. Changes to Terms</h2>
                <p>
                  Latest Fitness reserves the right to modify these Terms and Conditions at any time. Changes will be effective upon posting to our website and/or notification to members. Continued use of our services after such modifications constitutes acceptance of the updated terms.
                </p>
              </motion.section>
              
              <motion.section variants={fadeIn} className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">8. Contact Information</h2>
                <p>
                  If you have any questions about these Terms and Conditions, please contact us at:
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

export default TermsAndConditions;