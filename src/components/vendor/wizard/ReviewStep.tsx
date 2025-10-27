import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { SupplierData, UploadedFile } from '@/types/vendor';
import { useState } from 'react';

const formatFileSizeKB = (bytes: number): string => {
  return Math.round(bytes / 1024).toString();
};

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

  const cardStyle = "w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200";

  return (
    <Card className={cardStyle}>
      {/* Step Header */}
      <CardHeader>
        <div className="!bg-gradient-to-r from-[#2b4d8a] via-[#3e6ab3] to-[#2b4d8a] px-4 py-1 border-b-4 border-blue-500 rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shadow">
              <span className="text-white font-bold text-base">5</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Review & Submit</h2>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-5">
          {/* Supplier Details - Full Width */}
          <Card className={cardStyle}>
            <CardHeader className="p-3 pb-0">
              <h3 className="text-lg font-semibold text-[#1a365d]">Supplier Details</h3>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
                <div className="flex">
                  <dt className="font-medium w-32 sm:w-40">Supplier Name:</dt>
                  <dd>{data.supplierName || '—'}</dd>
                </div>
                <div className="flex">
                  <dt className="font-medium w-32 sm:w-40">Street:</dt>
                  <dd>{data.mainAddress.street || '—'}</dd>
                </div>
                <div className="flex">
                  <dt className="font-medium w-32 sm:w-40">City:</dt>
                  <dd>{data.mainAddress.city || '—'}</dd>
                </div>
                <div className="flex">
                  <dt className="font-medium w-32 sm:w-40">Postal Code:</dt>
                  <dd>{data.mainAddress.postalCode || '—'}</dd>
                </div>
                <div className="flex">
                  <dt className="font-medium w-32 sm:w-40">Country:</dt>
                  <dd>{data.mainAddress.country || '—'}</dd>
                </div>
                <div className="flex">
                  <dt className="font-medium w-32 sm:w-40">Region:</dt>
                  <dd>{data.mainAddress.region || '—'}</dd>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details - Full Width */}
          <Card className={cardStyle}>
            <CardHeader className="p-3 pb-0">
              <h3 className="text-lg font-semibold text-[#1a365d]">Contact Details</h3>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
                <div className="flex">
                  <dt className="font-medium w-32 sm:w-40">First Name:</dt>
                  <dd>{data.primaryContact.firstName || '—'}</dd>
                </div>
                <div className="flex">
                  <dt className="font-medium w-32 sm:w-40">Last Name:</dt>
                  <dd>{data.primaryContact.lastName || '—'}</dd>
                </div>
                <div className="flex">
                  <dt className="font-medium w-32 sm:w-40">Email:</dt>
                  <dd>{data.primaryContact.email || '—'}</dd>
                </div>
                <div className="flex">
                  <dt className="font-medium w-32 sm:w-40">Phone:</dt>
                  <dd>{data.primaryContact.phone || '—'}</dd>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category & Region - Full Width */}
          <Card className={cardStyle}>
            <CardHeader className="p-3 pb-0">
              <h3 className="text-lg font-semibold text-[#1a365d]">Category & Region</h3>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
                <div className="flex">
                  <dt className="font-medium w-32 sm:w-40">Category:</dt>
                  <dd>{data.categoryAndRegion.category || '—'}</dd>
                </div>
                <div className="flex">
                  <dt className="font-medium w-32 sm:w-40">Region:</dt>
                  <dd>{data.categoryAndRegion.region || '—'}</dd>
                </div>
                <div className="flex col-span-1 sm:col-span-2">
                  <dt className="font-medium w-32 sm:w-40">Additional Info:</dt>
                  <dd>{data.additionalInfo.details || '—'}</dd>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments - Full Width (already was) */}
          <Card className={cardStyle}>
            <CardHeader className="p-3 pb-0">
              <h3 className="text-lg font-semibold text-[#1a365d]">Uploaded Attachments</h3>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {files.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                        <th className="px-3 py-2">File Name</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Size (KB)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {files.map(file => (
                        <tr key={file.documentId} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-900">{file.name}</td>
                          <td className="px-3 py-2 text-gray-700">{file.type || 'Unknown'}</td>
                          <td className="px-3 py-2 text-gray-700">{formatFileSizeKB(file.size)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No files uploaded.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
            {isSubmitting ? 'Submitting...' : 'Submit Supplier'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
