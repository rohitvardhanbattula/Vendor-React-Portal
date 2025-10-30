import { useEffect, useState } from 'react';
import { useAutoLogout } from '@/hooks/use-auto-logout';
import { useNavigate } from 'react-router-dom';
import { sessionStorage } from '@/lib/session';
import { api } from '@/lib/api';
import { SupplierData } from '@/types/vendor';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Filter, Eye, Trash2, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
 
export default function Suppliers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);
  useAutoLogout();
 
  useEffect(() => {
    const session = sessionStorage.get();
    if (!session?.username) {
      navigate('/');
      return;
    }
 
    api.getSuppliers(session.username)
      .then(data => {
        setSuppliers(data);
        setFilteredSuppliers(data);
      })
      .finally(() => setLoading(false));
  }, [navigate]);
 
  useEffect(() => {
    let filtered = suppliers;
 
    if (searchName) {
      filtered = filtered.filter(s =>
        s.supplierName.toLowerCase().includes(searchName.toLowerCase())
      );
    }
 
    if (filterCountry !== 'all') {
      filtered = filtered.filter(s => s.mainAddress?.country === filterCountry);
    }
 
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }
 
    setFilteredSuppliers(filtered);
  }, [searchName, filterCountry, filterStatus, suppliers]);
 
  const countries = Array.from(new Set(suppliers.map(s => s.mainAddress?.country).filter(Boolean)));
  const statuses = Array.from(new Set(suppliers.map(s => s.status).filter(Boolean)));
 
  const handleDeleteClick = (supplierName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSupplierToDelete(supplierName);
    setDeleteDialogOpen(true);
  };
 
  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;
 
    const session = sessionStorage.get();
    if (!session?.username) return;
 
    try {
      await api.deleteSupplier(supplierToDelete, session.username);
      setSuppliers(prev => prev.filter(s => s.supplierName !== supplierToDelete));
      toast({
        title: 'Success',
        description: 'Supplier deleted successfully'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete supplier'
      });
    } finally {
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };
 
  // Status badge with colors matching SuppliersListPage
  const getStatusBadge = (status?: string) => {
    if (!status) return <span className="text-gray-500">—</span>;
 
    let bgColor = 'bg-gray-100 text-gray-800';
    if (status === 'Approved' || status === 'Active') bgColor = 'bg-green-100 text-green-800';
    else if (status === 'Pending' || status === 'In Review') bgColor = 'bg-yellow-100 text-yellow-800';
    else if (status === 'Rejected') bgColor = 'bg-red-100 text-red-800';
 
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${bgColor}`}>
        {status}
      </span>
    );
  };
 
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading suppliers...</p>
        </div>
      </div>
    );
  }
 
  return (
    // 💡 Applied centering and max-width to the main content wrapper
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-6 max-w-7xl"> {/* ✅ max-w-7xl to limit width and mx-auto to center */}
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/vendor-home')}
            className="px-4 py-2 bg-[#1a365d] hover:bg-[#152c4a] text-white text-sm font-medium rounded-xl flex items-center transition-colors duration-200 shadow-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
 
        {/* Page Header */}
        <div className="
          !bg-gradient-to-r from-[#2b4d8a] via-[#3e6ab3] to-[#2b4d8a]
          px-6 py-2
          border-b-4 border-blue-500
          rounded-lg
          mb-6
          shadow-sm
        ">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Suppliers
          </h1>
        </div>
 
        {/* Filters Card */}
        <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200 p-3 mb-5">
          <div className="flex flex-wrap items-end gap-5">
            {/* Search by Name */}
            <div className="flex-1 min-w-[240px] group">
              <label className="block text-sm font-semibold text-[#1a365d] mb-2">Supplier Name</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1a365d]/30 focus:border-[#1a365d] bg-white"
                />
              </div>
            </div>
 
            {/* Filter by Country */}
            <div className="flex-1 min-w-[240px] group">
              <label className="block text-sm font-semibold text-[#1a365d] mb-2">Country</label>
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger className="w-full pl-4 py-3 text-sm border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1a365d]/30 focus:border-[#1a365d] bg-white [&>span]:text-gray-700">
                  <Filter className="mr-2 h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country!}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
 
            {/* Filter by Status */}
            <div className="flex-1 min-w-[240px] group">
              <label className="block text-sm font-semibold text-[#1a365d] mb-2">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full pl-4 py-3 text-sm border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1a365d]/30 focus:border-[#1a365d] bg-white [&>span]:text-gray-700">
                  <Filter className="mr-2 h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status!}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
 
        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredSuppliers.length} of {suppliers.length} suppliers
        </div>
 
        {/* Suppliers Table */}
        <div className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-md rounded-xl border border-gray-200 overflow-hidden">
          {filteredSuppliers.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="text-xl font-semibold text-gray-700">No suppliers found</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="!bg-gradient-to-r from-[#2b4d8a] via-[#3e6ab3] to-[#2b4d8a]">
                  <tr>
                    <th className="px-8 py-2.5 text-left text-sm font-bold text-white uppercase tracking-wider">Supplier Name</th>
                    <th className="px-8 py-2.5 text-left text-sm font-bold text-white uppercase tracking-wider">Country</th>
                    <th className="px-8 py-2.5 text-left text-sm font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-8 py-2.5 text-left text-sm font-bold text-white uppercase tracking-wider">Contact Email</th>
                    <th className="px-8 py-2.5 text-left text-sm font-bold text-white uppercase tracking-wider">Business Partner ID</th>
                    <th className="px-8 py-2.5 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSuppliers.map((supplier, idx) => (
                    <tr
                      key={idx}
                      className="group hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                      onClick={() => navigate(`/suppliers/${encodeURIComponent(supplier.supplierName)}`)}
                    >
                      <td className="px-8 py-6 font-semibold text-gray-900 group-hover:text-[#1a365d]">{supplier.supplierName}</td>
                      <td className="px-8 py-6 text-sm text-gray-700">{supplier.mainAddress?.country || '—'}</td>
                      <td className="px-8 py-6">{getStatusBadge(supplier.status)}</td>
                      <td className="px-8 py-6 text-sm text-blue-600 hover:text-blue-800">{supplier.primaryContact?.email || '—'}</td>
                      <td className="px-8 py-6 text-sm text-gray-600">{supplier.businessPartnerId || '—'}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/suppliers/${encodeURIComponent(supplier.supplierName)}`);
                            }}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(supplier.supplierName, e)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
 
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the supplier "{supplierToDelete}" and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
 