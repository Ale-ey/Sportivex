import PageLayout from "@/components/PageLayout";
import Hero from "@/components/landingPage/Hero";
import Projects from "@/components/landingPage/Projects";
import WhyWrlds from "@/components/landingPage/WhyWrlds";
import BlogPreview from "@/components/landingPage/BlogPreview";
import SportsNavigation from "@/components/landingPage/SportsNavigation";
import CazzaFeatures from "@/components/landingPage/CazzaFeatures";
import SEO from "@/components/landingPage/SEO";
import { useEffect } from "react";

const Index = () => {
  // Fix any ID conflicts when the page loads
  useEffect(() => {
    const contactElements = document.querySelectorAll('[id="contact"]');
    if (contactElements.length > 1) {
      // If there are multiple elements with id="contact", rename one
      contactElements[1].id = "contact-footer";
    }
  }, []);

  return (
    <PageLayout>
      <SEO
        title="NUST University Sports Management"
        description="Comprehensive sports management platform for NUST University. Manage competitions, training, gym, horse riding, swimming, squash, bowling, badminton and more."
        imageUrl="/lovable-uploads/526dc38a-25fa-40d4-b520-425b23ae0464.png"
        keywords={[
          "NUST University",
          "sports management",
          "university sports",
          "sports competitions",
          "gym management",
          "swimming pool",
          "badminton",
          "squash",
          "bowling",
          "horse riding",
        ]}
      />
      <Hero />
      <SportsNavigation />
      <WhyWrlds />
      <CazzaFeatures />
      <Projects />
      <BlogPreview />
    </PageLayout>
  );
};

export default Index;
