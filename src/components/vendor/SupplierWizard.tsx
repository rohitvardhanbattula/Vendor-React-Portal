import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SupplierData, UploadedFile, GSTValidation } from '@/types/vendor';
import { api } from '@/lib/api';
import { sessionStorage } from '@/lib/session';
import { SupplierDetailsStep } from './wizard/SupplierDetailsStep';
import { ContactDetailsStep } from './wizard/ContactDetailsStep';
import { CategoryInfoStep } from './wizard/CategoryInfoStep';
import { FileUploadStep } from './wizard/FileUploadStep';
import { ReviewStep } from './wizard/ReviewStep';
import { ProgressDialog } from './wizard/ProgressDialog';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, title: 'Supplier Details' },
  { id: 2, title: 'Contact Details' },
  { id: 3, title: 'Category & Additional Info' },
  { id: 4, title: 'Upload Attachments' },
  { id: 5, title: 'Review & Submit' }
];

export function SupplierWizard() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [supplierData, setSupplierData] = useState<SupplierData>({
    supplierName: '',
    mainAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: '',
      region: ''
    },
    primaryContact: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    categoryAndRegion: {
      category: '',
      region: ''
    },
    additionalInfo: {
      details: ''
    }
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showProgress, setShowProgress] = useState(false);
  const [progressSteps, setProgressSteps] = useState({
    supplier: 'idle',
    gst: 'idle'
  });

  const updateSupplierData = (updates: Partial<SupplierData>) => {
    setSupplierData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSupplierData({
      supplierName: '',
      mainAddress: { street: '', city: '', postalCode: '', country: '',region:'' },
      primaryContact: { firstName: '', lastName: '', email: '', phone: '' },
      categoryAndRegion: { category: '',region:'' },
      additionalInfo: {details:''}
    });
    setUploadedFiles([]);
  };

  const handleSubmit = async () => {

    const navigate = useNavigate();
    const session = sessionStorage.get();
    if (!session?.username) return;

    if (uploadedFiles.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please upload at least one file'
      });
      return;
    }

    const exists = await api.checkIfSupplierExists(supplierData.supplierName, session.username);
    if (exists) {
      toast({
        variant: 'destructive',
        title: 'Supplier Exists',
        description: `A supplier with the name "${supplierData.supplierName}" already exists`
      });
      return;
    }

    setShowProgress(true);
    setProgressSteps({ supplier: 'idle', gst: 'inprogress' });

    try {
      // Step 1: Extract text and validate GST
      const extractedText = await api.extractTextFromFile(uploadedFiles[0].file);

      const gstinRegex = /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]\b/;
      const gstinMatch = extractedText.match(gstinRegex);
      const gstin = gstinMatch ? gstinMatch[0] : null;

      let validationData: GSTValidation | null = null;
      if (gstin) {
        const gstData = await api.validateGST(gstin);
        validationData = await validateGSTData(gstData, supplierData);
        setProgressSteps(prev => ({ ...prev, gst: validationData!.overallStatus === 'Success' ? 'success' : 'failed' }));
      } else {
        setProgressSteps(prev => ({ ...prev, gst: 'failed' }));
      }

      // Save validation results
      if (validationData && validationData.results.length > 0) {
        await Promise.all(
          validationData.results.map(result =>
            api.saveValidationResult(
              session.username,
              supplierData.supplierName,
              result.field,
              result.status,
              result.remarks
            )
          )
        );
      }

      // Step 2: Create supplier
      setProgressSteps(prev => ({ ...prev, supplier: 'inprogress' }));
      await api.createSupplierWithFiles(supplierData, session.username);

      // Step 3: Save extracted text
      if (extractedText) {
        await api.saveExtractedText(session.username, supplierData.supplierName, extractedText);
      }
      console.log("hit");
      // Step 4: Upload attachments
      if (uploadedFiles.length > 0) {
        const files = uploadedFiles.map(f => f.file);
        await api.uploadAttachments(supplierData.supplierName, session.username, files);
      }

      // All supplier steps done, mark as success
      setProgressSteps(prev => ({ ...prev, supplier: 'success' }));

      toast({
        title: 'Success',
        description: 'Supplier created successfully and approval process initiated'
      });

      setTimeout(() => {
        resetForm();
        setShowProgress(false);
        navigate(`/suppliers/${encodeURIComponent(supplierData.supplierName)}`);
      }, 2000);
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred during submission'
      });
      setProgressSteps({ supplier: 'failed', gst: 'failed' });
    }
  };

  const validateGSTData = async (gstData: any, supplierData: SupplierData): Promise<GSTValidation> => {
    const normalizeString = (str: string) =>
      str.toLowerCase().replace(/[\s.,]/g, '');

    const results = [];
    let overallStatus: 'Success' | 'Failed' = 'Success';

    const isNameMatch = normalizeString(gstData.gstTradeName || '') ===
      normalizeString(supplierData.supplierName);
    results.push({
      field: 'Trade Name',
      status: isNameMatch ? 'Success' as const : 'Failed' as const,
      remarks: isNameMatch ? 'Match' : `Expected: ${gstData.gstTradeName}`
    });
    if (!isNameMatch) overallStatus = 'Failed';

    const isPincodeMatch = gstData.gstPincode === supplierData.mainAddress.postalCode;
    results.push({
      field: 'Pincode',
      status: isPincodeMatch ? 'Success' as const : 'Failed' as const,
      remarks: isPincodeMatch ? 'Match' : `Expected: ${gstData.gstPincode}`
    });
    if (!isPincodeMatch) overallStatus = 'Failed';

    return { results, overallStatus };
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardContent className="p-6">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${currentStep > step.id
                          ? 'bg-primary text-primary-foreground'
                          : currentStep === step.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                    </div>
                    <span className="mt-2 text-xs font-medium text-center">{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-4 transition-colors ${currentStep > step.id ? 'bg-primary' : 'bg-muted'
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="mt-8">
            {currentStep === 1 && (
              <SupplierDetailsStep
                data={supplierData}
                onUpdate={updateSupplierData}
                onNext={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 2 && (
              <ContactDetailsStep
                data={supplierData}
                onUpdate={updateSupplierData}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 3 && (
              <CategoryInfoStep
                data={supplierData}
                onUpdate={updateSupplierData}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 4 && (
              <FileUploadStep
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
                onNext={() => setCurrentStep(5)}
                onBack={() => setCurrentStep(3)}
              />
            )}
            {currentStep === 5 && (
              <ReviewStep
                data={supplierData}
                files={uploadedFiles}
                onSubmit={handleSubmit}
                onBack={() => setCurrentStep(4)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <ProgressDialog
        open={showProgress}
        steps={progressSteps}
        onClose={() => setShowProgress(false)}
      />
    </>
  );
}
