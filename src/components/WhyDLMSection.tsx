"use client";

import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const WhyDLMSection = () => {
  const { translate } = useLanguage();

  return (
    <section className="bg-white text-gray-900 py-16 px-4 sm:py-24 sm:px-8 text-center">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
          {translate("We’re Here for Dreamers Nobody Else Believes In.")}
        </h2>
        <p className="text-md sm:text-xl italic opacity-90 text-gray-600">
          Hum un khwab dekhne walon ke liye hain jin par koi aur yaqeen nahi karta.
        </p>
        <p className="text-lg sm:text-xl text-gray-700">
          {translate("Not everyone has family connections, investors, or startup backing. DLM exists for people like you—students, hustlers, creators, innovators—who just need one chance.")}
        </p>
        <p className="text-md sm:text-xl italic opacity-90 text-gray-600">
          Har kisi ke paas family connections, investors, ya startup backing nahi hoti. DLM aap jaise logon ke liye hai—talib-e-ilm, mehnatkash, creators, innovators—jinhe bas ek mauqa chahiye.
        </p>
        <p className="text-lg sm:text-xl text-gray-700 pt-4">
          It's an initiative that helps people improve themselves, their professionalism and their ideas through guidance, mentorship, and exposure.
        </p>
        <p className="text-md sm:text-xl italic opacity-90 text-gray-600">
          Ye ek initiative hai jo logon ko apne aap ko, apne professionalism ko, aur apne ideas ko improve karne mein help karta hai — guidance, mentorship, aur exposure ke zariye.
        </p>
        <p className="text-xl sm:text-2xl font-bold text-green-600 pt-4">
          {translate("This isn't charity. This is opportunity.")}
        </p>
      </div>
    </section>
  );
};

export default WhyDLMSection;