import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Removed Navigate
import Index from "./pages/Index";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Apply from "./pages/Apply";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./i18n/LanguageContext";
import { MadeWithDyad } from "./components/made-with-dyad";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/apply" element={<Apply />} /> {/* Apply is now public */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <MadeWithDyad />
      </BrowserRouter>
    </LanguageProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent /> {/* SessionContextProvider removed */}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;