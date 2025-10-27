/*import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SupplierData } from '@/types/vendor';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  data: SupplierData;
  onUpdate: (updates: Partial<SupplierData>) => void;
  onNext: () => void;
}

export function SupplierDetailsStep({ data, onUpdate, onNext }: Props) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleNext = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!data.supplierName) newErrors.supplierName = true;
    if (!data.mainAddress.country) newErrors.country = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields'
      });
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="supplierName" className="required">Supplier Name</Label>
          <Input
            id="supplierName"
            value={data.supplierName}
            onChange={(e) => {
              onUpdate({ supplierName: e.target.value  });
              setErrors(prev => ({ ...prev, supplierName: false }));
            }}
            className={errors.supplierName ? 'border-destructive' : ''}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="street">Street</Label>
          <Input
            id="street"
            value={data.mainAddress.street || ''}
            onChange={(e) =>
              onUpdate({ mainAddress: { ...data.mainAddress, street: e.target.value } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="line2">Line 2</Label>
          <Input
            id="line2"
            value={data.mainAddress.line2 || ''}
            onChange={(e) =>
              onUpdate({ mainAddress: { ...data.mainAddress, line2: e.target.value } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="line3">Line 3</Label>
          <Input
            id="line3"
            value={data.mainAddress.line3 || ''}
            onChange={(e) =>
              onUpdate({ mainAddress: { ...data.mainAddress, line3: e.target.value } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.mainAddress.city || ''}
            onChange={(e) =>
              onUpdate({ mainAddress: { ...data.mainAddress, city: e.target.value } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={data.mainAddress.postalCode || ''}
            onChange={(e) =>
              onUpdate({ mainAddress: { ...data.mainAddress, postalCode: e.target.value } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="required">Country</Label>
          <Input
            id="country"
            value={data.mainAddress.country || ''}
            onChange={(e) => {
              onUpdate({ mainAddress: { ...data.mainAddress, country: e.target.value } });
              setErrors(prev => ({ ...prev, country: false }));
            }}
            className={errors.country ? 'border-destructive' : ''}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            value={data.mainAddress.region || ''}
            onChange={(e) =>
              onUpdate({ mainAddress: { ...data.mainAddress, region: e.target.value } })
            }
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
}*/
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
}

