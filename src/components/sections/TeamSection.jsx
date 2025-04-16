import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { FiInstagram, FiFacebook, FiTwitter, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';

const TrainerCard = ({ member }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="w-72 flex-shrink-0 snap-center"
      whileHover={{ y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div 
        className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 h-full"
      >
        <div className="h-80 overflow-hidden relative">
          <motion.img 
            src={member.image} 
            alt={member.name} 
            className="w-full h-full object-cover object-center"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.7 : 0.5 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Social links overlay on hover */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {member.socialLinks.map((link, index) => (
              <motion.a 
                key={index}
                href={link.url} 
                className="bg-red-500 p-3 rounded-full text-white hover:bg-red-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                {link.icon}
              </motion.a>
            ))}
          </motion.div>
        </div>
        <div className="p-6">
          <motion.h3 
            className="text-xl font-bold text-white mb-1"
            animate={{ color: isHovered ? "#f56565" : "#ffffff" }}
            transition={{ duration: 0.3 }}
          >
            {member.name}
          </motion.h3>
          <p className="text-red-500 font-medium mb-4">{member.role}</p>
          
          <motion.div 
            className="w-10 h-0.5 bg-red-500"
            initial={{ width: 0 }}
            animate={{ width: isHovered ? 40 : 10 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const TeamSection = () => {
  // Refs for scroll-triggered animations
  const headerRef = useRef(null);
  const filterRef = useRef(null);
  const containerRef = useRef(null);
  
  // Check if elements are in view
  const headerInView = useInView(headerRef, { once: true, amount: 0.2 });
  const filterInView = useInView(filterRef, { once: true, amount: 0.2 });
  const containerInView = useInView(containerRef, { once: true, amount: 0.1 });

  // Team members data with categories
  const teamMembers = [
    {
      id: 1,
      name: "Samuel Tadesse",
      role: "CEO & Founder",
      image: "/home/samuel.jpg",
      category: "leadership",
      socialLinks: [
        { url: "#", icon: <FiInstagram className="text-lg" /> },
        { url: "#", icon: <FiFacebook className="text-lg" /> },
        { url: "#", icon: <FiTwitter className="text-lg" /> }
      ]
    },
    {
      id: 2,
      name: "Abeba Mekonnen",
      role: "General Manager",
      image: "https://lux-wellness-hawassa-gym.lovable.app/lovable-uploads/02e44ddf-c8d0-44ca-9197-2df2ac23c660.png",
      category: "leadership",
      socialLinks: [
        { url: "#", icon: <FiInstagram className="text-lg" /> },
        { url: "#", icon: <FiFacebook className="text-lg" /> },
        { url: "#", icon: <FiTwitter className="text-lg" /> }
      ]
    },
    {
      id: 3,
      name: "Dawit Gebre",
      role: "Bodybuilding Coach",
      image: "https://lux-wellness-hawassa-gym.lovable.app/lovable-uploads/7992f50c-8966-4fe3-b241-a54d3a3f4b26.png",
      category: "coaches",
      socialLinks: [
        { url: "#", icon: <FiInstagram className="text-lg" /> },
        { url: "#", icon: <FiFacebook className="text-lg" /> },
        { url: "#", icon: <FiTwitter className="text-lg" /> }
      ]
    },
    {
      id: 4,
      name: "Helen Kebede",
      role: "Cardio Coach",
      image: "https://lux-wellness-hawassa-gym.lovable.app/lovable-uploads/e33820f0-5822-4e32-b1aa-ab2704a28fce.png",
      category: "coaches",
      socialLinks: [
        { url: "#", icon: <FiInstagram className="text-lg" /> },
        { url: "#", icon: <FiFacebook className="text-lg" /> },
        { url: "#", icon: <FiTwitter className="text-lg" /> }
      ]
    },
    {
      id: 5,
      name: "Bereket Alemu",
      role: "IT Specialist",
      image: "https://lux-wellness-hawassa-gym.lovable.app/lovable-uploads/63e63b59-3ae8-4fb6-8ed6-b3e76c5b1481.png",
      category: "support",
      socialLinks: [
        { url: "#", icon: <FiInstagram className="text-lg" /> },
        { url: "#", icon: <FiFacebook className="text-lg" /> },
        { url: "#", icon: <FiTwitter className="text-lg" /> }
      ]
    },
  ];

  // Filter categories
  const categories = [
    { id: "all", label: "All" },
    { id: "leadership", label: "Leadership" },
    { id: "coaches", label: "Coaches" },
    { id: "support", label: "Support" }
  ];

  // State for active filter
  const [activeFilter, setActiveFilter] = useState("all");
  
  // State to track if we should show scroll buttons
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  
  // Ref for scrolling container
  const scrollContainerRef = useRef(null);

  // Filter team members based on active filter
  const filteredMembers = activeFilter === "all" 
    ? teamMembers 
    : teamMembers.filter(member => member.category === activeFilter);

  // Check if we need to show scroll buttons (more than 4 cards)
  useEffect(() => {
    setShowScrollButtons(filteredMembers.length > 4);
  }, [filteredMembers]);

  // Scroll functions
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  };

  const filterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3,
        ease: "easeOut"
      }
    }
  };

  const filterItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Button animation variants
  const buttonVariants = {
    rest: { scale: 1, backgroundColor: "rgb(239, 68, 68)" },
    hover: { 
      scale: 1.1, 
      backgroundColor: "rgb(220, 38, 38)",
      boxShadow: "0px 5px 15px rgba(239, 68, 68, 0.3)"
    },
    tap: { scale: 0.9 }
  };

  return (
    <section id="team" className="py-20 bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12" ref={headerRef}>
          <motion.h2 
            className="text-4xl font-bold text-white mb-4"
            variants={headerVariants}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
          >
            Our Team
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            variants={descriptionVariants}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
          >
            Meet the dedicated professionals who make Latest Fitness the premier fitness destination in Hawassa.
          </motion.p>
        </div>

        {/* Filter Pills */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-12"
          ref={filterRef}
          variants={filterVariants}
          initial="hidden"
          animate={filterInView ? "visible" : "hidden"}
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === category.id 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              variants={filterItemVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              animate={
                activeFilter === category.id 
                  ? { y: -2, boxShadow: "0px 4px 10px rgba(239, 68, 68, 0.3)" } 
                  : { y: 0, boxShadow: "none" }
              }
            >
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Team Members Scrollable Container */}
        <div className="relative" ref={containerRef}>
          {/* Scroll Left Button - Only shown if more than 4 cards */}
          {showScrollButtons && (
            <motion.button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-red-500 text-white p-3 rounded-full shadow-lg focus:outline-none"
              aria-label="Scroll left"
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              style={{ left: '-5px' }}
              animate={containerInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: 0.5 }}
            >
              <FiChevronLeft className="text-xl" />
            </motion.button>
          )}
          
          {/* Scroll Right Button - Only shown if more than 4 cards */}
          {showScrollButtons && (
            <motion.button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-red-500 text-white p-3 rounded-full shadow-lg focus:outline-none"
              aria-label="Scroll right"
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              style={{ right: '-5px' }}
              animate={containerInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 0.5 }}
            >
              <FiChevronRight className="text-xl" />
            </motion.button>
          )}

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                variants={containerVariants}
                initial="hidden"
                animate={containerInView ? "visible" : "hidden"}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className={`flex space-x-6 ${showScrollButtons ? 'px-4 pl-8 pr-8' : 'px-4 justify-center'}`}
              >
                {filteredMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    variants={itemVariants}
                    custom={index}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TrainerCard member={member} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Scroll Indicator for Mobile - Only shown if more than 4 cards */}
        {showScrollButtons && (
          <motion.div 
            className="mt-6 flex justify-center md:hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={containerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-sm text-gray-400 italic">Swipe to see more team members</p>
          </motion.div>
        )}
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default TeamSection;