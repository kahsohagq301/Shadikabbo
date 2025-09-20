import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import logoPath from "@assets/Logo png_1758104778985.png";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/traffic", label: "Traffic" },
  { path: "/account", label: "Account" },
  { path: "/payment", label: "Payment" },
  { path: "/tracking", label: "Tracking" },
  { path: "/paid-clients", label: "Paid Clients" },
  { path: "/success-story", label: "Success Story" },
  { path: "/hrm", label: "HRM" },
  { path: "/settings", label: "Settings" },
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
    <div className="w-52 bg-white border-r border-slate-200 min-h-screen flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-center">
        <img 
          src={logoPath}
          alt="ShadiKabbo Logo" 
          className="h-16 object-contain w-auto max-w-[180px]"
          data-testid="img-logo"
        />
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center bg-slate-50 rounded-lg p-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-slate-600 text-white text-xs font-semibold">
              SA
            </AvatarFallback>
          </Avatar>
          <div className="px-3 flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate" data-testid="text-username">
              {user?.username}
            </div>
            <div className="text-xs text-slate-600" data-testid="text-user-role">
              {getRoleDisplayName(user?.role)}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logoutMutation.mutate()}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
            data-testid="button-logout"
          >
            <LogOut className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map(({ path, label }) => (
          <Link 
            key={path} 
            href={path}
            className={cn(
              "relative group block px-4 py-3 text-xs font-semibold rounded-lg cursor-pointer overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-[1.02]",
              location === path
                ? "bg-gradient-to-r from-blue-500 to-red-500 text-white shadow-lg border-l-4 border-red-600"
                : "text-slate-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-red-400 hover:shadow-md"
            )}
            data-testid={`link-${label.toLowerCase().replace(' ', '-')}`}
          >
            {/* Background animation overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r from-blue-400/20 to-red-400/20 transform transition-transform duration-300 ease-out",
              location === path 
                ? "translate-x-0" 
                : "-translate-x-full group-hover:translate-x-0"
            )} />
            
            {/* Text content */}
            <span className="relative z-10 transition-all duration-200 ease-in-out">
              {label}
            </span>
            
            {/* Active state indicator */}
            {location === path && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full animate-pulse" />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