export function SupplierDetailsStep({ data, onUpdate, onNext }: Props) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate required fields
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    if (!data.supplierName?.trim()) {
      newErrors.supplierName = 'Supplier Name is required';
    }
    if (!data.mainAddress.country?.trim()) {
      newErrors.country = 'Country is required';
    }
    setErrors(newErrors);
  }, [data.supplierName, data.mainAddress.country]);

  const handleNext = () => {
    // Mark required fields as touched to reveal errors
    setTouched({
      supplierName: true,
      country: true,
    });

    if (errors.supplierName || errors.country) {
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

  // Border classes: only show error/success after touch
  const getSupplierNameBorderClass = () => {
    if (!touched.supplierName) return 'border-input';
    if (errors.supplierName) return 'border-red-500';
    return 'border-[#1a365d]';
  };

  const getCountryBorderClass = () => {
    if (!touched.country) return 'border-input';
    if (errors.country) return 'border-red-500';
    return 'border-[#1a365d]';
  };

  return (
    <Card className="w-full bg-gray-50 shadow-sm rounded-lg border border-gray-200">
      <CardHeader className="pb-3">
        <div className="!bg-gradient-to-r from-[#2b4d8a] via-[#3e6ab3] to-[#2b4d8a] px-4 py-1 border-b-4 border-blue-500 rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shadow">
              <span className="text-white font-bold text-base">1</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Supplier Details</h2>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {/* Supplier Name */}
          <div>
            <Label
              htmlFor="supplierName"
              className={`text-sm font-medium ${
                touched.supplierName && errors.supplierName ? 'text-red-500' : 'text-indigo-700'
              }`}
            >
              Supplier Name:<span className="text-red-500">*</span>
            </Label>
            <Input
              id="supplierName"
              value={data.supplierName || ''}
              onChange={(e) => {
                onUpdate({ supplierName: e.target.value });
              }}
              onBlur={() => markTouched('supplierName')}
              className={`mt-1 w-full p-1.5 text-sm rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]
                focus:shadow-[0_0_0_2px_rgba(26,54,93,0.2)]
                transition-colors duration-200
                ${getSupplierNameBorderClass()}`}
            />
            {touched.supplierName && errors.supplierName && (
              <p className="mt-1 text-xs text-red-500 italic flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.supplierName}
              </p>
            )}
          </div>

          {/* Street */}
          <div>
            <Label htmlFor="street" className="text-sm font-medium text-indigo-700">
              Street:
            </Label>
            <Input
              id="street"
              value={data.mainAddress.street || ''}
              onChange={(e) =>
                onUpdate({ mainAddress: { ...data.mainAddress, street: e.target.value } })
              }
              className="mt-1 w-full p-1.5 text-sm rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]
                focus:shadow-[0_0_0_2px_rgba(26,54,93,0.2)]"
            />
          </div>

          {/* Line 2 */}
          <div>
            <Label htmlFor="line2" className="text-sm font-medium text-indigo-700">
              Line2:
            </Label>
            <Input
              id="line2"
              value={data.mainAddress.line2 || ''}
              onChange={(e) =>
                onUpdate({ mainAddress: { ...data.mainAddress, line2: e.target.value } })
              }
              className="mt-1 w-full p-1.5 text-sm rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]
                focus:shadow-[0_0_0_2px_rgba(26,54,93,0.2)]"
            />
          </div>

          {/* Line 3 */}
          <div>
            <Label htmlFor="line3" className="text-sm font-medium text-indigo-700">
              Line3:
            </Label>
            <Input
              id="line3"
              value={data.mainAddress.line3 || ''}
              onChange={(e) =>
                onUpdate({ mainAddress: { ...data.mainAddress, line3: e.target.value } })
              }
              className="mt-1 w-full p-1.5 text-sm rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]
                focus:shadow-[0_0_0_2px_rgba(26,54,93,0.2)]"
            />
          </div>

          {/* City */}
          <div>
            <Label htmlFor="city" className="text-sm font-medium text-indigo-700">
              City:
            </Label>
            <Input
              id="city"
              value={data.mainAddress.city || ''}
              onChange={(e) =>
                onUpdate({ mainAddress: { ...data.mainAddress, city: e.target.value } })
              }
              className="mt-1 w-full p-1.5 text-sm rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]
                focus:shadow-[0_0_0_2px_rgba(26,54,93,0.2)]"
            />
          </div>

          {/* Postal Code */}
          <div>
            <Label htmlFor="postalCode" className="text-sm font-medium text-indigo-700">
              Postal Code:
            </Label>
            <Input
              id="postalCode"
              value={data.mainAddress.postalCode || ''}
              onChange={(e) =>
                onUpdate({ mainAddress: { ...data.mainAddress, postalCode: e.target.value } })
              }
              className="mt-1 w-full p-1.5 text-sm rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]
                focus:shadow-[0_0_0_2px_rgba(26,54,93,0.2)]"
            />
          </div>

          {/* Country */}
          <div>
            <Label
              htmlFor="country"
              className={`text-sm font-medium ${
                touched.country && errors.country ? 'text-red-500' : 'text-indigo-700'
              }`}
            >
              Country:<span className="text-red-500">*</span>
            </Label>
            <Input
              id="country"
              value={data.mainAddress.country || ''}
              onChange={(e) =>
                onUpdate({ mainAddress: { ...data.mainAddress, country: e.target.value } })
              }
              onBlur={() => markTouched('country')} // ← flat key 'country'
              className={`mt-1 w-full p-1.5 text-sm rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]
                focus:shadow-[0_0_0_2px_rgba(26,54,93,0.2)]
                transition-colors duration-200
                ${getCountryBorderClass()}`}
            />
            {touched.country && errors.country && (
              <p className="mt-1 text-xs text-red-500 italic flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.country}
              </p>
            )}
          </div>

          {/* Region */}
          <div>
            <Label htmlFor="region" className="text-sm font-medium text-indigo-700">
              Region:
            </Label>
            <Input
              id="region"
              value={data.mainAddress.region || ''}
              onChange={(e) =>
                onUpdate({ mainAddress: { ...data.mainAddress, region: e.target.value } })
              }
              className="mt-1 w-full p-1.5 text-sm rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]
                focus:shadow-[0_0_0_2px_rgba(26,54,93,0.2)]"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleNext}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}