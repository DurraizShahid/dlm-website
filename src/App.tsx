import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Apply from "./pages/Apply";
import Login from "./pages/Login"; // Import Login page
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./i18n/LanguageContext";
import { SessionContextProvider, useSession } from "./components/SessionContextProvider"; // Import SessionContextProvider and useSession
import { MadeWithDyad } from "./components/made-with-dyad"; // Import MadeWithDyad

const queryClient = new QueryClient();

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return session ? children : <Navigate to="/login" />;
};

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
          <Route path="/login" element={<Login />} /> {/* Login page */}
          {/* Protected routes */}
          <Route
            path="/apply"
            element={
              <PrivateRoute>
                <Apply />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <MadeWithDyad /> {/* Add MadeWithDyad here to appear on all pages */}
      </BrowserRouter>
    </LanguageProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SessionContextProvider> {/* Wrap the entire app content with SessionContextProvider */}
        <AppContent />
      </SessionContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;