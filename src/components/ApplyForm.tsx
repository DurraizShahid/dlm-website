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
import { showSuccess, showError } from "@/utils/toast";

// Zod schema for form validation
const applyFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full Name must be at least 2 characters." }),
  age: z.coerce.number().min(18, { message: "You must be at least 18 years old." }).max(100, { message: "Age cannot exceed 100." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  contact: z.string().refine(
    (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format for phone numbers
      return emailRegex.test(value) || phoneRegex.test(value);
    },
    { message: "Please enter a valid email or phone number." }
  ),
  ideaTitle: z.string().min(5, { message: "Idea Title must be at least 5 characters." }),
  shortDescription: z.string().min(300, { message: "Description must be at least 300 characters." }).max(500, { message: "Description cannot exceed 500 characters." }),
  video: z.instanceof(File, { message: "Video upload is required." })
    .refine((file) => file.size <= 200 * 1024 * 1024, `Max video size is 200MB.`)
    .refine((file) => ['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(file.type), `Only .mp4, .mov, .avi formats are accepted.`),
});

type ApplyFormValues = z.infer<typeof applyFormSchema>;

const ApplyForm = () => {
  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      fullName: "",
      age: undefined,
      city: "",
      contact: "",
      ideaTitle: "",
      shortDescription: "",
      video: undefined,
    },
  });

  const [isDragging, setIsDragging] = useState(false);
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
      form.trigger("video"); // Manually trigger validation for the video field
    }
  }, [form]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      form.setValue("video", files[0], { shouldValidate: true });
      form.trigger("video"); // Manually trigger validation for the video field
    }
  }, [form]);

  const handleRemoveVideo = useCallback(() => {
    form.setValue("video", undefined, { shouldValidate: true });
    form.trigger("video");
  }, [form]);

  const onSubmit = (data: ApplyFormValues) => {
    console.log("Form Data Submitted:", data);
    // In a real application, you would send `data` to your backend here.
    // For video, you'd typically upload the file to cloud storage (e.g., AWS S3, Supabase Storage)
    // and send the resulting URL along with other form data.
    showSuccess("Application submitted successfully! (Simulated)");
    form.reset(); // Reset form after successful submission
    handleRemoveVideo(); // Clear video field explicitly
  };

  return (
    <section className="bg-white text-gray-900 py-16 px-4 sm:py-24 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-center">
          Submit Your Idea
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 text-center">
          Fill out the form below to apply for a chance to win 10 Lakh Rupees and bring your dream to life.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
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
                  <FormLabel>Age</FormLabel>
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
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Karachi" {...field} />
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
                  <FormLabel>Email / Phone</FormLabel>
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
                  <FormLabel>Idea Title</FormLabel>
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
                  <FormLabel>Short Description (300-500 characters)</FormLabel>
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
                  <FormLabel>Upload Video (Required)</FormLabel>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a short video (max 2 minutes). Tell us your idea and why you deserve to win.
                    Accept: .mp4, .mov, .avi (max 200MB)
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
                            Drag & drop your video here, or <span className="text-blue-600 font-medium">click to browse</span>
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

            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-full text-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75"
            >
              Submit Application
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default ApplyForm;