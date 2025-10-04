import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Upload, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApplyForm = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const translate = (key: keyof typeof translations) => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  const form = useForm<ApplyFormData>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      age: 18,
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

      const { error: uploadError } = await (supabase as any).storage
        .from('application-videos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(translate('Error uploading video'));
        return null;
      }

      console.log('Video uploaded successfully to path:', filePath);
      toast.success(translate('Video uploaded successfully'));
      
      // Return just the file path, not the full URL
      // We'll generate signed URLs when displaying videos
      return filePath;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(translate('Error uploading video'));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ApplyFormData) => {
    console.log('Form submission started with data:', { email: data.email, ideaTitle: data.ideaTitle });
    
    try {
      setIsSubmitting(true);
      toast.info(translate('Submitting...'));

      // Re-validate entire form before submission (project specification)
      const validationResult = applyFormSchema.safeParse(data);
      if (!validationResult.success) {
        console.log('Form validation failed:', validationResult.error);
        toast.error('Please fix all form errors before submitting.');
        return;
      }
      
      console.log('Form validation passed, uploading video...');

      // Upload video first
      const videoUrl = await uploadVideo(data.video);
      if (!videoUrl) {
        console.log('Video upload failed, stopping submission');
        return;
      }
      
      console.log('Video uploaded successfully, file path:', videoUrl);
      console.log('Submitting application to database...');

      // Submit application to database - simple approach without auth
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
          status: 'pending',
        });

      if (submissionError) {
        console.error('Submission error:', submissionError);
        // Following project specification for error message format
        if (submissionError.message?.includes('JWT') || submissionError.message?.includes('anon')) {
          toast.error(`${translate('Error submitting application. Please try again.')}: Database not configured`);
        } else {
          toast.error(`${translate('Error submitting application. Please try again.')}: ${submissionError.message}`);
        }
        return;
      }
      
      console.log('Application submitted successfully to database');

      // Success!
      toast.success(translate('Application submitted successfully!'));
      
      console.log('Resetting form and redirecting...');
      form.reset();
      setUploadedVideoUrl(null);
      
      // Redirect to home page
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Overall submission error:', error);
      toast.error(`${translate('Error submitting application. Please try again.')}: ${error}`);
    } finally {
      console.log('Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('video', file);
      setUploadedVideoUrl(URL.createObjectURL(file));
    }
  };

  const removeVideo = () => {
    form.setValue('video', undefined as any);
    setUploadedVideoUrl(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold mb-2">
              {translate('Submit Your Idea')}
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        {translate('CNIC')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12345-1234567-1"
                          {...field}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600 mb-4">
                            {translate('Drag & drop your video here, or click to browse')}
                          </p>
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime,video/x-msvideo"
                            onChange={handleVideoChange}
                            className="hidden"
                            id="video-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('video-upload')?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? translate('Uploading video...') : 'Choose Video'}
                          </Button>
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
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  >
                    {isSubmitting ? translate('Submitting...') : translate('Submit Application')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplyForm;