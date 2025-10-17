"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const FinalPunchSection = () => {
  const { translate } = useLanguage();

  return (
    <section className="text-white py-16 px-4 sm:py-24 sm:px-8 text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
          {translate("Opportunities Like This Don't Come Twice.")}
        </h2>
        <p className="text-lg sm:text-xl italic opacity-90">
          {translate("Aise mauqe baar baar nahi milte.")}
        </p>
        <p className="text-lg sm:text-xl pt-6">
          It's an initiative that helps people improve themselves, their professionalism and their ideas through guidance, mentorship, and exposure.
        </p>
        <p className="text-md sm:text-xl italic opacity-90">
          Ye ek initiative hai jo logon ko apne aap ko, apne professionalism ko, aur apne ideas ko improve karne mein help karta hai — guidance, mentorship, aur exposure ke zariye.
        </p>
        <div className="pt-8">
          <Link to="/apply">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75">
              {translate("Submit Your Idea Today")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalPunchSection;