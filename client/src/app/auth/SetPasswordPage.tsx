import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Lock, ShieldCheck, XCircle } from 'lucide-react';
import { setPassword } from '@/lib/api/auth';

const setPasswordSchema = z
  .object({
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

const ROLE_REDIRECT: Record<string, string> = {
  admin: '/dashboard',
  technician: '/technician',
  user: '/user',
  hos: '/section-head',
  hod: '/hod',
  manager: '/manager',
};

export function SetPasswordPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'entering' | 'submitting' | 'error'>(
    uid && token ? 'entering' : 'error'
  );

  const form = useForm<z.infer<typeof setPasswordSchema>>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { new_password: '', confirm_password: '' },
  });

  const handleSubmit = async (values: z.infer<typeof setPasswordSchema>) => {
    if (!uid || !token) return;
    setStatus('submitting');
    try {
      const result = await setPassword(uid, token, values.new_password, values.confirm_password);
      toast.success('Password set! Welcome to Resolver.');
      let redirectPath = ROLE_REDIRECT[result.role] ?? '/user';
      if (result.role === 'technician' && window.innerWidth < 640) {
        redirectPath = '/tech/mobile';
      }
      window.location.assign(redirectPath);
    } catch (error: unknown) {
      setStatus('entering');
      const err = error as {
        response?: { data?: { error?: { message?: string | Record<string, string[]> } } };
      };
      const message = err?.response?.data?.error?.message;
      const displayMessage =
        typeof message === 'string'
          ? message
          : message && typeof message === 'object'
            ? Object.values(message).flat().join(' ')
            : null;
      toast.error(displayMessage || 'This link is invalid or has expired.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Set your password</CardTitle>
          {status !== 'error' && (
            <CardDescription>Choose a password to activate your account.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {status === 'error' ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <p className="text-gray-600">This link is invalid or missing required information.</p>
              <Button className="w-full" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input type="password" className="pl-10 h-11" {...field} disabled={status === 'submitting'} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input type="password" className="pl-10 h-11" {...field} disabled={status === 'submitting'} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Setting password...' : 'Set Password & Sign In'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
