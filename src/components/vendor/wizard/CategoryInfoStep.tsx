import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
 
export function CategoryInfoStep({ data, onUpdate, onNext, onBack }: Props) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
 
  // Real-time validation (errors computed but not shown until touched)
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    if (!data.categoryAndRegion.category?.trim()) {
      newErrors.category = 'Category is required';
    }
    setErrors(newErrors);
  }, [data.categoryAndRegion.category]);
 
  const handleNext = () => {
    // Mark required field as touched to reveal error if invalid
    setTouched((prev) => ({ ...prev, category: true }));
 
    if (errors.category) {
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
 
  const getCategoryBorderClass = () => {
    if (!touched.category) return 'border-input';
    if (errors.category) return 'border-red-500';
    return 'border-[#1a365d]';
  };
 
  return (
    <Card className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200">
      <CardHeader>
        <div className="!bg-gradient-to-r from-[#2b4d8a] via-[#3e6ab3] to-[#2b4d8a] px-4 py-1 border-b-4 border-blue-500 rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center shadow">
              <span className="text-white font-bold text-base">3</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Category & Info</h2>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Category */}
          <div>
            <Label
              htmlFor="category"
              className={`block text-sm font-medium ${
                touched.category && errors.category ? 'text-red-500' : 'text-indigo-700'
              }`}
            >
              Category:<span className="text-red-500">*</span>
            </Label>
            <Input
              id="category"
              type="text"
              value={data.categoryAndRegion.category || ''}
              onChange={(e) =>
                onUpdate({ categoryAndRegion: { ...data.categoryAndRegion, category: e.target.value } })
              }
              onBlur={() => markTouched('category')}
              className={`mt-1 block w-full p-2 rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d]
                focus:border-[#1a365d] focus:shadow-[0_0_0_3px_rgba(26,54,93,0.2)]
                transition-colors duration-200 ease-in-out
                ${getCategoryBorderClass()}`}
            />
            {touched.category && errors.category && (
              <p className="mt-1 text-sm text-red-500 italic flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.category}
              </p>
            )}
          </div>
 
          {/* Region */}
          <div>
            <Label htmlFor="region" className="block text-sm font-medium text-indigo-700">
              Region:
            </Label>
            <Input
              id="region"
              type="text"
              value={data.categoryAndRegion.region || ''}
              onChange={(e) =>
                onUpdate({ categoryAndRegion: { ...data.categoryAndRegion, region: e.target.value } })
              }
              className="mt-1 block w-full p-2 rounded-md shadow-sm
                focus:outline-none focus:ring-1 focus:ring-[#1a365d]
                focus:border-[#1a365d] focus:shadow-[0_0_0_3px_rgba(26,54,93,0.2)]
                transition-colors duration-200 ease-in-out"
            />
          </div>
 
          {/* Additional Info */}
          <div className="md:col-span-2">
            <Label htmlFor="additionalInfo" className="block text-sm font-medium text-indigo-700">
              Additional Info:
            </Label>
            <Textarea
              id="additionalInfo"
              rows={4}
              value={data.additionalInfo.details || ''}
              onChange={(e) =>
                onUpdate({ additionalInfo: { details: e.target.value } })
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