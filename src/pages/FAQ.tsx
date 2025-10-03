"use client";

import React from "react";
import FAQContent from "@/components/FAQContent";
// import { MadeWithDyad } from "@/components/made-with-dyad"; // Removed

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <FAQContent />
      {/* <MadeWithDyad /> */} {/* Removed */}
    </div>
  );
};

export default FAQ;