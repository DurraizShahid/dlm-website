"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Handshake, Eye, Lightbulb } from "lucide-react";

const AboutContent = () => {
  const values = [
    {
      icon: <Handshake className="h-10 w-10 text-green-600" />,
      title: "Fairness",
      description: "Every idea counts, regardless of background or connections.",
      urduDescription: "Har khayal ahem hai, pas-manzar ya rabton se be-niyaz.",
    },
    {
      icon: <Eye className="h-10 w-10 text-green-600" />,
      title: "Transparency",
      description: "A clear process with no hidden agendas or biases.",
      urduDescription: "Aik wazeh amal jisme koi posheeda agenda ya ta'assub nahi.",
    },
    {
      icon: <Lightbulb className="h-10 w-10 text-green-600" />,
      title: "Empowerment",
      description: "Beyond funding, we provide mentorship and a spotlight for growth.",
      urduDescription: "Funding se barh kar, hum rehnumai aur taraqqi ke liye numayan mauqa faraham karte hain.",
    },
  ];

  return (
    <section className="bg-white text-gray-900 py-16 px-4 sm:py-24 sm:px-8 text-center">
      <div className="max-w-5xl mx-auto space-y-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-8">
          We Believe in the Power of Ordinary People with Extraordinary Ideas.
        </h1>
        <p className="text-lg sm:text-xl italic opacity-90 text-gray-600">
          Hum aam logon ki ghair-mamooli afkaar ki quwwat par yaqeen rakhte hain.
        </p>

        <div className="text-left space-y-6 max-w-3xl mx-auto">
          <p className="text-lg sm:text-xl text-gray-700">
            DLM started with one belief: talent is everywhere, but opportunity is not. Our mission is to break the cycle where only a privileged few get a chance. We are dedicated to finding and nurturing the raw potential within Pakistan's everyday dreamers.
          </p>
          <p className="text-md sm:text-lg italic opacity-90 text-gray-600">
            DLM ka aaghaz is yaqeen se hua: salahiyat har jagah hai, lekin mauqa nahi. Hamara maqsad is silsile ko torna hai jahan sirf chand khush-qismat logon ko mauqa milta hai. Hum Pakistan ke aam khwab dekhne walon ki bunyadi salahiyat ko talaash karne aur parwan charhane ke liye pur-azm hain.
          </p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            This is about leveling the playing field and giving everyone a fair shot.
          </p>
          <p className="text-lg sm:text-xl italic opacity-90 text-gray-600">
            Yeh maidan ko barabar karne aur har kisi ko aik munasib mauqa dene ke bare mein hai.
          </p>
        </div>

        <div className="pt-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">Our Core Values</h2>
          <p className="text-lg sm:text-xl italic opacity-90 text-gray-600 mb-8">
            Hamari Bunyadi Iqdaar
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-md border border-gray-200 transform transition-all duration-300 hover:scale-105">
                <div className="mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{value.title}</h3>
                <p className="text-md sm:text-lg text-gray-700">{value.description}</p>
                <p className="text-sm sm:text-md italic opacity-90 text-gray-600 mt-1">{value.urduDescription}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-12">
          <Link to="/apply">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75">
              Join the Movement – Apply Today
            </Button>
          </Link>
          <p className="text-md sm:text-lg italic opacity-90 text-gray-600 mt-4">
            Tehreek mein Shamil Hon – Aaj Hi Apply Karen
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutContent;