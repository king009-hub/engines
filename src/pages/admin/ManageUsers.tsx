import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ManageUsers = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/');
  }, [user, isAdmin, loading, navigate]);

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });

  if (loading || !isAdmin) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-black uppercase text-foreground">Manage Clients</h1>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {profilesLoading ? (
            <div className="flex justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : profiles?.length ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase text-xs font-bold">
                    <tr>
                      <th className="px-6 py-3">Client</th>
                      <th className="px-6 py-3">Contact</th>
                      <th className="px-6 py-3">Address</th>
                      <th className="px-6 py-3">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {profiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-bold text-foreground">{profile.full_name || 'No Name'}</div>
                              <div className="text-xs text-muted-foreground font-mono">{profile.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-foreground">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{profile.email || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{profile.phone || '—'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="flex items-start gap-2 text-muted-foreground italic">
                            <MapPin className="h-3 w-3 mt-1 shrink-0" />
                            <span className="line-clamp-2">{profile.address || 'No address provided'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-muted rounded-xl bg-muted/20">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-bold uppercase tracking-wider">No clients found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ManageUsers;
