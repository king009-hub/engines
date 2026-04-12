import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('quotes').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      status: 'pending',
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Quote submitted!', description: 'We will get back to you shortly.' });
      setForm({ name: '', email: '', phone: '', message: '' });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-black uppercase text-foreground text-center mb-8">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Form */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-bold uppercase text-lg mb-4 text-foreground">Request a Quote</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="bg-background" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="bg-background" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-background" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} required className="bg-background" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase">
                {loading ? 'Sending...' : 'Submit Quote Request'}
              </Button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-bold uppercase text-lg mb-4 text-foreground">Get In Touch</h2>
              <p className="text-muted-foreground">Need a specific engine? Contact us with your vehicle details and we'll source it for you.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Address</h3>
                  <p className="text-sm text-muted-foreground">30 E 7th St, St Paul, MN 55101</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">Major Cities: Minneapolis, St. Paul, Rochester</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Phone / WhatsApp</h3>
                  <a 
                    href="https://wa.me/16122931250" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    +1 612 293 1250
                    <span className="text-[10px] bg-[#25D366] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                      Click to chat
                    </span>
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Email</h3>
                  <p className="text-sm text-muted-foreground">info@enginemarkets.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
