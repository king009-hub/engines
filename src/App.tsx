import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/common/ScrollToTop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import NetworkStatus from "@/components/common/NetworkStatus";

import TopBar from "./components/layout/TopBar";
import MainHeader from "./components/layout/MainHeader";
import NavBar from "./components/layout/NavBar";
import Footer from "./components/layout/Footer";
import { MessageCircle } from "lucide-react";

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
const ShippingInfo = lazy(() => import("./pages/ShippingInfo"));
const Returns = lazy(() => import("./pages/Returns"));
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
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Simple loading fallback
const PageLoader = () => (
  <div className="flex h-[400px] w-full items-center justify-center bg-transparent">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading engine parts...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours (extreme caching for catalog)
      gcTime: 1000 * 60 * 60 * 48,    // 48 hours
      refetchOnWindowFocus: false,   // Disable refetch on focus for instant feel
      refetchOnMount: true,          // Recover cleanly on first mount if a cached query is incomplete
      refetchOnReconnect: true,
      retry: 3,                      // More retries for unstable connections
      retryDelay: (attempt) => Math.min(attempt * 1000, 3000), // Faster retries
      networkMode: 'offlineFirst',   // Allow using cache even if network is unstable
    },
  },
});

const App = () => {
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
  useRealtimeSync();

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NetworkStatus />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-background relative">
          <TopBar />
          <MainHeader />
          <NavBar />
          
          <main className="flex-1">
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
                  <Route path="/shipping-info" element={<ShippingInfo />} />
                  <Route path="/returns" element={<Returns />} />
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
                    path="/admin/users" 
                    element={
                      <ProtectedRoute adminOnly>
                        <ManageUsers />
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
          </main>

          <Footer />

          {/* Floating WhatsApp Button */}
          <a 
            href="https://wa.me/16122931250" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 z-50 bg-[#25D366] hover:bg-[#1fb45a] text-white px-4 py-3 rounded-full shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            aria-label="Contact us on WhatsApp"
          >
            <MessageCircle className="h-5 w-5 fill-current shrink-0" />
            <span className="font-bold whitespace-nowrap text-sm">
              Chat to Order
            </span>
          </a>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
