"use client";

import React from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { useLanguage } from '@/i18n/LanguageContext';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Admin = () => {
  const { user, isLoading, isAdmin } = useSession();
  const { translate } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">{translate("Loading...")}</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    // This case should ideally be handled by SessionContextProvider redirecting to login
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">{translate("Access Denied. You must be an administrator to view this page.")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-red-700 dark:text-red-400 mb-4">
          {translate("Admin Panel")}
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          {translate("Hello")}, {user.first_name || user.email}! {translate("You have administrator privileges.")}
        </p>
        <p className="text-md text-gray-600 dark:text-gray-400">
          {translate("Here you can manage applications, users, and other system settings.")}
        </p>
        {/* Add more admin-related content here */}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Admin;