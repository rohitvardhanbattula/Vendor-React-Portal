/*import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionStorage } from '@/lib/session';
import { api } from '@/lib/api';
import { SupplierData, ApprovalComment, ValidationRecord } from '@/types/vendor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, MapPin, User, Mail, Phone, FileText, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SupplierDetail() {
  const navigate = useNavigate();
  const { name } = useParams<{ name: string }>();
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [approvals, setApprovals] = useState<ApprovalComment[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.get();
    if (!session?.username || !name) {
      navigate('/vendor-login');
      return;
    }

    const decodedName = decodeURIComponent(name);

    Promise.all([
      api.getSuppliers(session.username),
      api.getApprovals(decodedName, session.username),
      api.downloadAttachments(decodedName, session.username),
      api.getValidationResults(decodedName, session.username)
    ]).then(([suppliers, approvalsData, attachmentsData, validationData]) => {
      const found = suppliers.find(s => s.supplierName === decodedName);
      if (found) setSupplier(found);
      setApprovals(approvalsData);
      setAttachments(attachmentsData.value || []);
      setValidationResults(validationData);
    }).finally(() => setLoading(false));
  }, [name, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Supplier not found</p>
            <Button className="w-full mt-4" onClick={() => navigate('/suppliers')}>
              Back to Suppliers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getGSTStatusBadge = (status?: string) => {
    if (status === 'Success') {
      return <Badge variant="default" className="bg-green-600">Validated</Badge>;
    }
    if (status === 'Failed') {
      return <Badge variant="destructive">Validation Failed</Badge>;
    }
    return <Badge variant="secondary">Not Validated</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/suppliers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        // Header Card 
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl mb-2">{supplier.supplierName}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {supplier.status && (
                      <Badge variant={supplier.status === 'Approved' ? 'default' : 'secondary'}>
                        {supplier.status}
                      </Badge>
                    )}
                    {supplier.businessPartnerId && (
                      <span className="text-sm">BP ID: {supplier.businessPartnerId}</span>
                    )}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        // Details Tabs 
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Supplier Details</TabsTrigger>
            <TabsTrigger value="gst">GST Validation</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          // Supplier Details Tab 
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Street</p>
                  <p className="text-base">{supplier.mainAddress.street || '-'}</p>
                </div>
                {supplier.mainAddress.line2 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Line 2</p>
                    <p className="text-base">{supplier.mainAddress.line2}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">City</p>
                  <p className="text-base">{supplier.mainAddress.city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Postal Code</p>
                  <p className="text-base">{supplier.mainAddress.postalCode || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Country</p>
                  <p className="text-base">{supplier.mainAddress.country || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Region</p>
                  <p className="text-base">{supplier.mainAddress.region || '-'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-base">{supplier.primaryContact.firstName} {supplier.primaryContact.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" /> Email
                  </p>
                  <p className="text-base">{supplier.primaryContact.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-4 w-4" /> Phone
                  </p>
                  <p className="text-base">{supplier.primaryContact.phone}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category & Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-base">{supplier.categoryAndRegion.category || '-'}</p>
                </div>
                {supplier.categoryAndRegion.region && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category Region</p>
                    <p className="text-base">{supplier.categoryAndRegion.region}</p>
                  </div>
                )}
                {supplier.additionalInfo.details && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Additional Details</p>
                    <p className="text-base whitespace-pre-wrap">{supplier.additionalInfo.details}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          // GST Validation Tab 
          <TabsContent value="gst" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>GST Validation Results</CardTitle>
                </div>
                <CardDescription>Automated validation of GST information against submitted documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {validationResults.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Field-by-Field Validation</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResults.map((result, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{result.field}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {result.status === 'Success' ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <Badge variant="default" className="bg-green-600">Match</Badge>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <Badge variant="destructive">Mismatch</Badge>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{result.remarks || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {supplier.aiExtractedText && (
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Extracted GST Information:
                    </p>
                    <p className="text-sm font-mono whitespace-pre-wrap bg-background p-3 rounded">
                      {supplier.aiExtractedText}
                    </p>
                  </div>
                )}

                {validationResults.length === 0 && !supplier.aiExtractedText && (
                  <p className="text-center text-muted-foreground py-8">
                    No GST validation data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          // Approvals Tab 
          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle>Approval Workflow</CardTitle>
                <CardDescription>Track approval status across different levels</CardDescription>
              </CardHeader>
              <CardContent>
                {approvals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No approval records found
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Level</TableHead>
                        <TableHead>Approver Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead>Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvals.map((approval, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">Level {approval.level}</TableCell>
                          <TableCell>{approval.name}</TableCell>
                          <TableCell>{approval.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(approval.status)}
                              <span>{approval.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>{approval.comment || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {approval.updatedAt || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          // Attachments Tab 
          <TabsContent value="attachments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attachments
                </CardTitle>
                <CardDescription>Documents and files attached to this supplier</CardDescription>
              </CardHeader>
              <CardContent>
                {attachments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No attachments found
                  </p>
                ) : (
                  <div className="space-y-3">
                    {attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{file.fileName}</p>
                            <p className="text-sm text-muted-foreground">
                              {file.filesize ? `${(file.filesize / 1024).toFixed(2)} KB` : 'Size unknown'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const fullDataUri = `data:${file.mimeType};base64,${file.content}`;

                            api.downloadFileFromContent(fullDataUri, file.fileName);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                    <Separator className="my-4" />
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        const session = sessionStorage.get();
                        if (session?.username) {
                          api.downloadZip(supplier.supplierName, session.username);
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download All as ZIP
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}*/
import { useEffect, useState } from 'react';
import { useAutoLogout } from '@/hooks/use-auto-logout';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionStorage } from '@/lib/session';
import { api } from '@/lib/api';
import { SupplierData, ApprovalComment, ValidationRecord } from '@/types/vendor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SupplierDetail() {
  const navigate = useNavigate();
  const { name } = useParams<{ name: string }>();
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [approvals, setApprovals] = useState<ApprovalComment[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useAutoLogout();
  useEffect(() => {
    const session = sessionStorage.get();
    if (!session?.username || !name) {
      navigate('/vendor-login');
      return;
    }

    const decodedName = decodeURIComponent(name);

    Promise.all([
      api.getSuppliers(session.username),
      api.getApprovals(decodedName, session.username),
      api.downloadAttachments(decodedName, session.username),
      api.getValidationResults(decodedName, session.username),
    ])
      .then(([suppliers, approvalsData, attachmentsData, validationData]) => {
        const found = suppliers.find((s) => s.supplierName === decodedName);
        if (found) setSupplier(found);
        setApprovals(approvalsData);
        setAttachments(attachmentsData.value || []);
        setValidationResults(validationData);
      })
      .finally(() => setLoading(false));
  }, [name, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-4">Supplier not found</p>
          <Button
            onClick={() => navigate('/suppliers')}
            className="bg-[#1a365d] hover:bg-[#152c4a] text-white px-4 py-2 rounded-xl font-medium"
          >
            Back to Suppliers
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    let bgColor = 'bg-gray-100 text-gray-800';
    if (status === 'Approved') bgColor = 'bg-green-100 text-green-800';
    else if (status === 'Pending' || status === 'In Review') bgColor = 'bg-yellow-100 text-yellow-800';
    else if (status === 'Rejected') bgColor = 'bg-red-100 text-red-800';
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${bgColor}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/suppliers')}
            className="px-4 py-2 bg-[#1a365d] hover:bg-[#152c4a] text-white text-sm font-medium rounded-xl flex items-center transition-colors duration-200 shadow-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Suppliers
          </button>
        </div>

        {/* Page Header */}
        <div className="!bg-gradient-to-r from-[#2b4d8a] via-[#3e6ab3] to-[#2b4d8a] px-6 py-2 border-b-4 border-blue-500 rounded-lg mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{supplier.supplierName}</h1>
              <div className="flex items-center gap-3 mt-1">
                {getStatusBadge(supplier.status)}
                {supplier.businessPartnerId && (
                  <span className="text-sm text-blue-200">BP ID: {supplier.businessPartnerId}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ CORRECTED: Tabs wrapper contains BOTH TabsList AND all TabsContent */}
        <Tabs defaultValue="details" className="space-y-6">
          {/* Tabs UI (styled container) */}
          <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200 p-1">
            <TabsList className="grid w-full grid-cols-4 bg-transparent p-1">
              {(['details', 'gst', 'approvals', 'attachments'] as const).map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="data-[state=active]:bg-[#1a365d] data-[state=active]:text-white rounded-lg py-2 text-sm font-medium transition-colors"
                >
                  {tab === 'details' && 'Supplier Details'}
                  {tab === 'gst' && 'GST Validation'}
                  {tab === 'approvals' && 'Approvals'}
                  {tab === 'attachments' && 'Attachments'}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ✅ All TabsContent are INSIDE <Tabs> */}
          <TabsContent value="details" className="outline-none">
            <div className="space-y-5">
              <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-[#1a365d] mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                  <div className="flex">
                    <dt className="font-medium w-32">Street:</dt>
                    <dd>{supplier.mainAddress.street || '—'}</dd>
                  </div>
                  {supplier.mainAddress.line2 && (
                    <div className="flex">
                      <dt className="font-medium w-32">Line 2:</dt>
                      <dd>{supplier.mainAddress.line2}</dd>
                    </div>
                  )}
                  <div className="flex">
                    <dt className="font-medium w-32">City:</dt>
                    <dd>{supplier.mainAddress.city || '—'}</dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium w-32">Postal Code:</dt>
                    <dd>{supplier.mainAddress.postalCode || '—'}</dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium w-32">Country:</dt>
                    <dd>{supplier.mainAddress.country || '—'}</dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium w-32">Region:</dt>
                    <dd>{supplier.mainAddress.region || '—'}</dd>
                  </div>
                </div>
              </div>

              <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-[#1a365d] mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" /> Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                  <div className="flex">
                    <dt className="font-medium w-32">Name:</dt>
                    <dd>{supplier.primaryContact.firstName} {supplier.primaryContact.lastName}</dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium w-32 flex items-center gap-1">
                      <Mail className="h-4 w-4" /> Email:
                    </dt>
                    <dd>{supplier.primaryContact.email}</dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium w-32 flex items-center gap-1">
                      <Phone className="h-4 w-4" /> Phone:
                    </dt>
                    <dd>{supplier.primaryContact.phone || '—'}</dd>
                  </div>
                </div>
              </div>

              <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-[#1a365d] mb-4">Category & Additional Information</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex">
                    <dt className="font-medium w-32">Category:</dt>
                    <dd>{supplier.categoryAndRegion.category || '—'}</dd>
                  </div>
                  {supplier.categoryAndRegion.region && (
                    <div className="flex">
                      <dt className="font-medium w-32">Category Region:</dt>
                      <dd>{supplier.categoryAndRegion.region}</dd>
                    </div>
                  )}
                  {supplier.additionalInfo.details && (
                    <div className="flex flex-col">
                      <dt className="font-medium w-32">Additional Details:</dt>
                      <dd className="whitespace-pre-wrap">{supplier.additionalInfo.details}</dd>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gst" className="outline-none">
            <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-[#1a365d] mb-2">GST Validation Results</h3>
              <p className="text-sm text-gray-600 mb-6">Automated validation of GST information against submitted documents</p>

              {validationResults.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">Field-by-Field Validation</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                      <thead className="bg-[#e0e7ff]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-bold text-[#1a365d] uppercase">Field</th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-[#1a365d] uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-[#1a365d] uppercase">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {validationResults.map((result, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{result.field}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {result.status === 'Success' ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-green-700 font-medium">Match</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-red-700 font-medium">Mismatch</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{result.remarks || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {supplier.aiExtractedText && (
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-[#1a365d] mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Extracted GST Information:
                  </p>
                  <pre className="text-xs bg-white p-3 rounded border font-mono whitespace-pre-wrap">
                    {supplier.aiExtractedText}
                  </pre>
                </div>
              )}

              {validationResults.length === 0 && !supplier.aiExtractedText && (
                <p className="text-center text-gray-500 py-8">No GST validation data available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="outline-none">
            <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-[#1a365d] mb-2">Approval Workflow</h3>
              <p className="text-sm text-gray-600 mb-6">Track approval status across different levels</p>

              {approvals.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No approval records found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                    <thead className="bg-[#e0e7ff]">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-[#1a365d] uppercase">Level</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-[#1a365d] uppercase">Approver</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-[#1a365d] uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-[#1a365d] uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-[#1a365d] uppercase">Comments</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-[#1a365d] uppercase">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {approvals.map((approval, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">Level {approval.level}</td>
                          <td className="px-4 py-3 text-gray-900">{approval.name}</td>
                          <td className="px-4 py-3 text-gray-900">{approval.email}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(approval.status)}
                              <span>{approval.status}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{approval.comment || '—'}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm">{approval.updatedAt || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="outline-none">
            <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-[#1a365d] mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" /> Attachments
              </h3>
              <p className="text-sm text-gray-600 mb-6">Documents and files attached to this supplier</p>

              {attachments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No attachments found</p>
              ) : (
                <div className="space-y-4">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{file.fileName}</p>
                          <p className="text-sm text-gray-500">
                            {file.filesize ? `${(file.filesize / 1024).toFixed(2)} KB` : 'Size unknown'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          const fullDataUri = `data:${file.mimeType};base64,${file.content}`;
                          api.downloadFileFromContent(fullDataUri, file.fileName);
                        }}
                        className="bg-[#1a365d] hover:bg-[#152c4a] text-white px-3 py-1.5 text-sm rounded-lg flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => {
                        const session = sessionStorage.get();
                        if (session?.username) {
                          api.downloadZip(supplier.supplierName, session.username);
                        }
                      }}
                      className="w-full bg-[#1a365d] hover:bg-[#152c4a] text-white px-4 py-2.5 text-sm rounded-lg flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download All as ZIP
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}