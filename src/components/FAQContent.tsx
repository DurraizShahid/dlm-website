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
      urduQuestion: "Kya apply karne ke liye mujhe registered business ki zaroorat hai?",
      answer: "No. Anyone with an idea can apply—students, workers, freelancers, creators. We believe great ideas can come from anywhere.",
      urduAnswer: "Nahi. Koi bhi shakhs jiske paas koi khayal ho, apply kar sakta hai—talib-e-ilm, mazdoor, freelancer, creators. Humara yaqeen hai ke behtareen afkaar kahin se bhi aa sakte hain.",
    },
    {
      question: "How many people will win?",
      urduQuestion: "Kitne log jeetenge?",
      answer: "At least one winner will be selected per cycle, receiving the 10 Lakh Rupees. However, we also spotlight other top ideas for future opportunities and mentorship.",
      urduAnswer: "Har cycle mein kam az kam aik winner muntakhib kiya jayega, jise 10 Lakh Rupees milenge. Taham, hum deegar behtareen afkaar ko bhi mustaqbil ke mauqon aur rehnumai ke liye numayan karte hain.",
    },
    {
      question: "Is there any fee to apply?",
      urduQuestion: "Kya apply karne ki koi fees hai?",
      answer: "No, applying to DLM is 100% free. Our goal is to remove barriers, not create them.",
      urduAnswer: "Nahi, DLM mein apply karna 100% muft hai. Hamara maqsad rukawaton ko khatam karna hai, na ke unhe banana.",
    },
    {
      question: "What if my idea isn’t “big enough”?",
      urduQuestion: "Agar mera khayal 'bohat bara' na ho to kya hoga?",
      answer: "Doesn’t matter. We value impact and innovation more than the perceived 'size' of an idea. Small ideas can lead to big changes.",
      urduAnswer: "Koi farq nahi parta. Hum kisi khayal ki 'size' se ziyada uske asar aur jadat ko ahmiyat dete hain. Chote afkaar bhi bare tabdeeliyan la sakte hain.",
    },
    {
      question: "What kind of ideas are you looking for?",
      urduQuestion: "Aap kis qism ke afkaar talash kar rahe hain?",
      answer: "We're looking for innovative, impactful, and feasible ideas that can make a difference. Whether it's a tech solution, a social enterprise, a creative project, or a local business, we want to hear it!",
      urduAnswer: "Hum aise jadid, asar-angez, aur qabil-e-amal afkaar talash kar rahe hain jo farq paida kar saken. Chahe woh koi tech solution ho, aik social enterprise, aik creative project, ya aik local business, hum use sunna chahte hain!",
    },
  ];

  return (
    <section className="bg-white text-gray-900 py-16 px-4 sm:py-24 sm:px-8 text-center">
      <div className="max-w-3xl mx-auto space-y-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-8">
          Frequently Asked Questions
        </h1>
        <p className="text-lg sm:text-xl italic opacity-90 text-gray-600 mb-8">
          Aksar Puche Jane Wale Sawalat
        </p>

        <div className="text-left">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg sm:text-xl font-semibold text-green-700 hover:no-underline">
                  {faq.question}
                  <span className="block text-sm sm:text-lg italic opacity-90 text-gray-600 mt-1">{faq.urduQuestion}</span>
                </AccordionTrigger>
                <AccordionContent className="text-md sm:text-lg text-gray-700 pt-2 pb-4">
                  {faq.answer}
                  <span className="block text-sm sm:text-md italic opacity-90 text-gray-600 mt-1">{faq.urduAnswer}</span>
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
          <p className="text-md sm:text-lg italic opacity-90 text-gray-600 mt-4">
            Intezar Na Karen – Abhi Apply Karen
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQContent;