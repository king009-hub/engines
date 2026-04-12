import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, FileText, ShoppingCart, ArrowLeft, FolderTree, Tag, Settings, CreditCard, ShieldCheck, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black uppercase text-foreground">Admin Dashboard</h1>
          <Button asChild variant="outline" size="sm">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Store</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{productCount ?? '...'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{orderCount ?? '...'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quotes</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{quoteCount ?? '...'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Brands</CardTitle>
              <Tag className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{brandCount ?? '...'}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Button asChild size="lg" className="h-20 bg-primary font-bold uppercase text-primary-foreground hover:bg-primary/90">
            <Link to="/admin/products"><Package className="mr-2 h-5 w-5" /> Manage Products</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase">
            <Link to="/admin/categories"><FolderTree className="mr-2 h-5 w-5" /> Manage Categories</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase">
            <Link to="/admin/brands"><Tag className="mr-2 h-5 w-5" /> Manage Brands</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase">
            <Link to="/admin/orders"><ShoppingCart className="mr-2 h-5 w-5" /> Manage Orders</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase">
            <Link to="/admin/quotes"><FileText className="mr-2 h-5 w-5" /> Manage Quotes</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase">
            <Link to="/admin/stripe-payments"><CreditCard className="mr-2 h-5 w-5" /> Stripe Payments</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase text-blue-500 border-blue-200">
            <Link to="/admin/stripe-analytics"><BarChart3 className="mr-2 h-5 w-5" /> Analytics & Fraud</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-20 font-bold uppercase text-red-500 border-red-200">
            <Link to="/admin/stripe-config"><Settings className="mr-2 h-5 w-5" /> Stripe Configuration</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
