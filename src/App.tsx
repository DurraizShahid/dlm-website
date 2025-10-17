import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Academy from "./pages/Academy";
import Apply from "./pages/Apply";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./i18n/LanguageContext";
import { useLanguage } from "./i18n/LanguageContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const { translate } = useLanguage();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/academy" element={<Academy />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Simple Footer with Terms & Privacy Links */}
      <footer className="py-4 text-center text-sm text-gray-600 border-t">
        <div className="container mx-auto">
          <Link to="/terms" className="text-gray-600 hover:text-green-700 mx-2">
            {translate("Terms")}
          </Link>
          <span>|</span>
          <Link to="/privacy" className="text-gray-600 hover:text-green-700 mx-2">
            {translate("Privacy")}
          </Link>
        </div>
      </footer>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;