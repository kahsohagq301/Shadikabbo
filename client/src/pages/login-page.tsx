import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import logoPath from "@assets/Logo png_1758104778985.png";

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
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-white to-purple-500 flex flex-col lg:flex-row">
      {/* Left Section - Logo and Welcome Text */}
      <div className="flex-1 flex flex-col justify-center items-start px-8 md:px-16 lg:px-24 py-8 lg:py-0">
        {/* Logo */}
        <div className="mb-8 mx-auto lg:mx-0">
          <img 
            src={logoPath} 
            alt="ShadiKabbo Logo" 
            className="h-24 md:h-32 lg:h-40 xl:h-48 w-auto"
          />
        </div>

        {/* Welcome Text */}
        <div className="text-center lg:text-left">
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4">
            <span className="text-red-600">Welcome to</span>{" "}
            <span className="text-blue-600">ShadiKabbo</span>
          </h1>
          <p className="text-gray-700 text-sm md:text-base lg:text-lg max-w-md leading-relaxed mx-auto lg:mx-0">
            Professional matchmaking services connecting hearts and building lasting relationships across communities.
          </p>
        </div>
      </div>

      {/* Right Section - Login Card */}
      <div className="flex-1 flex justify-center items-center px-4 md:px-8 pb-8 lg:pb-0">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white rounded-xl">
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
                  className="w-full py-3 text-white font-semibold text-lg bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg rounded-lg border-0"
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
      </div>
    </div>
  );
}
