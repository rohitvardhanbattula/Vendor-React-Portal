import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionStorage } from '@/lib/session';
import { api } from '@/lib/api';
import { SupplierWizard } from '@/components/vendor/SupplierWizard';
import { Button } from '@/components/ui/button';
import { MenuButton } from '@/components/vendor/MenuButton';
import { Users, Building2, List } from 'lucide-react';

export default function VendorHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const session = sessionStorage.get();
    if (!session?.username) {
      navigate('/vendor-login');
      return;
    }

    api.getUserInfo(session.username).then(setUser);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Supplier Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/approvers')}
            >
              <Users className="mr-2 h-4 w-4" />
              Approvers
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/suppliers')}
            >
              <List className="mr-2 h-4 w-4" />
              All Suppliers
            </Button>
            <MenuButton user={user} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <SupplierWizard />
      </main>
    </div>
  );
}
