import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import logoPath from "@assets/Logo png_1758087604918.png";

export default function LoginPage() {
  const { user, loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState<string>("");

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    try {
      await loginMutation.mutateAsync({
        username: loginForm.username,
        password: loginForm.password,
      });
    } catch (error) {
      setLoginError("Invalid username or password. Please try again.");
    }
  };


  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Logo and Welcome Text - Side by side alignment */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 lg:gap-16 mb-12 max-w-7xl mx-auto">
        {/* Logo - Left side, much larger */}
        <div className="flex-shrink-0">
          <img 
            src={logoPath} 
            alt="ShadiKabbo Logo" 
            className="h-40 md:h-48 lg:h-56 mx-auto"
          />
        </div>

        {/* Welcome Text - Right side, smaller and elegant */}
        <div className="text-center md:text-left">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold mb-3">
            <span className="text-red-600">Welcome to</span>{" "}
            <span className="text-blue-600">ShadiKabbo</span>
          </h1>
          <p className="text-sm md:text-base text-black max-w-lg leading-relaxed">
            Professional matchmaking services connecting hearts and building lasting relationships across communities.
          </p>
        </div>
      </div>

      {/* Login Card - Centered */}
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border border-gray-200 bg-white">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Access Portal
            </CardTitle>
            <p className="text-gray-600 text-sm">
              CRO Agent • Matchmaker • Super Admin
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="username" className="text-gray-700 font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                  data-testid="input-username"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white pr-10"
                    data-testid="input-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <Alert variant="destructive" data-testid="alert-login-error" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{loginError}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="premium-login-btn w-full py-3 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In to Dashboard
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">
          New accounts are created by administrators for security purposes.
        </p>
      </div>
    </div>
  );
}
