import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHomepageContent, type HomepageContent } from "@/hooks/useHomepageContent";

export const HomepageManagement = () => {
  const { content, setContent, loading } = useHomepageContent();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const save = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload = {
        id: "default",
        data: content,
        updated_at: new Date().toISOString(),
      };
      const { error } = await (supabase as any)
        .from("homepage_content")
        .upsert(payload, { onConflict: "id" });
      if (error) throw error;
      toast({ title: "Homepage content saved" });
    } catch (err: any) {
      console.error("Save homepage content failed", err);
      setError("Failed to save. Ensure 'homepage_content' table exists with columns: id text PK, data jsonb, updated_at timestamp.");
      toast({ title: "Save failed", description: "Backend table missing?", variant: "destructive" });
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
