import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, Edit, Plus, Users } from "lucide-react";
import { format } from "date-fns";
import { AppLayout } from "@/components/app-layout";

// Role options for filtering and selection
const roleOptions = [
  { value: "all", label: "All Roles" },
  { value: "cro_agent", label: "CRO Agent" },
  { value: "matchmaker", label: "Matchmaker" },
  { value: "super_admin", label: "Super Admin" },
];

const createAccountSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateAccountForm = z.infer<typeof createAccountSchema>;

export default function Account() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // Determine if user is super admin
  const isSuperAdmin = user?.role === 'super_admin';

  // Query to fetch accounts
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['/api/accounts', selectedRole],
    queryFn: async () => {
      const response = await fetch(`/api/accounts${selectedRole !== 'all' ? `?role=${selectedRole}` : ''}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      return await response.json() as any[];
    },
  });

  // Create account form
  const createForm = useForm<CreateAccountForm>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: "",
      username: "",
      officialNumber: "",
      role: "cro_agent",
      dateOfBirth: "",
      gender: "",
      password: "",
      confirmPassword: "",
      isEnabled: true,
    },
  });

  // Edit account form  
  const editForm = useForm({
    resolver: zodResolver(insertUserSchema.partial()),
  });

  // Create account mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateAccountForm) => {
      const { confirmPassword, ...accountData } = data;
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(accountData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create account');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsAddDialogOpen(false);
      createForm.reset();
      toast({ title: "Success", description: "Account created successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create account", variant: "destructive" });
    },
  });

  // Edit account mutation
  const editMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      const response = await fetch(`/api/accounts/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data.updates),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update account');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsEditDialogOpen(false);
      editForm.reset();
      toast({ title: "Success", description: "Account updated successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update account", variant: "destructive" });
    },
  });

  // Toggle account status mutation
  const toggleMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch(`/api/accounts/${accountId}/toggle`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle account status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({ title: "Success", description: "Account status updated successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update account status", variant: "destructive" });
    },
  });

  const handleViewAccount = (account: any) => {
    setSelectedAccount(account);
    setIsViewDialogOpen(true);
  };

  const handleEditAccount = (account: any) => {
    setSelectedAccount(account);
    editForm.reset(account);
    setIsEditDialogOpen(true);
  };

  const handleToggleStatus = (accountId: string) => {
    toggleMutation.mutate(accountId);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'cro_agent':
        return 'CRO Agent';
      case 'matchmaker':
        return 'Matchmaker';
      case 'super_admin':
        return 'Super Admin';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadge = (isEnabled: boolean) => {
    return (
      <Badge variant={isEnabled ? "default" : "destructive"}>
        {isEnabled ? "Active" : "Disabled"}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="text-page-title">
            Account Management
          </h1>
          <p className="text-lg text-muted-foreground font-medium" data-testid="text-page-description">
            {isSuperAdmin ? "Manage all user accounts and permissions" : "View and manage your account information"}
          </p>
        </div>

        {isSuperAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-account">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>
                  Create a new user account with role and permissions.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
                  {/* Row 1: Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} data-testid="input-create-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter username" {...field} data-testid="input-create-username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 2: Contact & Role */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="officialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Official Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact number" {...field} data-testid="input-create-contact" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Role</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-create-role">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cro_agent">CRO Agent</SelectItem>
                              <SelectItem value="matchmaker">Matchmaker</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 3: Date of Birth & Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-create-dob" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-create-gender">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 4: Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Create Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter password" {...field} data-testid="input-create-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm password" {...field} data-testid="input-create-confirm-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-create-account">
                      {createMutation.isPending ? "Creating..." : "Create Account"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Role Filter - Only show for Super Admin */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Filter by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[200px]" data-testid="select-role-filter">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isSuperAdmin ? "All Accounts" : "Your Account"}
          </CardTitle>
          <CardDescription>
            {isSuperAdmin ? `Viewing ${selectedRole === 'all' ? 'all' : roleOptions.find(r => r.value === selectedRole)?.label} accounts` : "Manage your account information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="text-loading">Loading accounts...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Create Date</th>
                    <th className="text-left p-2 font-semibold">Name</th>
                    <th className="text-left p-2 font-semibold">Contact Number</th>
                    <th className="text-left p-2 font-semibold">Role</th>
                    <th className="text-left p-2 font-semibold">Status</th>
                    <th className="text-left p-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts?.map((account: any) => (
                    <tr key={account.id} className="border-b hover:bg-muted/50" data-testid={`row-account-${account.id}`}>
                      <td className="p-2" data-testid={`text-create-date-${account.id}`}>
                        {account.createdAt ? format(new Date(account.createdAt), "MMM dd, yyyy") : "N/A"}
                      </td>
                      <td className="p-2" data-testid={`text-name-${account.id}`}>
                        {account.name || account.username || "N/A"}
                      </td>
                      <td className="p-2" data-testid={`text-contact-${account.id}`}>
                        {account.officialNumber || "N/A"}
                      </td>
                      <td className="p-2" data-testid={`text-role-${account.id}`}>
                        <Badge variant="outline">{getRoleDisplayName(account.role)}</Badge>
                      </td>
                      <td className="p-2" data-testid={`text-status-${account.id}`}>
                        {getStatusBadge(account.isEnabled)}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewAccount(account)} data-testid={`button-view-${account.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditAccount(account)} data-testid={`button-edit-${account.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isSuperAdmin && account.id !== user?.id && (
                            <Switch 
                              checked={account.isEnabled}
                              onCheckedChange={() => handleToggleStatus(account.id)}
                              disabled={toggleMutation.isPending}
                              data-testid={`switch-status-${account.id}`}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Account Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Full Name</label>
                  <p className="text-sm text-muted-foreground">{selectedAccount.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Username</label>
                  <p className="text-sm text-muted-foreground">{selectedAccount.username}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Contact Number</label>
                  <p className="text-sm text-muted-foreground">{selectedAccount.officialNumber || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Role</label>
                  <p className="text-sm text-muted-foreground">{getRoleDisplayName(selectedAccount.role)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Date of Birth</label>
                  <p className="text-sm text-muted-foreground">{selectedAccount.dateOfBirth || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Gender</label>
                  <p className="text-sm text-muted-foreground">{selectedAccount.gender || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Status</label>
                  <p className="text-sm text-muted-foreground">{selectedAccount.isEnabled ? "Active" : "Disabled"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Created Date</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedAccount.createdAt ? format(new Date(selectedAccount.createdAt), "MMM dd, yyyy") : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => editMutation.mutate({ id: selectedAccount?.id, updates: data }))} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-edit-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="officialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} data-testid="input-edit-contact" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ''} data-testid="input-edit-dob" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-gender">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={editMutation.isPending} data-testid="button-update-account">
                  {editMutation.isPending ? "Updating..." : "Update Account"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
}