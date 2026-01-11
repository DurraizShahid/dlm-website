"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { trackInitiateApplication } from "@/utils/metaPixel";

const UrgencySection = () => {
  const { translate } = useLanguage();
  // Set the target date for the countdown to October 8th, 2025
  const targetDate = new Date('2025-10-15T00:00:00'); // October 8th, 2025, at midnight

  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date();
    let timeLeft: { days?: number; hours?: number; minutes?: number; seconds?: number } = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    const value = timeLeft[interval as keyof typeof timeLeft];
    if (value === undefined) {
      return null;
    }

    return (
      <span key={interval} className="text-3xl sm:text-5xl font-bold mx-2">
        {value}<span className="block text-sm sm:text-lg font-normal">{translate(interval)}</span>
      </span>
    );
  });

  return (
    <section className="bg-red-700 text-white py-16 px-4 sm:py-24 sm:px-8 text-center w-full">
      <div className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
          {translate("Applications close soon. If you don’t apply now, you’ll lose your shot.")}
        </h2>
        <p className="text-lg sm:text-xl italic opacity-90">
          Applications jald band ho jayengi. Agar aap abhi apply nahi karte, toh aap apna mauqa kho denge.
        </p>
        <div className="flex justify-center items-center mt-8">
          {timerComponents.length ? timerComponents : <span className="text-3xl sm:text-5xl font-bold">{translate("Time's Up!")}</span>}
        </div>
        <div className="pt-8">
          <Link to="/apply" onClick={() => trackInitiateApplication('urgency')}>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75">
              {translate("Claim My Spot Now")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UrgencySection;