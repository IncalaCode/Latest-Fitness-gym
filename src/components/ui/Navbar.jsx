import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { PrimaryButton } from './Buttons';
import { hoverEffects } from '../../utils/themeColors';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const logo_image_path = '/home/logo.png';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    setCurrentPath(window.location.pathname);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '#about' },
    { name: 'Services', path: '#services' },
    { name: 'Team', path: '#team' },
    { name: 'Testimonials', path: '#testimonials' },
    { name: 'Contact', path: '#contact' },
    { name: 'LogIn', path: '/login' },
  ];

  // Using the red-orange gradient from themeColors
  const underlineGradient = hoverEffects.underline.redOrange;

  // Custom NavLink component that works without Router context
  const NavLink = ({ to, children, className, onClick }) => {
    const isActive = currentPath === to;
    
    return (
      <a
        href={to}
        className={`${className} ${isActive ? 'font-semibold' : ''}`}
        onClick={(e) => {
          if (onClick) onClick(e);
        }}
      >
        {children}
      </a>
    );
  };

  // Function to navigate to the package page
  const navigateToPackage = () => {
    window.location.href = '/package';
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src={logo_image_path} 
                alt="Gym Logo" 
                className={`transition-all duration-300 ${
                  scrolled ? 'h-8' : 'h-10'
                }`}
              />
              <div className="ml-3">
                <span className="font-bold text-xl text-white">
                  Latest <span className="text-red-500">Fitness</span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={`relative px-3 py-2 text-sm font-medium group ${
                  scrolled ? 'text-white' : 'text-white'
                }`}
              >
                {item.name}
                <span 
                  className={`absolute bottom-0 left-0 w-0 h-0.5 ${underlineGradient} group-hover:w-full transition-all duration-300`}
                ></span>
              </NavLink>
            ))}
            <PrimaryButton onClick={navigateToPackage} colorScheme="redOrange">Join Now</PrimaryButton>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 focus:outline-none"
            >
              {isOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-black bg-opacity-95">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-200 relative group"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
                <span 
                  className={`absolute bottom-0 left-0 w-0 h-0.5 ${underlineGradient} group-hover:w-full transition-all duration-300`}
                ></span>
              </NavLink>
            ))}
            <div className="mt-4 px-3 pb-3">
              <PrimaryButton onClick={navigateToPackage} colorScheme="redOrange" className="w-full">Join Now</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;