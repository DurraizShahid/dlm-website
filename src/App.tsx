import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Apply from "./pages/Apply";
import Login from "./pages/Login"; // New import
import Dashboard from "./pages/Dashboard"; // New import
import Admin from "./pages/Admin"; // New import
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./i18n/LanguageContext";
import { SessionContextProvider } from "./components/SessionContextProvider"; // New import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <BrowserRouter>
          <SessionContextProvider> {/* Wrap with SessionContextProvider */}
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/login" element={<Login />} /> {/* New route */}
              <Route path="/dashboard" element={<Dashboard />} /> {/* New route */}
              <Route path="/admin" element={<Admin />} /> {/* New route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SessionContextProvider>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;