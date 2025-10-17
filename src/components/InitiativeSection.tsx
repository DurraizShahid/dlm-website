"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { GraduationCap, Users, TrendingUp } from "lucide-react";

const InitiativeSection = () => {
  const { translate } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white py-16 px-4 sm:py-24 sm:px-8 w-full">
      <div className="w-full px-4 sm:px-8 lg:px-16">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            {translate("What Makes DLM Different?")}
          </h2>
          <p className="text-md sm:text-xl italic opacity-90">
            DLM Ko Alag Kya Banata Hai?
          </p>

          {/* Initiative Description - Main Content */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 sm:p-12 lg:p-16 mt-8 max-w-6xl mx-auto">
            <p className="text-2xl sm:text-3xl lg:text-4xl leading-relaxed font-medium mb-6">
              It's an initiative that helps people improve themselves, their professionalism and their ideas through guidance, mentorship, and exposure.
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl italic opacity-90 leading-relaxed">
              Ye ek initiative hai jo logon ko apne aap ko, apne professionalism ko, aur apne ideas ko improve karne mein help karta hai — guidance, mentorship, aur exposure ke zariye.
            </p>
          </div>

          {/* Supporting Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12 max-w-6xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <GraduationCap className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">{translate("Guidance")}</h3>
              <p className="text-sm italic opacity-90">Rahnamai</p>
              <p className="text-sm mt-2 opacity-80">Expert guidebooks and learning materials</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <Users className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">{translate("Mentorship")}</h3>
              <p className="text-sm italic opacity-90">Mentorship</p>
              <p className="text-sm mt-2 opacity-80">One-on-one support from experienced entrepreneurs</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">{translate("Exposure")}</h3>
              <p className="text-sm italic opacity-90">Exposure</p>
              <p className="text-sm mt-2 opacity-80">Platform to showcase your ideas to the world</p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-8">
            <Link to="/academy">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75">
                {translate("Explore DLM Academy")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InitiativeSection;

