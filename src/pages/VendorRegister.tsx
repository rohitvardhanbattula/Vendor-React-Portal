import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { UserPlus, Mail, Check } from 'lucide-react';
import companyLogo from '../assets/companylogo.png'; // ✅ Import logo
 
export default function VendorRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
 
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
 
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
   
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all fields'
      });
      return;
    }
 
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Passwords do not match'
      });
      return;
    }
 
    setLoading(true);
    try {
      const result = await api.sendOtp(formData.email);
      toast({
        title: 'OTP Sent',
        description: result
      });
      setStep('otp');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
 
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
   
    if (!otp) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter the OTP'
      });
      return;
    }
 
    setLoading(true);
    try {
      const verifyResult = await api.verifyOtp(formData.email, otp);
     
      if (verifyResult.success) {
        const registerResult = await api.registerUser(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.username,
          formData.password
        );
       
        if (registerResult.success) {
          toast({
            title: 'Registration Successful',
            description: 'Your account has been created'
          });
          navigate('/');
        } else {
          toast({
            variant: 'destructive',
            title: 'Registration Failed',
            description: registerResult.message
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid OTP',
          description: verifyResult.message
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred during registration'
      });
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      {/* ✅ SAP-Style Blue Header Toolbar */}
      <div className="blueHeaderToolbar">
        <div style={{ width: '0.5rem' }}></div>
        <img
          src={companyLogo}
          alt="Company Logo"
          style={{ height: '2rem' }}
        />
      </div>
 
      {/* Registration Card — pushed below header */}
      <div className="flex flex-1 items-center justify-center pt-12"> {/* ✅ pt-12 prevents overlap */}
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              {step === 'form' ? 'Enter your details to register' : 'Enter the OTP sent to your email'}
            </CardDescription>
          </CardHeader>
 
          {step === 'form' ? (
            <form onSubmit={handleSendOTP}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  <Mail className="mr-2 h-4 w-4" />
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
                <div className="text-sm text-center text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  <Check className="mr-2 h-4 w-4" />
                  {loading ? 'Verifying...' : 'Verify & Register'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep('form')}
                >
                  Back to Form
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}