import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Header() {
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
    <header className="fixed top-0 left-52 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-end px-6 shadow-sm z-30">
      <div className="flex items-center bg-slate-50 rounded-lg p-2">
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
          className="text-slate-500 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors ml-2"
          data-testid="button-logout"
        >
          <LogOut className="h-3 w-3" />
        </Button>
      </div>
    </header>
  );
}