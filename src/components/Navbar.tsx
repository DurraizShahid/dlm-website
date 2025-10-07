"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/LanguageContext";

const Navbar = () => {
  const { language, setLanguage, translate } = useLanguage();

  const navLinks = [
    { name: translate("Home"), path: "/" },
    { name: translate("About"), path: "/about" },
    { name: translate("How It Works"), path: "/how-it-works" },
    { name: translate("FAQ"), path: "/faq" },
    { name: translate("Apply"), path: "/apply" },
    { name: translate("Dashboard"), path: "/dashboard" },
  ];

  const handleLanguageChange = (newLang: 'en' | 'ur') => {
    setLanguage(newLang);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/logo.png" 
            alt="DLM Logo" 
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
            >
              {link.name}
            </Link>
          ))}
          
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Select language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleLanguageChange('en')} className={language === 'en' ? 'font-bold' : ''}>
                {translate("English")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('ur')} className={language === 'ur' ? 'font-bold' : ''}>
                {translate("Urdu")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Select language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleLanguageChange('en')} className={language === 'en' ? 'font-bold' : ''}>
                {translate("English")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('ur')} className={language === 'ur' ? 'font-bold' : ''}>
                {translate("Urdu")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">{translate("Toggle navigation menu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 py-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-lg font-medium text-gray-700 hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;