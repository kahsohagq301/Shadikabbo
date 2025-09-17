import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, CreditCard, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddTrafficModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TrafficForm {
  // Step 1: Basic Info
  name: string;
  contactNumber: string;
  email: string;
  
  // Step 2: Advanced Info
  priority: string;
  status: string;
  gender: string;
  dateOfBirth: string;
  height: string;
  religion: string;
  requirements: string;
  
  // Step 3: Payment Info
  packageType: string;
  paidAmount: number;
  discountAmount: number;
  paymentMethod: string;
  afterMarriageFee: number;
}

export function AddTrafficModal({ isOpen, onClose }: AddTrafficModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TrafficForm>({
    name: "",
    contactNumber: "",
    email: "",
    priority: "medium",
    status: "pending", 
    gender: "",
    dateOfBirth: "",
    height: "",
    religion: "",
    requirements: "",
    packageType: "",
    paidAmount: 0,
    discountAmount: 0,
    paymentMethod: "",
    afterMarriageFee: 0,
  });

  const createTrafficMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/traffic", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traffic"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Traffic record created successfully",
      });
      onClose();
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create traffic record",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      name: "",
      contactNumber: "",
      email: "",
      priority: "medium",
      status: "pending",
      gender: "",
      dateOfBirth: "",
      height: "",
      religion: "",
      requirements: "",
      packageType: "",
      paidAmount: 0,
      discountAmount: 0,
      paymentMethod: "",
      afterMarriageFee: 0,
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate due amount and total amount
    const packageAmounts = {
      "premium": 50000,
      "standard": 30000, 
      "basic": 15000,
    };
    
    const packageAmount = packageAmounts[formData.packageType as keyof typeof packageAmounts] || 0;
    const dueAmount = packageAmount - formData.paidAmount - formData.discountAmount;
    
    const trafficData = {
      ...formData,
      // Add calculated fields
      dueAmount,
      totalAmount: packageAmount,
    };

    createTrafficMutation.mutate(trafficData);
  };

  const updateFormData = (field: keyof TrafficForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStepIndicator = (step: number) => {
    const isActive = step <= currentStep;
    return (
      <div className="flex items-center space-x-2">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          {step}
        </div>
        <span className={cn(
          "text-sm font-medium",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}>
          {step === 1 ? "Basic Info" : step === 2 ? "Advanced Info" : "Payment Info"}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground" data-testid="text-modal-title">
              Add New Traffic
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="border-b border-border pb-4">
          <div className="flex items-center space-x-4">
            {getStepIndicator(1)}
            <div className="flex-1 h-px bg-border"></div>
            {getStepIndicator(2)}
            <div className="flex-1 h-px bg-border"></div>
            {getStepIndicator(3)}
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6" data-testid="form-step-1">
            <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Enter full name"
                  data-testid="input-name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact Number *</Label>
                <Input
                  id="contact"
                  value={formData.contactNumber}
                  onChange={(e) => updateFormData("contactNumber", e.target.value)}
                  placeholder="+880..."
                  data-testid="input-contact"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="Enter email address"
                  data-testid="input-email"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleNext} className="btn-primary" data-testid="button-step-1-next">
                Next Step <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Advanced Info */}
        {currentStep === 2 && (
          <div className="space-y-6" data-testid="form-step-2">
            <h3 className="text-lg font-semibold text-foreground">Advanced Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => updateFormData("priority", value)}>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                  <SelectTrigger data-testid="select-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                  data-testid="input-dob"
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Select value={formData.height} onValueChange={(value) => updateFormData("height", value)}>
                  <SelectTrigger data-testid="select-height">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5.0-5.2">5'0" - 5'2"</SelectItem>
                    <SelectItem value="5.3-5.5">5'3" - 5'5"</SelectItem>
                    <SelectItem value="5.6-5.8">5'6" - 5'8"</SelectItem>
                    <SelectItem value="5.9-6.0">5'9" - 6'0"</SelectItem>
                    <SelectItem value="6.1-6.3">6'1" - 6'3"</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="religion">Religion</Label>
                <Select value={formData.religion} onValueChange={(value) => updateFormData("religion", value)}>
                  <SelectTrigger data-testid="select-religion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="islam">Islam</SelectItem>
                    <SelectItem value="hinduism">Hinduism</SelectItem>
                    <SelectItem value="christianity">Christianity</SelectItem>
                    <SelectItem value="buddhism">Buddhism</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => updateFormData("requirements", e.target.value)}
                placeholder="Describe client requirements..."
                className="h-24"
                data-testid="textarea-requirements"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} data-testid="button-step-2-prev">
                <ArrowLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <Button onClick={handleNext} className="btn-primary" data-testid="button-step-2-next">
                Next Step <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment Info */}
        {currentStep === 3 && (
          <div className="space-y-6" data-testid="form-step-3">
            <h3 className="text-lg font-semibold text-foreground">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="package">Package Type</Label>
                <Select value={formData.packageType} onValueChange={(value) => updateFormData("packageType", value)}>
                  <SelectTrigger data-testid="select-package">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium Package - ৳50,000</SelectItem>
                    <SelectItem value="standard">Standard Package - ৳30,000</SelectItem>
                    <SelectItem value="basic">Basic Package - ৳15,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => updateFormData("paymentMethod", value)}>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="mobile">Mobile Banking</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paid-amount">Paid Amount</Label>
                <Input
                  id="paid-amount"
                  type="number"
                  value={formData.paidAmount}
                  onChange={(e) => updateFormData("paidAmount", Number(e.target.value))}
                  placeholder="Enter paid amount"
                  data-testid="input-paid-amount"
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount Amount</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) => updateFormData("discountAmount", Number(e.target.value))}
                  placeholder="Enter discount"
                  data-testid="input-discount"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="marriage-fee">After Marriage Fee</Label>
                <Input
                  id="marriage-fee"
                  type="number"
                  value={formData.afterMarriageFee}
                  onChange={(e) => updateFormData("afterMarriageFee", Number(e.target.value))}
                  placeholder="Enter after marriage fee"
                  data-testid="input-marriage-fee"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} data-testid="button-step-3-prev">
                <ArrowLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="btn-secondary text-white"
                disabled={createTrafficMutation.isPending}
                data-testid="button-submit-traffic"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Apply for Paid Client
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
