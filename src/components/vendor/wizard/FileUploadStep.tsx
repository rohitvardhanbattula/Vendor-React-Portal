import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UploadedFile } from '@/types/vendor';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2 } from 'lucide-react';
import { useRef } from 'react';

interface Props {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FileUploadStep({ files, onFilesChange, onNext, onBack }: Props) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > 2) {
      toast({
        variant: 'destructive',
        title: 'Too Many Files',
        description: 'You can upload a maximum of 2 files'
      });
      return;
    }

    const newFiles: UploadedFile[] = selectedFiles.map(file => ({
      documentId: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: Math.round(file.size / 1024),
      file
    }));

    onFilesChange([...files, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileDelete = (documentId: string) => {
    onFilesChange(files.filter(f => f.documentId !== documentId));
  };

  const handleNext = () => {
    if (files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Files',
        description: 'Please upload at least 1 file to proceed'
      });
      return;
    }

    if (files.length > 2) {
      toast({
        variant: 'destructive',
        title: 'Too Many Files',
        description: 'Please remove extra files (maximum 2 files allowed)'
      });
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button type="button" variant="outline" asChild>
            <span>
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </span>
          </Button>
        </label>
        <p className="text-sm text-muted-foreground">
          Upload up to 2 files (PDF, DOCX, XLSX, PNG, JPEG)
        </p>
      </div>

      {files.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size (KB)</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map(file => (
                <TableRow key={file.documentId}>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell>{file.type}</TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileDelete(file.documentId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
}
