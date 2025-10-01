"use client";

import React from "react";
import ApplyForm from "@/components/ApplyForm";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Apply = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900">
      <ApplyForm />
      <MadeWithDyad />
    </div>
  );
};

export default Apply;