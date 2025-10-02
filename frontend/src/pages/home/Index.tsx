import PageLayout from "@/components/PageLayout";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Projects from "@/components/Projects";
import WhyWrlds from "@/components/WhyWrlds";
import BlogPreview from "@/components/BlogPreview";
import SEO from "@/components/SEO";
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
        title="Sportivex"
        description="Sportivex: 7+ years transforming product visions into market-ready connected solutions. Hardware, software, and manufacturing expertise."
        imageUrl="/lovable-uploads/526dc38a-25fa-40d4-b520-425b23ae0464.png"
        keywords={[
          "IoT development",
          "connected product development",
          "hardware software integration",
          "smart product partner",
          "end-to-end IoT solutions",
          "rapid prototyping",
          "product development",
        ]}
      />
      <Hero />
      <Features />
      <WhyWrlds />
      <Projects />
      <BlogPreview />
    </PageLayout>
  );
};

export default Index;
