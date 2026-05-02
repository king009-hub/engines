import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useProducts, useCategories, useBrands } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Youtube, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { FUEL_TYPES } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ImageUpload from '@/components/admin/ImageUpload';

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  brand: string;
  fuel_type: string;
  engine_code: string;
  price: string;
  mileage: string;
  year: string;
  condition: string;
  compatibility: string;
  images: string[];
  category_id: string;
  parent_category_id: string;
  availability: boolean;
  youtube_url: string;
}

const emptyForm: ProductForm = {
  name: '', slug: '', description: '', brand: '', fuel_type: 'Diesel', engine_code: '',
  price: '', mileage: '', year: '', condition: 'Tested - OK',
  compatibility: '', images: [], category_id: '', parent_category_id: '', availability: true,
  youtube_url: '',
};

const ITEMS_PER_PAGE = 20;

const ManageProducts = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Memoize filters to prevent re-fetch loops
  const filters = useMemo(() => ({ 
    per_page: ITEMS_PER_PAGE,
    page: currentPage,
    search: searchTerm,
    sort: 'newest' as const
  }), [currentPage, searchTerm]);

  const { data, isLoading } = useProducts(filters);
  const { data: categories } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    let videoId = '';
    try {
      if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      else if (url.includes('embed/')) videoId = url.split('embed/')[1].split('?')[0];
      else if (url.includes('shorts/')) videoId = url.split('shorts/')[1].split('?')[0];
    } catch (e) { return null; }
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null;
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/');
  }, [user, isAdmin, authLoading, navigate]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (product: any) => {
    const productCategory = categories?.find(c => c.id === product.category_id);
    const parentId = productCategory?.parent_id || (productCategory ? productCategory.id : '');
    
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug || '',
      description: product.description || '',
      brand: product.brand,
      fuel_type: product.fuel_type,
      engine_code: product.engine_code,
      price: String(product.price),
      mileage: product.mileage ? String(product.mileage) : '',
      year: product.year ? String(product.year) : '',
      condition: product.condition || '',
      compatibility: product.compatibility?.join(', ') || '',
      images: product.images || [],
      category_id: product.category_id || '',
      parent_category_id: parentId,
      availability: product.availability,
      youtube_url: product.youtube_url || '',
    });
    setDialogOpen(true);
  };

  const resetAfterSave = async () => {
    await queryClient.refetchQueries({ queryKey: ['products'] });
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.engine_code || !form.price || !form.category_id) {
      toast({ title: 'Missing fields', description: 'Name, engine code, price & category are required.', variant: 'destructive' });
      return;
    }

    const payload: any = {
      name: form.name,
      description: form.description,
      brand: form.brand,
      fuel_type: form.fuel_type,
      engine_code: form.engine_code,
      price: Number(form.price),
      mileage: form.mileage ? Number(form.mileage) : null,
      year: form.year ? Number(form.year) : null,
      condition: form.condition,
      compatibility: form.compatibility.split(',').map(s => s.trim()).filter(Boolean),
      images: form.images,
      category_id: form.category_id || null,
      availability: form.availability,
    };

    // Only add slug and youtube_url if they are not empty, 
    // to avoid errors if columns are missing from the table
    if (form.slug) payload.slug = form.slug;
    if (form.youtube_url) payload.youtube_url = form.youtube_url;

    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingId);
      if (error) {
        // Fallback for missing columns
        if (error.code === '42703') {
          console.warn('[ManageProducts] Slug or YouTube column missing, retrying without them');
          delete payload.slug;
          delete payload.youtube_url;
          const { error: retryError } = await supabase.from('products').update(payload).eq('id', editingId);
          if (retryError) {
            toast({ title: 'Error updating product', description: retryError.message, variant: 'destructive' });
            return;
          }
        } else {
          toast({ title: 'Error updating product', description: error.message, variant: 'destructive' });
          return;
        }
      }
      toast({ title: 'Product updated!' });
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) {
        // Fallback for missing columns
        if (error.code === '42703') {
          console.warn('[ManageProducts] Slug or YouTube column missing, retrying without them');
          delete payload.slug;
          delete payload.youtube_url;
          const { error: retryError } = await supabase.from('products').insert(payload);
          if (retryError) {
            toast({ title: 'Error adding product', description: retryError.message, variant: 'destructive' });
            return;
          }
        } else {
          toast({ title: 'Error adding product', description: error.message, variant: 'destructive' });
          return;
        }
      }
      toast({ title: 'Product added!' });
    }

    resetAfterSave();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Product deleted' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <h1 className="text-2xl font-black uppercase text-foreground">Manage Products</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-9 pr-10"
              />
              {searchInput && (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </form>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Button onClick={openAdd} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Product' : 'Add Product'}</DialogTitle>
                <DialogDescription className="sr-only">
                  Fill in the details for the engine product.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Slug (SEO URL)</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="e.g. peugeot-engine-code" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Engine Code *</Label><Input value={form.engine_code} onChange={e => setForm({ ...form, engine_code: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Parent Category</Label>
                      <Select 
                        value={form.parent_category_id} 
                        onValueChange={v => {
                          // Clear subcategory when parent changes
                          setForm({ ...form, parent_category_id: v, category_id: '' });
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {categories?.filter(c => !c.parent_id).map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Subcategory</Label>
                      <Select 
                        value={form.category_id} 
                        onValueChange={v => setForm({ ...form, category_id: v })}
                        disabled={!form.parent_category_id}
                      >
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {categories?.filter(c => c.parent_id === form.parent_category_id).map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                          {/* Fallback to parent itself if it's a leaf node */}
                          {categories?.filter(c => c.id === form.parent_category_id).map(c => (
                            <SelectItem key={`${c.id}-self`} value={c.id}>{c.name} (General)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Brand</Label>
                    <Select value={form.brand} onValueChange={v => setForm({ ...form, brand: v })}>
                      <SelectTrigger><SelectValue placeholder={brandsLoading ? 'Loading...' : 'Select'} /></SelectTrigger>
                      <SelectContent>
                        {brandsLoading ? (
                          <div className="flex items-center justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
                        ) : (
                          brands?.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fuel Type</Label>
                    <Select value={form.fuel_type} onValueChange={v => setForm({ ...form, fuel_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{FUEL_TYPES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div><Label>Price ($) *</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                  <div><Label>Mileage (km)</Label><Input type="number" value={form.mileage} onChange={e => setForm({ ...form, mileage: e.target.value })} /></div>
                  <div><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} /></div>
                  <div><Label>Condition</Label><Input value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} /></div>
                </div>
                <div><Label>Compatibility (comma-separated)</Label><Input value={form.compatibility} onChange={e => setForm({ ...form, compatibility: e.target.value })} placeholder="Renault Clio, Renault Megane" /></div>
                
                <div><Label>YouTube Video URL (Optional)</Label><Input value={form.youtube_url} onChange={e => setForm({ ...form, youtube_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." /></div>
                
                {getYouTubeEmbedUrl(form.youtube_url) && (
                  <div className="mt-2 space-y-2">
                    <Label className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold">
                      <Youtube className="h-3 w-3 text-red-600" />
                      Video Preview
                    </Label>
                    <div className="aspect-video rounded-lg overflow-hidden border border-border bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={getYouTubeEmbedUrl(form.youtube_url)!}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="availability"
                    checked={form.availability}
                    onCheckedChange={(checked) => setForm({ ...form, availability: checked as boolean })}
                  />
                  <Label htmlFor="availability" className="cursor-pointer">Available for sale</Label>
                </div>

                <div>
                  <Label>Product Images</Label>
                  <ImageUpload images={form.images} onImagesChange={(imgs) => setForm({ ...form, images: imgs })} />
                </div>

                <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                  {editingId ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Image</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Name / Slug</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Code</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Brand</th>
                  <th className="text-left px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Price</th>
                  <th className="text-right px-4 py-3 font-bold uppercase text-xs text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading products...</p>
                      </div>
                    </td>
                  </tr>
                ) : data?.products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No products found.
                    </td>
                  </tr>
                ) : (
                    data?.products.map(p => {
                      const category = categories?.find(c => c.id === p.category_id);
                      const parent = category?.parent_id ? categories?.find(c => c.id === category.parent_id) : null;
                      
                      return (
                        <tr key={p.id} className="hover:bg-muted/30">
                          <td className="px-4 py-2"><img src={p.images?.[0] || '/placeholder.svg'} alt="" className="w-12 h-12 object-cover rounded" /></td>
                          <td className="px-4 py-2">
                            <div className="font-semibold text-foreground">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{p.slug}</div>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">{p.engine_code}</td>
                          <td className="px-4 py-2">
                            <div className="text-xs font-medium text-foreground">{category?.name || '—'}</div>
                            {parent && <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{parent.name}</div>}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">{p.brand}</td>
                          <td className="px-4 py-2 font-bold text-primary">${Math.round(Number(p.price))}</td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile view for products */}
          <div className="sm:hidden divide-y divide-border">
            {isLoading ? (
              <div className="px-4 py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground mt-2">Loading products...</p>
              </div>
            ) : data?.products.length === 0 ? (
              <div className="px-4 py-12 text-center text-muted-foreground">
                No products found.
              </div>
            ) : (
              data?.products.map(p => {
                const category = categories?.find(c => c.id === p.category_id);
                return (
                  <div key={p.id} className="p-4 flex gap-4">
                    <img src={p.images?.[0] || '/placeholder.svg'} alt="" className="w-16 h-16 object-cover rounded shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{p.engine_code}</span>
                        <span>•</span>
                        <span>{category?.name}</span>
                      </div>
                      <div className="font-bold text-primary mt-1">${Math.round(Number(p.price))}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(p)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-destructive border-destructive/20"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    className="w-9 h-9 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageProducts;
