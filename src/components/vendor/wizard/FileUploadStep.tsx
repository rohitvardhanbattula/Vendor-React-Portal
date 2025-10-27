import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UploadedFile } from '@/types/vendor';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

// Helper: Format file size to human-readable (KB, MB, etc.)
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface Props {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FileUploadStep({ files, onFilesChange, onNext, onBack }: Props) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    setErrorMsg('');

    if (files.length + selectedFiles.length > 2) {
      setErrorMsg('You can only upload up to 2 files.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const newFiles: UploadedFile[] = selectedFiles.map(file => ({
      documentId: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size, // store raw size in bytes
      file
    }));

    onFilesChange([...files, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileDelete = (documentId: string) => {
    onFilesChange(files.filter(f => f.documentId !== documentId));
    setErrorMsg('');
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

    onNext();
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200">
      <CardHeader>
        <div className="!bg-gradient-to-r from-[#2b4d8a] via-[#3e6ab3] to-[#2b4d8a] px-4 py-1 border-b-4 border-blue-500 rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center shadow">
              <span className="text-white font-bold text-base">4</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Upload Attachments</h2>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Original "Choose Files" button style */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
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

          {/* Error message */}
          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          {/* Styled file list */}
          {files.length > 0 && (
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-indigo-700 mb-2">
                Selected Files ({files.length}/2)
              </h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="pb-2">File Name</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(file => (
                    <tr key={file.documentId} className="border-t border-gray-200">
                      <td className="py-2 font-medium text-gray-900">{file.name}</td>
                      <td className="py-2 text-gray-700">{file.type || 'Unknown'}</td>
                      <td className="py-2 text-gray-700">{formatFileSize(file.size)}</td>
                      <td className="py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 p-0 h-auto"
                          onClick={() => handleFileDelete(file.documentId)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
