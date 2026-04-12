import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, XCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CheckoutVerify = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('failed');
        return;
      }

      // We poll the database to see if the webhook has updated the status
      // This is more secure than trusting the URL params
      let attempts = 0;
      const maxAttempts = 10;
      
      const checkStatus = async () => {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();

        if (data?.status === 'paid') {
          setPaymentData(data);
          setStatus('success');
          return true;
        }
        
        if (data?.status === 'failed') {
          setStatus('failed');
          return true;
        }

        return false;
      };

      const interval = setInterval(async () => {
        attempts++;
        const isDone = await checkStatus();
        if (isDone || attempts >= maxAttempts) {
          clearInterval(interval);
          if (!isDone) setStatus('failed');
        }
      }, 2000);

      return () => clearInterval(interval);
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <Layout title="Verifying Payment">
      <div className="container mx-auto px-4 py-20 text-center">
        {status === 'verifying' && (
          <div className="space-y-6">
            <div className="relative inline-block">
              <Loader2 className="h-20 w-20 mx-auto text-primary animate-spin" />
              <ShieldCheck className="h-8 w-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h1 className="text-3xl font-black uppercase italic">Verifying Secure Payment...</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              We are communicating with Stripe to verify your transaction. This process is encrypted and secure.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="h-20 w-20 mx-auto text-green-500" />
            <h1 className="text-3xl font-black uppercase italic">Payment Confirmed!</h1>
            <div className="bg-muted p-6 rounded-xl max-w-md mx-auto border border-border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono font-bold">{paymentData?.transaction_id?.slice(0, 15)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-bold text-primary">${paymentData?.amount} {paymentData?.currency}</span>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button asChild className="bg-primary font-bold uppercase"><Link to="/account">My Orders</Link></Button>
              <Button asChild variant="outline" className="font-bold uppercase"><Link to="/">Storefront</Link></Button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <XCircle className="h-20 w-20 mx-auto text-red-500" />
            <h1 className="text-3xl font-black uppercase italic">Verification Failed</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't verify your payment automatically. This might be due to a delay in Stripe's systems.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild className="bg-primary font-bold uppercase"><Link to="/contact">Contact Support</Link></Button>
              <Button asChild variant="outline" className="font-bold uppercase"><Link to="/cart">Return to Basket</Link></Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CheckoutVerify;
