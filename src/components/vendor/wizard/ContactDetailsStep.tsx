import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { SupplierData } from '@/types/vendor';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  data: SupplierData;
  onUpdate: (updates: Partial<SupplierData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ContactDetailsStep({ data, onUpdate, onNext, onBack }: Props) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate in real-time, but errors are only shown if field is touched
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (!data.primaryContact.firstName?.trim()) {
      newErrors.firstName = 'First Name is required';
    }
    if (!data.primaryContact.lastName?.trim()) {
      newErrors.lastName = 'Last Name is required';
    }
    if (!data.primaryContact.email?.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.primaryContact.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    setErrors(newErrors);
  }, [data.primaryContact.firstName, data.primaryContact.lastName, data.primaryContact.email]);

  const handleNext = () => {
    // Mark all relevant fields as touched to reveal any errors
    const newTouched = {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    };
    setTouched(newTouched);

    // If any required field has an error, block navigation
    if (errors.firstName || errors.lastName || errors.email) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    onNext();
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Border class helpers: only show error/success after touch
  const getFirstNameBorderClass = () => {
    if (!touched.firstName) return 'border-input';
    if (errors.firstName) return 'border-red-500';
    return 'border-[#1a365d]';
  };

  const getLastNameBorderClass = () => {
    if (!touched.lastName) return 'border-input';
    if (errors.lastName) return 'border-red-500';
    return 'border-[#1a365d]';
  };

  const getEmailBorderClass = () => {
    if (!touched.email) return 'border-input';
    if (errors.email) return 'border-red-500';
    return 'border-[#1a365d]';
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200">
      <CardHeader>
        <div className="!bg-gradient-to-r from-[#2b4d8a] via-[#3e6ab3] to-[#2b4d8a] px-4 py-1 border-b-4 border-blue-500 rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center shadow">
              <span className="text-white font-bold text-base">2</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Contact Details</h2>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* First Name */}
          <div>
            <Label
              htmlFor="firstName"
              className={`block text-sm font-medium ${
                touched.firstName && errors.firstName ? 'text-red-500' : 'text-indigo-700'
              }`}
            >
              First Name:<span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              value={data.primaryContact.firstName || ''}
              onChange={(e) =>
                onUpdate({ primaryContact: { ...data.primaryContact, firstName: e.target.value } })
              }
              onBlur={() => markTouched('firstName')}
              className={`mt-1 block w-full p-2 rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d]
                focus:border-[#1a365d] focus:shadow-[0_0_0_3px_rgba(26,54,93,0.2)]
                transition-colors duration-200 ease-in-out
                ${getFirstNameBorderClass()}`}
            />
            {touched.firstName && errors.firstName && (
              <p className="mt-1 text-sm text-red-500 italic flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label
              htmlFor="lastName"
              className={`block text-sm font-medium ${
                touched.lastName && errors.lastName ? 'text-red-500' : 'text-indigo-700'
              }`}
            >
              Last Name:<span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              value={data.primaryContact.lastName || ''}
              onChange={(e) =>
                onUpdate({ primaryContact: { ...data.primaryContact, lastName: e.target.value } })
              }
              onBlur={() => markTouched('lastName')}
              className={`mt-1 block w-full p-2 rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d]
                focus:border-[#1a365d] focus:shadow-[0_0_0_3px_rgba(26,54,93,0.2)]
                transition-colors duration-200 ease-in-out
                ${getLastNameBorderClass()}`}
            />
            {touched.lastName && errors.lastName && (
              <p className="mt-1 text-sm text-red-500 italic flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label
              htmlFor="email"
              className={`block text-sm font-medium ${
                touched.email && errors.email ? 'text-red-500' : 'text-indigo-700'
              }`}
            >
              Email:<span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={data.primaryContact.email || ''}
              onChange={(e) =>
                onUpdate({ primaryContact: { ...data.primaryContact, email: e.target.value } })
              }
              onBlur={() => markTouched('email')}
              className={`mt-1 block w-full p-2 rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d]
                focus:border-[#1a365d] focus:shadow-[0_0_0_3px_rgba(26,54,93,0.2)]
                transition-colors duration-200 ease-in-out
                ${getEmailBorderClass()}`}
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-500 italic flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="block text-sm font-medium text-indigo-700">
              Phone:
            </Label>
            <Input
              id="phone"
              type="tel"
              value={data.primaryContact.phone || ''}
              onChange={(e) =>
                onUpdate({ primaryContact: { ...data.primaryContact, phone: e.target.value } })
              }
              className="mt-1 block w-full p-2 rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d]
                focus:border-[#1a365d] focus:shadow-[0_0_0_3px_rgba(26,54,93,0.2)]
                transition-colors duration-200 ease-in-out"
            />
          </div>
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleNext}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}