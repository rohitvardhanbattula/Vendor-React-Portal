import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  steps: {
    supplier: string;
    gst: string;
  };
  onClose: () => void;
}

export function ProgressDialog({ open, steps, onClose }: Props) {
  const canClose = steps.supplier !== 'inprogress' && steps.gst !== 'inprogress';

  return (
    <Dialog open={open} onOpenChange={canClose ? onClose : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Creating Supplier</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            {steps.gst === 'inprogress' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {steps.gst === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {steps.gst === 'failed' && <XCircle className="h-5 w-5 text-destructive" />}
            {steps.gst === 'idle' && <div className="h-5 w-5 rounded-full border-2 border-muted" />}
            <span className="font-medium">GST Validation</span>
          </div>
          <div className="flex items-center gap-3">
            {steps.supplier === 'inprogress' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {steps.supplier === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {steps.supplier === 'failed' && <XCircle className="h-5 w-5 text-destructive" />}
            {steps.supplier === 'idle' && <div className="h-5 w-5 rounded-full border-2 border-muted" />}
            <span className="font-medium">Supplier Creation</span>
          </div>

          
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose} disabled={!canClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
