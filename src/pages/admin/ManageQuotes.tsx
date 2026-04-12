import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ManageQuotes = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/');
  }, [user, isAdmin, loading, navigate]);

  const { data: quotes } = useQuery({
    queryKey: ['admin-quotes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('quotes').select('id, created_at, name, email, phone, message, status').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  if (loading || !isAdmin) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-black uppercase text-foreground">Manage Quotes</h1>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Message</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quotes?.length ? quotes.map((q: any) => (
                  <tr key={q.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-foreground">{q.name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{q.email}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{q.message || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded capitalize">{q.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No quotes yet</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile view for quotes */}
          <div className="sm:hidden divide-y divide-border">
            {quotes?.length ? quotes.map((q: any) => (
              <div key={q.id} className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground truncate">{q.name || 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{q.email}</div>
                <div className="text-sm text-foreground/80 line-clamp-2 mt-1">{q.message || 'No message provided.'}</div>
                <div className="flex justify-end mt-1">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">{q.status}</span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-muted-foreground text-sm">No quotes yet</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageQuotes;
