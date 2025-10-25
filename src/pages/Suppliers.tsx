import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionStorage } from '@/lib/session';
import { api } from '@/lib/api';
import { SupplierData } from '@/types/vendor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Filter, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Suppliers() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const session = sessionStorage.get();
    if (!session?.username) {
      navigate('/vendor-login');
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

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variants: Record<string, any> = {
      'Pending': 'secondary',
      'Approved': 'default',
      'Rejected': 'destructive',
      'In Review': 'outline'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/vendor-home')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Suppliers List</h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Manage Suppliers</CardTitle>
            <CardDescription>View and filter all registered suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country!}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status!}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredSuppliers.length} of {suppliers.length} suppliers
            </div>

            {/* Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Business Partner ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No suppliers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((supplier, idx) => (
                      <TableRow 
                        key={idx}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/suppliers/${encodeURIComponent(supplier.supplierName)}`)}
                      >
                        <TableCell className="font-medium">{supplier.supplierName}</TableCell>
                        <TableCell>{supplier.mainAddress?.country || '-'}</TableCell>
                        <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                        <TableCell>{supplier.primaryContact?.email || '-'}</TableCell>
                        <TableCell>{supplier.businessPartnerId || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/suppliers/${encodeURIComponent(supplier.supplierName)}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
