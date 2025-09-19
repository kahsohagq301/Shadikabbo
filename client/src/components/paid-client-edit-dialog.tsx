import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PaidClientWithPayment } from "@shared/schema";
import { User, Phone, Mail, MapPin, Briefcase, Loader2, Save } from "lucide-react";

interface PaidClientEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: PaidClientWithPayment | null;
}

interface EditFormData {
  name: string;
  contactNumber: string;
  email: string;
  gender?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  height?: string;
  religion?: string;
  profession?: string;
  jobType?: string;
  organization?: string;
  qualification?: string;
  permanentCountry?: string;
  permanentCity?: string;
  presentCountry?: string;
  presentCity?: string;
  socialTitle?: string;
  requirements?: string;
  priority: string;
}

export function PaidClientEditDialog({ isOpen, onClose, client }: PaidClientEditDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EditFormData>({
    name: "",
    contactNumber: "",
    email: "",
    priority: "medium",
  });

  // Reset form when client changes
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        contactNumber: client.contactNumber,
        email: client.email,
        gender: client.gender || "",
        dateOfBirth: client.dateOfBirth || "",
        maritalStatus: client.maritalStatus || "",
        height: client.height || "",
        religion: client.religion || "",
        profession: client.profession || "",
        jobType: client.jobType || "",
        organization: client.organization || "",
        qualification: client.qualification || "",
        permanentCountry: client.permanentCountry || "",
        permanentCity: client.permanentCity || "",
        presentCountry: client.presentCountry || "",
        presentCity: client.presentCity || "",
        socialTitle: client.socialTitle || "",
        requirements: client.requirements || "",
        priority: client.priority || "medium",
      });
    }
  }, [client]);

  const editMutation = useMutation({
    mutationFn: async (data: EditFormData) => {
      if (!client) throw new Error("No client selected");
      return await apiRequest("PATCH", `/api/paid-clients/${client.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paid-clients"] });
      toast({
        title: "Success",
        description: "Client information updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update client information",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editMutation.mutate(formData);
  };

  const updateField = (field: keyof EditFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-client-edit">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="h-6 w-6" />
            Edit Client Information
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      required
                      data-testid="input-edit-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-gender">Gender</Label>
                    <Select value={formData.gender || ""} onValueChange={(value) => updateField("gender", value)}>
                      <SelectTrigger data-testid="select-edit-gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-dob">Date of Birth</Label>
                    <Input
                      id="edit-dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField("dateOfBirth", e.target.value)}
                      data-testid="input-edit-dob"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-marital-status">Marital Status</Label>
                    <Select value={formData.maritalStatus || ""} onValueChange={(value) => updateField("maritalStatus", value)}>
                      <SelectTrigger data-testid="select-edit-marital-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-height">Height</Label>
                    <Input
                      id="edit-height"
                      value={formData.height}
                      onChange={(e) => updateField("height", e.target.value)}
                      placeholder="e.g., 5'8\""
                      data-testid="input-edit-height"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-religion">Religion</Label>
                    <Input
                      id="edit-religion"
                      value={formData.religion}
                      onChange={(e) => updateField("religion", e.target.value)}
                      data-testid="input-edit-religion"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="edit-contact">Contact Number *</Label>
                  <Input
                    id="edit-contact"
                    value={formData.contactNumber}
                    onChange={(e) => updateField("contactNumber", e.target.value)}
                    required
                    data-testid="input-edit-contact"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email Address *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                    data-testid="input-edit-email"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => updateField("priority", value)}>
                    <SelectTrigger data-testid="select-edit-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-profession">Profession</Label>
                    <Input
                      id="edit-profession"
                      value={formData.profession}
                      onChange={(e) => updateField("profession", e.target.value)}
                      data-testid="input-edit-profession"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-job-type">Job Type</Label>
                    <Input
                      id="edit-job-type"
                      value={formData.jobType}
                      onChange={(e) => updateField("jobType", e.target.value)}
                      data-testid="input-edit-job-type"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-organization">Organization</Label>
                  <Input
                    id="edit-organization"
                    value={formData.organization}
                    onChange={(e) => updateField("organization", e.target.value)}
                    data-testid="input-edit-organization"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-qualification">Qualification</Label>
                  <Input
                    id="edit-qualification"
                    value={formData.qualification}
                    onChange={(e) => updateField("qualification", e.target.value)}
                    data-testid="input-edit-qualification"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-permanent-country">Permanent Country</Label>
                    <Input
                      id="edit-permanent-country"
                      value={formData.permanentCountry}
                      onChange={(e) => updateField("permanentCountry", e.target.value)}
                      data-testid="input-edit-permanent-country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-permanent-city">Permanent City</Label>
                    <Input
                      id="edit-permanent-city"
                      value={formData.permanentCity}
                      onChange={(e) => updateField("permanentCity", e.target.value)}
                      data-testid="input-edit-permanent-city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-present-country">Present Country</Label>
                    <Input
                      id="edit-present-country"
                      value={formData.presentCountry}
                      onChange={(e) => updateField("presentCountry", e.target.value)}
                      data-testid="input-edit-present-country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-present-city">Present City</Label>
                    <Input
                      id="edit-present-city"
                      value={formData.presentCity}
                      onChange={(e) => updateField("presentCity", e.target.value)}
                      data-testid="input-edit-present-city"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="border-border col-span-full">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="edit-social-title">Social Title</Label>
                  <Input
                    id="edit-social-title"
                    value={formData.socialTitle}
                    onChange={(e) => updateField("socialTitle", e.target.value)}
                    data-testid="input-edit-social-title"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-requirements">Requirements & Preferences</Label>
                  <Textarea
                    id="edit-requirements"
                    value={formData.requirements}
                    onChange={(e) => updateField("requirements", e.target.value)}
                    rows={4}
                    placeholder="Enter client requirements and preferences..."
                    data-testid="textarea-edit-requirements"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={editMutation.isPending}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={editMutation.isPending}
              className="gap-2"
              data-testid="button-save-edit"
            >
              {editMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}