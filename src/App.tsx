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
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Login from "./pages/Login"; // Import Login page
import AdminDashboard from "./pages/AdminDashboard"; // Import AdminDashboard
import { LanguageProvider } from "./i18n/LanguageContext";
import { SessionContextProvider } from "./components/SessionContextProvider"; // Import SessionContextProvider
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <SessionContextProvider> {/* Wrap with SessionContextProvider */}
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/login" element={<Login />} /> {/* Add Login route */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              /> {/* Add Protected Admin Dashboard route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SessionContextProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;