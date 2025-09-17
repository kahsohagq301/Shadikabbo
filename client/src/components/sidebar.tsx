import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import logoPath from "@assets/Logo png_1758104778985.png";
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  MapPin, 
  CreditCard, 
  Heart, 
  UsersRound, 
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/traffic", label: "Traffic", icon: Users },
  { path: "/account", label: "Account", icon: UserCircle },
  { path: "/tracking", label: "Tracking", icon: MapPin },
  { path: "/paid-client", label: "Paid Client", icon: CreditCard },
  { path: "/success-story", label: "Success Story", icon: Heart },
  { path: "/hrm", label: "HRM", icon: UsersRound },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const getRoleDisplayName = (role: string | undefined) => {
    switch (role) {
      case 'cro_agent':
        return 'CRO Agent';
      case 'matchmaker':
        return 'Matchmaker';
      case 'super_admin':
        return 'Super Admin';
      default:
        return 'User';
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-border flex items-center justify-center">
        <img 
          src={logoPath}
          alt="ShadiKabbo Logo" 
          className="h-24 md:h-28 lg:h-32 object-contain w-auto max-w-[220px]"
          data-testid="img-logo"
        />
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center bg-muted rounded-full p-1">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              SA
            </AvatarFallback>
          </Avatar>
          <div className="px-3 flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate" data-testid="text-username">
              {user?.username}
            </div>
            <div className="text-xs text-muted-foreground" data-testid="text-user-role">
              {getRoleDisplayName(user?.role)}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logoutMutation.mutate()}
            className="text-muted-foreground hover:text-foreground p-1"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} href={path}>
            <a
              className={cn(
                "sidebar-link flex items-center space-x-3 p-3 rounded-lg transition-colors",
                location === path
                  ? "active text-foreground bg-primary/20 border-l-4 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
              )}
              data-testid={`link-${label.toLowerCase().replace(' ', '-')}`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </a>
          </Link>
        ))}
      </nav>
    </div>
  );
}
