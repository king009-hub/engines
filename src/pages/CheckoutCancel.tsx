import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const CheckoutCancel = () => {
  return (
    <Layout title="Payment Cancelled">
      <div className="container mx-auto px-4 py-16 text-center">
        <XCircle className="h-20 w-20 mx-auto text-red-500 mb-6" />
        <h1 className="text-3xl font-black uppercase text-foreground mb-4">Payment Cancelled</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          Your payment process was cancelled. No charges were made to your account. Your items are still in your basket.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase">
            <Link to="/cart">Return to Basket</Link>
          </Button>
          <Button asChild variant="outline" className="font-bold uppercase">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutCancel;
