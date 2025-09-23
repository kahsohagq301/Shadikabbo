import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertSettingSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Settings as SettingsIcon } from "lucide-react";
import { AppLayout } from "@/components/app-layout";

const addSettingSchema = insertSettingSchema.pick({
  category: true,
  value: true,
  displayOrder: true,
});

type AddSettingForm = z.infer<typeof addSettingSchema>;

const categoryLabels = {
  priority: "Priority",
  status: "Status", 
  profession: "Profession",
  jobType: "Job Type",
  maritalStatus: "Marital Status",
  gender: "Gender",
  permanentCountry: "Permanent Country",
  permanentCity: "Permanent City",
  presentCountry: "Present Country",
  presentCity: "Present City",
  height: "Height",
  qualification: "Qualification",
  organization: "Organization",
  religion: "Religion",
  socialTitle: "Social Title",
  packageType: "Package Type",
  paymentMethod: "Payment Method"
};

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<any>(null);

  // Only super admin can access settings
  const isSuperAdmin = user?.role === 'super_admin';

  // Query to fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Add setting mutation
  const addSettingMutation = useMutation({
    mutationFn: async (data: AddSettingForm) => {
      const response = await apiRequest("POST", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Setting added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add setting",
        variant: "destructive",
      });
    },
  });

  // Edit setting mutation
  const editSettingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AddSettingForm> }) => {
      const response = await apiRequest("PUT", `/api/settings/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setIsEditDialogOpen(false);
      setSelectedSetting(null);
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    },
  });

  // Delete setting mutation
  const deleteSettingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/settings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Setting deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete setting",
        variant: "destructive",
      });
    },
  });

  // Form for adding new setting
  const addForm = useForm<AddSettingForm>({
    resolver: zodResolver(addSettingSchema),
    defaultValues: {
      category: "priority",
      value: "",
      displayOrder: 0,
    },
  });

  // Form for editing setting
  const editForm = useForm<AddSettingForm>({
    resolver: zodResolver(addSettingSchema),
    defaultValues: {
      category: "priority",
      value: "",
      displayOrder: 0,
    },
  });

  const handleAddSetting = (data: AddSettingForm) => {
    addSettingMutation.mutate(data);
  };

  const handleEditSetting = (data: AddSettingForm) => {
    if (selectedSetting) {
      editSettingMutation.mutate({ id: selectedSetting.id, data });
    }
  };

  const handleEditClick = (setting: any) => {
    setSelectedSetting(setting);
    editForm.reset({
      category: setting.category,
      value: setting.value,
      displayOrder: setting.displayOrder,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (settingId: string) => {
    if (confirm("Are you sure you want to delete this setting? This will remove it from all dropdown menus.")) {
      deleteSettingMutation.mutate(settingId);
    }
  };

  if (!isSuperAdmin) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-muted-foreground mb-2">Access Denied</h2>
                <p className="text-muted-foreground">Only Super Admin can access settings.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Settings Management</h1>
              <p className="text-muted-foreground">
                Manage dropdown options used across the system
              </p>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-setting">
                <Plus className="h-4 w-4" />
                Add Setting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Setting</DialogTitle>
                <DialogDescription>
                  Add a new option that will appear in dropdown menus
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddSetting)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(categoryLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter option value"
                            data-testid="input-value"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="0"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-display-order"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={addSettingMutation.isPending} data-testid="button-submit-add">
                      {addSettingMutation.isPending ? "Adding..." : "Add Setting"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Settings Categories */}
        <div className="grid gap-6">
          {Object.entries(settings || {}).map(([category, categorySettings]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{categoryLabels[category as keyof typeof categoryLabels] || category}</span>
                  <Badge variant="secondary">{categorySettings.length} options</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categorySettings.map((setting: any) => (
                    <div
                      key={setting.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium" data-testid={`text-setting-${setting.id}`}>
                        {setting.value}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Order: {setting.displayOrder}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(setting)}
                          data-testid={`button-edit-${setting.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(setting.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          data-testid={`button-delete-${setting.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {categorySettings.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No options available for this category
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Setting Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Setting</DialogTitle>
              <DialogDescription>
                Update the setting value and display order
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditSetting)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-category">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter option value"
                          data-testid="input-edit-value"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-edit-display-order"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={editSettingMutation.isPending} data-testid="button-submit-edit">
                    {editSettingMutation.isPending ? "Updating..." : "Update Setting"}
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