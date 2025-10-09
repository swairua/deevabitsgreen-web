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
  featuredProducts: {
    title: string;
    subtitle: string;
    // Selected featured product IDs (from Supabase products table or legacy IDs)
    ids?: string[];
  };
  solarPackages: {
    title: string;
    subtitle: string;
  };
  whyChooseUs: {
    title: string;
    subtitle: string;
  };
  trustIndicators: {
    title: string;
    financingTitle: string;
    financingDescription: string;
  };
  whatsappCta: {
    title: string;
    description: string;
    primaryButton: string;
    secondaryButton: string;
  };
  newsletter: {
    title: string;
    description: string;
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
  featuredProducts: {
    title: "Featured Solar Equipment",
    subtitle: "Premium quality solar components from trusted global brands. Everything you need for a complete solar system.",
    ids: [],
  },
  solarPackages: {
    title: "Solar Packages & Solutions",
    subtitle: "Complete solar systems designed for different needs and budgets. Choose the perfect package or let us customize one specifically for you.",
  },
  whyChooseUs: {
    title: "Why Choose Deevabits?",
    subtitle: "We combine technical expertise with social impact, delivering reliable solar solutions that benefit both your pocket and the planet.",
  },
  trustIndicators: {
    title: "Trusted by Leading Organizations",
    financingTitle: "Flexible Financing Available",
    financingDescription: "Partner with leading banks for affordable solar financing options",
  },
  whatsappCta: {
    title: "Need Instant Help?",
    description: "Get expert advice, quick quotes, and technical support through WhatsApp. Our solar specialists are ready to help you go solar today!",
    primaryButton: "Chat on WhatsApp",
    secondaryButton: "Call Us Now",
  },
  newsletter: {
    title: "Stay Powered with Updates",
    description: "Get the latest solar tips, product updates, financing options, and exclusive offers delivered to your inbox.",
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
