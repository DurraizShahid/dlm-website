export interface Database {
  public: {
    Tables: {
      application_submissions: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          age: number;
          address: string;
          cnic: string;
          idea_title: string;
          idea_description: string;
          video_url: string | null;
          user_id: string | null;
          status: 'pending' | 'under_review' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          age: number;
          address: string;
          cnic: string;
          idea_title: string;
          idea_description: string;
          video_url?: string | null;
          user_id?: string | null;
          status?: 'pending' | 'under_review' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          age?: number;
          address?: string;
          cnic?: string;
          idea_title?: string;
          idea_description?: string;
          video_url?: string | null;
          user_id?: string | null;
          status?: 'pending' | 'under_review' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          has_password: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          has_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          has_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      guidebooks: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          file_path: string;
          is_free: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          file_path: string;
          is_free?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          file_path?: string;
          is_free?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Helper interface for guidebook data
export interface Guidebook {
  id: string;
  title: string;
  description: string;
  category: string;
  file_path: string;
  is_free: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}