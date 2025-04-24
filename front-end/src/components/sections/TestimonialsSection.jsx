import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { gradients } from '../../utils/themeColors';

const TestimonialCard = ({ name, text, image, rating }) => {
  // Generate stars based on rating
  const stars = Array.from({ length: 5 }, (_, i) => (
    <i 
      key={i} 
      className={`fas fa-star ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
    ></i>
  ));

  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6 md:p-8 shadow-lg relative h-full">
      <div className="flex items-center mb-4 md:mb-6">
        <img 
          src={image} 
          alt={name} 
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mr-3 sm:mr-4 border-2 border-red-500"
        />
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">{name}</h3>
          <div className="flex space-x-1 mt-1">
            {stars}
          </div>
        </div>
      </div>
      <p className="text-sm sm:text-base text-gray-300 italic">"{text}"</p>
      <div className="absolute -top-4 -left-4 text-4xl sm:text-5xl text-red-500 opacity-30">
        <i className="fas fa-quote-left"></i>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Jennifer K.",
      text: "Latest Fitness completely transformed my approach to working out. The trainers are knowledgeable and supportive, and the community keeps me motivated. I've lost 30 pounds and gained so much confidence!",
      image: "/images/testimonial-1.jpg",
      rating: 5
    },
    {
      name: "David M.",
      text: "As someone who was intimidated by gyms, I can't believe how comfortable I feel at Latest Fitness. The staff is friendly, the equipment is top-notch, and the results speak for themselves.",
      image: "/images/testimonial-2.jpg",
      rating: 5
    },
    {
      name: "Sophia L.",
      text: "The nutrition coaching combined with personal training has been a game-changer for me. I've not only reached my fitness goals but also learned sustainable habits that I can maintain long-term.",
      image: "/images/testimonial-3.jpg",
      rating: 4
    },
    {
      name: "Robert J.",
      text: "I've been a member of many gyms over the years, but Latest Fitness stands out for their attention to detail and personalized approach. The facilities are always clean and the atmosphere is motivating.",
      image: "/images/testimonial-4.jpg",
      rating: 5
    }
  ];

  // State for current slide
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  // Navigation functions
  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  // Determine how many testimonials to show based on screen size
  const getTestimonialsToShow = () => {
    // On mobile, show 1, on desktop show 2
    return window.innerWidth >= 768 ? 2 : 1;
  };

  const [testimonialsToShow, setTestimonialsToShow] = useState(1); // Default to 1 for initial render

  // Update testimonials to show on window resize
  useEffect(() => {
    const handleResize = () => {
      setTestimonialsToShow(getTestimonialsToShow());
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get visible testimonials
  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < testimonialsToShow; i++) {
      const index = (currentIndex + i) % testimonials.length;
      result.push({
        ...testimonials[index],
        originalIndex: index
      });
    }
    return result;
  };

  // Animation variants - reduced movement for mobile
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? window.innerWidth < 640 ? 300 : 500 : window.innerWidth < 640 ? -300 : -500,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? window.innerWidth < 640 ? -300 : -500 : window.innerWidth < 640 ? 300 : 500,
      opacity: 0
    })
  };

  // Button animation variants
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.9 }
  };

  return (
    <section id="testimonials" className="py-12 sm:py-20 bg-black overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-10 sm:mb-16">Testimonials</h2>
        
        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto px-8 sm:px-12">
          {/* Navigation Buttons */}
          <motion.button 
            onClick={prevSlide} 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-red-500 text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-red-600 focus:outline-none"
            aria-label="Previous testimonial"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <FiChevronLeft className="text-lg sm:text-xl" />
          </motion.button>
          
          <motion.button 
            onClick={nextSlide} 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-red-500 text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-red-600 focus:outline-none"
            aria-label="Next testimonial"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <FiChevronRight className="text-lg sm:text-xl" />
          </motion.button>

          {/* Testimonials Carousel */}
          <div className="overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div 
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8"
              >
                {getVisibleTestimonials().map((testimonial) => (
                  <div key={testimonial.originalIndex} className="h-full">
                    <TestimonialCard 
                      name={testimonial.name}
                      text={testimonial.text}
                      image={testimonial.image}
                      rating={testimonial.rating}
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-red-500 w-4 sm:w-6' : 'bg-gray-500'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
