import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';
import { translations } from '@/i18n/translations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import UserDashboard from '@/components/UserDashboard';
import { useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import bcrypt from 'bcryptjs';

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  idea_title: string;
  idea_description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'unpaid' | 'paid';
  created_at: string;
  video_url?: string;
  payment_screenshot_url?: string;
}

const Dashboard = () => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  const translate = (key: keyof typeof translations) => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  // Check for email or phone parameter in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const emailParam = urlParams.get('email');
    const phoneParam = urlParams.get('phone');
    const autoLogin = urlParams.get('auto_login');
    
    // Check if user is already authenticated in session
    const isAuthenticated = sessionStorage.getItem('user_authenticated') === 'true';
    const sessionIdentifier = sessionStorage.getItem('user_identifier');
    
    if (isAuthenticated && sessionIdentifier) {
      // Auto-login from session
      const isEmail = sessionIdentifier.includes('@');
      handleLoginAutomatically(sessionIdentifier, isEmail ? 'email' : 'phone', true);
      return;
    }
    
    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam);
      setLoginIdentifier(decodedEmail);
      // Only auto-login if coming from password setup (auto_login=true)
      if (autoLogin === 'true') {
        handleLoginAutomatically(decodedEmail, 'email', true);
      }
    } else if (phoneParam) {
      const decodedPhone = decodeURIComponent(phoneParam);
      setLoginIdentifier(decodedPhone);
      // Only auto-login if coming from password setup (auto_login=true)
      if (autoLogin === 'true') {
        handleLoginAutomatically(decodedPhone, 'phone', true);
      }
    }
  }, [location]);

  const handleLoginAutomatically = async (identifier: string, type: 'email' | 'phone', skipPasswordCheck = false) => {
    if (!identifier.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const column = type === 'email' ? 'email' : 'phone_number';
      const { data, error } = await (supabase as any)
        .from('application_submissions')
        .select('*')
        .eq(column, identifier.toLowerCase().trim())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast.error('Error accessing your applications. Please try again.');
        return;
      }

      if (!data || data.length === 0) {
        toast.error(`No applications found for this ${type}.`);
        return;
      }

      // If skip password check (coming from password setup), auto-login
      if (skipPasswordCheck) {
        setApplications(data);
        setIsLoggedIn(true);
        toast.success(`Welcome! Found ${data.length} application(s)`);
      } else {
        // Otherwise require password
        toast.info('Please enter your password to continue.');
      }

    } catch (error) {
      console.error('Dashboard access error:', error);
      toast.error('Error accessing dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      toast.error('Please enter your email or phone number');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      // Try to detect if it's an email or phone number
      const isEmail = loginIdentifier.includes('@');
      const column = isEmail ? 'email' : 'phone_number';
      
      const { data, error } = await (supabase as any)
        .from('application_submissions')
        .select('*')
        .eq(column, loginIdentifier.toLowerCase().trim())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast.error('Error accessing your applications. Please try again.');
        return;
      }

      if (!data || data.length === 0) {
        toast.error(`No account found for this ${isEmail ? 'email' : 'phone number'}.`);
        return;
      }

      // Get the first application (they all share same CNIC/email/password)
      const userRecord = data[0];

      // Check if password is set
      if (!userRecord.password_hash) {
        toast.error('No password set for this account. Please contact support.');
        return;
      }

      // Verify password using bcrypt
      const passwordMatch = await bcrypt.compare(password, userRecord.password_hash);

      if (!passwordMatch) {
        toast.error('Incorrect password. Please try again.');
        setPassword('');
        return;
      }

      // Password is correct - login successful
      setApplications(data);
      setIsLoggedIn(true);
      
      // Store authentication in session
      sessionStorage.setItem('user_authenticated', 'true');
      sessionStorage.setItem('user_id', userRecord.id);
      sessionStorage.setItem('user_identifier', loginIdentifier);
      
      toast.success(`Welcome back! Found ${data.length} application(s)`);

    } catch (error) {
      console.error('Dashboard access error:', error);
      toast.error('Error accessing dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return <UserDashboard applications={applications} userEmail={loginIdentifier} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-4 px-3 sm:py-12 sm:px-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <Card className="shadow-lg sm:shadow-2xl border-0 mx-auto">
          <CardHeader className="text-center bg-gradient-to-r from-green-800 via-emerald-600 to-yellow-500 text-white rounded-t-lg p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold mb-2">
              Access Your Dashboard
            </CardTitle>
            <CardDescription className="text-green-100 text-sm sm:text-base">
              Enter your email or phone number to view your applications
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="loginIdentifier" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Phone Number
                </label>
                <Input
                  id="loginIdentifier"
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Enter your email or phone number"
                  className="h-11 sm:h-12 border-2 border-gray-200 focus:border-blue-500 text-base"
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11 sm:h-12 border-2 border-gray-200 focus:border-blue-500 text-base pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-gray-900 transition-all duration-200"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an application yet?{' '}
                <a href="/apply" className="text-blue-600 hover:text-blue-700 underline font-medium">
                  Submit one here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;