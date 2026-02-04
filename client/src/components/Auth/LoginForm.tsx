import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Mail, Lock, Shield, Settings, Users, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

// Simple login schema with username and password
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  // Simplified state - remove magic link logic for testing
  // const [authMethod, setAuthMethod] = useState<'password' | 'magic_link' | null>(null);
  // const [userRole, setUserRole] = useState<string>('');
  // const [email, setEmail] = useState('');

  const { login, isLoading } = useAuth();
  // Commented out magic link functionality for testing
  // const { login, checkAuthMethod, requestMagicLink, isLoading } = useAuth();

  // Single login form with username and password
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { 
      username: '', 
      password: '' 
    }
  });

  // Simplified login handler - direct username/password authentication
  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      // Use username for login
      const result = await login({
        username: values.username,
        password: values.password,
        remember_me: false
      });
      
      toast.success(`Welcome back!`);
      
      // Redirect based on role from login response
      const roleRedirect = {
        'admin': '/dashboard',
        'technician': '/technician', 
        'user': '/user'
      };
      
      const redirectPath = roleRedirect[result.role as keyof typeof roleRedirect] || '/dashboard';
      window.location.href = redirectPath;
      
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  // Commented out magic link functionality for testing
  // const handleMagicLinkRequest = async () => {
  //   try {
  //     await requestMagicLink(email);
  //     toast.success('Magic link sent! Check your email inbox.');
  //   } catch (error: any) {
  //     toast.error(error.response?.data?.message || 'Failed to send magic link');
  //   }
  // };

  // const resetForm = () => {
  //   loginForm.reset();
  // };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Info */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 opacity-90" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-12">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-white mb-6">
              Resolver 🚀
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              A comprehensive maintenance ticketing system designed to efficiently track, monitor, and resolve maintenance issues across the organization.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Secure Authentication</h3>
                  <p className="text-blue-100 text-sm">Role-based access control for maintenance teams</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Issue Tracking</h3>
                  <p className="text-blue-100 text-sm">Create and manage maintenance tickets from report to resolution</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Workflow Automation</h3>
                  <p className="text-blue-100 text-sm">Streamlined processes from ticket submission to completion</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Resolution Monitoring</h3>
                  <p className="text-blue-100 text-sm">Track progress and ensure timely resolution of all issues</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white to-transparent opacity-5 rounded-full transform translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white to-transparent opacity-5 rounded-full transform -translate-x-24 translate-y-24" />
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg p-8">
          <Card className="w-full shadow-xl border-0">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-2">
                Sign in to Resolver
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Simple username/password login form */}
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Username
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="e.g., tech_maria"
                            className="pl-10 h-11"
                            {...field}
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10 h-11"
                            {...field}
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </Form>
            
            {/* Commented out multi-step auth UI for testing */}
            {/* {!authMethod ? (
            ) : (
              // Step 2: Authentication Method - COMMENTED OUT FOR TESTING
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{email}</p>
                </div>
                
                {authMethod === 'password' ? (
                  // Password Authentication
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                  type="password"
                                  placeholder="Enter your password"
                                  className="pl-10 h-11"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg" 
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  // Magic Link Authentication - COMMENTED OUT FOR TESTING
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-center font-semibold text-gray-900 mb-2">
                        Magic Link Authentication - DISABLED FOR TESTING
                      </h3>
                      <p className="text-center text-sm text-gray-600">
                        Magic link functionality temporarily disabled for testing purposes.
                      </p>
                    </div>
                    
                    <Button 
                      disabled
                      className="w-full h-11 bg-gray-300 text-gray-500 cursor-not-allowed" 
                    >
                      Magic Link Disabled
                    </Button>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={resetForm} 
                  className="w-full h-11 border-gray-300 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )} */}
            
            {/* Footer */}
            <div className="pt-6">
              <Separator className="mb-6" />
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 rounded-full mx-auto mb-1"></div>
                  <p className="text-xs text-blue-700 font-medium">Email & Password Login</p>
                  <p className="text-xs text-blue-600">All Users (Testing Mode)</p>
                </div>
                {/* Magic Link authentication temporarily disabled for testing */}
                {/* <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 rounded-full mx-auto mb-1"></div>
                  <p className="text-xs text-green-700 font-medium">User Login</p>
                  <p className="text-xs text-green-600">Magic Link</p>
                </div> */}
              </div>
              
              {onSwitchToRegister && (
                <div className="text-center pb-4">
                  <span className="text-sm text-gray-600">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Create account
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};