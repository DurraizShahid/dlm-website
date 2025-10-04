import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/i18n/LanguageContext';
import { translations } from '@/i18n/translations';
import { supabase } from '@/integrations/supabase/client';
import { generateVideoSignedUrl } from '@/utils/videoUtils';
import { 
  FileText, 
  Video, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  BookOpen,
  Download,
  PlayCircle,
  User,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface Application {
  id: string;
  full_name: string;
  email: string;
  idea_title: string;
  idea_description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  created_at: string;
  video_url?: string; // This is now a file path, not a full URL
}

interface UserDashboardProps {
  applications?: Application[];
  userEmail?: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ applications: propApplications, userEmail }) => {
  const { language } = useLanguage();
  const [applications, setApplications] = useState<Application[]>(propApplications || []);
  const [loadingData, setLoadingData] = useState(false);

  const translate = (key: keyof typeof translations) => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  // Function to handle video viewing
  const handleViewVideo = async (filePath: string) => {
    try {
      const signedUrl = await generateVideoSignedUrl(filePath);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        toast.error('Error loading video. Please try again.');
      }
    } catch (error) {
      console.error('Error opening video:', error);
      toast.error('Error opening video.');
    }
  };

  // Use provided applications or fetch if needed
  useEffect(() => {
    if (!propApplications && userEmail) {
      fetchUserData();
    }
  }, [userEmail, propApplications]);

  const fetchUserData = async () => {
    if (!userEmail) return;
    
    try {
      setLoadingData(true);

      const { data: appsData, error: appsError } = await (supabase as any)
        .from('application_submissions')
        .select('*')
        .eq('email', userEmail)
        .order('created_at', { ascending: false });

      if (appsError) {
        console.error('Error fetching applications:', appsError);
        toast.error('Error loading your applications');
      } else {
        setApplications(appsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            <Eye className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-600 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'pending': return 25;
      case 'under_review': return 50;
      case 'approved': return 100;
      case 'rejected': return 0;
      default: return 0;
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 rounded-full p-2">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Welcome, {userEmail}</h1>
                <p className="text-sm text-gray-600">Manage your applications and access learning resources</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'} size="sm">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="applications" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>My Applications</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Learning Resources</span>
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            {applications.length === 0 ? (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  You haven't submitted any applications yet. <a href="/apply" className="underline text-blue-600">Submit your first application</a> to get started!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-6">
                {applications.map((app) => (
                  <Card key={app.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{app.idea_title}</CardTitle>
                          <CardDescription className="mt-1">
                            Submitted on {new Date(app.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Application Progress</h4>
                        <Progress value={getStatusProgress(app.status)} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {app.status === 'pending' && 'Your application is being reviewed by our team'}
                          {app.status === 'under_review' && 'Your application is currently under detailed review'}
                          {app.status === 'approved' && 'Congratulations! Your application has been approved'}
                          {app.status === 'rejected' && 'Unfortunately, your application was not selected this time'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Idea Description</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">{app.idea_description}</p>
                      </div>

                      {app.video_url && (
                        <div className="flex items-center space-x-2">
                          <Video className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Video submission attached</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewVideo(app.video_url!)}
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            View Video
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Dummy booklets for now */}
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Business Planning Guide</CardTitle>
                  <Badge variant="outline" className="w-fit">Business</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">A comprehensive guide to creating a successful business plan</p>
                  <Button variant="default" size="sm" className="flex-1">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">Marketing Strategies</CardTitle>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Premium
                    </Badge>
                  </div>
                  <Badge variant="outline" className="w-fit">Marketing</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">Effective marketing strategies for small businesses</p>
                  <Button variant="outline" size="sm" className="flex-1" disabled>
                    <Download className="h-3 w-3 mr-1" />
                    Premium Content
                  </Button>
                  <p className="text-xs text-gray-500">
                    This content will be available after your application is approved.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;