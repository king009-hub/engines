import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Plus, Trash2, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useCategories, useBrands } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/admin/ImageUpload';
import type { Category } from '@/lib/types';

interface CategoryForm {
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string;
  sort_order: string;
  brand_ids: string[];
}

const emptyForm: CategoryForm = {
  name: '',
  slug: '',
  parent_id: null,
  image_url: '',
  sort_order: '0',
  brand_ids: [],
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ManageCategories = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/');
  }, [authLoading, isAdmin, navigate, user]);

  const availableParents = useMemo(
    () => (categories || []).filter(category => category.id !== editingId),
    [categories, editingId],
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = async (category: Category) => {
    setEditingId(category.id);
    
    // Fetch associated brands for this category
    const { data: brandAssociations } = await supabase
      .from('category_brands')
      .select('brand_id')
      .eq('category_id', category.id);
    
    const associatedBrandIds = brandAssociations?.map(item => item.brand_id) || [];

    setForm({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id,
      image_url: category.image_url || '',
      sort_order: String(category.sort_order ?? 0),
      brand_ids: associatedBrandIds,
    });
    setDialogOpen(true);
  };

  const resetAfterSave = async () => {
    await queryClient.refetchQueries({ queryKey: ['categories'] });
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
      parent_id: form.parent_id,
      image_url: form.image_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
    };

    let categoryId = editingId;

    if (editingId) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editingId);
      if (error) {
        toast({ title: 'Error updating category', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Category updated!' });
    } else {
      const { data, error } = await supabase.from('categories').insert(payload).select('id').single();
      if (error) {
        toast({ title: 'Error creating category', description: error.message, variant: 'destructive' });
        return;
      }
      categoryId = data.id;
      toast({ title: 'Category created!' });
    }

    // Manage brand associations
    if (categoryId) {
      await supabase.from('category_brands').delete().eq('category_id', categoryId);
      if (form.brand_ids.length > 0) {
        const associations = form.brand_ids.map(brandId => ({ category_id: categoryId!, brand_id: brandId }));
        const { error: assocError } = await supabase.from('category_brands').insert(associations);
        if (assocError) {
          toast({ title: 'Error updating brands', description: assocError.message, variant: 'destructive' });
        }
      }
    }

    resetAfterSave();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;

    await supabase.from('category_brands').delete().eq('category_id', id);
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Category deleted' });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
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
            <h1 className="text-2xl font-black uppercase text-foreground">Manage Categories</h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Category' : 'Add Category'}</DialogTitle>
                <DialogDescription className="sr-only">
                  Manage category details and brand associations.
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Parent Category</Label>
                    <Select
                      value={form.parent_id ?? 'none'}
                      onValueChange={value => setForm(current => ({ ...current, parent_id: value === 'none' ? null : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {availableParents.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={form.sort_order}
                      onChange={e => setForm(current => ({ ...current, sort_order: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Image</Label>
                  <ImageUpload
                    images={form.image_url ? [form.image_url] : []}
                    onImagesChange={urls => setForm(current => ({ ...current, image_url: urls[0] || '' }))}
                    maxImages={1}
                    path="categories"
                  />
                  <Input
                    className="mt-2"
                    value={form.image_url}
                    onChange={e => setForm(current => ({ ...current, image_url: e.target.value }))}
                    placeholder="Or paste an image URL (https://...)"
                  />
                </div>

                <div className="pt-2">
                  <Label className="mb-3 block">Brands for this category</Label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-[150px] overflow-y-auto p-3 border border-border rounded-md">
                    {brandsLoading ? (
                      <div className="col-span-2 flex justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    ) : (
                      brands?.map(brand => (
                        <div key={brand.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`brand-${brand.id}`}
                            checked={form.brand_ids.includes(brand.id)}
                            onCheckedChange={(checked) => {
                              setForm(current => ({
                                ...current,
                                brand_ids: checked
                                  ? [...current.brand_ids, brand.id]
                                  : current.brand_ids.filter(id => id !== brand.id)
                              }));
                            }}
                          />
                          <Label
                            htmlFor={`brand-${brand.id}`}
                            className="text-xs font-medium cursor-pointer"
                          >
                            {brand.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">
                    Only selected brands will appear in the navigation and filters for this category.
                  </p>
                </div>

                <Button onClick={handleSave} className="w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90">
                  {editingId ? 'Update Category' : 'Create Category'}
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
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Parent</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Sort</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!categories ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading categories...</p>
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map(category => {
                    const parent = categories.find(item => item.id === category.parent_id);

                    return (
                      <tr key={category.id} className="hover:bg-muted/30">
                        <td className="px-4 py-2">
                          <img
                            src={category.image_url || '/placeholder.svg'}
                            alt=""
                            className="h-12 w-12 rounded object-cover shadow-sm"
                          />
                        </td>
                        <td className="px-4 py-2 font-semibold text-foreground">
                          {category.name}
                        </td>
                        <td className="px-4 py-2 text-[11px] font-mono text-muted-foreground">
                          {category.slug}
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          {parent?.name || '—'}
                        </td>
                        <td className="px-4 py-2 text-xs font-medium text-foreground">
                          {category.sort_order || 0}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile view for categories */}
          <div className="sm:hidden divide-y divide-border">
            {!categories ? (
              <div className="px-4 py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground mt-2">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="px-4 py-12 text-center text-muted-foreground">
                No categories found.
              </div>
            ) : (
              categories.map(category => {
                const parent = categories.find(item => item.id === category.parent_id);
                return (
                  <div key={category.id} className="p-4 flex gap-4">
                    <img src={category.image_url || '/placeholder.svg'} alt="" className="w-16 h-16 object-cover rounded shrink-0 shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground truncate">{category.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">{category.slug}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                        {parent && (
                          <>
                            <span className="uppercase tracking-tighter">Parent: {parent.name}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>Sort: {category.sort_order || 0}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(category)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(category.id)} className="h-8 w-8 text-destructive border-destructive/20"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageCategories;
