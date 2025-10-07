import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { generateVideoSignedUrl } from '@/utils/videoUtils';
import { toast } from 'sonner';
import { 
  Shield, 
  Users, 
  FileText, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  PlayCircle,
  LogOut,
  Download,
  Image as ImageIcon
} from 'lucide-react';

interface Application {
  id: string;
  full_name: string;
  email: string;
  age: number;
  address: string;
  cnic: string;
  idea_title: string;
  idea_description: string;
  video_url?: string;
  payment_screenshot_url?: string; // Add screenshot URL field
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'unpaid' | 'paid';
  created_at: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Check if already authenticated (from session storage)
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      fetchApplications();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Hardcoded credentials (as requested)
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      toast.success('Successfully logged in as admin');
      fetchApplications();
    } else {
      setLoginError('Invalid username or password');
      toast.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setUsername('');
    setPassword('');
    setApplications([]);
    toast.info('Logged out successfully');
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('application_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast.error('Error loading applications');
        return;
      }

      setApplications(data || []);
      toast.success(`Loaded ${data?.length || 0} applications`);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error loading applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewVideo = async (filePath: string) => {
    try {
      const signedUrl = await generateVideoSignedUrl(filePath);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        toast.error('Error loading video');
      }
    } catch (error) {
      console.error('Error opening video:', error);
      toast.error('Error opening video');
    }
  };

  // Function to view payment screenshot
  const viewPaymentScreenshot = async (filePath: string) => {
    try {
      const { data, error } = await (supabase as any).storage
        .from('application-videos')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Error creating signed URL for screenshot:', error);
        toast.error('Error loading screenshot');
        return;
      }

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error opening screenshot:', error);
      toast.error('Error opening screenshot');
    }
  };

  const updateApplicationStatus = async (id: string, newStatus: string) => {
    console.log(`Attempting to update application ${id} to status: ${newStatus}`);
    
    try {
      const { data, error } = await (supabase as any)
        .from('application_submissions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(); // Add select to get the updated data

      if (error) {
        console.error('Error updating status:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Error updating application status: ${error.message}`);
        return;
      }

      console.log('Update successful, response data:', data);

      // Update local state
      setApplications(apps => 
        apps.map(app => 
          app.id === id ? { ...app, status: newStatus as any } : app
        )
      );

      toast.success(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Unexpected error updating status:', error);
      toast.error(`Error updating application status: ${error}`);
    }
  };

  const handlePostToTikTok = async (application: Application) => {
    try {
      toast.info(`Preparing to post "${application.idea_title}" to TikTok...`);
      
      // Check if the application has a video
      if (!application.video_url) {
        toast.error('No video found for this application');
        return;
      }
      
      // Generate a signed URL for the video that TikTok can access
      const videoSignedUrl = await generateVideoSignedUrl(application.video_url, 7200); // 2 hour expiry
      
      if (!videoSignedUrl) {
        toast.error('Failed to generate video access URL');
        return;
      }
      
      // TikTok API configuration
      const TIKTOK_API_BASE_URL = 'https://open.tiktokapis.com/v2';
      const TIKTOK_ACCESS_TOKEN = import.meta.env.VITE_TIKTOK_ACCESS_TOKEN;
      
      // Check if TikTok credentials are configured
      if (!TIKTOK_ACCESS_TOKEN) {
        toast.error('TikTok API not configured. Please set VITE_TIKTOK_ACCESS_TOKEN in your .env file.');
        return;
      }
      
      // Create caption with idea title, description and hashtags
      const caption = `${application.idea_title}

${application.idea_description}

#DreamLauncherMovement #Innovation #Pakistan #Entrepreneurship #Startup`;
      
      // Initialize the video upload to TikTok
      const initResponse = await fetch(`${TIKTOK_API_BASE_URL}/post/publish/inbox/video/init/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TIKTOK_ACCESS_TOKEN}`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: videoSignedUrl
          }
        })
      });
      
      if (!initResponse.ok) {
        const errorData = await initResponse.json().catch(() => ({}));
        console.error('TikTok API init error:', errorData);
        toast.error(`Failed to initialize TikTok upload: ${errorData.error?.message || initResponse.statusText}`);
        return;
      }
      
      const initData = await initResponse.json();
      const publishId = initData.data?.publish_id;
      
      if (!publishId) {
        toast.error('Failed to get publish ID from TikTok API');
        return;
      }
      
      toast.success(`Successfully initiated upload of "${application.idea_title}" to TikTok! The user will be notified in their TikTok inbox to complete the post.`);
    } catch (error) {
      console.error('Error posting to TikTok:', error);
      toast.error(`Error posting to TikTok: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      case 'unpaid':
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            <Clock className="w-3 h-3 mr-1" />
            Unpaid
          </Badge>
        );
      case 'paid':
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Full Name', 'Email', 'Age', 'Address', 'CNIC', 'Idea Title', 'Status', 'Submitted Date'];
    const csvContent = [
      headers.join(','),
      ...applications.map(app => [
        `"${app.full_name}"`,
        `"${app.email}"`,
        app.age,
        `"${app.address}"`,
        `"${app.cnic}"`,
        `"${app.idea_title}"`,
        app.status,
        new Date(app.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Applications exported to CSV');
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
            <div className="mx-auto bg-white rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-gray-800" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <CardDescription className="text-gray-200">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo.png" 
                alt="DLM Logo" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage all application submissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={exportToCSV} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {applications.filter(app => app.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {applications.filter(app => app.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {applications.filter(app => app.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>All Applications</span>
                  </CardTitle>
                  <CardDescription>
                    Review and manage all submitted applications
                  </CardDescription>
                </div>
                <Button onClick={fetchApplications} disabled={loading} size="sm">
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No applications found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Name</TableHead>
                        <TableHead className="whitespace-nowrap">Email</TableHead>
                        <TableHead className="whitespace-nowrap">Age</TableHead>
                        <TableHead className="whitespace-nowrap">CNIC</TableHead>
                        <TableHead className="whitespace-nowrap">Idea Title</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Video</TableHead>
                        <TableHead className="whitespace-nowrap">Screenshot</TableHead>
                        <TableHead className="whitespace-nowrap">Submitted</TableHead>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium whitespace-nowrap">{app.full_name}</TableCell>
                          <TableCell className="whitespace-nowrap">{app.email}</TableCell>
                          <TableCell className="whitespace-nowrap">{app.age}</TableCell>
                          <TableCell className="font-mono text-sm whitespace-nowrap">{app.cnic}</TableCell>
                          <TableCell className="min-w-[250px]">
                            <div className="" title={app.idea_title}>
                              {app.idea_title}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{getStatusBadge(app.status)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {app.video_url ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewVideo(app.video_url!)}
                              >
                                <PlayCircle className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">No video</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {app.payment_screenshot_url ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewPaymentScreenshot(app.payment_screenshot_url!)}
                              >
                                <ImageIcon className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">No screenshot</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log('Approve button clicked for app:', app.id);
                                  updateApplicationStatus(app.id, 'approved');
                                }}
                                disabled={app.status === 'approved'}
                                className="text-green-600 hover:text-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log('Reject button clicked for app:', app.id);
                                  updateApplicationStatus(app.id, 'rejected');
                                }}
                                disabled={app.status === 'rejected'}
                                className="text-red-600 hover:text-red-700"
                              >
                                Reject
                              </Button>
                              {app.status === 'unpaid' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    console.log('Mark as Paid button clicked for app:', app.id);
                                    updateApplicationStatus(app.id, 'paid');
                                  }}
                                  className="text-purple-600 hover:text-purple-700"
                                >
                                  Mark as Paid
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePostToTikTok(app)}
                                className="text-purple-600 hover:text-purple-700"
                              >
                                Post to TikTok
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;