import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { translations } from '@/i18n/translations';
import { toast } from 'sonner';
import { Mail, Key, LogIn } from 'lucide-react';

const magicLinkSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

const passwordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const LoginForm = () => {
  const { signInWithMagicLink, signInWithPassword } = useAuth();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const translate = (key: keyof typeof translations) => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  const magicLinkForm = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleMagicLinkSubmit = async (data: MagicLinkFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signInWithMagicLink(data.email);
      if (error) {
        toast.error('Error sending magic link. Please try again.');
      }
    } catch (error) {
      toast.error('Error sending magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signInWithPassword(data.email, data.password);
      if (error) {
        toast.error('Invalid email or password. Please try again.');
      }
    } catch (error) {
      toast.error('Error signing in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold mb-2">
              <LogIn className="h-6 w-6 mx-auto mb-2" />
              Access Your Dashboard
            </CardTitle>
            <CardDescription className="text-blue-100">
              Sign in to view your applications and access learning resources
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="magic-link" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="magic-link" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Magic Link</span>
                </TabsTrigger>
                <TabsTrigger value="password" className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Password</span>
                </TabsTrigger>
              </TabsList>

              {/* Magic Link Tab */}
              <TabsContent value="magic-link" className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    Enter your email to receive a secure login link
                  </p>
                </div>
                <Form {...magicLinkForm}>
                  <form onSubmit={magicLinkForm.handleSubmit(handleMagicLinkSubmit)} className="space-y-4">
                    <FormField
                      control={magicLinkForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              {...field}
                              className="h-12 border-2 border-gray-200 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                    >
                      {isLoading ? 'Sending...' : 'Send Magic Link'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Password Tab */}
              <TabsContent value="password" className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    Sign in with your email and password
                  </p>
                </div>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              {...field}
                              className="h-12 border-2 border-gray-200 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              {...field}
                              className="h-12 border-2 border-gray-200 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/apply" className="text-blue-600 hover:text-blue-700 underline">
                  Submit an application
                </a>{' '}
                to get started
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;