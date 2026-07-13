import { useNavigate } from 'react-router-dom';
import { Mail, Building2, Briefcase, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLE_LABELS } from '@/components/layout/RoleSwitcher';

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-b-0">
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const fullName = `${user.first_name} ${user.last_name}`.trim() || user.username;

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <div className="px-6 py-4 border-b bg-background shrink-0 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">My Profile</h1>
          <p className="text-sm text-muted-foreground">Your account details.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">{fullName}</CardTitle>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </CardHeader>
          <CardContent className="pt-0">
            <ProfileRow icon={Mail} label="Email" value={user.email} />
            <ProfileRow icon={Shield} label="Role" value={ROLE_LABELS[user.role]} />
            {user.home_campus_name && (
              <ProfileRow icon={Building2} label="Campus" value={user.home_campus_name} />
            )}
            {user.primary_department_name && (
              <ProfileRow icon={Briefcase} label="Department" value={user.primary_department_name} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
