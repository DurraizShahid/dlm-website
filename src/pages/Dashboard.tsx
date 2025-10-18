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
    
    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam);
      setLoginIdentifier(decodedEmail);
      handleLoginAutomatically(decodedEmail, 'email');
    } else if (phoneParam) {
      const decodedPhone = decodeURIComponent(phoneParam);
      setLoginIdentifier(decodedPhone);
      handleLoginAutomatically(decodedPhone, 'phone');
    }
  }, [location]);

  const handleLoginAutomatically = async (identifier: string, type: 'email' | 'phone') => {
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

      setApplications(data);
      setIsLoggedIn(true);
      toast.success(`Found ${data.length} application(s) for ${identifier}`);

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
        toast.error(`No applications found for this ${isEmail ? 'email' : 'phone number'}.`);
        return;
      }

      setApplications(data);
      setIsLoggedIn(true);
      toast.success(`Found ${data.length} application(s) for ${loginIdentifier}`);

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
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-gray-900 transition-all duration-200"
              >
                {isLoading ? 'Checking...' : 'Access Dashboard'}
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