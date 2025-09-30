"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Users, Crown, DollarSign } from "lucide-react";

const HowItWorksContent = () => {
  const steps = [
    {
      icon: <FileText className="h-12 w-12 text-yellow-500" />,
      title: "1. Submit Your Idea",
      description: "Fill out our quick and easy online form. No complicated pitch decks or jargon needed—just tell us your vision in simple terms.",
    },
    {
      icon: <Users className="h-12 w-12 text-yellow-500" />,
      title: "2. Get Shortlisted",
      description: "Our expert judges and the DLM community will review all submissions and select the most promising ideas to move forward.",
    },
    {
      icon: <Crown className="h-12 w-12 text-yellow-500" />,
      title: "3. Final Showdown",
      description: "The top ideas will battle it out in a thrilling final round, showcasing their potential to a wider audience and our panel.",
    },
    {
      icon: <DollarSign className="h-12 w-12 text-yellow-500" />,
      title: "4. Win Das Lakh",
      description: "The winning idea walks away with 10 Lakh Rupees in funding, invaluable mentorship, and the recognition needed to turn their dream into reality.",
    },
  ];

  return (
    <section className="bg-white text-gray-900 py-16 px-4 sm:py-24 sm:px-8 text-center">
      <div className="max-w-5xl mx-auto space-y-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-8">
          Simple. Transparent. Life-Changing.
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-md border border-gray-200 transform transition-all duration-300 hover:scale-105">
              <div className="mb-4 flex justify-center">{step.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">{step.title}</h3>
              <p className="text-md sm:text-lg text-gray-700 mb-6">{step.description}</p>
              <Link to="/apply">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-full text-md shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75">
                  Apply Now Before It’s Too Late
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksContent;