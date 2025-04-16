import React from 'react';
import { gradients } from '../../utils/themeColors';
import { FiMapPin, FiPhone, FiMail, FiClock, FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">Latest Fitness</h3>
            <p className="text-gray-400 mb-4">
              Elevating fitness in Hawassa with top-tier equipment and exceptional service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiFacebook className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiInstagram className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiYoutube className="text-xl" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-gray-400 hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a>
              </li>
              <li>
                <a href="#team" className="text-gray-400 hover:text-white transition-colors">Our Team</a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Personal Training</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Group Classes</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Nutrition Coaching</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Strength Training</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cardio Programs</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Recovery & Wellness</a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <FiMapPin className="mt-1 mr-3 text-red-500 flex-shrink-0" />
                <span className="text-gray-400">
                  Hawassa City Center<br />
                  Near Lake Hawassa, Main Road<br />
                  Hawassa, Ethiopia
                </span>
              </li>
              <li className="flex items-start">
                <FiPhone className="mt-1 mr-3 text-red-500 flex-shrink-0" />
                <span className="text-gray-400">+251 911 123 456</span>
              </li>
              <li className="flex items-start">
                <FiMail className="mt-1 mr-3 text-red-500 flex-shrink-0" />
                <span className="text-gray-400">info@latestfitnesshawassa.com</span>
              </li>
              <li className="flex items-start">
                <FiClock className="mt-1 mr-3 text-red-500 flex-shrink-0" />
                <span className="text-gray-400">
                  <span className="font-medium">Gym:</span> 6:00 AM - 10:00 PM Daily<br />
                  <span className="font-medium">Spa:</span> 10:00 AM - 8:00 PM Daily
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">© {currentYear} Latest Fitness. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;