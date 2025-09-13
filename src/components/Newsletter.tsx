import { NewsletterSubscription } from "@/components/impact/NewsletterSubscription";
import { useHomepageContent } from "@/hooks/useHomepageContent";

export const Newsletter = () => {
  const { content } = useHomepageContent();
  return (
    <section className="py-20 bg-gradient-to-r from-solar-blue to-solar-green">
      <div className="container mx-auto px-4">
        <NewsletterSubscription
          segment="general"
          sourcePage="home"
          title={content.newsletter.title}
          description={content.newsletter.description}
        />
      </div>
    </section>
  );
};
