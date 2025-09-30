"use client";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4 sm:p-8">
      <div className="text-center max-w-4xl space-y-8">
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight animate-fade-in-up">
          Your Idea Deserves the Spotlight—This is Your Chance.
        </h1>
        <p className="text-lg sm:text-2xl text-gray-300 animate-fade-in-up delay-200">
          Funding. Recognition. Opportunity. Don’t Miss Out.
        </p>
        <p className="text-md sm:text-xl text-gray-400 animate-fade-in-up delay-400">
          Pakistan’s First Platform Built for You—Apply Now.
        </p>
        <div className="pt-8 animate-fade-in-up delay-600">
          <Link to="/apply">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75">
              Submit My Idea Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;