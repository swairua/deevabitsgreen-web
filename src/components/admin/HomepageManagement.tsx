import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHomepageContent, type HomepageContent } from "@/hooks/useHomepageContent";

export const HomepageManagement = () => {
  const { content, setContent, loading } = useHomepageContent();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Array<{ id: string; name: string; category: string; is_active?: boolean }>>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const handleChange = (path: (keyof HomepageContent)[] | string, value: any) => {
    setContent((prev) => {
      const next: any = { ...prev };
      if (Array.isArray(path)) {
        if (path.length === 2) {
          next[path[0]] = { ...(prev as any)[path[0]], [path[1]]: value };
        }
      } else {
        (next as any)[path] = value;
      }
      return next;
    });
  };

  const handleImageChange = (index: number, value: string) => {
    setContent((prev) => {
      const images = [...(prev.hero.images || [])];
      images[index] = value;
      return { ...prev, hero: { ...prev.hero, images } };
    });
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('id,name,category,is_active')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setAllProducts((data || []).filter(p => p.is_active !== false));
      } catch (e) {
        console.warn('Could not load products for featured selection', e);
        setAllProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const toggleFeatured = (productId: string, checked: boolean) => {
    setContent(prev => {
      const current = prev.featuredProducts.ids || [];
      let next = [...current];
      if (checked) {
        if (current.length >= 4 && !current.includes(productId)) {
          toast({ title: 'Limit reached', description: 'You can select up to 4 featured products.', variant: 'destructive' });
          return prev;
        }
        if (!next.includes(productId)) next.push(productId);
      } else {
        next = next.filter(id => id !== productId);
      }
      return { ...prev, featuredProducts: { ...prev.featuredProducts, ids: next } };
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      setError(null);
      // Minimal payload to avoid schema mismatches (e.g., if updated_at column doesn't exist)
      const payload = {
        id: "default",
        data: content,
      } as const;

      const { error } = await (supabase as any)
        .from("homepage_content")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;
      toast({ title: "Homepage content saved" });
    } catch (err: any) {
      // Fallback to localStorage so Admin can still save without DB
      try {
        localStorage.setItem("homepage_content", JSON.stringify(content));
        toast({ title: "Saved locally", description: "Could not reach database; changes saved in your browser.", });
        setError(null);
      } catch (lsErr) {
        const message = err?.message || String(err);
        console.error("Save homepage content failed", err);
        setError(`Failed to save. Error: ${message}. Ensure table 'homepage_content' exists with columns: id text PK, data jsonb.`);
        toast({ title: "Save failed", description: message, variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage Content</CardTitle>
        <CardDescription>Manage hero text, images, and impact stats displayed on the homepage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Hero</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heroTitle">Title</Label>
              <Input id="heroTitle" value={content.hero.title} onChange={(e) => handleChange(["hero", "title"], e.target.value)} />
            </div>
            <div>
              <Label htmlFor="heroSubtitle">Subtitle</Label>
              <Input id="heroSubtitle" value={content.hero.subtitle} onChange={(e) => handleChange(["hero", "subtitle"], e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[0,1,2].map((i) => (
              <div key={i}>
                <Label>Hero Image {i+1} URL</Label>
                <Input value={content.hero.images[i] || ""} onChange={(e) => handleImageChange(i, e.target.value)} placeholder="https://..." />
              </div>
            ))}
          </div>
        </div>

        {/* Impact Stats */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Impact Stats</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Households Powered</Label>
              <Input type="number" value={content.impact.householdsPowered} onChange={(e) => handleChange(["impact", "householdsPowered"], Number(e.target.value))} />
            </div>
            <div>
              <Label>Jobs Created</Label>
              <Input type="number" value={content.impact.jobsCreated} onChange={(e) => handleChange(["impact", "jobsCreated"], Number(e.target.value))} />
            </div>
            <div>
              <Label>Tonnes CO₂ Saved</Label>
              <Input type="number" value={content.impact.co2SavedTonnes} onChange={(e) => handleChange(["impact", "co2SavedTonnes"], Number(e.target.value))} />
            </div>
            <div>
              <Label>MW Installed</Label>
              <Input type="number" value={content.impact.mwInstalled} onChange={(e) => handleChange(["impact", "mwInstalled"], Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Section: Featured Products */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Featured Products</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={content.featuredProducts.title} onChange={(e) => handleChange(["featuredProducts", "title"], e.target.value)} />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={content.featuredProducts.subtitle} onChange={(e) => handleChange(["featuredProducts", "subtitle"], e.target.value)} />
            </div>
          </div>

          <div className="mt-2">
            <Label>Select up to 4 products</Label>
            <div className="text-sm text-muted-foreground mb-2">Selected: {(content.featuredProducts.ids || []).length} / 4</div>
            {productsLoading ? (
              <div className="text-sm text-muted-foreground">Loading products…</div>
            ) : allProducts.length === 0 ? (
              <div className="text-sm text-muted-foreground">No products found. Create products first in the Products section.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allProducts.map(p => {
                  const checked = (content.featuredProducts.ids || []).includes(p.id);
                  return (
                    <label key={p.id} className="flex items-center gap-3 p-3 rounded-md border">
                      <Checkbox checked={checked} onCheckedChange={(val) => toggleFeatured(p.id, Boolean(val))} />
                      <div>
                        <div className="font-medium leading-none">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.category.replace('_',' ')}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Section: Solar Packages */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Solar Packages</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={content.solarPackages.title} onChange={(e) => handleChange(["solarPackages", "title"], e.target.value)} />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={content.solarPackages.subtitle} onChange={(e) => handleChange(["solarPackages", "subtitle"], e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section: Why Choose Us */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Why Choose Us</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={content.whyChooseUs.title} onChange={(e) => handleChange(["whyChooseUs", "title"], e.target.value)} />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={content.whyChooseUs.subtitle} onChange={(e) => handleChange(["whyChooseUs", "subtitle"], e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section: Trust Indicators */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Trust Indicators</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Main Title</Label>
              <Input value={content.trustIndicators.title} onChange={(e) => handleChange(["trustIndicators", "title"], e.target.value)} />
            </div>
            <div>
              <Label>Financing Title</Label>
              <Input value={content.trustIndicators.financingTitle} onChange={(e) => handleChange(["trustIndicators", "financingTitle"], e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Financing Description</Label>
              <Input value={content.trustIndicators.financingDescription} onChange={(e) => handleChange(["trustIndicators", "financingDescription"], e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section: WhatsApp CTA */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">WhatsApp CTA</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={content.whatsappCta.title} onChange={(e) => handleChange(["whatsappCta", "title"], e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={content.whatsappCta.description} onChange={(e) => handleChange(["whatsappCta", "description"], e.target.value)} />
            </div>
            <div>
              <Label>Primary Button</Label>
              <Input value={content.whatsappCta.primaryButton} onChange={(e) => handleChange(["whatsappCta", "primaryButton"], e.target.value)} />
            </div>
            <div>
              <Label>Secondary Button</Label>
              <Input value={content.whatsappCta.secondaryButton} onChange={(e) => handleChange(["whatsappCta", "secondaryButton"], e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section: Newsletter */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Newsletter</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={content.newsletter.title} onChange={(e) => handleChange(["newsletter", "title"], e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={content.newsletter.description} onChange={(e) => handleChange(["newsletter", "description"], e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </CardContent>
    </Card>
  );
};
