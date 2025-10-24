import { Button } from '@/components/ui/button';
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
              onUpdate({ supplierName: e.target.value });
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
            value={data.mainAddress.street}
            onChange={(e) =>
              onUpdate({ mainAddress: { ...data.mainAddress, street: e.target.value } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="line2">Line 2</Label>
          <Input
            id="line2"
            value={data.mainAddress.line2}
            onChange={(e) =>
              onUpdate({ mainAddress: { ...data.mainAddress, line2: e.target.value } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="line3">Line 3</Label>
          <Input
            id="line3"
            value={data.mainAddress.line3}
            onChange={(e) =>
              onUpdate({ mainAddress: { ...data.mainAddress, line3: e.target.value } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.mainAddress.city}
            onChange={(e) =>
              onUpdate({ mainAddress: { ...data.mainAddress, city: e.target.value } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={data.mainAddress.postalCode}
            onChange={(e) =>
              onUpdate({ mainAddress: { ...data.mainAddress, postalCode: e.target.value } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="required">Country</Label>
          <Input
            id="country"
            value={data.mainAddress.country}
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
            value={data.mainAddress.region}
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
}
