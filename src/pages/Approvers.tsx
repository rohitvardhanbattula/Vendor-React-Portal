/*import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionStorage } from '@/lib/session';
import { api } from '@/lib/api';
import { Approver } from '@/types/vendor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
 
export default function Approvers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [selectedApprovers, setSelectedApprovers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newApprover, setNewApprover] = useState<Approver>({
    name: '',
    email: '',
    country: '',
    level: ''
  });
 
  useEffect(() => {
    const session = sessionStorage.get();
    if (!session?.username) {
      navigate('/vendor-login');
      return;
    }
 
    loadApprovers();
  }, [navigate]);
 
  const loadApprovers = () => {
    setLoading(true);
    api.getApprovers()
      .then(setApprovers)
      .finally(() => setLoading(false));
  };
 
  const handleSelectApprover = (approver: Approver, checked: boolean) => {
    const key = `${approver.name}-${approver.country}-${approver.level}`;
    const newSelected = new Set(selectedApprovers);
    if (checked) {
      newSelected.add(key);
    } else {
      newSelected.delete(key);
    }
    setSelectedApprovers(newSelected);
  };
 
  const handleDeleteSelected = async () => {
    if (selectedApprovers.size === 0) return;
 
    const deletePromises = Array.from(selectedApprovers).map(key => {
      const [name, country, level] = key.split('-');
      return api.deleteApprover(name, country, level);
    });
 
    try {
      await Promise.all(deletePromises);
      toast({
        title: 'Success',
        description: `Deleted ${selectedApprovers.size} approver(s)`
      });
      setSelectedApprovers(new Set());
      loadApprovers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete approvers'
      });
    }
  };
 
  const handleAddApprover = async () => {
    if (!newApprover.name || !newApprover.email || !newApprover.country || !newApprover.level) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all fields'
      });
      return;
    }
 
    try {
      await api.addApprover(newApprover);
      toast({
        title: 'Success',
        description: 'Approver added successfully'
      });
      setShowAddDialog(false);
      setNewApprover({ name: '', email: '', country: '', level: '' });
      loadApprovers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add approver'
      });
    }
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/vendor-home')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Approvers Management</h1>
          <div className="w-24" />
        </div>
      </header>
 
      <main className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Manage Approvers</CardTitle>
                <CardDescription>Add, view, and remove approval workflow approvers</CardDescription>
              </div>
              <div className="flex gap-2">
                {selectedApprovers.size > 0 && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete ({selectedApprovers.size})
                  </Button>
                )}
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Approver
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Approver</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new approver
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newApprover.name}
                          onChange={(e) => setNewApprover({ ...newApprover, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newApprover.email}
                          onChange={(e) => setNewApprover({ ...newApprover, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={newApprover.country}
                          onChange={(e) => setNewApprover({ ...newApprover, country: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="level">Level</Label>
                        <Input
                          id="level"
                          value={newApprover.level}
                          onChange={(e) => setNewApprover({ ...newApprover, level: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddApprover}>
                        Add Approver
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedApprovers.size === approvers.length && approvers.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedApprovers(new Set(approvers.map(a =>
                                `${a.name}-${a.country}-${a.level}`
                              )));
                            } else {
                              setSelectedApprovers(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No approvers found. Add your first approver to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      approvers.map((approver, idx) => {
                        const key = `${approver.name}-${approver.country}-${approver.level}`;
                        return (
                          <TableRow key={idx}>
                            <TableCell>
                              <Checkbox
                                checked={selectedApprovers.has(key)}
                                onCheckedChange={(checked) =>
                                  handleSelectApprover(approver, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">{approver.name}</TableCell>
                            <TableCell>{approver.email}</TableCell>
                            <TableCell>{approver.country}</TableCell>
                            <TableCell>Level {approver.level}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}*/
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionStorage } from '@/lib/session';
import { api } from '@/lib/api';
import { Approver } from '@/types/vendor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, Loader2, Mail } from 'lucide-react'; // ✅ Added Mail icon
import { useToast } from '@/hooks/use-toast';
 
