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
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-md">
      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-200 flex items-center justify-center">
        <img 
          src={logoPath}
          alt="ShadiKabbo Logo" 
          className="h-20 object-contain w-auto max-w-[200px]"
          data-testid="img-logo"
        />
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center bg-gray-50 rounded-lg p-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-red-600 text-white text-sm font-semibold">
              SA
            </AvatarFallback>
          </Avatar>
          <div className="px-3 flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate" data-testid="text-username">
              {user?.username}
            </div>
            <div className="text-xs text-gray-600 font-medium" data-testid="text-user-role">
              {getRoleDisplayName(user?.role)}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logoutMutation.mutate()}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors duration-200"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 flex-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link 
            key={path} 
            href={path}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer block",
              location === path
                ? "bg-gradient-to-r from-blue-50 to-red-50 text-gray-900 font-semibold border-l-4 border-blue-600"
                : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            )}
            data-testid={`link-${label.toLowerCase().replace(' ', '-')}`}
          >
            <Icon className={cn(
              "h-4 w-4 transition-colors duration-200 flex-shrink-0",
              location === path 
                ? "text-blue-600" 
                : "text-gray-600"
            )} />
            <span className="text-sm font-normal">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
