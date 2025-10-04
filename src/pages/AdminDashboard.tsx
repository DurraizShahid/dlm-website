"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { MadeWithDyad } from "@/components/made-with-dyad";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { showError } from "@/utils/toast";

interface Application {
  id: string;
  full_name: string;
  age: number;
  city: string;
  cnic: string;
  contact: string;
  idea_title: string;
  short_description: string;
  video_url: string | null;
  created_at: string;
  user_id: string | null;
  status: string;
  payment_status: string;
  payment_amount: number;
}

const AdminDashboard = () => {
  const { translate } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        setError(translate(`Error loading applications: ${error.message}`));
        showError(translate(`Error loading applications: ${error.message}`));
      } else {
        setApplications(data || []);
      }
      setLoading(false);
    };

    fetchApplications();
  }, [translate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {translate("Loading applications...")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-full w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-center mb-4 text-gray-900 dark:text-gray-100">
          {translate("Welcome to the Admin Dashboard")}
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 text-center mb-8">
          {translate("Manage all submitted applications.")}
        </p>

        {applications.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            {translate("No applications found.")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{translate("Full Name (Admin)")}</TableHead>
                  <TableHead>{translate("Age (Admin)")}</TableHead>
                  <TableHead>{translate("City (Admin)")}</TableHead>
                  <TableHead>{translate("CNIC (Admin)")}</TableHead>
                  <TableHead>{translate("Contact (Admin)")}</TableHead>
                  <TableHead>{translate("Idea Title (Admin)")}</TableHead>
                  <TableHead>{translate("Description (Admin)")}</TableHead>
                  <TableHead>{translate("Video URL (Admin)")}</TableHead>
                  <TableHead>{translate("Status (Admin)")}</TableHead>
                  <TableHead>{translate("Payment Status (Admin)")}</TableHead>
                  <TableHead>{translate("Payment Amount (Admin)")}</TableHead>
                  <TableHead>{translate("Created At (Admin)")}</TableHead>
                  <TableHead>{translate("User ID (Admin)")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.full_name}</TableCell>
                    <TableCell>{app.age}</TableCell>
                    <TableCell>{app.city}</TableCell>
                    <TableCell>{app.cnic}</TableCell>
                    <TableCell>{app.contact}</TableCell>
                    <TableCell>{app.idea_title}</TableCell>
                    <TableCell className="max-w-xs truncate">{app.short_description}</TableCell>
                    <TableCell>
                      {app.video_url ? (
                        <Button variant="link" asChild className="p-0 h-auto">
                          <a href={app.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 dark:text-blue-400">
                            <ExternalLink className="h-4 w-4 mr-1" /> {translate("View Video")}
                          </a>
                        </Button>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{app.status}</TableCell>
                    <TableCell>{app.payment_status}</TableCell>
                    <TableCell>{app.payment_amount}</TableCell>
                    <TableCell>{new Date(app.created_at).toLocaleString()}</TableCell>
                    <TableCell className="max-w-[100px] truncate">{app.user_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default AdminDashboard;