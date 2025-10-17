import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { applyFormSchema, ApplyFormData } from '@/types/apply-form';
import { useLanguage } from '@/i18n/LanguageContext';
import { translations } from '@/i18n/translations';
import { toast } from 'sonner';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Note: Watermarking is handled by admin when downloading videos

const ApplyForm = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [existingCnicData, setExistingCnicData] = useState<any>(null);
  const [pendingFormData, setPendingFormData] = useState<ApplyFormData | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const translate = (key: keyof typeof translations) => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  // CNIC formatting function
  const formatCNIC = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format: 12345-1234567-1 (5 digits, 7 digits, 1 digit)
    let formatted = '';
    
    if (digits.length <= 5) {
      formatted = digits;
    } else if (digits.length <= 12) {
      formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
    } else {
      formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
    }
    
    return formatted;
  };

  // Validate CNIC format
  const isValidCNICFormat = (value: string): boolean => {
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    return cnicRegex.test(value);
  };

  const form = useForm<ApplyFormData>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      age: 0,
      address: '',
      cnic: '',
      ideaTitle: '',
      ideaDescription: '',
    },
  });

  const uploadVideo = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      toast.info(translate('Uploading video...'));

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      // Upload the video
      const { error: uploadError } = await (supabase as any).storage
        .from('application-videos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(translate('Error uploading video'));
        return null;
      }

      toast.success(translate('Video uploaded successfully!'));
      console.log('Video uploaded successfully:', filePath);
      
      return filePath;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(translate('Error uploading video'));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const checkExistingCnic = async (cnic: string) => {
    try {
      console.log('Checking for existing CNIC:', cnic);
      const { data, error } = await (supabase as any)
        .from('application_submissions')
        .select('*')
        .eq('cnic', cnic);

      console.log('Supabase response for CNIC check:', { data, error });
      
      if (error) {
        console.error('Error checking CNIC:', error);
        // Still return null even if there's an error
        return null;
      }

      // Check if any records were returned (array with items)
      if (Array.isArray(data) && data.length > 0) {
        console.log('Existing CNIC found:', data[0]);
        return data[0]; // Return the first match
      }

      console.log('No existing CNIC found - data:', data);
      return null;
    } catch (error) {
      console.error('Exception while checking CNIC:', error);
      return null;
    }
  };

  const submitApplication = async (data: ApplyFormData, isPaidApplication = false) => {
    console.log('Form submission started with data:', { email: data.email, ideaTitle: data.ideaTitle });
    
    try {
      setIsSubmitting(true);
      toast.info(translate('Submitting...'));

      console.log('Form validation passed, uploading video...');

      // Upload video first
      const videoUrl = await uploadVideo(data.video);
      if (!videoUrl) {
        console.log('Video upload failed, stopping submission');
        return;
      }
      
      console.log('Video uploaded successfully, file path:', videoUrl);
      console.log('Submitting application to database...');

      // Determine status based on whether this is a paid application
      const status = isPaidApplication ? 'unpaid' : 'pending';

      // Submit application to database
      const { error: submissionError } = await (supabase as any)
        .from('application_submissions')
        .insert({
          full_name: data.fullName,
          email: data.email,
          age: data.age,
          address: data.address,
          cnic: data.cnic,
          idea_title: data.ideaTitle,
          idea_description: data.ideaDescription,
          video_url: videoUrl,
          status: status,
        });

      if (submissionError) {
        console.error('Submission error:', submissionError);
        if (submissionError.message?.includes('JWT') || submissionError.message?.includes('anon')) {
          toast.error(`${translate('Error submitting application. Please try again.')}: Database not configured`);
        } else {
          toast.error(`${translate('Error submitting application. Please try again.')}: ${submissionError.message}`);
        }
        return;
      }
      
      console.log('Application submitted successfully to database');

      // Success!
      if (isPaidApplication) {
        toast.success('Application submitted! Status: Unpaid. Please wait for admin approval after payment.');
      } else {
        toast.success(translate('Application submitted successfully!'));
      }
      
      console.log('Resetting form and redirecting...');
      form.reset();
      setUploadedVideoUrl(null);
      setShowPaymentModal(false);
      setPendingFormData(null);
      setExistingCnicData(null);
      
      // Redirect to dashboard with email pre-filled
      setTimeout(() => {
        navigate(`/dashboard?email=${encodeURIComponent(data.email)}`);
      }, 3000);
      
    } catch (error) {
      console.error('Overall submission error:', error);
      toast.error(`${translate('Error submitting application. Please try again.')}: ${error}`);
    } finally {
      console.log('Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: ApplyFormData) => {
    console.log('Form submitted with data:', data);
    
    // Re-validate entire form before submission
    const validationResult = applyFormSchema.safeParse(data);
    if (!validationResult.success) {
      console.log('Form validation failed:', validationResult.error);
      toast.error('Please fix all form errors before submitting.');
      return;
    }

    // Check if CNIC already exists
    console.log('Checking for existing CNIC:', data.cnic);
    const existingEntry = await checkExistingCnic(data.cnic);
    console.log('Existing entry result:', existingEntry);
    
    // More robust check for existing entry
    const hasExistingEntry = existingEntry && 
                             typeof existingEntry === 'object' && 
                             Object.keys(existingEntry).length > 0;
    
    console.log('Has existing entry:', hasExistingEntry);
    console.log('Existing entry details:', existingEntry);
    
    // For the new requirement, ALL submissions require payment
    // But we still need to check CNIC to determine payment amount in the future
    console.log('Showing payment modal for all submissions');
    setExistingCnicData(hasExistingEntry ? existingEntry : null);
    setPendingFormData(data);
    setShowPaymentModal(true);
    console.log('Payment modal state set to:', true);
  };

  const handlePaymentConfirm = async () => {
    console.log('Payment confirmed for application');
    if (pendingFormData) {
      // Pass true to indicate this is a paid application (results in 'unpaid' status)
      await submitApplication(pendingFormData, true);
    }
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    setShowPaymentModal(false);
    setPendingFormData(null);
    setExistingCnicData(null);
  };

  // Debugging: Log when showPaymentModal changes
  useEffect(() => {
    console.log('showPaymentModal state changed to:', showPaymentModal);
  }, [showPaymentModal]);
  
  // Test function to manually trigger the modal
  const testShowModal = () => {
    console.log('Test show modal function called');
    setExistingCnicData({
      cnic: '12345-1234567-1',
      full_name: 'Test User',
      idea_title: 'Test Idea',
      status: 'pending'
    });
    setShowPaymentModal(true);
  };

  // Handle video file selection (both from input and drag-drop)
  const handleVideoFile = (file: File) => {
    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload MP4, MOV, or AVI video files.');
      return;
    }

    // Validate file size (200MB max)
    const maxSize = 200 * 1024 * 1024; // 200MB in bytes
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 200MB.');
      return;
    }

    // Store the file for upload later, after validation
    form.setValue('video', file);
    setUploadedVideoUrl(URL.createObjectURL(file));
    toast.success('Video selected successfully!');
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoFile(file);
    }
  };

  const removeVideo = () => {
    form.setValue('video', undefined as any);
    setUploadedVideoUrl(null);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleVideoFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-green-800 via-emerald-600 to-yellow-500 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold mb-2">
              {translate('Submit Your Idea')}
            </CardTitle>
            <CardDescription className="text-green-100 text-lg">
              {translate('Fill out the form below to apply for a chance to win 10 Lakh Rupees and bring your dream to life.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          {translate('Full Name')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={translate('Full Name')}
                            {...field}
                            className="h-12 border-2 border-gray-200 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Age */}
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          {translate('Age')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="25"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="h-12 border-2 border-gray-200 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        {translate('Email')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={translate('Email')}
                          {...field}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        {translate('Address')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={translate('Address')}
                          {...field}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CNIC */}
                <FormField
                  control={form.control}
                  name="cnic"
                  render={({ field }) => {
                    const hasValue = field.value && field.value.length > 0;
                    const isValid = hasValue && isValidCNICFormat(field.value);
                    const isInvalid = hasValue && !isValid && field.value.replace(/\D/g, '').length === 13;
                    
                    return (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          {translate('CNIC')}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="tel"
                              inputMode="numeric"
                              pattern="[0-9-]*"
                              placeholder="12345-1234567-1"
                              value={field.value}
                              onChange={(e) => {
                                const formatted = formatCNIC(e.target.value);
                                field.onChange(formatted);
                              }}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                              maxLength={15}
                              className={`h-12 border-2 pr-10 ${
                                isValid 
                                  ? 'border-green-500 focus:border-green-600' 
                                  : isInvalid
                                  ? 'border-red-500 focus:border-red-600'
                                  : 'border-gray-200 focus:border-blue-500'
                              }`}
                            />
                            {isValid && (
                              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                            )}
                            {isInvalid && (
                              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500">
                          Format: 12345-1234567-1 (automatically formatted as you type)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Idea Title */}
                <FormField
                  control={form.control}
                  name="ideaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        {translate('Idea Title')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={translate('Idea Title')}
                          {...field}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Idea Description */}
                <FormField
                  control={form.control}
                  name="ideaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        {translate('Short Description (300-500 characters)')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={translate('Short Description (300-500 characters)')}
                          {...field}
                          className="min-h-[120px] border-2 border-gray-200 focus:border-blue-500 resize-none"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">
                        {field.value?.length || 0}/500 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Video Upload */}
                <FormField
                  control={form.control}
                  name="video"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        {translate('Upload Video (Required)')}
                      </FormLabel>
                      <FormDescription className="text-sm text-gray-600 mb-4">
                        {translate('Upload a short video (max 2 minutes). Tell us your idea and why you deserve to win. Accept: .mp4, .mov, .avi (max 200MB)')}
                      </FormDescription>
                      
                      {!uploadedVideoUrl ? (
                        <div>
                          {/* Hidden file input - works better when not using programmatic clicks */}
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/*"
                            capture="environment"
                            onChange={handleVideoChange}
                            className="hidden"
                            id="video-upload"
                            multiple={false}
                          />
                          
                          {/* Label acts as the clickable area - works in all browsers including embedded ones */}
                          <label 
                            htmlFor="video-upload"
                            className={`block border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                              isDragging 
                                ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                            }`}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                          >
                            <Upload className={`mx-auto h-12 w-12 mb-4 transition-colors ${
                              isDragging ? 'text-blue-500' : 'text-gray-400'
                            }`} />
                            <p className={`font-medium mb-2 ${
                              isDragging ? 'text-blue-600' : 'text-gray-700'
                            }`}>
                              {isDragging 
                                ? translate('Drop your video here!') 
                                : translate('Drag & drop your video here')}
                            </p>
                            <p className="text-gray-500 text-sm mb-4">
                              {translate('or click to browse from your device')}
                            </p>
                            <span
                              className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                                isUploading 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {isUploading ? translate('Uploading video...') : translate('Choose Video')}
                            </span>
                            <p className="text-xs text-gray-400 mt-3">
                              MP4, MOV, AVI, WebM • Max 200MB
                            </p>
                          </label>
                          
                          {/* Alternative direct button for problematic browsers */}
                          <div className="mt-2 text-center">
                            <p className="text-xs text-gray-500 mb-2">
                              {translate('Having trouble? Try the button below:')}
                            </p>
                            <label 
                              htmlFor="video-upload-alt"
                              className="inline-flex items-center justify-center px-4 py-2 border-2 border-blue-500 rounded-md shadow-sm text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                            >
                              📹 {translate('Select Video File')}
                            </label>
                            <input
                              type="file"
                              accept="video/*"
                              capture="environment"
                              onChange={handleVideoChange}
                              className="hidden"
                              id="video-upload-alt"
                              multiple={false}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-green-700 font-medium">Video selected</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeVideo}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4 mr-1" />
                              {translate('Remove video')}
                            </Button>
                          </div>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="w-full h-14 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-gray-900 shadow-lg"
                  >
                    {isSubmitting ? translate('Submitting...') : translate('Submit Application')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        <Dialog open={showPaymentModal} onOpenChange={(open) => {
          console.log('Dialog onOpenChange called with:', open);
          setShowPaymentModal(open);
        }}>
          <DialogContent className="sm:max-w-md max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader className="text-left sticky top-0 bg-white z-10 pb-4 border-b">
              <DialogTitle className="flex items-center space-x-2 text-xl">
                <AlertCircle className="h-6 w-6 text-amber-500" />
                <span>Application Fee Required</span>
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <DialogDescription className="text-sm text-gray-600 space-y-4">
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-700">
                        {existingCnicData ? (
                          <>
                            A fee of <strong className="text-lg">5,000 PKR</strong> is required for additional idea submissions.
                          </>
                        ) : (
                          <>
                            A fee of <strong className="text-lg">5,000 PKR</strong> is required for all idea submissions.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                {existingCnicData && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                    <h3 className="font-bold text-blue-800 mb-2">Previous Application Details</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="text-gray-900">{existingCnicData?.full_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Idea:</span>
                        <span className="text-gray-900">{existingCnicData?.idea_title || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="text-gray-900 capitalize">{existingCnicData?.status || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        Your application will be marked as "Unpaid" until an admin confirms your payment.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 text-lg border-b pb-2">Payment Methods</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {/* EasyPaisa */}
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <img 
                          src="/easypaisalogo.png" 
                          alt="EasyPaisa" 
                          className="h-8 w-auto"
                        />
                        <span className="font-bold text-gray-800">EasyPaisa</span>
                      </div>
                      <div className="ml-11">
                        <p className="text-sm text-gray-600 mb-1">Mobile Account</p>
                        <p className="font-mono bg-gray-100 p-2 rounded text-center">0333 32101200</p>
                      </div>
                    </div>
                    
                    {/* JazzCash */}
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <img 
                          src="/jazzcashlogo.png" 
                          alt="JazzCash" 
                          className="h-8 w-auto"
                        />
                        <span className="font-bold text-gray-800">JazzCash</span>
                      </div>
                      <div className="ml-11">
                        <p className="text-sm text-gray-600 mb-1">Mobile Account</p>
                        <p className="font-mono bg-gray-100 p-2 rounded text-center">0333 32101200</p>
                      </div>
                    </div>
                    
                    {/* Bank Transfer */}
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <img 
                          src="/bankalfalahlogo.png" 
                          alt="Bank Alfalah" 
                          className="h-8 w-auto"
                        />
                        <span className="font-bold text-gray-800">Bank Transfer</span>
                      </div>
                      <div className="ml-11 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">Bank:</span>
                          <span className="text-gray-900">Bank Alfalah Islamic</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">Account Title:</span>
                          <span className="text-gray-900">Fancy Tech Industries SMC (Pvt) Ltd</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">Account #:</span>
                          <span className="font-mono text-gray-900">5002491934</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">IBAN:</span>
                          <span className="font-mono text-gray-900">PK42ALFH5639005002491934</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-2">Important Information</h4>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>Your application will be marked as "Unpaid" until an admin confirms your payment</li>
                    <li>Please keep a screenshot of your payment receipt for reference</li>
                    <li>Payment confirmation may take up to 24 hours</li>
                    <li>For payment issues, contact support with your CNIC number</li>
                  </ul>
                </div>
              </DialogDescription>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3 pt-2 sticky bottom-0 bg-white z-10 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePaymentCancel}
                className="w-full sm:w-1/2 py-6 text-base"
              >
                Cancel Application
              </Button>
              <Button
                onClick={handlePaymentConfirm}
                disabled={isSubmitting}
                className="w-full sm:w-1/2 py-6 text-base bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  existingCnicData ? 'Pay 5,000 PKR & Submit' : 'Pay 5,000 PKR & Submit'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ApplyForm;