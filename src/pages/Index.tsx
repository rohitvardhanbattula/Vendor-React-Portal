import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Building2, FileCheck, Shield, Zap } from "lucide-react";
import heroImage from "@/assets/hero-vendor.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Building2,
      title: "Easy Registration",
      description: "Simple multi-step registration process for new vendors",
    },
    {
      icon: FileCheck,
      title: "Document Management",
      description: "Securely upload and manage vendor documents",
    },
    {
      icon: Shield,
      title: "Compliance Ready",
      description: "Built-in compliance checks and validations",
    },
    {
      icon: Zap,
      title: "Fast Processing",
      description: "Quick approval workflow and real-time updates",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Vendor Portal
                <span className="block text-white/90 mt-2">Registration System</span>
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Streamline your vendor onboarding process with our enterprise-grade
                registration platform. Integrated with CAPM backend for seamless operations.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg"
                >
                  Register as Vendor
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="border-white text-white hover:bg-white/10"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src={heroImage}
                  alt="Professional business environment"
                  className="rounded-lg shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Registered Vendors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enterprise-ready vendor management with modern technology stack
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="gradient-card border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of vendors already using our platform for seamless business operations.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="shadow-primary"
          >
            Start Registration Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>© 2025 Vendor Portal. Powered by CAPM Backend.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
