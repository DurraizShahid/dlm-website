"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { BookOpen, Users, TrendingUp, Award, GraduationCap, Lightbulb, Target, Rocket } from "lucide-react";

const Academy = () => {
  const { translate } = useLanguage();

  const learningBenefits = [
    {
      icon: BookOpen,
      title: "Expert Guidebooks",
      titleUr: "Maahir Guidebooks",
      description: "Comprehensive guides covering business fundamentals, planning, marketing, finance, and scaling",
      descriptionUr: "Business ke bunyadi usool, planning, marketing, finance, aur scaling par mukammal guides"
    },
    {
      icon: Users,
      title: "Mentorship Access",
      titleUr: "Mentorship Tak Rasai",
      description: "Connect with experienced entrepreneurs and business mentors who guide you through your journey",
      descriptionUr: "Tajurbakar entrepreneurs aur business mentors se juden jo aapke safar mein rahnamai karen"
    },
    {
      icon: TrendingUp,
      title: "Practical Skills",
      titleUr: "Amali Maharat",
      description: "Learn real-world skills that you can apply immediately to grow your business",
      descriptionUr: "Haqeeqi duniya ki maharat seekhen jo aap apne business ko barhane ke liye turant istimal kar saken"
    },
    {
      icon: Award,
      title: "Recognized Certification",
      titleUr: "Tasdeeq Shuda Certificate",
      description: "Receive certificates that demonstrate your commitment to entrepreneurial excellence",
      descriptionUr: "Certificates hasil karen jo entrepreneurial excellence ke liye aapki lagan ko zahir karte hain"
    }
  ];

  const guidebookTopics = [
    { title: "Getting Started", titleUr: "Shuruat", icon: Rocket },
    { title: "Business Planning", titleUr: "Business Planning", icon: Target },
    { title: "Marketing Strategies", titleUr: "Marketing Strategies", icon: Lightbulb },
    { title: "Financial Management", titleUr: "Maaliyat Ka Nizam", icon: TrendingUp },
    { title: "Growth & Scaling", titleUr: "Taraqqi Aur Scale", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:py-24 sm:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-full">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
            {translate("DLM Academy")}
          </h1>
          <p className="text-lg sm:text-2xl text-gray-700 max-w-3xl mx-auto">
            {translate("Learn, Grow, and Transform Your Business Ideas into Reality")}
          </p>
          <p className="text-md sm:text-xl italic opacity-90 text-gray-600">
            Seekhen, Barhen, Aur Apne Business Ideas Ko Haqeeqat Mein Badlen
          </p>

          <div className="pt-6 max-w-4xl mx-auto">
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">
              {translate("More than just a competition, DLM is a complete learning ecosystem. We provide expert guidebooks, mentorship, and resources to help you become a better entrepreneur and bring your ideas to life.")}
            </p>
            <p className="text-md sm:text-lg italic opacity-90 text-gray-600 mt-3">
              Sirf muqabla nahi, DLM ek mukammal learning ecosystem hai. Hum expert guidebooks, mentorship, aur resources faraham karte hain taa ke aap ek behtar entrepreneur ban saken aur apne ideas ko zinda kar saken.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="bg-white py-16 px-4 sm:py-20 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
              {translate("What You'll Learn")}
            </h2>
            <p className="text-md sm:text-xl italic opacity-90 text-gray-600">
              Aap Kya Seekhenge
            </p>
            <p className="text-lg text-gray-700 mt-4 max-w-3xl mx-auto">
              {translate("Access world-class business education designed specifically for Pakistani entrepreneurs")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {learningBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-shadow duration-300 border-2">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{benefit.title}</CardTitle>
                        <p className="text-sm italic text-gray-600">{benefit.titleUr}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{benefit.description}</p>
                    <p className="text-sm italic text-gray-600 mt-2">{benefit.descriptionUr}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guidebook Topics Section */}
      <section className="py-16 px-4 sm:py-20 sm:px-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
              {translate("Our Guidebook Collection")}
            </h2>
            <p className="text-md sm:text-xl italic opacity-90 text-gray-600">
              Hamari Guidebook Collection
            </p>
            <p className="text-lg text-gray-700 mt-4">
              {translate("Comprehensive guides covering every aspect of building and growing a successful business")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {guidebookTopics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200 border-2 hover:border-green-400">
                  <CardHeader className="pb-3">
                    <div className="flex justify-center mb-2">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-base">{topic.title}</CardTitle>
                    <p className="text-xs italic text-gray-600">{topic.titleUr}</p>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 italic">
              {translate("...and many more resources available when you join!")}
            </p>
            <p className="text-xs text-gray-500 italic">
              ...aur jab aap shamil honge to bohat se resources mojood hain!
            </p>
          </div>
        </div>
      </section>

      {/* How to Access Section */}
      <section className="bg-white py-16 px-4 sm:py-20 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
              {translate("How to Access Academy Resources")}
            </h2>
            <p className="text-md sm:text-xl italic opacity-90 text-gray-600">
              Academy Resources Tak Kaise Pahunchen
            </p>
          </div>

          <div className="space-y-8">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  <span>{translate("Submit Your Application")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-2">
                  {translate("Start by submitting your business idea through our application form. It's quick, simple, and completely free to apply.")}
                </p>
                <p className="text-sm italic text-gray-600">
                  Apni business idea hamari application form ke zariye submit karen. Ye tez, asan, aur bilkul muft hai.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  <span>{translate("Get Approved or Make Payment")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-2">
                  {translate("Once your application is reviewed and approved, or after completing the registration payment, you unlock full access to all learning resources.")}
                </p>
                <p className="text-sm italic text-gray-600">
                  Jab aapki application review aur approve ho jaye, ya registration payment mukammal karne ke baad, aapko tamam learning resources tak mukammal rasai mil jati hai.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  <span>{translate("Access Your Dashboard")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-2">
                  {translate("Log into your personal dashboard to download guidebooks, track your progress, and access exclusive content.")}
                </p>
                <p className="text-sm italic text-gray-600">
                  Apne personal dashboard mein login karen guidebooks download karne, apni taraqqi track karne, aur exclusive content tak rasai pane ke liye.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Free Resources Highlight */}
      <section className="py-16 px-4 sm:py-20 sm:px-8 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold">
            {translate("Some Resources Are Free!")}
          </h2>
          <p className="text-md sm:text-xl italic opacity-90">
            Kuch Resources Bilkul Muft Hain!
          </p>
          <p className="text-lg sm:text-xl">
            {translate("We believe in giving everyone a head start. That's why select guidebooks are available for free to all visitors, even before you apply.")}
          </p>
          <p className="text-md sm:text-lg italic opacity-90">
            Hum yaqeen rakhte hain ke har kisi ko ek shuruat milni chahiye. Isliye kuch guidebooks tamam visitors ke liye bilkul muft hain, apply karne se pehle bhi.
          </p>
          <div className="pt-6">
            <Link to="/dashboard">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105">
                {translate("Browse Free Resources")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 sm:py-24 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            {translate("Ready to Start Your Learning Journey?")}
          </h2>
          <p className="text-md sm:text-xl italic opacity-90 text-gray-600">
            Apne Seekhne Ke Safar Ko Shuru Karne Ke Liye Tayyar Hain?
          </p>
          
          <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-2xl p-8 text-left">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {translate("What Happens After You Apply:")}
            </h3>
            <p className="text-sm italic text-gray-600 mb-4">
              Application Ke Baad Kya Hota Hai:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <span className="font-medium">Instant access to free guidebooks</span>
                  <p className="text-sm italic text-gray-600">Muft guidebooks tak turant rasai</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <span className="font-medium">Full library unlocked after approval or payment</span>
                  <p className="text-sm italic text-gray-600">Approval ya payment ke baad puri library unlock ho jati hai</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <span className="font-medium">Personalized dashboard to track your progress</span>
                  <p className="text-sm italic text-gray-600">Apni taraqqi track karne ke liye personal dashboard</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <span className="font-medium">Opportunity to win 10 Lakh Rupees</span>
                  <p className="text-sm italic text-gray-600">10 Lakh Rupees jeetne ka mauqa</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/apply">
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75 w-full sm:w-auto">
                {translate("Apply Now & Start Learning")}
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-lg sm:text-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-75 w-full sm:w-auto">
                {translate("View Free Resources")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Initiative Description */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4 sm:py-20 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-2xl sm:text-4xl font-bold">
            {translate("It's More Than Just Funding")}
          </h3>
          <p className="text-md sm:text-lg italic opacity-90">
            Ye Sirf Funding Se Zyada Hai
          </p>
          <p className="text-lg sm:text-xl leading-relaxed">
            It's an initiative that helps people improve themselves, their professionalism and their ideas through guidance, mentorship, and exposure.
          </p>
          <p className="text-md sm:text-lg italic opacity-90">
            Ye ek initiative hai jo logon ko apne aap ko, apne professionalism ko, aur apne ideas ko improve karne mein help karta hai — guidance, mentorship, aur exposure ke zariye.
          </p>
          <div className="pt-6">
            <p className="text-xl sm:text-2xl font-bold text-yellow-400">
              {translate("Transform yourself while transforming your business")}
            </p>
            <p className="text-sm sm:text-md italic opacity-90 text-yellow-300 mt-2">
              Apne business ko tabdeel karte waqt khud ko bhi tabdeel karen
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Academy;

