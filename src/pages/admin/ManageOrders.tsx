import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ManageOrders = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/');
  }, [user, isAdmin, loading, navigate]);

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('id, created_at, total, status, user_id, email, phone, shipping_address').order('created_at', { ascending: false });
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
          <h1 className="text-2xl font-black uppercase text-foreground">Manage Orders</h1>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Order ID</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Contact</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders?.length ? orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{o.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground truncate max-w-[150px]">{o.email || 'Guest'}</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{o.shipping_address || 'No address'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{o.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded capitalize">{o.status}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">${Math.round(Number(o.total))}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile view for orders */}
          <div className="sm:hidden divide-y divide-border">
            {orders?.length ? orders.map((o: any) => (
              <div key={o.id} className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-muted-foreground">ID: {o.id.slice(0, 8)}...</span>
                  <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">${Math.round(Number(o.total))}</span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">{o.status}</span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-muted-foreground text-sm">No orders yet</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageOrders;
