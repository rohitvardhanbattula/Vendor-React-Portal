import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Building2, FileCheck, Shield, Zap } from "lucide-react";
import heroImage from "@/assets/hero-vendor.jpg";
import { useEffect } from "react";
import { sessionStorage } from "@/lib/session";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.isAuthenticated()) {
      navigate('/vendor-home');
    }
  }, [navigate]);

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
        <div className="absolute inset-0 gradient-hero animate-gradient" />
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-sm font-medium">✨ Enterprise-Grade Vendor Management</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                Vendor Portal
                <span className="block text-white/90 mt-2 text-4xl lg:text-5xl">Registration System</span>
              </h1>
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                Streamline your vendor onboarding with intelligent automation, GST validation,
                and comprehensive approval workflows powered by CAPM backend.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/vendor-login")}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all text-lg px-10 py-6"
                >
                  Sign In
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/vendor-register")}
                  className="border-white text-white hover:bg-white/10 backdrop-blur-sm text-lg px-10 py-6"
                >
                  Register as Vendor
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 gradient-accent opacity-20 blur-3xl rounded-3xl" />
                <img
                  src={heroImage}
                  alt="Professional business environment"
                  className="relative rounded-2xl shadow-2xl border border-white/20"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-2xl border border-primary/10">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">500+</div>
                  <div className="text-sm text-muted-foreground font-medium">Registered Vendors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background via-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-sm font-semibold text-primary">Features</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enterprise-ready vendor management with modern technology stack
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <Card 
                key={feature.title} 
                className="gradient-card border-primary/10 shadow-lg hover:shadow-primary transition-all hover:-translate-y-2"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-14 h-14 gradient-hero rounded-xl flex items-center justify-center mb-4 shadow-primary">
                    <feature.icon className="w-7 h-7 text-white" />
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
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-accent opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Join hundreds of vendors already using our platform for seamless business operations.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/vendor-register")}
            className="shadow-primary hover:shadow-accent transition-all text-lg px-10 py-6"
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
