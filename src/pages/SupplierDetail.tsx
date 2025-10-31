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
      navigate('/');
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
      {/* 🎯 Applied Centering and Max-Width here */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
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
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            SAP BUSINESS PARTNER ID: {supplier.businessPartnerId}
          </span>
                )}
              </div>
            </div>
          </div>
        </div>
 
        {/* Tabs wrapper contains BOTH TabsList AND all TabsContent */}
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
                  {tab === 'gst' && 'AI Extraction & Validation'}
                  {tab === 'approvals' && 'Approvals'}
                  {tab === 'attachments' && 'Attachments'}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
 
          {/* All TabsContent are INSIDE <Tabs> */}
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
  <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-2xl border border-gray-200 p-6 space-y-6">

    {/* 🔹 AI Extracted Information Section */}
    {supplier.aiExtractedText && (
      <div className="p-5 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-[#1a365d]" />
          <h4 className="text-base font-semibold text-[#1a365d]">
            Extracted AI Information
          </h4>
        </div>
        <pre className="text-sm bg-white p-4 rounded-lg border border-gray-200 font-mono whitespace-pre-wrap text-gray-800 overflow-x-auto">
          {supplier.aiExtractedText}
        </pre>
      </div>
    )}

    {/* 🔹 GST Validation Header */}
    <div>
      <h3 className="text-lg font-semibold text-[#1a365d] mb-1">
        GST Validation Results
      </h3>
      <p className="text-sm text-gray-600">
        Automated validation of GST information against submitted documents.
      </p>
    </div>

    {/* 🔹 Validation Results Table */}
    {validationResults.length > 0 ? (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-800">Field-by-Field Validation</h4>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm bg-white rounded-lg">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1a365d] uppercase">
                  Field
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1a365d] uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#1a365d] uppercase">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {validationResults.map((result, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {result.field}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {result.status === 'Success' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-700 font-medium">
                            Match
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-700 font-medium">
                            Mismatch
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {result.remarks || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
      // 🔹 Empty State
      !supplier.aiExtractedText && (
        <div className="text-center text-gray-500 py-10">
          <p className="text-sm">No validation data available.</p>
        </div>
      )
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