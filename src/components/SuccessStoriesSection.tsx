"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const SuccessStoriesSection = () => {
  const { translate } = useLanguage();

  const stories = [
    {
      name: "Ali, 22",
      description: "Built his first business with DLM support.",
      image: "https://via.placeholder.com/150/FFD700/000000?text=Ali", // Placeholder image
    },
    {
      name: "Sana, 19",
      description: "Turned a university project into a funded startup.",
      image: "https://via.placeholder.com/150/FFD700/000000?text=Sana", // Placeholder image
    },
    {
      name: "Ahmed, 25",
      description: "Launched a tech solution for local farmers.",
      image: "https://via.placeholder.com/150/FFD700/000000?text=Ahmed", // Placeholder image
    },
  ];

  return (
    <section className="text-white py-16 px-4 sm:py-24 sm:px-8 text-center">
      <div className="max-w-5xl mx-auto space-y-12">
        <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white">
          {translate("Be the Next Success Story Everyone Talks About.")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-lg transform transition-all duration-300 hover:scale-105 border border-gray-200">
              <img src={story.image} alt={story.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-yellow-500" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                {story.name}
              </h3>
              <p className="text-md sm:text-lg text-gray-700">{story.description}</p>
            </div>
          ))}
        </div>
        <div className="pt-8">
          <Link to="/apply">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75">
              <Sparkles className="mr-2 h-5 w-5" /> {translate("Your Story Could Be Next – Apply Now")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;