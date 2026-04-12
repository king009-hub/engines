import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { toast } from 'sonner';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      toast.success("You're back online!", {
        icon: <Wifi className="w-4 h-4" />,
        duration: 3000,
      });
      
      // Hide the "back online" message after a few seconds
      setTimeout(() => setShowBackOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are currently offline. Some features may not be available.", {
        icon: <WifiOff className="w-4 h-4" />,
        duration: Infinity, // Keep it open until they dismiss or come back online
        id: 'offline-toast',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showBackOnline) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out flex justify-center items-center py-2 px-4 text-sm font-medium ${
        isOnline 
          ? 'bg-green-500 text-white translate-y-0 opacity-100' 
          : 'bg-destructive text-destructive-foreground translate-y-0 opacity-100'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 mr-2" />
          Internet connection restored
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 mr-2 animate-pulse" />
          You are operating offline. Content may not be up to date.
        </>
      )}
    </div>
  );
};

export default NetworkStatus;
