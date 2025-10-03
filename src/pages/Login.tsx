"use client";

import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Login = () => {
  const { session, isLoading, user } = useSession();
  const navigate = useNavigate();
  const { translate } = useLanguage();

  useEffect(() => {
    if (!isLoading && session) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [session, isLoading, navigate, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">{translate("Loading...")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          {translate("Login")}
        </h1>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(45 93% 47%)', // Yellow-500
                  brandAccent: 'hsl(45 93% 57%)', // Yellow-600
                  brandButtonText: 'hsl(222.2 47.4% 11.2%)', // Gray-900
                },
              },
            },
          }}
          theme="light" // Force light theme for auth UI
          localization={{
            variables: {
              sign_in: {
                email_label: translate("Email or Phone"),
                password_label: translate("Password"),
                email_input_placeholder: translate("Your email or phone number"),
                password_input_placeholder: translate("Your password"),
                button_label: translate("Sign In"),
                social_auth_typography: translate("Or continue with"),
                link_text: translate("Already have an account? Sign In"),
                forgotten_password: translate("Forgot your password?"),
                confirmation_text: translate("Check your email for the login link."),
              },
              sign_up: {
                email_label: translate("Email or Phone"),
                password_label: translate("Create a Password"),
                email_input_placeholder: translate("Your email or phone number"),
                password_input_placeholder: translate("Your password"),
                button_label: translate("Sign Up"),
                social_auth_typography: translate("Or continue with"),
                link_text: translate("Don't have an account? Sign Up"),
                confirmation_text: translate("Check your email to confirm your account."),
              },
              forgotten_password: {
                email_label: translate("Email or Phone"),
                email_input_placeholder: translate("Your email or phone number"),
                button_label: translate("Send reset instructions"),
                link_text: translate("Forgot your password?"),
                confirmation_text: translate("Check your email for the password reset link."),
              },
              update_password: {
                password_label: translate("New Password"),
                password_input_placeholder: translate("Your new password"),
                button_label: translate("Update Password"),
                confirmation_text: translate("Your password has been updated."),
              },
            },
          }}
        />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Login;