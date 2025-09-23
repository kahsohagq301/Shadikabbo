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
import { useSettings } from "@/hooks/use-settings";
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
  profession: string;
  jobType: string;
  dateOfBirth: string;
  maritalStatus: string;
  gender: string;
  permanentCountry: string;
  permanentCity: string;
  presentCountry: string;
  presentCity: string;
  height: string;
  qualification: string;
  organization: string;
  religion: string;
  socialTitle: string;
  profilePicture: string;
  candidatePictures: string[];
  curriculumVitae: string;
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
  const { getValuesByCategory, isLoading: settingsLoading } = useSettings();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TrafficForm>({
    name: "",
    contactNumber: "",
    email: "",
    priority: "medium",
    status: "pending",
    profession: "",
    jobType: "",
    dateOfBirth: "",
    maritalStatus: "",
    gender: "",
    permanentCountry: "",
    permanentCity: "",
    presentCountry: "",
    presentCity: "",
    height: "",
    qualification: "",
    organization: "",
    religion: "",
    socialTitle: "",
    profilePicture: "",
    candidatePictures: [],
    curriculumVitae: "",
    requirements: "",
    packageType: "",
    paidAmount: 0,
    discountAmount: 0,
    paymentMethod: "",
    afterMarriageFee: 0,
  });

  const createTrafficMutation = useMutation({
    mutationFn: async (data: any) => {
      // First, create the traffic record
      const trafficResponse = await apiRequest("POST", "/api/traffic", data);
      const trafficData = await trafficResponse.json();
      
      // If payment information is provided, create a payment request
      if (data.packageType && data.paymentMethod && data.paidAmount >= 0) {
        const paymentData = {
          trafficId: trafficData.id,
          packageType: data.packageType,
          paidAmount: data.paidAmount.toString(),
          discountAmount: data.discountAmount.toString(),
          dueAmount: data.dueAmount.toString(),
          totalAmount: data.totalAmount.toString(),
          paymentMethod: data.paymentMethod,
          afterMarriageFee: data.afterMarriageFee ? data.afterMarriageFee.toString() : null,
          status: "pending"
        };
        
        await apiRequest("POST", "/api/payments", paymentData);
      }
      
      return trafficData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/traffic"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/pending"] });
      toast({
        title: "Success",
        description: "Traffic record and payment request created successfully",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create traffic record and payment request",
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
      profession: "",
      jobType: "",
      dateOfBirth: "",
      maritalStatus: "",
      gender: "",
      permanentCountry: "",
      permanentCity: "",
      presentCountry: "",
      presentCity: "",
      height: "",
      qualification: "",
      organization: "",
      religion: "",
      socialTitle: "",
      profilePicture: "",
      candidatePictures: [],
      curriculumVitae: "",
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader className="border-b border-border pb-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg -m-6 mb-0 p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3" data-testid="text-modal-title">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              Add New Traffic
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground hover:bg-destructive/10 rounded-full w-8 h-8 p-0"
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Professional Step Indicator */}
        <div className="py-6">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {getStepIndicator(1)}
            <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/20 to-primary/40 mx-4"></div>
            {getStepIndicator(2)}
            <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/20 to-primary/40 mx-4"></div>
            {getStepIndicator(3)}
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="pb-6" data-testid="form-step-1">
            <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Enter full name"
                    data-testid="input-name"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-sm font-semibold text-foreground">Contact Number *</Label>
                  <Input
                    id="contact"
                    value={formData.contactNumber}
                    onChange={(e) => updateFormData("contactNumber", e.target.value)}
                    placeholder="+880..."
                    data-testid="input-contact"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="Enter email address"
                    data-testid="input-email"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-6">
              <Button 
                onClick={handleNext} 
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105" 
                data-testid="button-step-1-next"
              >
                Next Step <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Advanced Info */}
        {currentStep === 2 && (
          <div className="pb-6" data-testid="form-step-2">
            <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Advanced Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-semibold text-foreground">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => updateFormData("priority", value)}>
                    <SelectTrigger className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors" data-testid="select-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getValuesByCategory("priority").map((option) => (
                        <SelectItem key={option} value={option.toLowerCase()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-foreground">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                    <SelectTrigger className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors" data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getValuesByCategory("status").map((option) => (
                        <SelectItem key={option} value={option.toLowerCase()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-semibold text-foreground">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                    <SelectTrigger className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors" data-testid="select-gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getValuesByCategory("gender").map((option) => (
                        <SelectItem key={option} value={option.toLowerCase()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-sm font-semibold text-foreground">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-dob"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm font-semibold text-foreground">Height</Label>
                  <Select value={formData.height} onValueChange={(value) => updateFormData("height", value)}>
                    <SelectTrigger className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors" data-testid="select-height">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getValuesByCategory("height").map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus" className="text-sm font-semibold text-foreground">Marital Status</Label>
                  <Select value={formData.maritalStatus} onValueChange={(value) => updateFormData("maritalStatus", value)}>
                    <SelectTrigger className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors" data-testid="select-marital-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getValuesByCategory("maritalStatus").map((option) => (
                        <SelectItem key={option} value={option.toLowerCase()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-sm font-semibold text-foreground">Profession</Label>
                  <Input
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => updateFormData("profession", e.target.value)}
                    placeholder="Enter profession"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-profession"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobType" className="text-sm font-semibold text-foreground">Job Type</Label>
                  <Select value={formData.jobType} onValueChange={(value) => updateFormData("jobType", value)}>
                    <SelectTrigger className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors" data-testid="select-job-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getValuesByCategory("jobType").map((option) => (
                        <SelectItem key={option} value={option.toLowerCase()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permanentCountry" className="text-sm font-semibold text-foreground">Permanent Country</Label>
                  <Input
                    id="permanentCountry"
                    value={formData.permanentCountry}
                    onChange={(e) => updateFormData("permanentCountry", e.target.value)}
                    placeholder="Enter permanent country"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-permanent-country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permanentCity" className="text-sm font-semibold text-foreground">Permanent City</Label>
                  <Input
                    id="permanentCity"
                    value={formData.permanentCity}
                    onChange={(e) => updateFormData("permanentCity", e.target.value)}
                    placeholder="Enter permanent city"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-permanent-city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="presentCountry" className="text-sm font-semibold text-foreground">Present Country</Label>
                  <Input
                    id="presentCountry"
                    value={formData.presentCountry}
                    onChange={(e) => updateFormData("presentCountry", e.target.value)}
                    placeholder="Enter present country"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-present-country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="presentCity" className="text-sm font-semibold text-foreground">Present City</Label>
                  <Input
                    id="presentCity"
                    value={formData.presentCity}
                    onChange={(e) => updateFormData("presentCity", e.target.value)}
                    placeholder="Enter present city"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-present-city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification" className="text-sm font-semibold text-foreground">Qualification</Label>
                  <Input
                    id="qualification"
                    value={formData.qualification}
                    onChange={(e) => updateFormData("qualification", e.target.value)}
                    placeholder="Enter qualification"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-qualification"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-sm font-semibold text-foreground">Organization</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => updateFormData("organization", e.target.value)}
                    placeholder="Enter organization"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-organization"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="religion" className="text-sm font-semibold text-foreground">Religion</Label>
                  <Select value={formData.religion} onValueChange={(value) => updateFormData("religion", value)}>
                    <SelectTrigger className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors" data-testid="select-religion">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getValuesByCategory("religion").map((option) => (
                        <SelectItem key={option} value={option.toLowerCase()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialTitle" className="text-sm font-semibold text-foreground">Social Title</Label>
                  <Select value={formData.socialTitle} onValueChange={(value) => updateFormData("socialTitle", value)}>
                    <SelectTrigger className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors" data-testid="select-social-title">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getValuesByCategory("socialTitle").map((option) => (
                        <SelectItem key={option} value={option.toLowerCase()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profilePicture" className="text-sm font-semibold text-foreground">Profile Picture URL</Label>
                  <Input
                    id="profilePicture"
                    value={formData.profilePicture}
                    onChange={(e) => updateFormData("profilePicture", e.target.value)}
                    placeholder="Enter profile picture URL"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-profile-picture"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curriculumVitae" className="text-sm font-semibold text-foreground">CV/Resume URL</Label>
                  <Input
                    id="curriculumVitae"
                    value={formData.curriculumVitae}
                    onChange={(e) => updateFormData("curriculumVitae", e.target.value)}
                    placeholder="Enter CV/Resume URL"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-curriculum-vitae"
                  />
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <Label htmlFor="requirements" className="text-sm font-semibold text-foreground">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => updateFormData("requirements", e.target.value)}
                  placeholder="Describe client requirements..."
                  className="h-24 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                  data-testid="textarea-requirements"
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious} 
                className="px-6 py-3 border-2 border-input hover:border-primary/50 hover:bg-primary/5 font-semibold rounded-lg transition-all duration-200"
                data-testid="button-step-2-prev"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <Button 
                onClick={handleNext} 
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105" 
                data-testid="button-step-2-next"
              >
                Next Step <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment Info */}
        {currentStep === 3 && (
          <div className="pb-6" data-testid="form-step-3">
            <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Payment Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="package" className="text-sm font-semibold text-foreground">Package Type</Label>
                  <Select value={formData.packageType} onValueChange={(value) => updateFormData("packageType", value)}>
                    <SelectTrigger className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors" data-testid="select-package">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getValuesByCategory("packageType").map((option) => (
                        <SelectItem key={option} value={option.toLowerCase().split(' ')[0]}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-method" className="text-sm font-semibold text-foreground">Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => updateFormData("paymentMethod", value)}>
                    <SelectTrigger className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors" data-testid="select-payment-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getValuesByCategory("paymentMethod").map((option) => (
                        <SelectItem key={option} value={option.toLowerCase().replace(' ', '_')}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paid-amount" className="text-sm font-semibold text-foreground">Paid Amount</Label>
                  <Input
                    id="paid-amount"
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => updateFormData("paidAmount", Number(e.target.value))}
                    placeholder="Enter paid amount"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-paid-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-sm font-semibold text-foreground">Discount Amount</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discountAmount}
                    onChange={(e) => updateFormData("discountAmount", Number(e.target.value))}
                    placeholder="Enter discount"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-discount"
                  />
                </div>
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="marriage-fee" className="text-sm font-semibold text-foreground">After Marriage Fee</Label>
                  <Input
                    id="marriage-fee"
                    type="number"
                    value={formData.afterMarriageFee}
                    onChange={(e) => updateFormData("afterMarriageFee", Number(e.target.value))}
                    placeholder="Enter after marriage fee"
                    className="h-11 border-2 border-input hover:border-primary/50 focus:border-primary transition-colors"
                    data-testid="input-marriage-fee"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious} 
                className="px-6 py-3 border-2 border-input hover:border-primary/50 hover:bg-primary/5 font-semibold rounded-lg transition-all duration-200"
                data-testid="button-step-3-prev"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={createTrafficMutation.isPending}
                data-testid="button-submit-traffic"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {createTrafficMutation.isPending ? "Creating..." : "Apply for Paid Client"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
