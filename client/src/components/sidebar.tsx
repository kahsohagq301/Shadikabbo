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
    <div className="w-64 bg-card border-r border-border min-h-screen flex flex-col shadow-lg">
      {/* Header */}
      <div className="px-4 py-8 border-b border-border flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <img 
          src={logoPath}
          alt="ShadiKabbo Logo" 
          className="h-20 md:h-24 lg:h-28 object-contain w-auto max-w-[200px] drop-shadow-sm"
          data-testid="img-logo"
        />
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-3 shadow-sm">
          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-bold">
              SA
            </AvatarFallback>
          </Avatar>
          <div className="px-3 flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground truncate" data-testid="text-username">
              {user?.username}
            </div>
            <div className="text-xs text-secondary font-medium" data-testid="text-user-role">
              {getRoleDisplayName(user?.role)}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logoutMutation.mutate()}
            className="text-muted-foreground hover:text-secondary hover:bg-secondary/10 p-2 rounded-lg transition-all duration-200"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 flex-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} href={path}>
            <a
              className={cn(
                "sidebar-link flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                location === path
                  ? "active text-white bg-gradient-to-r from-primary to-secondary shadow-lg scale-105 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:shadow-md hover:scale-[1.02]"
              )}
              data-testid={`link-${label.toLowerCase().replace(' ', '-')}`}
            >
              <Icon className={cn(
                "h-5 w-5 transition-all duration-200",
                location === path 
                  ? "text-white" 
                  : "text-muted-foreground group-hover:text-primary"
              )} />
              <span className="font-medium">{label}</span>
              {location === path && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full opacity-80"></div>
              )}
            </a>
          </Link>
        ))}
      </nav>
    </div>
  );
}
