"use client";

import React from "react";
import AboutContent from "@/components/AboutContent";
import { MadeWithDyad } from "@/components/made-with-dyad";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <AboutContent />
      <MadeWithDyad />
    </div>
  );
};

export default About;