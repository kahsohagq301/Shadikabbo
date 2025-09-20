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
              "block px-3 py-2 text-xs font-medium rounded transition-colors cursor-pointer",
              location === path
                ? "bg-blue-100 text-blue-900 border-l-2 border-blue-600"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            )}
            data-testid={`link-${label.toLowerCase().replace(' ', '-')}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
