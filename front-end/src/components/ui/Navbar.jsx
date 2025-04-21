import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { hoverEffects, gradients, uiColors } from '../../utils/themeColors';
import { useSnackbar } from 'notistack';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const logo_image_path = '/home/logo.png';
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    setCurrentPath(window.location.pathname);

    const checkUserAuth = () => {
      const user = localStorage.getItem('auth');
      if (user) {
        setIsLoggedIn(true);
        const userData = JSON.parse(user);
        setIsAdmin(userData.user.role === 'Admin');
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    checkUserAuth();
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const openLogoutDialog = () => {
    setLogoutDialogOpen(true);
  };

  const closeLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setIsLoggedIn(false);
    setIsAdmin(false);
    closeLogoutDialog();
    enqueueSnackbar('Successfully logged out', { 
      variant: 'success',
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'right',
      }
    });
    window.location.href = '/';
  };

  const isHomePage = currentPath === '/';
  const isDashboardPage = currentPath === '/user-dashboard' || currentPath === '/admin-dashboard';

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '#about' },
    { name: 'Services', path: '#services' },
    { name: 'Team', path: '#team' },
    { name: 'Testimonials', path: '#testimonials' },
    { name: 'Contact', path: '#contact' },
  ];

  // Dashboard-specific navigation items
  const dashboardNavItems = [
    { name: 'Home', path: '/' }
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

  // Function to navigate to the dashboard
  const navigateToDashboard = () => {
    window.location.href = isAdmin ? '/admin-dashboard' : '/user-dashboard';
  };

  return (
    <>
      <motion.nav 
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-black shadow-lg py-2' 
            : 'bg-transparent py-4'
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <motion.img 
                  src={logo_image_path} 
                  alt="Gym Logo" 
                  className={`transition-all duration-300 ${
                    scrolled ? 'h-8' : 'h-10'
                  }`}
                  whileHover={{ scale: 1.05 }}
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
              {/* Show different navigation based on current page */}
              {isDashboardPage ? (
                // On dashboard pages, show Home link
                dashboardNavItems.map((item) => (
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
                ))
              ) : (
                // On home page, show full navigation
                isHomePage && navItems.map((item) => (
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
                ))
              )}

              {/* Authentication buttons */}
              {isLoggedIn ? (
                <>
                  {/* Only show Dashboard link if not already on a dashboard page */}
                  {!isDashboardPage && (
                    <NavLink
                      to={isAdmin ? '/admin-dashboard' : '/user-dashboard'}
                      className={`relative px-3 py-2 text-sm font-medium group ${
                        scrolled ? 'text-white' : 'text-white'
                      }`}
                    >
                      Dashboard
                      <span 
                        className={`absolute bottom-0 left-0 w-0 h-0.5 ${underlineGradient} group-hover:w-full transition-all duration-300`}
                      ></span>
                    </NavLink>
                  )}
                  <PrimaryButton onClick={openLogoutDialog} colorScheme="redOrange">Logout</PrimaryButton>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={`relative px-3 py-2 text-sm font-medium group ${
                      scrolled ? 'text-white' : 'text-white'
                    }`}
                  >
                    Login
                    <span 
                      className={`absolute bottom-0 left-0 w-0 h-0.5 ${underlineGradient} group-hover:w-full transition-all duration-300`}
                    ></span>
                  </NavLink>
                  {isHomePage && (
                    <PrimaryButton onClick={navigateToPackage} colorScheme="redOrange">Join Now</PrimaryButton>
                  )}
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <motion.button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 focus:outline-none"
                whileTap={{ scale: 0.95 }}
              >
                {isOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="md:hidden bg-black bg-opacity-95"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {/* Show different navigation based on current page */}
                {isDashboardPage ? (
                  // On dashboard pages, show Home link
                  dashboardNavItems.map((item) => (
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
                  ))
                ) : (
                  // On home page, show full navigation
                  isHomePage && navItems.map((item) => (
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
                  ))
                )}

                {/* Authentication links */}
                {isLoggedIn ? (
                  <>
                    {/* Only show Dashboard link if not already on a dashboard page */}
                    {!isDashboardPage && (
                      <NavLink
                        to={isAdmin ? '/admin-dashboard' : '/user-dashboard'}
                        className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-200 relative group"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                        <span 
                          className={`absolute bottom-0 left-0 w-0 h-0.5 ${underlineGradient} group-hover:w-full transition-all duration-300`}
                        ></span>
                      </NavLink>
                    )}
                    <div className="mt-4 px-3 pb-3">
                      <PrimaryButton onClick={openLogoutDialog} colorScheme="redOrange" className="w-full">Logout</PrimaryButton>
                    </div>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-gray-200 relative group"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                      <span 
                        className={`absolute bottom-0 left-0 w-0 h-0.5 ${underlineGradient} group-hover:w-full transition-all duration-300`}
                      ></span>
                    </NavLink>
                    {isHomePage && (
                      <div className="mt-4 px-3 pb-3">
                        <PrimaryButton onClick={navigateToPackage} colorScheme="redOrange" className="w-full">Join Now</PrimaryButton>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={closeLogoutDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: 'black',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          },
        }}
      >
        <DialogTitle id="logout-dialog-title" className="text-center font-bold text-white">
          {"Confirm Logout"}
        </DialogTitle>
        <DialogContent>
          <DialogTitle id="logout-dialog-title" className="text-center font-bold text-white">
          {"Are you sure you want to log out of your account?"}
        </DialogTitle>
        </DialogContent>
        <DialogActions className="flex justify-center pb-4 px-6 gap-4">
          <SecondaryButton onClick={closeLogoutDialog} className="px-6">
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={handleLogout} colorScheme="redOrange" className="px-6">
            Logout
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
