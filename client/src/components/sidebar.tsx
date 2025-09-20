import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import logoPath from "@assets/Logo png_1758104778985.png";
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  DollarSign, 
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
  { path: "/payment", label: "Payment", icon: DollarSign },
  { path: "/tracking", label: "Tracking", icon: MapPin },
  { path: "/paid-clients", label: "Paid Clients", icon: CreditCard },
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
    <div className="w-72 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/80 min-h-screen flex flex-col shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 py-6 border-b border-slate-200/60 flex items-center justify-center bg-white/60 backdrop-blur-sm">
        <img 
          src={logoPath}
          alt="ShadiKabbo Logo" 
          className="h-20 object-contain w-auto max-w-[220px] drop-shadow-sm"
          data-testid="img-logo"
        />
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
          <Avatar className="w-12 h-12 shadow-md ring-2 ring-white">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white text-base font-bold">
              SA
            </AvatarFallback>
          </Avatar>
          <div className="px-4 flex-1 min-w-0">
            <div className="text-base font-bold text-slate-800 truncate" data-testid="text-username">
              {user?.username}
            </div>
            <div className="text-sm text-slate-600 font-medium" data-testid="text-user-role">
              {getRoleDisplayName(user?.role)}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logoutMutation.mutate()}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-6 space-y-2 flex-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link 
            key={path} 
            href={path}
            className={cn(
              "flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer block group relative overflow-hidden",
              location === path
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg transform scale-[1.02] border border-blue-200"
                : "text-slate-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md hover:scale-[1.01] border border-transparent hover:border-blue-200/50"
            )}
            data-testid={`link-${label.toLowerCase().replace(' ', '-')}`}
          >
            <Icon className={cn(
              "h-5 w-5 transition-all duration-300 flex-shrink-0 group-hover:scale-110",
              location === path 
                ? "text-white drop-shadow-sm" 
                : "text-slate-600 group-hover:text-blue-600"
            )} />
            <span className={cn(
              "text-sm font-semibold leading-relaxed transition-all duration-300",
              location === path 
                ? "text-white drop-shadow-sm" 
                : "text-slate-700 group-hover:text-blue-700"
            )}>{label}</span>
            {location === path && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-xl animate-pulse"></div>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
