import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, DollarSign, Activity, ShieldAlert, BarChart3, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const StripeAnalytics = () => {
  const { toast } = useToast();
  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['admin-stripe-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalRevenue = payments?.reduce((sum, p) => p.status === 'paid' ? sum + Number(p.amount) : sum, 0) || 0;
  const fraudAlerts = payments?.filter(p => p.fraud_flag !== 'safe').length || 0;
  const conversionRate = payments?.length ? (payments.filter(p => p.status === 'paid').length / payments.length * 100).toFixed(1) : 0;
  const failedPayments = payments?.filter(p => p.status === 'failed').length || 0;

  const handleRefund = async (paymentId: string, piId: string) => {
    try {
      toast({ title: 'Processing refund...', description: 'Triggering Stripe refund from backend' });
      const { error } = await supabase.functions.invoke('stripe-refund', {
        body: { paymentId, paymentIntentId: piId, reason: 'requested_by_customer' }
      });
      if (error) throw error;
      toast({ title: 'Refund processed successfully' });
      refetch();
    } catch (err: any) {
      toast({ title: 'Refund failed', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) return <Layout><div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black uppercase mb-2">Stripe Intelligence & Analytics</h1>
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCcw className="h-4 w-4 mr-2" /> Refresh Data</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1"><TrendingUp className="h-3 w-3 mr-1 text-green-500" /> +12.5% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Fraud Alerts</CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{fraudAlerts}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">Potential security threats</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Conversion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">Payment completion success</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Failed Payments</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{failedPayments}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">Issues with processing</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Financial & Security Transaction Feed</CardTitle>
            <CardDescription>Verified payments with built-in fraud scoring.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="uppercase text-[10px] font-bold">Email</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold">Amount</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold">Status</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold">Fraud Score</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold">IP Address</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium text-xs">{payment.email}</TableCell>
                    <TableCell className="font-bold text-xs">${payment.amount} {payment.currency}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'paid' ? 'default' : payment.status === 'failed' ? 'destructive' : 'outline'} className="text-[10px] uppercase font-bold">
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.fraud_flag === 'safe' ? 'outline' : 'destructive'} className={`text-[10px] uppercase font-bold ${payment.fraud_flag === 'safe' ? 'text-green-500 border-green-500' : ''}`}>
                        {payment.fraud_flag}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{payment.ip_address || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'paid' && (
                        <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase" onClick={() => handleRefund(payment.id, payment.stripe_payment_intent_id)}>
                          Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StripeAnalytics;
