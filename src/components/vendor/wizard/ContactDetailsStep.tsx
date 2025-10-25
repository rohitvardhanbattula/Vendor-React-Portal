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
  onBack: () => void;
}

export function ContactDetailsStep({ data, onUpdate, onNext, onBack }: Props) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleNext = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!data.primaryContact.firstName) newErrors.firstName = true;
    if (!data.primaryContact.email) newErrors.email = true;

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
        <div className="space-y-2">
          <Label htmlFor="firstName" className="required">First Name</Label>
          <Input
            id="firstName"
            value={data.primaryContact.firstName}
            onChange={(e) => {
              onUpdate({ primaryContact: { ...data.primaryContact, firstName: e.target.value } });
              setErrors(prev => ({ ...prev, firstName: false }));
            }}
            className={errors.firstName ? 'border-destructive' : ''}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={data.primaryContact.lastName}
            onChange={(e) =>
              onUpdate({ primaryContact: { ...data.primaryContact, lastName: e.target.value } })
            }
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email" className="required">Email</Label>
          <Input
            id="email"
            type="email"
            value={data.primaryContact.email}
            onChange={(e) => {
              onUpdate({ primaryContact: { ...data.primaryContact, email: e.target.value } });
              setErrors(prev => ({ ...prev, email: false }));
            }}
            className={errors.email ? 'border-destructive' : ''}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={data.primaryContact.phone}
            onChange={(e) =>
              onUpdate({ primaryContact: { ...data.primaryContact, phone: e.target.value } })
            }
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
}