export default function Approvers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [selectedApprovers, setSelectedApprovers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newApprover, setNewApprover] = useState<Approver>({
    name: '',
    email: '',
    country: '',
    level: ''
  });
  const [searchTerm, setSearchTerm] = useState(''); // ✅ New search state
 
  useEffect(() => {
    const session = sessionStorage.get();
    if (!session?.username) {
      navigate('/vendor-login');
      return;
    }
    loadApprovers();
  }, [navigate]);
 
  const loadApprovers = () => {
    setLoading(true);
    api.getApprovers()
      .then(setApprovers)
      .finally(() => setLoading(false));
  };
 
  // ✅ Filter approvers based on search term
  const filteredApprovers = useMemo(() => {
    if (!searchTerm) return approvers;
    const term = searchTerm.toLowerCase();
    return approvers.filter(approver =>
      approver.name.toLowerCase().includes(term) ||
      approver.email.toLowerCase().includes(term) ||
      approver.country.toLowerCase().includes(term) ||
      approver.level.toLowerCase().includes(term)
    );
  }, [approvers, searchTerm]);
 
  const handleSelectApprover = (approver: Approver, checked: boolean) => {
    const key = `${approver.name}-${approver.country}-${approver.level}`;
    const newSelected = new Set(selectedApprovers);
    if (checked) {
      newSelected.add(key);
    } else {
      newSelected.delete(key);
    }
    setSelectedApprovers(newSelected);
  };
 
  const handleDeleteSelected = async () => {
    if (selectedApprovers.size === 0) return;
 
    const deletePromises = Array.from(selectedApprovers).map(key => {
      const [name, country, level] = key.split('-');
      return api.deleteApprover(name, country, level);
    });
 
    try {
      await Promise.all(deletePromises);
      toast({
        title: 'Success',
        description: `Deleted ${selectedApprovers.size} approver(s)`
      });
      setSelectedApprovers(new Set());
      loadApprovers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete approvers'
      });
    }
  };
 
  const handleAddApprover = async () => {
    if (!newApprover.name || !newApprover.email || !newApprover.country || !newApprover.level) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all fields'
      });
      return;
    }
 
    try {
      await api.addApprover(newApprover);
      toast({
        title: 'Success',
        description: 'Approver added successfully'
      });
      setShowAddDialog(false);
      setNewApprover({ name: '', email: '', country: '', level: '' });
      loadApprovers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add approver'
      });
    }
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="!bg-gradient-to-r from-[#2b4d8a] via-[#3e6ab3] to-[#2b4d8a] px-4 py-2 border-b-4 border-blue-500 rounded-lg mb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/vendor-home')}
                className="text-white hover:text-blue-200 transition-colors"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Approver List
              </h1>
            </div>
 
            <div className="flex items-center gap-2">
              {selectedApprovers.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-shadow duration-200 shadow-md hover:shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedApprovers.size})
                </button>
              )}
 
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1.5 bg-[#1a365d] hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-shadow duration-200 shadow-md hover:shadow-lg">
                    <Plus className="h-4 w-4" />
                    Add Approver
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md rounded-2xl border border-gray-200 p-6">
                  <DialogHeader>
                    <DialogTitle>Add New Approver</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new approver
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newApprover.name}
                        onChange={(e) => setNewApprover({ ...newApprover, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newApprover.email}
                        onChange={(e) => setNewApprover({ ...newApprover, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={newApprover.country}
                        onChange={(e) => setNewApprover({ ...newApprover, country: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Level</Label>
                      <Input
                        id="level"
                        value={newApprover.level}
                        onChange={(e) => setNewApprover({ ...newApprover, level: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <button
                      onClick={() => setShowAddDialog(false)}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl font-semibold transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddApprover}
                      className="bg-[#1a365d] hover:bg-[#153052] text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200"
                    >
                      Add Approver
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
 
        {/* ✅ Search Bar */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search approvers by name, email, country, or level..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]"
            />
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
 
        {/* Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#e0e7ff]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#1a365d] uppercase tracking-wider w-12">
                      <Checkbox
                        checked={filteredApprovers.length > 0 && selectedApprovers.size === filteredApprovers.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedApprovers(new Set(filteredApprovers.map(a =>
                              `${a.name}-${a.country}-${a.level}`
                            )));
                          } else {
                            setSelectedApprovers(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#1a365d] uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#1a365d] uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#1a365d] uppercase tracking-wider">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[#1a365d] uppercase tracking-wider">Level</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredApprovers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        {approvers.length === 0
                          ? 'No approvers found. Add your first approver to get started.'
                          : 'No approvers match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredApprovers.map((approver, idx) => {
                      const key = `${approver.name}-${approver.country}-${approver.level}`;
                      return (
                        <tr key={idx} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Checkbox
                              checked={selectedApprovers.has(key)}
                              onCheckedChange={(checked) =>
                                handleSelectApprover(approver, checked as boolean)
                              }
                            />
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{approver.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              {approver.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{approver.country}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">Level {approver.level}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}