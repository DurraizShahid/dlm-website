import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/i18n/LanguageContext';
import { translations } from '@/i18n/translations';
import { supabase } from '@/integrations/supabase/client';
import { Guidebook } from '@/integrations/supabase/types';
import { generateVideoSignedUrl, generateScreenshotSignedUrl, generateGuidebookSignedUrl } from '@/utils/videoUtils';
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
  Settings,
  Lock,
  AlertCircle,
  MessageCircle,
  Upload,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface Application {
  id: string;
  full_name: string;
  email: string;
  idea_title: string;
  idea_description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'unpaid' | 'paid';
  created_at: string;
  video_url?: string;
  payment_screenshot_url?: string;
}

interface UserDashboardProps {
  applications?: Application[];
  userEmail?: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ applications: propApplications, userEmail }) => {
  const { language, translate } = useLanguage();
  const [applications, setApplications] = useState<Application[]>(propApplications || []);
  const [loadingData, setLoadingData] = useState(false);
  const [uploadingScreenshotId, setUploadingScreenshotId] = useState<string | null>(null);
  const [guidebooks, setGuidebooks] = useState<Guidebook[]>([]);
  const [loadingGuidebooks, setLoadingGuidebooks] = useState(false);

  // Check if user has at least one paid application
  const hasPaidApplication = useMemo(() => {
    return applications.some(app => app.status === 'paid');
  }, [applications]);

  // Check if user has at least one application with approved or pending status
  const hasApprovedOrPendingApplication = useMemo(() => {
    return applications.some(app => app.status === 'approved' || app.status === 'pending');
  }, [applications]);

  // User can access guidebooks if they have at least one paid application 
  // OR at least one application with approved or pending status
  const canAccessGuidebooks = useMemo(() => {
    return hasPaidApplication || hasApprovedOrPendingApplication;
  }, [hasPaidApplication, hasApprovedOrPendingApplication]);

  // Get user's full name from applications data
  const getUserName = useMemo(() => {
    if (applications.length > 0) {
      return applications[0].full_name;
    }
    return userEmail; // Fallback to email if no applications
  }, [applications, userEmail]);

  const fetchUserData = useCallback(async () => {
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
        toast.error(translate('Error loading your applications'));
      } else {
        setApplications(appsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(translate('Error loading dashboard data'));
    } finally {
      setLoadingData(false);
    }
  }, [userEmail, translate]);

  // Fetch guidebooks from database
  const fetchGuidebooks = useCallback(async () => {
    try {
      setLoadingGuidebooks(true);
      const { data, error } = await (supabase as any)
        .from('guidebooks')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching guidebooks:', error);
        toast.error(translate('Error loading guidebooks'));
      } else {
        setGuidebooks(data || []);
      }
    } catch (error) {
      console.error('Error fetching guidebooks:', error);
      toast.error(translate('Error loading guidebooks'));
    } finally {
      setLoadingGuidebooks(false);
    }
  }, [translate]);

  // Function to handle video viewing - memoized for performance
  const handleDownloadGuidebook = useCallback(async (filePath: string) => {
    try {
      const signedUrl = await generateGuidebookSignedUrl(filePath);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        toast.error(translate('Error loading guidebook'));
      }
    } catch (error) {
      console.error('Error opening guidebook:', error);
      toast.error(translate('Error opening guidebook'));
    }
  }, [translate]);

  const handleViewVideo = useCallback(async (filePath: string) => {
    try {
      const signedUrl = await generateVideoSignedUrl(filePath);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        toast.error(translate('Error loading video. Please try again.'));
      }
    } catch (error) {
      console.error('Error opening video:', error);
      toast.error(translate('Error opening video.'));
    }
  }, [translate]);

  // Function to view payment screenshot
  const viewPaymentScreenshot = useCallback(async (filePath: string) => {
    try {
      const signedUrl = await generateScreenshotSignedUrl(filePath);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        toast.error(translate('Error loading screenshot'));
      }
    } catch (error) {
      console.error('Error opening screenshot:', error);
      toast.error(translate('Error opening screenshot'));
    }
  }, [translate]);

  // Function to upload payment screenshot
  const uploadPaymentScreenshot = useCallback(async (applicationId: string, file: File) => {
    try {
      setUploadingScreenshotId(applicationId);
      toast.info(translate('Uploading payment screenshot...'));

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `screenshots/${fileName}`;

      const { error: uploadError } = await (supabase as any).storage
        .from('application-videos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Screenshot upload error:', uploadError);
        toast.error(translate('Error uploading payment screenshot'));
        return false;
      }

      // Update the application record with the screenshot URL
      const { error: updateError } = await (supabase as any)
        .from('application_submissions')
        .update({ payment_screenshot_url: filePath })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Error updating application with screenshot URL:', updateError);
        toast.error(translate('Error saving screenshot information'));
        return false;
      }

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, payment_screenshot_url: filePath } 
            : app
        )
      );

      console.log('Screenshot uploaded successfully to path:', filePath);
      toast.success(translate('Payment screenshot uploaded successfully'));
      return true;
    } catch (error) {
      console.error('Screenshot upload error:', error);
      toast.error(translate('Error uploading payment screenshot'));
      return false;
    } finally {
      setUploadingScreenshotId(null);
    }
  }, [translate]);

  // Handle screenshot file selection
  const handleScreenshotUpload = useCallback((applicationId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadPaymentScreenshot(applicationId, file);
      // Reset the file input
      event.target.value = '';
    }
  }, [uploadPaymentScreenshot]);

  // Use provided applications or fetch if needed
  useEffect(() => {
    if (!propApplications && userEmail) {
      fetchUserData();
    }
    // Always fetch guidebooks
    fetchGuidebooks();
  }, [userEmail, propApplications, fetchUserData, fetchGuidebooks]);

  // Memoize status badge for performance
  const getStatusBadge = useMemo(() => (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 text-xs sm:text-sm">
            <Clock className="w-3 h-3 mr-1" />
            {translate('Pending')}
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs sm:text-sm">
            <Eye className="w-3 h-3 mr-1" />
            {translate('Under Review')}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-600 border-green-300 text-xs sm:text-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            {translate('Approved')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 border-red-300 text-xs sm:text-sm">
            <XCircle className="w-3 h-3 mr-1" />
            {translate('Rejected')}
          </Badge>
        );
      case 'unpaid':
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs sm:text-sm">
            <Clock className="w-3 h-3 mr-1" />
            {translate('Unpaid')}
          </Badge>
        );
      case 'paid':
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-300 text-xs sm:text-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            {translate('Paid')}
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs sm:text-sm">{translate('Unknown')}</Badge>;
    }
  }, [translate]);

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'pending': return 25;
      case 'under_review': return 50;
      case 'approved': return 100;
      case 'rejected': return 0;
      case 'unpaid': return 15;
      case 'paid': return 35;
      default: return 0;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{translate('Loading your dashboard...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4 gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Logo added here */}
              <img 
                src="/logo.png" 
                alt="DLM Logo" 
                className="h-8 w-auto"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {translate('Welcome, {userName}').replace('{userName}', getUserName || '')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  {translate('Manage your applications and access learning resources')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 self-end sm:self-auto">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{translate('Settings')}</span>
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'} size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                <span className="sm:hidden">{translate('Home')}</span>
                <span className="hidden sm:inline">{translate('Back to Home')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Tabs defaultValue="applications" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger 
              value="applications" 
              id="tabs-trigger-applications"
              className="flex items-center justify-center space-x-1 sm:space-x-2 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">{translate('My Applications')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="resources" 
              className="flex items-center justify-center space-x-1 sm:space-x-2 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">{translate('Learning Resources')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4 sm:space-y-6">
            {applications.length === 0 ? (
              <Alert className="mx-2 sm:mx-0">
                <FileText className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {translate('You haven\'t submitted any applications yet.')} <a href="/apply" className="underline text-blue-600 font-medium">{translate('Submit your first application')}</a> {translate('to get started!')}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {applications.map((app) => (
                  <Card key={app.id} className="overflow-hidden mx-2 sm:mx-0">
                    <CardHeader className="pb-3 px-4 sm:px-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg leading-tight">{app.idea_title}</CardTitle>
                          <CardDescription className="mt-1 text-xs sm:text-sm">
                            {translate('Submitted on {date}').replace('{date}', formatDate(app.created_at))}
                          </CardDescription>
                        </div>
                        <div className="self-start">
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{translate('Application Progress')}</h4>
                        <Progress value={getStatusProgress(app.status)} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {app.status === 'pending' && translate('Your application is being reviewed by our team')}
                          {app.status === 'under_review' && translate('Your application is currently under detailed review')}
                          {app.status === 'approved' && translate('Congratulations! Your application has been approved')}
                          {app.status === 'rejected' && translate('Unfortunately, your application was not selected this time')}
                          {app.status === 'unpaid' && translate('Payment required: Please pay 5,000 PKR for duplicate CNIC submission')}
                          {app.status === 'paid' && translate('Payment confirmed: Your application is now being processed')}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{translate('Idea Description')}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{app.idea_description}</p>
                      </div>

                      {app.video_url && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 pt-2">
                          <div className="flex items-center space-x-2">
                            <Video className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-600">{translate('Video submission attached')}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewVideo(app.video_url!)}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            {translate('View Video')}
                          </Button>
                        </div>
                      )}

                      {/* Payment Information for Unpaid Applications */}
                      {app.status === 'unpaid' && (
                        <div className="pt-3 border-t-2 border-amber-200 bg-amber-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 mt-4">
                          <div className="flex items-start space-x-2 mb-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-bold text-amber-900 text-sm sm:text-base">{translate('Payment Required')}</h4>
                              <p className="text-xs text-amber-800 mt-1">
                                {translate('Please pay 5,000 PKR to process your application')}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 mt-4">
                            <h5 className="font-semibold text-amber-900 text-xs sm:text-sm">{translate('Payment Methods')}</h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* EasyPaisa */}
                              <div className="border border-amber-300 rounded-lg p-3 bg-white">
                                <div className="flex items-center space-x-2 mb-1">
                                  <img 
                                    src="/easypaisalogo.png" 
                                    alt="EasyPaisa" 
                                    className="h-5 w-auto"
                                  />
                                  <span className="font-bold text-gray-800 text-xs">EasyPaisa</span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{translate('Mobile Account')}</p>
                                <p className="font-mono bg-amber-50 p-1 rounded text-center text-xs font-semibold">0333 32101200</p>
                              </div>
                              
                              {/* JazzCash */}
                              <div className="border border-amber-300 rounded-lg p-3 bg-white">
                                <div className="flex items-center space-x-2 mb-1">
                                  <img 
                                    src="/jazzcashlogo.png" 
                                    alt="JazzCash" 
                                    className="h-5 w-auto"
                                  />
                                  <span className="font-bold text-gray-800 text-xs">JazzCash</span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{translate('Mobile Account')}</p>
                                <p className="font-mono bg-amber-50 p-1 rounded text-center text-xs font-semibold">0333 32101200</p>
                              </div>
                              
                              {/* Bank Transfer */}
                              <div className="border border-amber-300 rounded-lg p-2 bg-white">
                                <div className="flex items-center space-x-2 mb-1">
                                  <img 
                                    src="/bankalfalahlogo.png" 
                                    alt="Bank Alfalah" 
                                    className="h-5 w-auto"
                                  />
                                  <span className="font-bold text-gray-800 text-xs">Bank</span>
                                </div>
                                <div className="space-y-0.5">
                                  <div className="text-xs">
                                    <span className="text-gray-600">Bank:</span>
                                    <span className="text-gray-900 ml-1 font-medium">Bank Alfalah Islamic</span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-gray-600">Title:</span>
                                    <span className="text-gray-900 ml-1 font-medium text-[10px]">Fancy Tech Industries</span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-gray-600">Account:</span>
                                    <span className="font-mono text-gray-900 ml-1 font-medium">5002491934</span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-gray-600">IBAN:</span>
                                    <span className="font-mono text-gray-900 ml-1 font-medium text-[9px]">PK42ALFH5639005002491934</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Upload Payment Screenshot Section */}
                          <div className="mt-4 pt-3 border-t border-amber-200">
                            <h5 className="font-semibold text-amber-900 text-xs sm:text-sm mb-2">{translate('Upload Payment Proof')}</h5>
                            {app.payment_screenshot_url ? (
                              <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                                <div className="flex items-center space-x-2">
                                  <Check className="h-4 w-4 text-green-600" />
                                  <span className="text-xs sm:text-sm text-green-700 font-medium">{translate('Screenshot uploaded')}</span>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => viewPaymentScreenshot(app.payment_screenshot_url!)}
                                  className="text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  {translate('View')}
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleScreenshotUpload(app.id, e)}
                                  disabled={uploadingScreenshotId === app.id}
                                  className="hidden"
                                  id={`screenshot-upload-${app.id}`}
                                />
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => document.getElementById(`screenshot-upload-${app.id}`)?.click()}
                                  disabled={uploadingScreenshotId === app.id}
                                  className="w-full text-xs bg-amber-600 hover:bg-amber-700"
                                >
                                  {uploadingScreenshotId === app.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                                      {translate('Uploading...')}
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-3 w-3 mr-1" />
                                      {translate('Upload Screenshot')}
                                    </>
                                  )}
                                </Button>
                                <p className="text-xs text-amber-700 text-center">
                                  {translate('Upload proof of payment after making the transfer')}
                                </p>
                              </div>
                            )}
                          </div>

                          <p className="mt-3 text-xs text-amber-700 bg-amber-100 p-2 rounded">
                            {translate('Once you pay, your application will be processed and reviewed by our team and approved or rejected accordingly. Payment confirmation may take up to 24 hours.')}
                          </p>
                        </div>
                      )}

                      {/* Payment Screenshot Section for Paid Applications */}
                      {app.status === 'paid' && app.payment_screenshot_url && (
                        <div className="pt-2 border-t border-gray-100">
                          <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{translate('Payment Screenshot')}</h4>
                          <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-xs sm:text-sm text-green-700">{translate('Payment confirmed')}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewPaymentScreenshot(app.payment_screenshot_url!)}
                              className="text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {translate('View Screenshot')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-4 sm:space-y-6">
            {loadingGuidebooks ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{translate('Loading guidebooks...')}</p>
              </div>
            ) : guidebooks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{translate('No Guidebooks Available')}</h3>
                <p className="text-gray-600 mb-6">
                  {translate('Guidebooks will be available soon. Please check back later.')}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-2 sm:px-0">
                {guidebooks.map((guidebook) => {
                  // Check if user can access this guidebook
                  const canAccessThisGuidebook = guidebook.is_free || canAccessGuidebooks;

                  return (
                    <Card key={guidebook.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="pb-3 px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base sm:text-lg">{translate(guidebook.title)}</CardTitle>
                            <Badge variant="outline" className="w-fit text-xs mt-2">{translate(guidebook.category)}</Badge>
                          </div>
                          {guidebook.is_free && (
                            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                              {translate('Free')}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {translate(guidebook.description)}
                        </p>
                        {canAccessThisGuidebook ? (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full text-xs sm:text-sm h-9 sm:h-10"
                            onClick={() => handleDownloadGuidebook(guidebook.file_path)}
                          >
                            <Download className="h-3 w-3 mr-2" />
                            {translate('Download')} {translate(guidebook.title)}
                          </Button>
                        ) : (
                          <div className="text-center py-2">
                            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 mb-2">
                              {translate('Locked')}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={() => document.getElementById('tabs-trigger-applications')?.click()}
                            >
                              {translate('View Applications')}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;