import { useEffect, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/common/ScrollToTop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import NetworkStatus from "@/components/common/NetworkStatus";

// Lazy load pages for better initial bundle size
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const About = lazy(() => import("./pages/About"));
const Payment = lazy(() => import("./pages/Payment"));
const Account = lazy(() => import("./pages/Account"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const CheckoutVerify = lazy(() => import("./pages/CheckoutVerify"));
const CheckoutCancel = lazy(() => import("./pages/CheckoutCancel"));
const Checkout = lazy(() => import("./pages/Checkout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const StripeConfig = lazy(() => import("./pages/admin/StripeConfig"));
const StripePayments = lazy(() => import("./pages/admin/StripePayments"));
const StripeAnalytics = lazy(() => import("./pages/admin/StripeAnalytics"));
const ManageProducts = lazy(() => import("./pages/admin/ManageProducts"));
const ManageCategories = lazy(() => import("./pages/admin/ManageCategories"));
const ManageBrands = lazy(() => import("./pages/admin/ManageBrands"));
const ManageOrders = lazy(() => import("./pages/admin/ManageOrders"));
const ManageQuotes = lazy(() => import("./pages/admin/ManageQuotes"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Simple loading fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours (extreme caching for catalog)
      gcTime: 1000 * 60 * 60 * 48,    // 48 hours
      refetchOnWindowFocus: false,   // Disable refetch on focus for instant feel
      refetchOnMount: false,         // Use cached data immediately on mount
      refetchOnReconnect: true,
      retry: 1,                      // Faster failover
    },
  },
});

const App = () => {
  console.log('[App] Rendering main application');
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

const AppContent = () => {
  return (
    <AuthProvider>
      <RealtimeWrapper />
    </AuthProvider>
  );
};

const RealtimeWrapper = () => {
  const { loading: authLoading } = useAuth();
  useRealtimeSync();
  
  // Pre-fetch critical metadata once the app starts
  useEffect(() => {
    console.log('[App] Pre-fetching metadata...');
    // Optimized: pre-fetching everything we need for the filters
    queryClient.prefetchQuery({ queryKey: ['categories'] });
    queryClient.prefetchQuery({ queryKey: ['brands'] });
    queryClient.prefetchQuery({ 
      queryKey: ['products', { per_page: 16, sort: 'newest' }] 
    }); // Pre-fetch the homepage list specifically
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NetworkStatus />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/about" element={<About />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/verify" element={<CheckoutVerify />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />
              <Route 
                path="/account" 
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <ProtectedRoute adminOnly>
                    <ManageProducts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/categories" 
                element={
                  <ProtectedRoute adminOnly>
                    <ManageCategories />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/brands" 
                element={
                  <ProtectedRoute adminOnly>
                    <ManageBrands />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/orders" 
                element={
                  <ProtectedRoute adminOnly>
                    <ManageOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/quotes" 
                element={
                  <ProtectedRoute adminOnly>
                    <ManageQuotes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/stripe-config" 
                element={
                  <ProtectedRoute adminOnly>
                    <StripeConfig />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/stripe-payments" 
                element={
                  <ProtectedRoute adminOnly>
                    <StripePayments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/stripe-analytics" 
                element={
                  <ProtectedRoute adminOnly>
                    <StripeAnalytics />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
