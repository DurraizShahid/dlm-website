"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const HeroSection = () => {
  const { translate } = useLanguage();

  return (
    <section className="text-white py-16 px-4 sm:py-24 sm:px-8 w-full">
      <div className="text-center max-w-4xl mx-auto space-y-8">
        {/* Logo added here */}
        <div className="flex justify-center">
          <img 
            src="/logo.png" 
            alt="DLM Logo" 
            className="h-24 w-auto mb-6"
          />
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight animate-fade-in-up">
          {translate("Your Idea Deserves the Spotlight—This is Your Chance.")}
        </h1>
        <p className="text-lg sm:text-2xl animate-fade-in-up delay-200">
          {translate("Pakistan’s first platform giving everyday people the chance to win 10 Lakh Rupees to bring their idea to life.")}
        </p>
        <p className="text-md sm:text-xl animate-fade-in-up delay-200 italic opacity-90">
          {translate("Pakistan’s first platform giving everyday people the chance to win 10 Lakh Rupees to bring their idea to life.")}
        </p>
        <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up delay-600">
          <Link to="/apply">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75 w-full sm:w-auto">
              {translate("Submit My Idea Today")}
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-75 w-full sm:w-auto">
              {translate("Learn How It Works")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;