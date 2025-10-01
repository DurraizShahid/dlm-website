"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Send, Users, Trophy } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <Send className="h-12 w-12 text-yellow-500" />,
      title: "Submit your idea online",
      description: "Simple form, no jargon. Tell us your vision.",
    },
    {
      icon: <Users className="h-12 w-12 text-yellow-500" />,
      title: "Get shortlisted",
      description: "Our team and community will vote for the best ideas.",
    },
    {
      icon: <Trophy className="h-12 w-12 text-yellow-500" />,
      title: "Win Das Lakh",
      description: "Receive funding, mentorship, and recognition to grow.",
    },
  ];

  return (
    <section className="text-white py-16 px-4 sm:py-24 sm:px-8 text-center">
      <div className="max-w-5xl mx-auto space-y-12">
        <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-xl transform transition-all duration-300 hover:scale-105 border border-gray-200">
              <div className="mb-4 flex justify-center">{step.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900"> {/* Changed text color to gray-900 (black) */}
                {step.title}
              </h3>
              <p className="text-md sm:text-lg text-gray-700">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="pt-8">
          <Link to="/apply">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75">
              Apply Now – Limited Spots
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;