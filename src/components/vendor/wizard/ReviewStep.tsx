import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SupplierData, UploadedFile } from '@/types/vendor';
import { useState } from 'react';

interface Props {
  data: SupplierData;
  files: UploadedFile[];
  onSubmit: () => void;
  onBack: () => void;
}

export function ReviewStep({ data, files, onSubmit, onBack }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit();
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Supplier Name</p>
            <p className="text-sm">{data.supplierName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Street</p>
            <p className="text-sm">{data.mainAddress.street || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">City</p>
            <p className="text-sm">{data.mainAddress.city || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Postal Code</p>
            <p className="text-sm">{data.mainAddress.postalCode || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Country</p>
            <p className="text-sm">{data.mainAddress.country}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Region</p>
            <p className="text-sm">{data.mainAddress.region || '-'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">First Name</p>
            <p className="text-sm">{data.primaryContact.firstName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Name</p>
            <p className="text-sm">{data.primaryContact.lastName || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm">{data.primaryContact.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phone</p>
            <p className="text-sm">{data.primaryContact.phone || '-'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category & Additional Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Category</p>
            <p className="text-sm">{data.categoryAndRegion.category}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Region</p>
            <p className="text-sm">{data.categoryAndRegion.region || '-'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Additional Info</p>
            <p className="text-sm">{data.additionalInfo.details || '-'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.documentId} className="flex items-center justify-between text-sm">
                <span>{file.name}</span>
                <span className="text-muted-foreground">{file.size} KB</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Submitting...' : 'Submit Supplier'}
        </Button>
      </div>
    </div>
  );
}
