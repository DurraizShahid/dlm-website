"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FinalPunchSection = () => {
  return (
    <section className="text-white py-16 px-4 sm:py-24 sm:px-8 text-center"> {/* Removed gradient classes, text remains white */}
      <div className="max-w-4xl mx-auto space-y-8">
        <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
          Opportunities Like This Don’t Come Twice.
        </h2>
        <div className="pt-8">
          <Link to="/apply">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75">
              Submit Your Idea Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalPunchSection;