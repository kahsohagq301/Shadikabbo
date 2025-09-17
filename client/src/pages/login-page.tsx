import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";
import logoPath from "@assets/Logo png_1758087604918.png";

export default function LoginPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "sohaghasunbd@gmail.com",
    password: "Sohagq301",
  });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    role: "cro_agent" as "cro_agent" | "matchmaker" | "super_admin",
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
        username: loginForm.email,
        password: loginForm.password,
      });
    } catch (error) {
      setLoginError("Invalid email or password. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await registerMutation.mutateAsync(registerForm);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center relative overflow-hidden">
      {/* Animated particles background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-red-400/20 rounded-full animate-bounce"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen gap-8">
          
          {/* Left Side - Company Info */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="mb-8">
              <img 
                src={logoPath} 
                alt="ShadiKabbo Logo" 
                className="h-20 mx-auto lg:mx-0 mb-6"
              />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Welcome to <span className="text-blue-400">ShadiKabbo</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-md mx-auto lg:mx-0">
              Professional matchmaking services connecting hearts and building lasting relationships across communities.
            </p>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="lg:w-1/2 w-full max-w-md">
            <Card className="glass-effect login-card border-white/10">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-foreground mb-2">
                  Access Portal
                </CardTitle>
                <p className="text-muted-foreground">CRO Agent • Matchmaker • Super Admin</p>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="login" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 bg-muted">
                    <TabsTrigger 
                      value="login" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      data-testid="tab-login"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      data-testid="tab-register"
                    >
                      Register
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="email" className="text-gray-200">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="bg-input border-border text-foreground mt-1"
                          data-testid="input-email"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-gray-200">Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            className="bg-input border-border text-foreground pr-10"
                            data-testid="input-password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {loginError && (
                        <Alert variant="destructive" data-testid="alert-login-error">
                          <AlertDescription>{loginError}</AlertDescription>
                        </Alert>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full btn-primary text-white font-semibold" 
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <LogIn className="h-4 w-4 mr-2" />
                        )}
                        Sign In to Dashboard
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="reg-username" className="text-muted-foreground">Username</Label>
                        <Input
                          id="reg-username"
                          type="text"
                          placeholder="Enter username"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                          className="bg-input border-border text-foreground mt-1"
                          data-testid="input-register-username"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="reg-password" className="text-muted-foreground">Password</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="Enter password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className="bg-input border-border text-foreground mt-1"
                          data-testid="input-register-password"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="reg-role" className="text-muted-foreground">Role</Label>
                        <Select value={registerForm.role} onValueChange={(value: "cro_agent" | "matchmaker" | "super_admin") => setRegisterForm({ ...registerForm, role: value })}>
                          <SelectTrigger className="bg-input border-border text-foreground mt-1" data-testid="select-register-role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cro_agent">CRO Agent</SelectItem>
                            <SelectItem value="matchmaker">Matchmaker</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full btn-primary text-white font-semibold" 
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
