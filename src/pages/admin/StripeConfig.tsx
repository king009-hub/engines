import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, CreditCard, ShieldCheck, Globe, Activity, ListPlus, Database } from 'lucide-react';

const StripeConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for components that don't play well with FormData
  const [stripeMode, setStripeMode] = useState<string>('test');
  const [currency, setCurrency] = useState<string>('USD');
  const [subscriptionEnabled, setSubscriptionEnabled] = useState<boolean>(false);

  // Fetch settings with robust error handling
  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['stripe-config'],
    queryFn: async () => {
      // Try fetching existing settings
      const { data, error } = await supabase.from('app_settings').select('*').maybeSingle();
      
      // If error occurs that's not "not found", throw it
      if (error) {
        console.error('[StripeConfig] Error fetching settings:', error);
        throw error;
      }
      
      return data;
    },
  });

  // Sync local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setStripeMode(settings.stripe_mode || 'test');
      setCurrency(settings.currency || 'USD');
      setSubscriptionEnabled(settings.subscription_enabled || false);
    }
  }, [settings]);

  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pricing_plans').select('*').order('created_at');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: logs } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  // Use upsert to handle both creation and update
  const settingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      // If we already have an ID, use it. 
      // If not, try to find the first existing row's ID to avoid creating duplicates.
      let targetId = settings?.id;
      
      if (!targetId) {
        const { data: existing } = await supabase.from('app_settings').select('id').limit(1).maybeSingle();
        if (existing) targetId = existing.id;
      }

      const payload = {
        ...newSettings,
        ...(targetId ? { id: targetId } : {})
      };

      const { error } = await supabase.from('app_settings').upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-config'] });
      toast({ title: 'Configuration updated successfully' });
    },
    onError: (err: any) => {
      console.error('[StripeConfig] Save error:', err);
      toast({ 
        title: 'Update failed', 
        description: err.message || 'Check your database permissions and connection.', 
        variant: 'destructive' 
      });
    },
  });

  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      stripe_public_key: formData.get('stripe_public_key'),
      stripe_secret_key: formData.get('stripe_secret_key'),
      stripe_webhook_secret: formData.get('stripe_webhook_secret'),
      currency: currency,
      stripe_mode: stripeMode,
      subscription_enabled: subscriptionEnabled,
    };
    
    await settingsMutation.mutateAsync(data);
    setIsSaving(false);
  };

  if (isSettingsLoading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-muted-foreground animate-pulse font-bold uppercase tracking-tighter">Initializing configuration...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 p-3 rounded-xl">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Stripe Control Center</h1>
            <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">Global Financial Configuration</p>
          </div>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="bg-muted p-1 grid grid-cols-3 w-full sm:w-auto h-12">
            <TabsTrigger value="config" className="data-[state=active]:bg-background font-bold uppercase text-xs">API & Security</TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-background font-bold uppercase text-xs">Pricing Tiers</TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-background font-bold uppercase text-xs">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <Card className="border-2 border-border/50 shadow-sm overflow-hidden">
                <div className="h-1 bg-primary" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-black uppercase"><Database className="h-5 w-5 text-primary" /> API Credentials</CardTitle>
                  <CardDescription className="font-medium">These keys allow your website to communicate with Stripe servers securely.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-3">
                    <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Environment Mode</Label>
                    <Select value={stripeMode} onValueChange={setStripeMode}>
                      <SelectTrigger className="h-12 border-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test" className="font-bold">🧪 Test Mode (Development & Testing)</SelectItem>
                        <SelectItem value="live" className="font-bold text-green-600">⚡ Live Mode (Real Transactions)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="grid gap-3">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-12 border-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD" className="font-bold">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR" className="font-bold">EUR - Euro</SelectItem>
                          <SelectItem value="GBP" className="font-bold">GBP - British Pound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-3">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Publishable Key</Label>
                      <Input name="stripe_public_key" className="h-12 border-2" defaultValue={settings?.stripe_public_key} placeholder="pk_test_..." />
                    </div>
                    <div className="grid gap-3">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Secret Key</Label>
                      <Input name="stripe_secret_key" className="h-12 border-2" type="password" defaultValue={settings?.stripe_secret_key} placeholder="sk_test_..." />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/50 shadow-sm overflow-hidden">
                <div className="h-1 bg-blue-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-black uppercase"><ShieldCheck className="h-5 w-5 text-blue-500" /> Webhook Security</CardTitle>
                  <CardDescription className="font-medium">Secure your backend with the Stripe Webhook Signing Secret.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-3">
                    <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Signing Secret</Label>
                    <Input name="stripe_webhook_secret" className="h-12 border-2" type="password" defaultValue={settings?.stripe_webhook_secret} placeholder="whsec_..." />
                  </div>
                  <div className="flex items-center justify-between p-5 bg-muted/30 border-2 border-dashed rounded-xl">
                    <div className="space-y-1">
                      <Label className="uppercase font-black text-xs">Enable Subscriptions</Label>
                      <p className="text-xs text-muted-foreground font-medium">Activate recurring monthly/yearly billing features</p>
                    </div>
                    <Switch checked={subscriptionEnabled} onCheckedChange={setSubscriptionEnabled} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button type="submit" disabled={isSaving} className="h-14 px-10 font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-3 h-5 w-5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-3 h-5 w-5" />
                      Sync Configuration
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="plans">
            <Card className="border-2 border-border/50 shadow-sm overflow-hidden">
              <div className="h-1 bg-purple-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <div>
                  <CardTitle className="text-lg font-black uppercase">Pricing Plans</CardTitle>
                  <CardDescription className="font-medium">Dynamic subscription tiers linked to Stripe Price IDs.</CardDescription>
                </div>
                <Button size="sm" className="font-bold uppercase h-10 px-4"><ListPlus className="h-4 w-4 mr-2" /> New Tier</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isPlansLoading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
                  ) : !plans?.length ? (
                    <div className="text-center py-12 bg-muted/20 border-2 border-dashed rounded-2xl">
                      <p className="text-muted-foreground font-black uppercase text-xs tracking-widest">No pricing tiers defined yet.</p>
                    </div>
                  ) : (
                    plans.map((plan: any) => (
                      <div key={plan.id} className="flex items-center justify-between p-5 border-2 rounded-2xl hover:border-primary/50 hover:bg-muted/30 transition-all group">
                        <div className="space-y-1">
                          <p className="font-black uppercase tracking-tighter text-lg">{plan.name}</p>
                          <p className="text-xs font-mono text-muted-foreground">{plan.stripe_price_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-2xl text-primary tracking-tighter">${plan.amount}<span className="text-xs text-muted-foreground">/{plan.interval}</span></p>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${plan.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {plan.active ? 'Active' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card className="border-2 border-border/50 shadow-sm overflow-hidden">
              <div className="h-1 bg-orange-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-black uppercase"><Activity className="h-5 w-5 text-orange-500" /> Financial Audit Log</CardTitle>
                <CardDescription className="font-medium">Security record of all Stripe configuration changes.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logs?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground font-bold uppercase text-xs">No activity recorded yet.</p>
                  ) : (
                    logs?.map((log: any) => (
                      <div key={log.id} className="text-sm p-4 border rounded-xl bg-muted/10 flex flex-col sm:flex-row justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg font-black text-[10px] uppercase ${log.action === 'INSERT' ? 'bg-green-100 text-green-700' : log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {log.action}
                          </div>
                          <div>
                            <span className="font-black uppercase tracking-tighter">{log.entity_type}</span>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{log.ip_address || 'Internal System'}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground bg-muted p-2 rounded-lg self-end sm:self-center">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StripeConfig;
