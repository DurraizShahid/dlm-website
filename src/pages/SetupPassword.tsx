import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import bcrypt from 'bcryptjs';

const SetupPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const applicationId = searchParams.get('id');
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');

  useEffect(() => {
    // Validate that we have the necessary parameters
    if (!applicationId || (!email && !phone)) {
      toast.error('Invalid setup link. Please submit your application again.');
      navigate('/apply');
    }
  }, [applicationId, email, phone, navigate]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Hash the password using bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Update the application with the password hash
      const { error: updateError } = await (supabase as any)
        .from('application_submissions')
        .update({ 
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Error updating password:', updateError);
        toast.error('Error setting up password. Please try again.');
        return;
      }

      toast.success('Password created successfully! Logging you in...');

      // Store authentication in session
      sessionStorage.setItem('user_authenticated', 'true');
      sessionStorage.setItem('user_id', applicationId!);
      sessionStorage.setItem('user_identifier', email || phone || '');

      // Redirect to dashboard
      setTimeout(() => {
        if (email) {
          navigate(`/dashboard?email=${encodeURIComponent(email)}&auto_login=true`);
        } else if (phone) {
          navigate(`/dashboard?phone=${encodeURIComponent(phone)}&auto_login=true`);
        }
      }, 1500);

    } catch (error) {
      console.error('Error in password setup:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    
    if (strength <= 25) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 50) return { strength, label: 'Fair', color: 'bg-orange-500' };
    if (strength <= 75) return { strength, label: 'Good', color: 'bg-yellow-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-green-800 via-emerald-600 to-yellow-500 text-white rounded-t-lg">
            <div className="mx-auto bg-white rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-green-800" />
            </div>
            <CardTitle className="text-2xl font-bold mb-2">
              Create Your Password
            </CardTitle>
            <CardDescription className="text-green-100">
              Secure your account to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                  Account
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  value={email || phone || ''}
                  disabled
                  className="h-12 bg-gray-50 border-2 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {password && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.strength === 100 ? 'text-green-600' : 
                        passwordStrength.strength >= 75 ? 'text-yellow-600' :
                        passwordStrength.strength >= 50 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-600 space-y-1 mt-2">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3 w-3 ${password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`} />
                    At least 8 characters
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3 w-3 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`} />
                    One uppercase letter
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3 w-3 ${/[a-z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`} />
                    One lowercase letter
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3 w-3 ${/[0-9]/.test(password) ? 'text-green-500' : 'text-gray-400'}`} />
                    One number
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                className="w-full h-12 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-gray-900"
              >
                {isLoading ? 'Creating Account...' : 'Create Password & Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupPassword;

