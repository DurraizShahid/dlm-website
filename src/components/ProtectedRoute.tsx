"use client";

import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider';
import { useLanguage } from '@/i18n/LanguageContext';
import { showError } from '@/utils/toast';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { session, user, isAdmin, loading } = useSession();
  const { translate } = useLanguage();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">{translate("Loading...")}</div>;
  }

  if (!session || !user) {
    showError(translate("You must be logged in to view this page."));
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    showError(translate("You do not have permission to view this page."));
    return <Navigate to="/" replace />; // Redirect non-admins to home
  }

  return <>{children}</>;
};

export default ProtectedRoute;