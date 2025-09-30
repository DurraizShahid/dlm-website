"use client";

import React from "react";
import HeroSection from "@/components/HeroSection";
import WhyDLMSection from "@/components/WhyDLMSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import UrgencySection from "@/components/UrgencySection";
import SuccessStoriesSection from "@/components/SuccessStoriesSection";
import FinalPunchSection from "@/components/FinalPunchSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100"> {/* Removed gradient and text-white from here */}
      <HeroSection />
      <WhyDLMSection />
      <HowItWorksSection />
      <UrgencySection />
      <SuccessStoriesSection />
      <FinalPunchSection />
    </div>
  );
};

export default Index;