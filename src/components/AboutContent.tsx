"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Handshake, Eye, Lightbulb } from "lucide-react";

const AboutContent = () => {
  const values = [
    {
      icon: <Handshake className="h-10 w-10 text-green-600" />,
      title: "Fairness",
      description: "Every idea counts, regardless of background or connections.",
    },
    {
      icon: <Eye className="h-10 w-10 text-green-600" />,
      title: "Transparency",
      description: "A clear process with no hidden agendas or biases.",
    },
    {
      icon: <Lightbulb className="h-10 w-10 text-green-600" />,
      title: "Empowerment",
      description: "Beyond funding, we provide mentorship and a spotlight for growth.",
    },
  ];

  return (
    <section className="bg-white text-gray-900 py-16 px-4 sm:py-24 sm:px-8 text-center">
      <div className="max-w-5xl mx-auto space-y-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-8">
          We Believe in the Power of Ordinary People with Extraordinary Ideas.
        </h1>

        <div className="text-left space-y-6 max-w-3xl mx-auto">
          <p className="text-lg sm:text-xl text-gray-700">
            DLM started with one belief: talent is everywhere, but opportunity is not. Our mission is to break the cycle where only a privileged few get a chance. We are dedicated to finding and nurturing the raw potential within Pakistan's everyday dreamers.
          </p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            This is about leveling the playing field and giving everyone a fair shot.
          </p>
        </div>

        <div className="pt-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-md border border-gray-200 transform transition-all duration-300 hover:scale-105">
                <div className="mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{value.title}</h3>
                <p className="text-md sm:text-lg text-gray-700">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-12">
          <Link to="/apply">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75">
              Join the Movement – Apply Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutContent;