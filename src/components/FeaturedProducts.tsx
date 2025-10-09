import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { products as legacyProducts } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { supabase } from "@/integrations/supabase/client";

export const FeaturedProducts = () => {
  const { content } = useHomepageContent();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      const ids = content.featuredProducts.ids || [];
      if (ids.length > 0) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .in('id', ids)
            .eq('is_active', true);
          if (error) throw error;
          const map = new Map((data || []).map(p => [p.id, p]));
          const ordered = ids.map(id => map.get(id)).filter(Boolean).slice(0, 4) as any[];
          if (ordered.length > 0) {
            setItems(ordered);
            return;
          }
        } catch (e) {
          console.warn('Failed to load featured products from DB, falling back', e);
        }
      }
      setItems(legacyProducts.slice(0, 4));
    };
    run();
  }, [content.featuredProducts.ids]);

  return (
    <section id="shop" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{content.featuredProducts.title}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {content.featuredProducts.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" className="px-8" asChild>
            <Link to="/shop">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
