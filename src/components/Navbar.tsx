"use client";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Globe, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSession } from "@/components/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

const Navbar = () => {
  const { language, setLanguage, translate } = useLanguage();
  const { session, isAdmin } = useSession();
  const navigate = useNavigate(); // Keep navigate for other potential uses, though not for logout redirect

  const navLinks = [
    { name: translate("Home"), path: "/" },
    { name: translate("About"), path: "/about" },
    { name: translate("How It Works"), path: "/how-it-works" },
    { name: translate("FAQ"), path: "/faq" },
  ];

  const handleLanguageChange = (newLang: 'en' | 'ur') => {
    setLanguage(newLang);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(translate(`Logout failed: ${error.message}`));
    } else {
      showSuccess(translate("Logged out successfully!"));
      // Navigation is now handled by SessionContextProvider's onAuthStateChange listener
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center font-bold text-xl text-green-700 dark:text-green-400">
          DLM
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
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" className="text-sm font-medium text-gray-700 transition-colors hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400">
                <LayoutDashboard className="mr-2 h-4 w-4" /> {translate("Admin Dashboard")}
              </Button>
            </Link>
          )}
          <Link to="/apply">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-4 py-2 rounded-full text-sm shadow-md transition-all duration-300 ease-in-out hover:scale-105">
              {translate("Apply")}
            </Button>
          </Link>
          {session ? (
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" /> {translate("Logout")}
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" /> {translate("Login")}
              </Button>
            </Link>
          )}
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
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" className="text-lg font-medium text-gray-700 hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400 w-full justify-start">
                      <LayoutDashboard className="mr-2 h-5 w-5" /> {translate("Admin Dashboard")}
                    </Button>
                  </Link>
                )}
                <Link to="/apply">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-4 py-2 rounded-full text-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105 mt-4 w-full">
                    {translate("Apply")}
                  </Button>
                </Link>
                {session ? (
                  <Button variant="outline" size="lg" onClick={handleLogout} className="flex items-center gap-2 mt-4 w-full">
                    <LogOut className="h-5 w-5" /> {translate("Logout")}
                  </Button>
                ) : (
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="flex items-center gap-2 mt-4 w-full">
                      <LogIn className="h-5 w-5" /> {translate("Login")}
                    </Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;