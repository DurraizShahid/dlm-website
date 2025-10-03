"use client";

import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UploadCloud, FileText, XCircle } from "lucide-react";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ApplyForm = () => {
  const { translate } = useLanguage();

  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;

  const applyFormSchema = z.object({
    fullName: z.string().min(2, { message: translate("Full Name must be at least 2 characters.") }),
    age: z.coerce.number().min(18, { message: translate("You must be at least 18 years old.") }).max(100, { message: translate("Age cannot exceed 100.") }),
    city: z.string().min(2, { message: translate("City must be at least 2 characters.") }),
    cnic: z.string().regex(cnicRegex, { message: translate("Please enter a valid Pakistani CNIC number (e.g., 12345-1234567-1).") }),
    contact: z.string().refine(
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      },
      { message: translate("Please enter a valid email or phone number.") }
    ),
    ideaTitle: z.string().min(5, { message: translate("Idea Title must be at least 5 characters.") }),
    shortDescription: z.string().min(300, { message: translate("Description must be at least 300 characters.") }).max(500, { message: translate("Description cannot exceed 500 characters.") }),
    video: z.instanceof(File, { message: translate("Video upload is required.") })
      .refine((file) => file.size <= 200 * 1024 * 1024, translate(`Max video size is 200MB.`))
      .refine((file) => ['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(file.type), translate(`Only .mp4, .mov, .avi formats are accepted.`)),
  });

  type ApplyFormValues = z.infer<typeof applyFormSchema>;

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      fullName: "",
      age: undefined,
      city: "",
      cnic: "",
      contact: "",
      ideaTitle: "",
      shortDescription: "",
      video: undefined,
    },
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isDuplicateCnic, setIsDuplicateCnic] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [originalApplicationId, setOriginalApplicationId] = useState<string | null>(null);

  const videoRef = form.watch("video");

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      form.setValue("video", files[0], { shouldValidate: true });
      form.trigger("video");
    }
  }, [form]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      form.setValue("video", files[0], { shouldValidate: true });
      form.trigger("video");
    }
  }, [form]);

  const handleRemoveVideo = useCallback(() => {
    form.setValue("video", undefined, { shouldValidate: true });
    form.trigger("video");
  }, [form]);

  const handleCnicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, '');
    let formattedValue = '';

    if (value.length > 0) {
      formattedValue = value.substring(0, 5);
    }
    if (value.length > 5) {
      formattedValue += '-' + value.substring(5, 12);
    }
    if (value.length > 12) {
      formattedValue += '-' + value.substring(12, 13);
    }
    form.setValue("cnic", formattedValue, { shouldValidate: true });
    setIsDuplicateCnic(false); // Reset duplicate status on CNIC change
    setShowPaymentOptions(false);
    setSelectedPaymentMethod(null);
    setOriginalApplicationId(null);
  };

  const checkDuplicateApplication = async (cnic: string, contact: string) => {
    const { data: existingApplications, error: checkError } = await supabase
      .from('applications')
      .select('id, cnic, contact')
      .or(`cnic.eq.${cnic},contact.eq.${contact}`);

    if (checkError) {
      throw new Error(translate(`Error checking for existing applications: ${checkError.message}`));
    }

    const cnicMatch = existingApplications?.find(app => app.cnic === cnic);
    const contactMatch = existingApplications?.find(app => app.contact === contact);

    if (cnicMatch && contactMatch && cnicMatch.id === contactMatch.id) {
      // Both CNIC and contact match the same existing application
      setIsDuplicateCnic(true);
      setOriginalApplicationId(cnicMatch.id);
      return { isDuplicate: true, type: 'both', applicationId: cnicMatch.id };
    } else if (cnicMatch) {
      // Only CNIC matches an existing application
      setIsDuplicateCnic(true);
      setOriginalApplicationId(cnicMatch.id);
      return { isDuplicate: true, type: 'cnic', applicationId: cnicMatch.id };
    } else if (contactMatch) {
      // Only contact matches an existing application
      // For simplicity, we'll treat this as a duplicate requiring payment if CNIC is also present in the form
      // If the user changes CNIC but keeps the same contact, it's still a duplicate.
      // If the user changes contact but keeps the same CNIC, it's also a duplicate.
      setIsDuplicateCnic(true);
      setOriginalApplicationId(contactMatch.id);
      return { isDuplicate: true, type: 'contact', applicationId: contactMatch.id };
    }

    return { isDuplicate: false };
  };

  const handleInitialSubmit = async (data: ApplyFormValues) => {
    const loadingToastId = showLoading(translate("Submitting your application..."));
    try {
      const duplicateCheckResult = await checkDuplicateApplication(data.cnic, data.contact);

      if (duplicateCheckResult.isDuplicate) {
        dismissToast(loadingToastId);
        showError(translate("An application with this CNIC or Email/Phone has already been registered."));
        setShowPaymentOptions(true);
        return;
      }

      // If not a duplicate, proceed with normal submission
      await submitApplication(data, null);
      showSuccess(translate("Application submitted successfully!"));
      form.reset();
      handleRemoveVideo();
    } catch (error: any) {
      showError(error.message || translate("An unexpected error occurred."));
    } finally {
      dismissToast(loadingToastId);
    }
  };

  const submitApplication = async (data: ApplyFormValues, originalAppId: string | null) => {
    let videoUrl = null;

    // 1. Upload video to Supabase Storage
    if (data.video) {
      const fileExtension = data.video.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('application-videos')
        .upload(fileName, data.video, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(translate(`Video upload failed: ${uploadError.message}`));
      }

      const { data: publicUrlData } = supabase.storage
        .from('application-videos')
        .getPublicUrl(fileName);
      
      videoUrl = publicUrlData.publicUrl;
    }

    // 2. Insert form data into Supabase database
    const { data: newApplication, error: insertError } = await supabase
      .from('applications')
      .insert({
        full_name: data.fullName,
        age: data.age,
        city: data.city,
        cnic: data.cnic,
        contact: data.contact,
        idea_title: data.ideaTitle,
        short_description: data.shortDescription,
        video_url: videoUrl,
        // user_id is removed as there is no logged-in user
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(translate(`Application submission failed: ${insertError.message}`));
    }

    // 3. If it's a duplicate application, record the payment
    if (originalAppId && newApplication?.id) {
      const { error: paymentInsertError } = await supabase
        .from('duplicate_applications_payments')
        .insert({
          application_id: newApplication.id,
          cnic: data.cnic,
          payment_method: selectedPaymentMethod || 'N/A', // Use selected method
          payment_amount: 500, // Fixed fee
          is_paid: true, // Payment is confirmed
        });

      if (paymentInsertError) {
        console.error("Error recording duplicate payment:", paymentInsertError);
        // Don't throw error here, as the application itself was submitted.
        // Just log the payment recording failure.
      }
    }
  };

  const handlePaymentAndSubmit = async () => {
    if (!selectedPaymentMethod) {
      showError(translate("Please select a payment method."));
      return;
    }

    const loadingToastId = showLoading(translate("Confirming payment and submitting application..."));
    try {
      const data = form.getValues(); // Get current form values
      await submitApplication(data, originalApplicationId);
      showSuccess(translate("Payment confirmed and application submitted successfully!"));
      form.reset();
      handleRemoveVideo();
      setIsDuplicateCnic(false);
      setShowPaymentOptions(false);
      setSelectedPaymentMethod(null);
      setOriginalApplicationId(null);
    } catch (error: any) {
      showError(error.message || translate("An unexpected error occurred during payment and submission."));
    } finally {
      dismissToast(loadingToastId);
    }
  };

  return (
    <section className="bg-white text-gray-900 py-16 px-4 sm:py-24 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-center">
          {translate("Submit Your Idea")}
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 text-center">
          {translate("Fill out the form below to apply for a chance to win 10 Lakh Rupees and bring your dream to life.")}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInitialSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("Full Name")}</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("Age")}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="25" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("City")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Karachi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cnic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("CNIC")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12345-1234567-1"
                      maxLength={15}
                      {...field}
                      onChange={handleCnicChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("Email / Phone")}</FormLabel>
                  <FormControl>
                    <Input placeholder="example@email.com or +923001234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ideaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("Idea Title")}</FormLabel>
                  <FormControl>
                    <Input placeholder="My Innovative Project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("Short Description (300-500 characters)")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your idea in detail..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500 text-right">
                    {field.value?.length || 0} / 500
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="video"
              render={() => (
                <FormItem>
                  <FormLabel>{translate("Upload Video (Required)")}</FormLabel>
                  <p className="text-sm text-gray-600 mb-2">
                    {translate("Upload a short video (max 2 minutes). Tell us your idea and why you deserve to win. Accept: .mp4, .mov, .avi (max 200MB)")}
                  </p>
                  <FormControl>
                    <div
                      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
                        ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-gray-400"}`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById("video-upload-input")?.click()}
                    >
                      {videoRef ? (
                        <div className="flex items-center space-x-3 text-green-700">
                          <FileText className="h-6 w-6" />
                          <span>{videoRef.name} ({(videoRef.size / (1024 * 1024)).toFixed(2)} MB)</span>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRemoveVideo(); }}>
                            <XCircle className="h-5 w-5 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-gray-600 text-center">
                            {translate("Drag & drop your video here, or click to browse")}
                          </p>
                        </>
                      )}
                      <input
                        id="video-upload-input"
                        type="file"
                        accept=".mp4,.mov,.avi"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!showPaymentOptions ? (
              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-full text-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75"
              >
                {translate("Submit Application")}
              </Button>
            ) : (
              <Card className="mt-8 border-yellow-500 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center text-xl text-red-600">
                    {translate("You have already submitted an application with this CNIC. To submit another idea, a fee of PKR 500 is required.")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <h3 className="text-lg font-semibold">{translate("Payment Method")}</h3>
                  <RadioGroup
                    onValueChange={setSelectedPaymentMethod}
                    value={selectedPaymentMethod || ""}
                    className="grid grid-cols-1 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="JazzCash/EasyPaisa" id="r1" />
                      <Label htmlFor="r1">{translate("JazzCash / EasyPaisa")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Dummy Card Payment" id="r2" />
                      <Label htmlFor="r2">{translate("Dummy Card Payment")}</Label>
                    </div>
                  </RadioGroup>
                  <Button
                    type="button"
                    onClick={handlePaymentAndSubmit}
                    disabled={!selectedPaymentMethod}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-75"
                  >
                    {translate("Confirm Payment & Submit")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>
      </div>
    </section>
  );
};

export default ApplyForm;