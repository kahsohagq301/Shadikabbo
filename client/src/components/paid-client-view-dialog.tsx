import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { PaidClientWithPayment } from "@shared/schema";
import { User, Phone, Mail, MapPin, GraduationCap, Briefcase, Heart, Calendar, DollarSign, CreditCard } from "lucide-react";

interface PaidClientViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: PaidClientWithPayment | null;
}

export function PaidClientViewDialog({ isOpen, onClose, client }: PaidClientViewDialogProps) {
  if (!client) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-client-view">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="h-6 w-6" />
            {client.name}
            <Badge variant="secondary" className="ml-2">Paid Client</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Personal Information */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-sm font-semibold" data-testid="text-view-name">{client.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <p className="text-sm" data-testid="text-view-gender">{client.gender || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <p className="text-sm" data-testid="text-view-dob">{client.dateOfBirth || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                  <p className="text-sm" data-testid="text-view-marital-status">{client.maritalStatus || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Height</label>
                  <p className="text-sm" data-testid="text-view-height">{client.height || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Religion</label>
                  <p className="text-sm" data-testid="text-view-religion">{client.religion || "Not specified"}</p>
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
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold" data-testid="text-view-contact">{client.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm" data-testid="text-view-email">{client.email}</span>
                </div>
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
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Profession</label>
                  <p className="text-sm" data-testid="text-view-profession">{client.profession || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Job Type</label>
                  <p className="text-sm" data-testid="text-view-job-type">{client.jobType || "Not specified"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Organization</label>
                  <p className="text-sm" data-testid="text-view-organization">{client.organization || "Not specified"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Qualification</label>
                  <p className="text-sm" data-testid="text-view-qualification">{client.qualification || "Not specified"}</p>
                </div>
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
              <div>
                <label className="text-sm font-medium text-muted-foreground">Permanent Address</label>
                <p className="text-sm" data-testid="text-view-permanent-address">
                  {[client.permanentCity, client.permanentCountry].filter(Boolean).join(", ") || "Not specified"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Present Address</label>
                <p className="text-sm" data-testid="text-view-present-address">
                  {[client.presentCity, client.presentCountry].filter(Boolean).join(", ") || "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="border-border col-span-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
                  <p className="text-sm font-semibold text-green-600" data-testid="text-view-payment-date">
                    {formatDate(client.paymentDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Package Type</label>
                  <Badge variant="secondary" data-testid="text-view-package-type">
                    {client.packageType}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Paid Amount</label>
                  <p className="text-sm font-bold text-green-600" data-testid="text-view-paid-amount">
                    ₹{client.paidAmount}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                  <p className="text-sm" data-testid="text-view-payment-method">{client.paymentMethod}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Notes */}
          {(client.requirements || client.socialTitle) && (
            <Card className="border-border col-span-full">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.socialTitle && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Social Title</label>
                    <p className="text-sm" data-testid="text-view-social-title">{client.socialTitle}</p>
                  </div>
                )}
                {client.requirements && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Requirements</label>
                    <p className="text-sm whitespace-pre-wrap" data-testid="text-view-requirements">
                      {client.requirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Client Status & Priority */}
          <Card className="border-border col-span-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <Badge 
                    variant={client.priority === "high" ? "destructive" : client.priority === "medium" ? "default" : "secondary"}
                    data-testid="text-view-priority"
                  >
                    {client.priority || "Medium"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client Status</label>
                  <Badge variant="secondary" data-testid="text-view-status">
                    {client.status || "Active"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                  <p className="text-sm" data-testid="text-view-registration-date">
                    {formatDate(client.createdAt as any)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}