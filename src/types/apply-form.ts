import { z } from 'zod';

// Database types
export interface ApplicationSubmission {
  id?: string;
  full_name: string;
  email: string;
  phone_number?: string;
  age: number;
  address: string;
  cnic: string;
  idea_title: string;
  idea_description: string;
  video_url?: string;
  user_id?: string;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'unpaid' | 'paid';
  created_at?: string;
  updated_at?: string;
}

// Form validation schema
export const applyFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full Name must be at least 2 characters.")
    .max(100, "Full Name cannot exceed 100 characters."),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .min(1, "Email is required."),
  phoneNumber: z
    .string()
    .regex(
      /^(\+92|0)?[0-9]{10}$/,
      "Please enter a valid Pakistani phone number (e.g., 03001234567 or +923001234567)."
    ),
  age: z
    .number()
    .min(0, "Age must be a positive number.")
    .max(100, "Age cannot exceed 100."),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters.")
    .max(200, "Address cannot exceed 200 characters."),
  cnic: z
    .string()
    .regex(
      /^\d{5}-\d{7}-\d{1}$/,
      "Please enter a valid Pakistani CNIC number (e.g., 12345-1234567-1)."
    ),
  ideaTitle: z
    .string()
    .min(5, "Idea Title must be at least 5 characters.")
    .max(100, "Idea Title cannot exceed 100 characters."),
  ideaDescription: z
    .string()
    .min(300, "Description must be at least 300 characters.")
    .max(500, "Description cannot exceed 500 characters."),
  video: z
    .instanceof(File)
    .refine(
      (file) => file?.size <= 200 * 1024 * 1024,
      "Max video size is 200MB."
    )
    .refine(
      (file) => ['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(file?.type),
      "Only .mp4, .mov, .avi formats are accepted."
    )
});

export type ApplyFormData = z.infer<typeof applyFormSchema>;