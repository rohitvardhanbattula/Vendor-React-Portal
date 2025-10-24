import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, User, Briefcase, CheckCircle2 } from "lucide-react";

interface VendorFormData {
  companyName: string;
  taxId: string;
  address: string;
  city: string;
  country: string;
  contactName: string;
  email: string;
  phone: string;
  services: string;
  bankAccount: string;
}

export const VendorRegistrationForm = () => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [formData, setFormData] = useState<VendorFormData>({
    companyName: "",
    taxId: "",
    address: "",
    city: "",
    country: "",
    contactName: "",
    email: "",
    phone: "",
    services: "",
    bankAccount: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with CAPM backend
    console.log("Form submitted:", formData);
    toast({
      title: "Registration Successful!",
      description: "Your vendor registration has been submitted for review.",
    });
    setStep(4);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
              step >= num
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
          </div>
          {num < 3 && (
            <div
              className={`h-1 w-16 mx-2 transition-all ${
                step > num ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  if (step === 4) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Registration Complete!</h2>
          <p className="text-muted-foreground mb-8">
            Thank you for registering. Your application is under review and we'll contact you soon.
          </p>
          <Button onClick={() => window.location.reload()} size="lg">
            Register Another Vendor
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Vendor Registration</CardTitle>
        <CardDescription>
          {step === 1 && "Step 1: Company Information"}
          {step === 2 && "Step 2: Contact Details"}
          {step === 3 && "Step 3: Services & Banking"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStepIndicator()}
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Building2 className="w-5 h-5" />
                <h3 className="font-semibold">Company Details</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / Registration Number *</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter tax ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <User className="w-5 h-5" />
                <h3 className="font-semibold">Contact Information</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Person Name *</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  required
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="email@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Briefcase className="w-5 h-5" />
                <h3 className="font-semibold">Services & Banking</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="services">Services Offered *</Label>
                <Input
                  id="services"
                  name="services"
                  value={formData.services}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., IT Services, Consulting, Manufacturing"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account Number *</Label>
                <Input
                  id="bankAccount"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter bank account number"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button type="button" onClick={handleNext} className="ml-auto">
                Next
              </Button>
            ) : (
              <Button type="submit" className="ml-auto shadow-primary">
                Submit Registration
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
