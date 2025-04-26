import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton, OutlineButton } from '../ui/Buttons';
import { FiChevronDown } from 'react-icons/fi';
import { gradients, primaryColors } from '../../utils/themeColors';

const HeroSection = () => {
  // Array of background images
  const backgroundImages = [
    '/home/landingpageImage.JPG',
    '/home/heroimg2.avif',
    // '/images/hero/gym-hero-3.jpg',
    // '/images/hero/gym-hero-4.jpg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Image rotation interval
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000); // Change image every 10 seconds (10000ms)

    // Scroll detection
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(imageInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Get the primary color from theme
  const primaryColor = primaryColors.red.default;
  const primaryGradient = gradients.redOrange;

  // Wave animation variants for the circles around the V icon
  const waveVariants = {
    animate: {
      scale: [1, 1.05, 1.1, 1.05, 1],
      opacity: [0.2, 0.3, 0.4, 0.3, 0.2],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  };

  // Bounce animation for the V icon
  const bounceVariants = {
    animate: {
      y: [0, -5, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  };

  const scrollDown = () => {
    const viewportHeight = window.innerHeight;
    window.scrollBy({
      top: viewportHeight,
      behavior: 'smooth'
    });
  };


  // Function to navigate to the package page
  const navigateToPackage = () => {
    window.location.href = '/package';
  };


  return (
    <section id="home" className="h-screen relative overflow-hidden">
      {/* Background Image Carousel */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentImageIndex}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          style={{
            backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>

      
      {/* V Icon with Wave Effect - Hidden when scrolled */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div 
            className="absolute bottom-10 left-0 right-0 flex justify-center z-20"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              {/* Animated waves - smaller and lighter */}
              <motion.div 
                className="absolute inset-0 rounded-full border border-red-500 border-opacity-30"
                variants={waveVariants}
                animate="animate"
                style={{ margin: '-4px' }}
              />
              <motion.div 
                className="absolute inset-0 rounded-full border border-red-500 border-opacity-30"
                variants={waveVariants}
                animate="animate"
                style={{ margin: '-8px', animationDelay: '0.5s' }}
              />
              <motion.div 
                className="absolute inset-0 rounded-full border border-red-500 border-opacity-30"
                variants={waveVariants}
                animate="animate"
                style={{ margin: '-12px', animationDelay: '1s' }}
              />
              
              {/* V Icon without background circle - with direct click handler */}
              <motion.button
                className="text-red-500 cursor-pointer bg-transparent border-0 p-0 focus:outline-none hover:text-red-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                variants={bounceVariants}
                animate="animate"
                aria-label="Scroll down"
                style={{ cursor: 'pointer' }} /* Inline style to ensure cursor works */
              >
                <FiChevronDown className="text-2xl" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            HAWASSA'S PREMIER<br />
            FITNESS & WELLNESS DESTINATION
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Where strength meets serenity. Transform your body, calm your mind.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <PrimaryButton 
              colorScheme="redOrange" 
              className="px-8 py-3 text-lg"
              onClick={navigateToPackage}
            >
             Become a Member
            </PrimaryButton>
            
            <OutlineButton 
              colorScheme="light" 
              className="px-8 py-3 text-lg"
              onClick={scrollDown}
            >
              Learn More
            </OutlineButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;