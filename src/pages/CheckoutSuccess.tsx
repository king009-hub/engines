import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

const CheckoutSuccess = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart when the user arrives on the success page
    clearCart();
  }, [clearCart]);

  return (
    <Layout title="Payment Successful">
      <div className="container mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="h-20 w-20 mx-auto text-green-500 mb-6" />
        <h1 className="text-3xl font-black uppercase text-foreground mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          Thank you for your order. We have received your payment and are processing your engine parts for shipment.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase">
            <Link to="/account">View My Orders</Link>
          </Button>
          <Button asChild variant="outline" className="font-bold uppercase">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
