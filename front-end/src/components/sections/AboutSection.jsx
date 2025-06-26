import React from 'react';
import { motion } from 'framer-motion';

const AboutSection = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const aboutContent = [
    {
      id: 'equipment',
      title: 'State-of-the-Art Equipment',
      image: '/home/landingpageimage1.JPG',
      imageAlt: 'State-of-the-Art Equipment',
      description: [
        'Our fitness center boasts the latest high-end equipment for every training style. From advanced cardio machines with integrated entertainment systems to premium free weights and specialized functional training zones, we provide the tools you need to achieve your fitness goals efficiently and safely.',
        'Each piece of equipment is meticulously maintained and strategically placed in our spacious facility to ensure optimal workout flow and comfort during your training sessions.'
      ],
      imageLeft: true
    },
    {
      id: 'spa',
      title: 'Luxury Spa Treatments',
      image: '/home/spa.png',
      imageAlt: 'Luxury Spa Treatments',
      description: [
        'Rejuvenate with our premium spa services delivered by certified wellness experts. Our spa sanctuary offers a comprehensive range of treatments designed to relax, restore, and revitalize your body and mind after intense workouts.',
        'From deep tissue and sports massages to aromatherapy and hydrotherapy, our wellness professionals customize each treatment to address your specific needs, helping you recover faster and perform better.'
      ],
      imageLeft: false
    },
    {
      id: 'trainers',
      title: 'Expert Personal Trainers',
      image: '/home/heroimg2.avif',
      imageAlt: 'Expert Personal Trainers',
      description: [
        'Transform your fitness journey with our dedicated personal training specialists. Our elite team of certified trainers brings diverse expertise in strength training, weight management, sports conditioning, rehabilitation, and holistic wellness.',
        'Each trainer is committed to creating personalized programs that align with your unique goals, preferences, and lifestyle. With their guidance, you\'ll experience accelerated results while learning proper techniques that prevent injury and ensure long-term success.'
      ],
      imageLeft: true
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <h2 className="text-4xl font-bold text-white text-center mb-6">About Us</h2>
          <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-16">
            <span className="text-red-500 font-semibold">About Latest Fitness</span> - 
            Hawassa's most exclusive fitness and wellness sanctuary, where luxury meets health in perfect harmony.
          </p>
        </motion.div>

        {/* Map through the content array to generate sections */}
        {aboutContent.map((content, index) => (
          <motion.div 
            key={content.id}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            {/* Image Section - Order changes based on imageLeft property */}
            <div className={`${content.imageLeft ? 'order-2 md:order-1' : 'order-2'}`}>
              <img 
                src={content.image} 
                alt={content.imageAlt} 
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
            
            {/* Text Section - Order changes based on imageLeft property */}
            <div className={`${content.imageLeft ? 'order-1 md:order-2' : 'order-1'}`}>
              <h3 className="text-2xl font-semibold text-white mb-4">{content.title}</h3>
              {content.description.map((paragraph, i) => (
                <p key={i} className={`text-gray-300 ${i < content.description.length - 1 ? 'mb-6' : ''}`}>
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AboutSection;