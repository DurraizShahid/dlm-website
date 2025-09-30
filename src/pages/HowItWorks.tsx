"use client";

import React from "react";
import HowItWorksContent from "@/components/HowItWorksContent";
import { MadeWithDyad } from "@/components/made-with-dyad";

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <HowItWorksContent />
      <MadeWithDyad />
    </div>
  );
};

export default HowItWorks;