"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Globe, LogIn, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSession } from "@/components/SessionContextProvider"; // New import
import { signOut } from "@/integrations/supabase/auth"; // New import
import { showError, showSuccess } from "@/utils/toast"; // New import

const Navbar = () => {
  const { language, setLanguage, translate } = useLanguage();
  const { session, user, isAdmin, isLoading } = useSession(); // Get session and user info

  const navLinks = [
    { name: translate("Home"), path: "/" },
    { name: translate("About"), path: "/about" },
    { name: translate("How It Works"), path: "/how-it-works" },
    { name: translate("FAQ"), path: "/faq" },
  ];

  const handleLanguageChange = (newLang: 'en' | 'ur') => {
    setLanguage(newLang);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showSuccess(translate("You have been signed out."));
    } catch (error: any) {
      showError(error.message || translate("Failed to sign out."));
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
          {!session && (
            <Link to="/apply">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-4 py-2 rounded-full text-sm shadow-md transition-all duration-300 ease-in-out hover:scale-105">
                {translate("Apply")}
              </Button>
            </Link>
          )}
          
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <UserIcon className="h-5 w-5" />
                  <span className="sr-only">{translate("User menu")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {translate("Admin Panel")}
                    </Link>
                  </DropdownMenuItem>
                )}
                {!isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {translate("Dashboard")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  {translate("Sign Out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="icon">
                <LogIn className="h-5 w-5" />
                <span className="sr-only">{translate("Sign In")}</span>
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
                {!session && (
                  <Link to="/apply">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-4 py-2 rounded-full text-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105 mt-4 w-full">
                      {translate("Apply")}
                    </Button>
                  </Link>
                )}
                {session ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin">
                        <Button variant="ghost" className="w-full justify-start text-lg">
                          <LayoutDashboard className="mr-2 h-5 w-5" />
                          {translate("Admin Panel")}
                        </Button>
                      </Link>
                    )}
                    {!isAdmin && (
                      <Link to="/dashboard">
                        <Button variant="ghost" className="w-full justify-start text-lg">
                          <LayoutDashboard className="mr-2 h-5 w-5" />
                          {translate("Dashboard")}
                        </Button>
                      </Link>
                    )}
                    <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start text-lg text-red-600">
                      <LogOut className="mr-2 h-5 w-5" />
                      {translate("Sign Out")}
                    </Button>
                  </>
                ) : (
                  <Link to="/login">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-full text-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105 mt-4">
                      <LogIn className="mr-2 h-5 w-5" />
                      {translate("Sign In")}
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