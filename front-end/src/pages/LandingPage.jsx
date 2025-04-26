import React from 'react';
import Navbar from '../components/ui/Navbar';
import HeroSection from '../components/sections/HeroSection';
import AboutSection from '../components/sections/AboutSection';
import ServicesSection from '../components/sections/ServicesSection';
import TeamSection from '../components/sections/TeamSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import ContactSection from '../components/sections/ContactSection';
import Footer from '../components/ui/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection /> 
      <AboutSection />
      <ServicesSection />
      <TeamSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
