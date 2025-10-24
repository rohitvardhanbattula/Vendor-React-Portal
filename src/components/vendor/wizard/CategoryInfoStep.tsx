import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SupplierData } from '@/types/vendor';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  data: SupplierData;
  onUpdate: (updates: Partial<SupplierData>) => void;
  onNext: () => void;
}

export function CategoryInfoStep({ data, onUpdate, onNext }: Props) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleNext = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!data.categoryAndRegion.category) newErrors.category = true;

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
          <Label htmlFor="category" className="required">Category</Label>
          <Input
            id="category"
            value={data.categoryAndRegion.category}
            onChange={(e) => {
              onUpdate({ categoryAndRegion: { ...data.categoryAndRegion, category: e.target.value } });
              setErrors(prev => ({ ...prev, category: false }));
            }}
            className={errors.category ? 'border-destructive' : ''}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="catRegion">Region</Label>
          <Input
            id="catRegion"
            value={data.categoryAndRegion.region}
            onChange={(e) =>
              onUpdate({ categoryAndRegion: { ...data.categoryAndRegion, region: e.target.value } })
            }
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="additionalInfo">Additional Information</Label>
          <Textarea
            id="additionalInfo"
            rows={4}
            value={data.additionalInfo.details}
            onChange={(e) =>
              onUpdate({ additionalInfo: { details: e.target.value } })
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
