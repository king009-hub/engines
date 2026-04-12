import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LayoutDashboard } from 'lucide-react';

const Account = () => {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState({ full_name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('full_name, phone, address').eq('id', user.id).single().then(({ data }) => {
        if (data) setProfile({ full_name: data.full_name || '', phone: data.phone || '', address: data.address || '' });
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update(profile).eq('id', user.id);
    setSaving(false);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Profile updated!' });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black uppercase text-foreground">My Account</h1>
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/admin"><LayoutDashboard className="h-4 w-4" /> Admin Panel</Link>
            </Button>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-4">Email: {user.email}</p>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} className="bg-background" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="bg-background" />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} className="bg-background" />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={handleSignOut}>Sign Out</Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Account;
