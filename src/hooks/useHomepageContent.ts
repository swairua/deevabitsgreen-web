import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HomepageContent = {
  hero: {
    title: string;
    subtitle: string;
    images: string[]; // URLs
  };
  impact: {
    householdsPowered: number;
    jobsCreated: number;
    co2SavedTonnes: number;
    mwInstalled: number;
  };
};

const defaultContent: HomepageContent = {
  hero: {
    title: "Powering Homes,",
    subtitle: "Empowering Lives",
    images: [],
  },
  impact: {
    householdsPowered: 5247,
    jobsCreated: 127,
    co2SavedTonnes: 2400,
    mwInstalled: 45,
  },
};

export function useHomepageContent() {
  const [content, setContent] = useState<HomepageContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Using any to avoid type coupling if backend table isn't present yet
        const { data, error } = await (supabase as any)
          .from("homepage_content")
          .select("data")
          .eq("id", "default")
          .maybeSingle();
        if (error) throw error;
        if (data?.data && isMounted) {
          setContent({ ...defaultContent, ...data.data });
        }
      } catch (err: any) {
        console.warn("Homepage content load failed", err?.message || err);
        if (isMounted) setError("Content not found; using defaults");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { content, setContent, loading, error };
}
