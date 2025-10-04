"use client";

import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider';
import { useLanguage } from '@/i18n/LanguageContext';

const Login = () => {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const { translate } = useLanguage();

  useEffect(() => {
    if (session && !loading) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [session, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">{translate("Loading...")}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
          {translate("Sign in to your account")}
        </h1>
        <Auth
          supabaseClient={supabase}
          providers={[]} // No third-party providers for now
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(45 93% 47%)', // Yellow-500
                  brandAccent: 'hsl(45 93% 57%)', // Yellow-600
                  brandButtonText: 'hsl(222.2 47.4% 11.2%)', // Gray-900
                  defaultButtonBackground: 'hsl(210 40% 96.1%)', // Secondary background
                  defaultButtonBackgroundHover: 'hsl(210 40% 90%)',
                  defaultButtonBorder: 'hsl(214.3 31.8% 91.4%)',
                  defaultButtonText: 'hsl(222.2 47.4% 11.2%)',
                  inputBackground: 'hsl(0 0% 100%)',
                  inputBorder: 'hsl(214.3 31.8% 91.4%)',
                  inputBorderHover: 'hsl(214.3 31.8% 80%)',
                  inputBorderFocus: 'hsl(217.2 91.2% 59.8%)', // Ring color
                  inputText: 'hsl(222.2 84% 4.9%)',
                  inputLabelText: 'hsl(215.4 16.3% 46.9%)',
                },
              },
              dark: {
                colors: {
                  brand: 'hsl(45 93% 47%)',
                  brandAccent: 'hsl(45 93% 57%)',
                  brandButtonText: 'hsl(222.2 47.4% 11.2%)',
                  defaultButtonBackground: 'hsl(217.2 32.6% 17.5%)',
                  defaultButtonBackgroundHover: 'hsl(217.2 32.6% 25%)',
                  defaultButtonBorder: 'hsl(217.2 32.6% 17.5%)',
                  defaultButtonText: 'hsl(210 40% 98%)',
                  inputBackground: 'hsl(222.2 84% 4.9%)',
                  inputBorder: 'hsl(217.2 32.6% 17.5%)',
                  inputBorderHover: 'hsl(217.2 32.6% 25%)',
                  inputBorderFocus: 'hsl(212.7 26.8% 83.9%)',
                  inputText: 'hsl(210 40% 98%)',
                  inputLabelText: 'hsl(215 20.2% 65.1%)',
                },
              },
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: translate("Email"),
                password_label: translate("Password"),
                email_input_placeholder: translate("Your email address"),
                password_input_placeholder: translate("Your password"),
                button_label: translate("Sign In"),
                social_auth_typography: translate("Or continue with"),
                link_text: translate("Already have an account? Sign In"),
                forgotten_password: translate("Forgot your password?"),
                confirmation_text: translate("Check your email for the login link."),
              },
              sign_up: {
                email_label: translate("Email"),
                password_label: translate("Password"),
                email_input_placeholder: translate("Your email address"),
                password_input_placeholder: translate("Create a password"),
                button_label: translate("Sign Up"),
                social_auth_typography: translate("Or continue with"),
                link_text: translate("Don't have an account? Sign Up"),
                confirmation_text: translate("Check your email to confirm your account."),
              },
              forgotten_password: {
                email_label: translate("Email"),
                email_input_placeholder: translate("Your email address"),
                button_label: translate("Send reset instructions"),
                link_text: translate("Forgot your password?"),
                confirmation_text: translate("Check your email for the password reset link."),
              },
              update_password: {
                password_label: translate("New password"),
                password_input_placeholder: translate("Your new password"),
                button_label: translate("Update password"),
                confirmation_text: translate("Your password has been updated."),
              },
            },
          }}
          theme="light" // Default to light theme, Tailwind handles dark mode
        />
      </div>
    </div>
  );
};

export default Login;