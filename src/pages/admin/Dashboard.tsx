import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, FileText, ShoppingCart, ArrowLeft, FolderTree, Tag, Settings, CreditCard, ShieldCheck, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const { data: userCount } = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: productCount } = useQuery({
    queryKey: ['admin-product-count'],
    queryFn: async () => {
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: orderCount } = useQuery({
    queryKey: ['admin-order-count'],
    queryFn: async () => {
      const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: quoteCount } = useQuery({
    queryKey: ['admin-quote-count'],
    queryFn: async () => {
      const { count } = await supabase.from('quotes').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: brandCount } = useQuery({
    queryKey: ['admin-brand-count'],
    queryFn: async () => {
      const { count } = await supabase.from('brands').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: recentClients } = useQuery({
    queryKey: ['admin-recent-clients'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5);
      return data || [];
    },
  });

  const { data: recentPayments } = useQuery({
    queryKey: ['admin-recent-payments'],
    queryFn: async () => {
      const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(5);
      return data || [];
    },
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black uppercase text-foreground">Admin Dashboard</h1>
          <Button asChild variant="outline" size="sm">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Store</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-tight">Products</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{productCount ?? '...'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-tight">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{orderCount ?? '...'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-tight">Quotes</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{quoteCount ?? '...'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-tight">Brands</CardTitle>
              <Tag className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{brandCount ?? '...'}</div>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary uppercase tracking-tight">Clients</CardTitle>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-primary">{userCount ?? '...'}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Button asChild size="lg" className="h-20 bg-primary font-bold uppercase text-primary-foreground hover:bg-primary/90">
            <Link to="/admin/products"><Package className="mr-2 h-5 w-5" /> Products</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase border-2">
            <Link to="/admin/orders"><ShoppingCart className="mr-2 h-5 w-5" /> Orders</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase border-2">
            <Link to="/admin/quotes"><FileText className="mr-2 h-5 w-5" /> Quotes</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase border-2 border-primary/20 bg-primary/5">
            <Link to="/admin/users"><ShieldCheck className="mr-2 h-5 w-5" /> Clients</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase border-2">
            <Link to="/admin/stripe-payments"><CreditCard className="mr-2 h-5 w-5" /> Payments</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase border-2">
            <Link to="/admin/categories"><FolderTree className="mr-2 h-5 w-5" /> Categories</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase border-2">
            <Link to="/admin/brands"><Tag className="mr-2 h-5 w-5" /> Brands</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase border-2 text-blue-500 border-blue-200">
            <Link to="/admin/stripe-analytics"><BarChart3 className="mr-2 h-5 w-5" /> Analytics</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase border-2 text-red-500 border-red-200">
            <Link to="/admin/stripe-config"><Settings className="mr-2 h-5 w-5" /> Config</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Recent Clients */}
          <Card className="border-2">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Recent Clients
                </CardTitle>
                <Button asChild variant="link" size="sm" className="font-bold uppercase text-xs">
                  <Link to="/admin/users">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentClients?.length ? recentClients.map((client) => (
                  <div key={client.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-xs text-primary uppercase">
                        {client.full_name?.charAt(0) || client.email?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground leading-none mb-1">{client.full_name || 'Guest User'}</p>
                        <p className="text-xs text-muted-foreground font-medium">{client.email}</p>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">
                      {new Date(client.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-muted-foreground text-sm font-bold uppercase">No recent clients</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments / Leads */}
          <Card className="border-2">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Recent Leads & Payments
                </CardTitle>
                <Button asChild variant="link" size="sm" className="font-bold uppercase text-xs">
                  <Link to="/admin/stripe-payments">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentPayments?.length ? recentPayments.map((payment) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-foreground leading-none">{payment.email}</p>
                        {payment.phone && <span className="text-[10px] text-muted-foreground font-mono">{payment.phone}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary uppercase">${payment.amount}</span>
                        <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                          payment.status === 'paid' ? 'bg-green-100 text-green-700' : 
                          payment.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {payment.status}
                        </span>
                        {payment.status === 'failed' && (
                          <span className="text-[10px] text-red-500 font-bold italic truncate max-w-[150px]">
                            {payment.failure_reason || 'Unknown error'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-muted-foreground text-sm font-bold uppercase">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
