"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { translate } = useLanguage();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error(translate("Error fetching user profile:"), error.message);
            setIsAdmin(false);
          } else if (profile && profile.role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error during initial session fetch or profile check:", error);
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => { // Changed _event to event
        setSession(session);
        setUser(session?.user || null);
        setLoading(true);

        if (event === 'SIGNED_OUT') { // Handle SIGNED_OUT event explicitly
          setIsAdmin(false);
          setLoading(false);
          navigate('/login'); // Redirect to login page after sign out
          return; // Exit early as session is null
        }

        if (session?.user) {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.error(translate("Error fetching user profile on auth state change:"), error.message);
              setIsAdmin(false);
            } else if (profile && profile.role === 'admin') {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch (profileError) {
            console.error("Error fetching user profile during auth state change:", profileError);
            setIsAdmin(false);
          } finally {
            setLoading(false);
          }
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [translate, navigate]); // Add navigate to dependency array

  return (
    <SessionContext.Provider value={{ session, user, isAdmin, loading }}>
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