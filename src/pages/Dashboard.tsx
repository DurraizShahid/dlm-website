import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';
import { translations } from '@/i18n/translations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import UserDashboard from '@/components/UserDashboard';

interface Application {
  id: string;
  full_name: string;
  email: string;
  idea_title: string;
  idea_description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  created_at: string;
  video_url?: string;
}

const Dashboard = () => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const translate = (key: keyof typeof translations) => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('application_submissions')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast.error('Error accessing your applications. Please try again.');
        return;
      }

      if (!data || data.length === 0) {
        toast.error('No applications found for this email address.');
        return;
      }

      setApplications(data);
      setIsLoggedIn(true);
      toast.success(`Found ${data.length} application(s) for ${email}`);

    } catch (error) {
      console.error('Dashboard access error:', error);
      toast.error('Error accessing dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return <UserDashboard applications={applications} userEmail={email} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-4 px-3 sm:py-12 sm:px-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <Card className="shadow-lg sm:shadow-2xl border-0 mx-auto">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold mb-2">
              Access Your Dashboard
            </CardTitle>
            <CardDescription className="text-blue-100 text-sm sm:text-base">
              Enter your email to view your applications
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter the email you used to apply"
                  className="h-11 sm:h-12 border-2 border-gray-200 focus:border-blue-500 text-base"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-200"
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