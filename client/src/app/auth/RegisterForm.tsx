import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Mail, UserPlus, CheckCircle, MailCheck, Shield, Settings, Zap, Users, BarChart2, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getPublicCampuses, type PublicCampus } from '@/lib/api/auth';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  campus_id: z.string().min(1, 'Select your campus')
});

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register, isLoading } = useAuth();
  const [campuses, setCampuses] = React.useState<PublicCampus[]>([]);
  const [createdUsername, setCreatedUsername] = React.useState<string | null>(null);

  React.useEffect(() => {
    getPublicCampuses().then(setCampuses).catch(() => {});
  }, []);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      campus_id: ''
    }
  });

  const handleSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      const result = await register({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        campus_id: Number(values.campus_id)
      });

      setCreatedUsername(result.username);
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
            error?: { code?: string; message?: string } | string;
            errors?: Record<string, string>;
          };
        };
      };
      const backendError = err?.response?.data?.error;
      const errorMessage = err?.response?.data?.message
        || (typeof backendError === 'string' ? backendError : backendError?.message)
        || 'Registration failed. Please try again.';

      if (err?.response?.data?.errors) {
        Object.keys(err.response.data.errors).forEach(field => {
          form.setError(field as keyof z.infer<typeof registerSchema>, {
            type: 'server',
            message: err.response!.data!.errors![field]
          });
        });
      }

      toast.error(errorMessage);
    }
  };

  if (createdUsername) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-4 pb-4 text-center">
            <div className="flex justify-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <MailCheck className="w-7 h-7 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Check your email</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Account created. Your username is <span className="font-semibold text-gray-800">{createdUsername}</span>.
              We've emailed you a link to set your password and activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {onSwitchToLogin && (
              <Button variant="outline" className="w-full" onClick={onSwitchToLogin}>
                Back to Sign In
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Info */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-green-600 opacity-90" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-12">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-white mb-6">
              Join Resolver
            </h2>
            <p className="text-green-100 text-lg leading-relaxed mb-8">
              Create your account and start submitting requests in minutes. Resolver tracks every request from submission to resolution — so nothing falls through the cracks.
            </p>

            <div className="space-y-5">
              {[
                { icon: CheckCircle, title: 'Quick Setup',         desc: 'Register and submit your first request in minutes — no configuration required on your end' },
                { icon: Shield,      title: 'Role-Based Access',   desc: 'JWT-secured with purpose-built views for requesters, technicians, supervisors and management' },
                { icon: Settings,    title: 'Request Tracking',    desc: 'Every request is logged, assigned and followed through to resolution with a full audit trail' },
                { icon: Zap,         title: 'SLA & Escalation',    desc: 'Automatic SLA timers and escalation paths keep resolution times in check' },
                { icon: Users,       title: 'Multi-Org Routing',   desc: 'Scales across multiple sites — requests route automatically to the right team' },
                { icon: BarChart2,   title: 'Analytics & Reports', desc: 'Real-time dashboards and exportable reports give teams full visibility into performance' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm leading-snug">{title}</h3>
                    <p className="text-green-100 text-xs leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white to-transparent opacity-5 rounded-full transform translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white to-transparent opacity-5 rounded-full transform -translate-x-24 translate-y-24" />
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg shadow-xl border-0">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Create Account
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-2">
                Get started with Resolver
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input placeholder="John" className="pl-10 h-11" {...field} disabled={isLoading} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" className="h-11" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input placeholder="john@example.com" className="pl-10 h-11" {...field} disabled={isLoading} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campus_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Campus</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10 pointer-events-none" />
                            <SelectTrigger className="pl-10 h-11">
                              <SelectValue placeholder="Select your campus" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {campuses.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </Form>

            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Account Information
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Your username is generated automatically from your name</li>
                <li>• We'll email you a link to set your password and activate your account</li>
                <li>• New accounts start with the requester role by default</li>
                <li>• Contact your administrator to be assigned a staff role</li>
              </ul>
            </div>

            <div className="pt-6">
              <Separator className="mb-6" />
              {onSwitchToLogin && (
                <div className="text-center pb-4">
                  <span className="text-sm text-gray-600">Already have an account? </span>
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-sm font-medium text-green-600 hover:text-green-500 transition-colors"
                  >
                    Sign in instead
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
