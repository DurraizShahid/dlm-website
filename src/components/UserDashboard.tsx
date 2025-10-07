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
import { generateVideoSignedUrl, generateScreenshotSignedUrl } from '@/utils/videoUtils';
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
  const { language } = useLanguage();
  const [applications, setApplications] = useState<Application[]>(propApplications || []);
  const [loadingData, setLoadingData] = useState(false);
  const [uploadingScreenshotId, setUploadingScreenshotId] = useState<string | null>(null);

  const translate = (key: keyof typeof translations) => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };

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
  }, [userEmail]);

  // Function to handle video viewing - memoized for performance
  const handleViewVideo = useCallback(async (filePath: string) => {
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
  }, []);

  // Function to view payment screenshot
  const viewPaymentScreenshot = useCallback(async (filePath: string) => {
    try {
      const signedUrl = await generateScreenshotSignedUrl(filePath);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        toast.error('Error loading screenshot');
      }
    } catch (error) {
      console.error('Error opening screenshot:', error);
      toast.error('Error opening screenshot');
    }
  }, []);

  // Function to upload payment screenshot
  const uploadPaymentScreenshot = useCallback(async (applicationId: string, file: File) => {
    try {
      setUploadingScreenshotId(applicationId);
      toast.info('Uploading payment screenshot...');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `screenshots/${fileName}`;

      const { error: uploadError } = await (supabase as any).storage
        .from('application-videos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Screenshot upload error:', uploadError);
        toast.error('Error uploading payment screenshot');
        return false;
      }

      // Update the application record with the screenshot URL
      const { error: updateError } = await (supabase as any)
        .from('application_submissions')
        .update({ payment_screenshot_url: filePath })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Error updating application with screenshot URL:', updateError);
        toast.error('Error saving screenshot information');
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
      toast.success('Payment screenshot uploaded successfully');
      return true;
    } catch (error) {
      console.error('Screenshot upload error:', error);
      toast.error('Error uploading payment screenshot');
      return false;
    } finally {
      setUploadingScreenshotId(null);
    }
  }, []);

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
  }, [userEmail, propApplications, fetchUserData]);

  // Memoize status badge for performance
  const getStatusBadge = useMemo(() => (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 text-xs sm:text-sm">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs sm:text-sm">
            <Eye className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-600 border-green-300 text-xs sm:text-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 border-red-300 text-xs sm:text-sm">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'unpaid':
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs sm:text-sm">
            <Clock className="w-3 h-3 mr-1" />
            Unpaid
          </Badge>
        );
      case 'paid':
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-300 text-xs sm:text-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs sm:text-sm">Unknown</Badge>;
    }
  }, []);

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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4 gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Logo added here */}
              <img 
                src="/logo.png" 
                alt="DLM Logo" 
                className="h-8 w-auto"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Welcome, {getUserName}</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your applications and access learning resources</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 self-end sm:self-auto">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'} size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                <span className="sm:hidden">Home</span>
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Tabs defaultValue="applications" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger 
              value="applications" 
              id="tabs-trigger-applications"
              className="flex items-center justify-center space-x-1 sm:space-x-2 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">My Applications</span>
            </TabsTrigger>
            <TabsTrigger 
              value="resources" 
              className="flex items-center justify-center space-x-1 sm:space-x-2 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Learning Resources</span>
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4 sm:space-y-6">
            {/* Unpaid Applications Notification */}
            {applications.some(app => app.status === 'unpaid') && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r mx-2 sm:mx-0">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-amber-800">Unpaid Applications Require Payment</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>You have one or more unpaid applications. Please complete the payment process to have your application reviewed by our team.</p>
                      
                      <div className="mt-3 space-y-3">
                        <h4 className="font-bold text-amber-800">Payment Methods</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* EasyPaisa */}
                          <div className="border border-amber-200 rounded-lg p-3 bg-white">
                            <div className="flex items-center space-x-2 mb-2">
                              <img 
                                src="/easypaisalogo.png" 
                                alt="EasyPaisa" 
                                className="h-6 w-auto"
                              />
                              <span className="font-bold text-gray-800 text-sm">EasyPaisa</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">Mobile Account</p>
                            <p className="font-mono bg-gray-100 p-1 rounded text-center text-xs">0333 32101200</p>
                          </div>
                          
                          {/* JazzCash */}
                          <div className="border border-amber-200 rounded-lg p-3 bg-white">
                            <div className="flex items-center space-x-2 mb-2">
                              <img 
                                src="/jazzcashlogo.png" 
                                alt="JazzCash" 
                                className="h-6 w-auto"
                              />
                              <span className="font-bold text-gray-800 text-sm">JazzCash</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">Mobile Account</p>
                            <p className="font-mono bg-gray-100 p-1 rounded text-center text-xs">0333 32101200</p>
                          </div>
                        </div>
                        
                        {/* Bank Transfer */}
                        <div className="border border-amber-200 rounded-lg p-3 bg-white">
                          <div className="flex items-center space-x-2 mb-2">
                            <img 
                              src="/bankalfalahlogo.png" 
                              alt="Bank Alfalah" 
                              className="h-6 w-auto"
                            />
                            <span className="font-bold text-gray-800 text-sm">Bank Transfer</span>
                          </div>
                          <div className="space-y-1 ml-8">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-gray-700">Bank:</span>
                              <span className="text-gray-900">Bank Alfalah Islamic</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-gray-700">Account Title:</span>
                              <span className="text-gray-900">Fancy Tech Industries SMC (Pvt) Ltd</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-gray-700">Account #:</span>
                              <span className="font-mono text-gray-900">5002491934</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-gray-700">IBAN:</span>
                              <span className="font-mono text-gray-900">PK42ALFH5639005002491934</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <Button variant="default" size="sm" className="text-xs">
                          <Upload className="h-3 w-3 mr-1" />
                          Upload Payment Receipt
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Send via WhatsApp
                        </Button>
                      </div>
                      
                      <p className="mt-3 text-xs text-amber-600">
                        Once you pay, your application will be processed and reviewed by our team and approved or rejected accordingly. 
                        Payment confirmation may take up to 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {applications.length === 0 ? (
              <Alert className="mx-2 sm:mx-0">
                <FileText className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  You haven't submitted any applications yet. <a href="/apply" className="underline text-blue-600 font-medium">Submit your first application</a> to get started!
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
                            Submitted on {new Date(app.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="self-start">
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Application Progress</h4>
                        <Progress value={getStatusProgress(app.status)} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {app.status === 'pending' && 'Your application is being reviewed by our team'}
                          {app.status === 'under_review' && 'Your application is currently under detailed review'}
                          {app.status === 'approved' && 'Congratulations! Your application has been approved'}
                          {app.status === 'rejected' && 'Unfortunately, your application was not selected this time'}
                          {app.status === 'unpaid' && 'Payment required: Please pay 5,000 PKR for duplicate CNIC submission'}
                          {app.status === 'paid' && 'Payment confirmed: Your application is now being processed'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Idea Description</h4>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">{app.idea_description}</p>
                      </div>

                      {app.video_url && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 pt-2">
                          <div className="flex items-center space-x-2">
                            <Video className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-600">Video submission attached</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewVideo(app.video_url!)}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            View Video
                          </Button>
                        </div>
                      )}

                      {/* Payment Screenshot Section for Unpaid Applications */}
                      {app.status === 'unpaid' && (
                        <div className="pt-2 border-t border-gray-100">
                          <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Payment Screenshot</h4>
                          {app.payment_screenshot_url ? (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Check className="h-4 w-4 text-green-600" />
                                <span className="text-xs sm:text-sm text-green-700">Screenshot uploaded</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewPaymentScreenshot(app.payment_screenshot_url!)}
                                className="text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleScreenshotUpload(app.id, e)}
                                disabled={uploadingScreenshotId === app.id}
                                className="hidden"
                                id={`screenshot-upload-${app.id}`}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`screenshot-upload-${app.id}`)?.click()}
                                disabled={uploadingScreenshotId === app.id}
                                className="w-full sm:w-auto text-xs"
                              >
                                {uploadingScreenshotId === app.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-3 w-3 mr-1" />
                                    Upload Screenshot
                                  </>
                                )}
                              </Button>
                              <p className="text-xs text-gray-500 sm:text-left">
                                Upload proof of payment after making the transfer
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Payment Screenshot Section for Paid Applications */}
                      {app.status === 'paid' && app.payment_screenshot_url && (
                        <div className="pt-2 border-t border-gray-100">
                          <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Payment Screenshot</h4>
                          <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-xs sm:text-sm text-green-700">Payment confirmed</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewPaymentScreenshot(app.payment_screenshot_url!)}
                              className="text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Screenshot
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
            {!canAccessGuidebooks ? (
              <div className="text-center py-12">
                <div className="mx-auto max-w-md">
                  <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Guidebooks Locked</h3>
                  <p className="text-gray-600 mb-6">
                    Please submit an application and have it approved or pay the application fee to unlock access to the guidebooks.
                  </p>
                  <Button variant="default" onClick={() => document.getElementById('tabs-trigger-applications')?.click()}>
                    View Applications
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-2 sm:px-0">
                {/* Guidebook #1 */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3 px-4 sm:px-6">
                    <CardTitle className="text-base sm:text-lg">Guidebook #1</CardTitle>
                    <Badge variant="outline" className="w-fit text-xs">Getting Started</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Essential first steps for entrepreneurs and business fundamentals</p>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => window.open('/guidebooks/guidebook1.pdf', '_blank')}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Download Guidebook #1
                    </Button>
                  </CardContent>
                </Card>

                {/* Guidebook #2 */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3 px-4 sm:px-6">
                    <CardTitle className="text-base sm:text-lg">Guidebook #2</CardTitle>
                    <Badge variant="outline" className="w-fit text-xs">Business Planning</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Comprehensive guide to creating effective business plans and strategies</p>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => window.open('/guidebooks/guidebook2.pdf', '_blank')}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Download Guidebook #2
                    </Button>
                  </CardContent>
                </Card>

                {/* Guidebook #3 */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3 px-4 sm:px-6">
                    <CardTitle className="text-base sm:text-lg">Guidebook #3</CardTitle>
                    <Badge variant="outline" className="w-fit text-xs">Marketing</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Marketing strategies and customer acquisition techniques for new businesses</p>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => window.open('/guidebooks/guidebook3.pdf', '_blank')}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Download Guidebook #3
                    </Button>
                  </CardContent>
                </Card>

                {/* Guidebook #4 */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3 px-4 sm:px-6">
                    <CardTitle className="text-base sm:text-lg">Guidebook #4</CardTitle>
                    <Badge variant="outline" className="w-fit text-xs">Finance</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Financial management, funding options, and investment strategies</p>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => window.open('/guidebooks/guidebook4.pdf', '_blank')}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Download Guidebook #4
                    </Button>
                  </CardContent>
                </Card>

                {/* Guidebook #5 */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3 px-4 sm:px-6">
                    <CardTitle className="text-base sm:text-lg">Guidebook #5</CardTitle>
                    <Badge variant="outline" className="w-fit text-xs">Growth & Scale</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Scaling your business, team building, and sustainable growth practices</p>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => window.open('/guidebooks/guidebook5.pdf', '_blank')}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Download Guidebook #5
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;