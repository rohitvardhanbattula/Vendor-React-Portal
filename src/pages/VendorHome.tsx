/*import { useEffect, useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <header className="border-b bg-card/80 backdrop-blur-lg supports-[backdrop-filter]:bg-card/80 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center shadow-primary">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Supplier Registration
              </h1>
              <p className="text-xs text-muted-foreground">Welcome, {user.firstName} {user.lastName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/approvers')}
              className="border-primary/20 hover:border-primary/40"
            >
              <Users className="mr-2 h-4 w-4" />
              Approvers
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/suppliers')}
              className="border-accent/20 hover:border-accent/40"
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
}*/
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionStorage } from '@/lib/session';
import { api } from '@/lib/api';
import { SupplierWizard } from '@/components/vendor/SupplierWizard';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Styled Header (matching Header.jsx) */}
      <header className="sticky top-0 z-50 bg-gray-100 shadow-md border-b-4 border-blue-500">
        <div className="px-5 md:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center shadow-primary">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#1a365d] tracking-tight">
                  Supplier Registration
                </h1>
                <p className="text-xs text-muted-foreground">Welcome, {user.firstName} {user.lastName}</p>
              </div>
            </div>

            {/* Action Buttons (styled like Header.jsx) */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/approvers')}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium 
                  text-white bg-[#1a365d] hover:bg-[#162a4b] 
                  rounded-lg shadow-md border-b-4 border-blue-500 transition-all duration-200
                  focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:shadow-[0_0_0_3px_rgba(26,54,93,0.2)]"
              >
                <Users className="w-4 h-4" />
                Approvers
              </button>

              <button
                onClick={() => navigate('/suppliers')}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium 
                  text-white bg-[#1a365d] hover:bg-[#162a4b] 
                  rounded-lg shadow-md border-b-4 border-blue-500 transition-all duration-200
                  focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:shadow-[0_0_0_3px_rgba(26,54,93,0.2)]"
              >
                <List className="w-4 h-4" />
                All Suppliers
              </button>

              {/* Keep MenuButton for logout/profile, but you could replace with plain Logout if preferred */}
              <MenuButton user={user} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <SupplierWizard />
      </main>
    </div>
  );
}
