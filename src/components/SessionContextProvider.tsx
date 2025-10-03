"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/integrations/supabase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { showLoading, dismissToast, showError } from '@/utils/toast';
import { useLanguage } from '@/i18n/LanguageContext';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface SessionContextType {
  session: Session | null;
  user: (User & UserProfile) | null;
  isLoading: boolean;
  isAdmin: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<(User & UserProfile) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { translate } = useLanguage();

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      const loadingToastId = showLoading(translate("Loading session..."));
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);

        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          setUser({ ...session.user, ...profile });
        } else {
          setUser(null);
        }
      } catch (error: any) {
        console.error("Error fetching session:", error.message);
        showError(translate("Failed to load session. Please try again."));
        setSession(null);
        setUser(null);
      } finally {
        dismissToast(loadingToastId);
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setIsLoading(true);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setSession(currentSession);
        if (currentSession?.user) {
          try {
            const profile = await getUserProfile(currentSession.user.id);
            setUser({ ...currentSession.user, ...profile });
            if (location.pathname === '/login') {
              if (profile.role === 'admin') {
                navigate('/admin');
              } else {
                navigate('/dashboard');
              }
            }
          } catch (profileError: any) {
            console.error("Error fetching user profile:", profileError.message);
            showError(translate("Failed to load user profile."));
            setUser(null);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        navigate('/login');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, translate]);

  const isAdmin = user?.role === 'admin';

  return (
    <SessionContext.Provider value={{ session, user, isLoading, isAdmin }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};