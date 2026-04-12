import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/admin/ImageUpload';
import type { Brand } from '@/lib/types';

interface BrandForm {
  name: string;
  slug: string;
  image_url: string;
  sort_order: string;
}

const emptyForm: BrandForm = {
  name: '',
  slug: '',
  image_url: '',
  sort_order: '0',
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ManageBrands = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: brands } = useBrands();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<BrandForm>(emptyForm);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/');
  }, [authLoading, isAdmin, navigate, user]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setForm({
      name: brand.name,
      slug: brand.slug,
      image_url: brand.image_url || '',
      sort_order: String(brand.sort_order ?? 0),
    });
    setDialogOpen(true);
  };

  const resetAfterSave = async () => {
    await queryClient.refetchQueries({ queryKey: ['brands'] });
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSave = async () => {
    const trimmedName = form.name.trim();
    const finalSlug = slugify(form.slug || trimmedName);

    if (!trimmedName || !finalSlug) {
      toast({ title: 'Missing fields', description: 'Name and slug are required.', variant: 'destructive' });
      return;
    }

    const payload = {
      name: trimmedName,
      slug: finalSlug,
      image_url: form.image_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
    };

    if (editingId) {
      const { error } = await supabase.from('brands').update(payload).eq('id', editingId);
      if (error) {
        toast({ title: 'Error updating brand', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Brand updated!' });
    } else {
      const { error } = await supabase.from('brands').insert(payload);
      if (error) {
        toast({ title: 'Error creating brand', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Brand created!' });
    }

    resetAfterSave();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand?')) return;

    const { error } = await supabase.from('brands').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Brand deleted' });
    queryClient.invalidateQueries({ queryKey: ['brands'] });
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex h-[50vh] w-full items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-black uppercase text-foreground">Manage Brands</h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add Brand
            </Button>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
                <DialogDescription className="sr-only">
                  Manage brand details and logos.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(current => ({
                      ...current,
                      name: e.target.value,
                      slug: current.slug ? current.slug : slugify(e.target.value),
                    }))}
                  />
                </div>

                <div>
                  <Label>Slug *</Label>
                  <Input
                    value={form.slug}
                    onChange={e => setForm(current => ({ ...current, slug: slugify(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={e => setForm(current => ({ ...current, sort_order: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Logo</Label>
                  <ImageUpload
                    images={form.image_url ? [form.image_url] : []}
                    onImagesChange={urls => setForm(current => ({ ...current, image_url: urls[0] || '' }))}
                    maxImages={1}
                    path="brands"
                  />
                  <Input
                    className="mt-2"
                    value={form.image_url}
                    onChange={e => setForm(current => ({ ...current, image_url: e.target.value }))}
                    placeholder="Or paste an image URL (https://...)"
                  />
                </div>

                <Button onClick={handleSave} className="w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90">
                  {editingId ? 'Update Brand' : 'Create Brand'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Logo</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Sort</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!brands ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading brands...</p>
                      </div>
                    </td>
                  </tr>
                ) : brands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      No brands found.
                    </td>
                  </tr>
                ) : (
                  brands.map(brand => (
                    <tr key={brand.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="h-10 w-10 overflow-hidden rounded border border-border bg-muted/50">
                          {brand.image_url ? (
                            <img src={brand.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                              No logo
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">{brand.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{brand.slug}</td>
                      <td className="px-4 py-3 text-muted-foreground">{brand.sort_order ?? 0}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(brand)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(brand.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile view for brands */}
          <div className="sm:hidden divide-y divide-border">
            {!brands ? (
              <div className="px-4 py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground mt-2">Loading brands...</p>
              </div>
            ) : brands.length === 0 ? (
              <div className="px-4 py-12 text-center text-muted-foreground">
                No brands found.
              </div>
            ) : (
              brands.map(brand => (
                <div key={brand.id} className="p-4 flex gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded border border-border bg-muted/50 shrink-0">
                    {brand.image_url ? (
                      <img src={brand.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        No logo
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground truncate">{brand.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">{brand.slug}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">Sort: {brand.sort_order ?? 0}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEdit(brand)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(brand.id)} className="h-8 w-8 text-destructive border-destructive/20"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageBrands;
