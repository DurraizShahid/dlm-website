"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';

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

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session); // For debugging
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
            setIsAdmin(false); // Ensure isAdmin is reset on error
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
        setLoading(false); // Always set loading to false
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed:", _event, session); // For debugging
        setSession(session);
        setUser(session?.user || null);
        setLoading(true); // Set loading true while re-evaluating session/profile

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
            setLoading(false); // Always set loading to false after auth state change processing
          }
        } else {
          setIsAdmin(false);
          setLoading(false); // If no user, immediately set loading to false
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [translate]);

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