"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQContent = () => {
  const faqs = [
    {
      question: "Do I need a registered business to apply?",
      answer: "No. Anyone with an idea can apply—students, workers, freelancers, creators. We believe great ideas can come from anywhere.",
    },
    {
      question: "How many people will win?",
      answer: "At least one winner will be selected per cycle, receiving the 10 Lakh Rupees. However, we also spotlight other top ideas for future opportunities and mentorship.",
    },
    {
      question: "Is there any fee to apply?",
      answer: "No, applying to DLM is 100% free. Our goal is to remove barriers, not create them.",
    },
    {
      question: "What if my idea isn’t “big enough”?",
      answer: "Doesn’t matter. We value impact and innovation more than the perceived 'size' of an idea. Small ideas can lead to big changes.",
    },
    {
      question: "What kind of ideas are you looking for?",
      answer: "We're looking for innovative, impactful, and feasible ideas that can make a difference. Whether it's a tech solution, a social enterprise, a creative project, or a local business, we want to hear it!",
    },
  ];

  return (
    <section className="bg-white text-gray-900 py-16 px-4 sm:py-24 sm:px-8 text-center">
      <div className="max-w-3xl mx-auto space-y-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-8">
          Frequently Asked Questions
        </h1>

        <div className="text-left">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg sm:text-xl font-semibold text-green-700 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-md sm:text-lg text-gray-700 pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="pt-8">
          <Link to="/apply">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75">
              Don’t Wait – Apply Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQContent;