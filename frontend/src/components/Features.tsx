import { useEffect, useState } from "react";
import {
  Activity,
  Shield,
  HardHat,
  Zap,
  ArrowRight,
  Box,
  Code,
  CheckCircle,
  Rocket,
  Microchip,
  Handshake,
  MessageSquare,
  Building,
  Cpu,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Features = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: (
        <Activity className="w-10 h-10 text-white transition-transform duration-300 transform" />
      ),
      title: "Sports & Health Tech",
      description:
        "Connected equipment and wearables with real-time performance analytics, injury prevention, and health monitoring.",
      image: "/swiming.jpg",
      category: "Sports",
    },
    {
      icon: (
        <Shield className="w-10 h-10 text-white transition-transform duration-300 transform" />
      ),
      title: "Safety & Defense",
      description:
        "Smart PPE and tactical gear with environmental monitoring, threat detection, and real-time health tracking.",
      image: "gym.jpg",
      category: "Safety",
    },
    {
      icon: (
        <HardHat className="w-10 h-10 text-white transition-transform duration-300 transform" />
      ),
      title: "Industrial IoT",
      description:
        "Predictive maintenance systems, asset tracking, and worker safety monitoring for industrial environments.",
      image: "badminton.jpg",
      category: "Industrial",
    },
    {
      icon: (
        <Building className="w-10 h-10 text-white transition-transform duration-300 transform" />
      ),
      title: "Smart Cities",
      description:
        "Environmental monitoring, traffic flow analysis, and infrastructure health systems for urban development.",
      image: "bowling.jpg",
      category: "Cities",
    },
  ];

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById("contact-info");
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  // Progress value state for potential progress bar animation
  const [, setProgressValue] = useState(0);

  // Animate progress bar on component mount
  useEffect(() => {
    const timer = setTimeout(() => setProgressValue(100), 100);
    return () => clearTimeout(timer);
  }, []);

  const pillars = [
    {
      icon: <Cpu className="w-6 h-6 text-gray-700" />,
      title: "Hardware Engineering",
      description:
        "Circuit design, power management, mechanical engineering, and connectivity solutions that form the backbone of smart products.",
    },
    {
      icon: <Code className="w-6 h-6 text-gray-700" />,
      title: "Software & AI",
      description:
        "Embedded firmware, cloud platforms, mobile applications, and machine learning that bring intelligence to connected devices.",
    },
    {
      icon: <Layers className="w-6 h-6 text-gray-700" />,
      title: "Production & Scale",
      description:
        "Manufacturing partnerships, certification management, and quality assurance for reliable market deployment.",
    },
  ];

  return (
    <>
      <section
        id="features"
        className="py-16 md:py-24 bg-white overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
              What We Do
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              End-to-End Smart Product Development
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We combine hardware engineering, software development, and
              manufacturing expertise to turn your connected product vision into
              market reality.
            </p>
          </div>

          {/* Three Pillars Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold mb-4">
                Our Three-Pillar Approach
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Every successful connected product requires expertise across
                hardware, software, and manufacturing. We provide all three
                under one roof.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pillars.map((pillar, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-lg mx-auto mb-4">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{pillar.title}</h3>
                  <p className="text-gray-600 text-sm">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Applications - Simplified grid */}
          <div className="text-center mb-8 max-w-3xl mx-auto feature-item">
            <div className="inline-block mb-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              Industry Applications
            </div>
            <h3 className="text-2xl font-bold mb-4">
              Cross-Industry IoT Solutions
            </h3>
            <p className="text-gray-600">
              Our modular approach enables rapid development across diverse
              industries, from sports tech to smart cities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-item rounded-xl overflow-hidden transform transition-all duration-300 relative shadow-lg hover:-translate-y-1 h-[280px]"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-all duration-300 grayscale hover:grayscale-0"
                  />
                  <div
                    className={cn(
                      "absolute inset-0 transition-opacity duration-300",
                      hoveredFeature === index ? "bg-black/50" : "bg-black/70"
                    )}
                  ></div>
                </div>

                <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-2">
                      {feature.icon}
                      <span className="text-white/80 text-sm font-medium">
                        {feature.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Process Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              How We Work
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              From Concept to Commercial Success
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our proven 5-phase methodology ensures your connected product
              vision becomes a market-ready solution faster than traditional
              approaches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              {
                phase: "01",
                title: "Discovery & Strategy",
                description:
                  "Market research, requirements gathering, and feasibility analysis to define the optimal product approach.",
                icon: <MessageSquare className="h-8 w-8 text-white" />,
              },
              {
                phase: "02",
                title: "Design & Prototyping",
                description:
                  "Rapid prototyping using our modular technology library to validate concepts and gather early feedback.",
                icon: <Code className="h-8 w-8 text-white" />,
              },
              {
                phase: "03",
                title: "Development & Integration",
                description:
                  "Full-stack development combining hardware, software, and cloud platforms into cohesive solutions.",
                icon: <Zap className="h-8 w-8 text-white" />,
              },
              {
                phase: "04",
                title: "Testing & Certification",
                description:
                  "Comprehensive testing, compliance verification, and certification management for market readiness.",
                icon: <CheckCircle className="h-8 w-8 text-white" />,
              },
              {
                phase: "05",
                title: "Launch & Scale",
                description:
                  "Market deployment, production scaling, and ongoing support to ensure commercial success.",
                icon: <Rocket className="h-8 w-8 text-white" />,
              },
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-gray-700 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  {step.icon}
                </div>
                <div className="text-2xl font-bold text-gray-400 mb-2">
                  {step.phase}
                </div>
                <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>

                {index < 4 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-6 h-6 text-gray-300" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={scrollToContact}
              className="bg-gray-700 text-white hover:bg-gray-800 px-8 py-3 text-lg"
            >
              Start Your Project Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              Our Technology
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Modular Technology for Rapid Innovation
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our proprietary modular approach combines proven components with
              custom innovations to achieve the fastest time-to-prototype in the
              industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 h-full">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-50 rounded-full p-4 mb-4">
                  <Box className="h-10 w-10 text-gray-700" />
                </div>
                <h3 className="text-lg font-bold mb-2">Proprietary Modules</h3>
                <p className="text-sm text-gray-600">
                  Pre-validated hardware and software components from our 7+
                  years of development
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 h-full">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-50 rounded-full p-4 mb-4">
                  <Microchip className="h-10 w-10 text-gray-700" />
                </div>
                <h3 className="text-lg font-bold mb-2">Vetted Off-the-Shelf</h3>
                <p className="text-sm text-gray-600">
                  Carefully selected commercial components that integrate
                  seamlessly with our platform
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 h-full">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-50 rounded-full p-4 mb-4">
                  <Handshake className="h-10 w-10 text-gray-700" />
                </div>
                <h3 className="text-lg font-bold mb-2">
                  Production Partner Network
                </h3>
                <p className="text-sm text-gray-600">
                  Expert manufacturing partners for quality production at scale
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              Result: Fastest Time-to-Market in the Industry
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our modular approach reduces development time by 60% while
              maintaining the highest quality standards and enabling unique
              product differentiation.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
