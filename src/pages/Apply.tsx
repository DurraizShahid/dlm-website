"use client";

import React from "react";
import ApplyForm from "@/components/ApplyForm";
// import { MadeWithDyad } from "@/components/made-with-dyad"; // Removed

const Apply = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900">
      <ApplyForm />
      {/* <MadeWithDyad /> */} {/* Removed */}
    </div>
  );
};

export default Apply;