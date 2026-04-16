import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, CreditCard, Calendar, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StripePayments = () => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
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
  const totalPaidCount = payments?.filter(p => p.status === 'paid').length || 0;
  const totalFailedCount = payments?.filter(p => p.status === 'failed').length || 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black uppercase text-foreground">Stripe Payments</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="font-bold uppercase">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button variant="outline" size="sm" className="font-bold uppercase">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">${totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Successful Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{totalPaidCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Failed Payments</CardTitle>
              <Calendar className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{totalFailedCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>A detailed list of all payment attempts through Stripe.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="uppercase text-xs font-bold">Email / Phone</TableHead>
                    <TableHead className="uppercase text-xs font-bold">Amount</TableHead>
                    <TableHead className="uppercase text-xs font-bold">Status</TableHead>
                    <TableHead className="uppercase text-xs font-bold">Failure Reason</TableHead>
                    <TableHead className="uppercase text-xs font-bold text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!payments?.length ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground leading-none mb-1">{payment.email}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{payment.phone || 'No phone'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-foreground">${payment.amount}</span>
                          <span className="text-[10px] text-muted-foreground ml-1 uppercase">{payment.currency}</span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={payment.status === 'paid' ? 'default' : payment.status === 'pending' ? 'outline' : 'destructive'}
                            className="uppercase text-[10px] font-bold"
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          {payment.status === 'failed' ? (
                            <span className="text-xs text-red-500 font-medium italic line-clamp-2">
                              {payment.failure_reason || 'Unknown error'}
                            </span>
                          ) : payment.status === 'pending' ? (
                            <span className="text-[10px] text-muted-foreground uppercase tracking-tight">Attempt in progress</span>
                          ) : (
                            <span className="text-[10px] text-green-600 uppercase font-bold tracking-tight">Successful</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StripePayments;
