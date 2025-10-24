import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { sessionStorage } from '@/lib/session';
import { SupplierData } from '@/types/vendor';
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierListDialog({ open, onOpenChange }: Props) {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const session = sessionStorage.get();
      if (session?.username) {
        setLoading(true);
        api.getSuppliers(session.username).then(setSuppliers).finally(() => setLoading(false));
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suppliers List</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s, i) => (
                <TableRow key={i}>
                  <TableCell>{s.supplierName}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>{s.mainAddress?.country}</TableCell>
                  <TableCell>{s.primaryContact?.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
