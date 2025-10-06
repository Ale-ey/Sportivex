import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const processes = [
  {
    id: 1,
    title: "Discovery & Strategy",
    description:
      "We analyze your market requirements, conduct feasibility studies, and develop a comprehensive product strategy that aligns with your business goals.",
    steps: [
      "Market research and competitive analysis",
      "Technical feasibility assessment",
      "Product requirements definition",
      "Development roadmap creation",
    ],
  },
  {
    id: 2,
    title: "Design & Prototyping",
    description:
      "Our multidisciplinary team creates hardware designs, software architecture, and rapid prototypes using our modular technology platform.",
    steps: [
      "Hardware circuit and mechanical design",
      "Software architecture planning",
      "Rapid prototype development",
      "Initial user testing and feedback",
    ],
  },
  {
    id: 3,
    title: "Development & Integration",
    description:
      "Full-stack development combining proprietary modules with selected components, creating integrated hardware and software solutions.",
    steps: [
      "Hardware development and optimization",
      "Firmware and software development",
      "System integration and testing",
      "Performance validation and refinement",
    ],
  },
  {
    id: 4,
    title: "Certification & Manufacturing",
    description:
      "We handle regulatory compliance, certification processes, and coordinate with our manufacturing partner network for production setup.",
    steps: [
      "Regulatory compliance and certification",
      "Manufacturing partner selection",
      "Production line setup and testing",
      "Quality assurance implementation",
    ],
  },
  {
    id: 5,
    title: "Launch & Scale",
    description:
      "Market deployment with ongoing support, monitoring, and continuous improvement to ensure product success and scalability.",
    steps: [
      "Market launch and deployment",
      "Performance monitoring and analytics",
      "User support and training",
      "Iterative improvements and scaling",
    ],
  },
];

const Process = () => {
  const [activeProcess, setActiveProcess] = useState(1);
  const processRef = useRef<HTMLDivElement>(null);
  const processSectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    processSectionsRef.current = processes.map(
      (_, i) => processSectionsRef.current[i] || null
    );
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          entries[0].target.classList.add("animate-fade-in");
          (entries[0].target as HTMLElement).style.opacity = "1";
          observer.unobserve(entries[0].target);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (processRef.current) {
      observer.observe(processRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;

      let closestSection = null;
      let closestDistance = Infinity;

      processSectionsRef.current.forEach((section, index) => {
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = index;
        }
      });

      if (closestSection !== null) {
        setActiveProcess(closestSection + 1);
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    setTimeout(handleScroll, 100);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="process" className="bg-white py-16">
      <div className="container mx-auto px-4" ref={processRef}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Smart Product Development Process
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our proven 5-phase approach transforms connected product ideas into
            market-ready solutions, combining hardware, software, and production
            expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Process Navigation */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="sticky top-24 space-y-2">
              {processes.map((process) => (
                <button
                  key={process.id}
                  onClick={() => {
                    setActiveProcess(process.id);
                    const el = document.getElementById(`process-${process.id}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className={cn(
                    "w-full text-left p-4 rounded-lg transition-all",
                    activeProcess === process.id
                      ? "bg-gray-100 shadow-sm"
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all",
                        activeProcess === process.id
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {activeProcess > process.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{process.id}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-medium",
                        activeProcess === process.id
                          ? "text-gray-900"
                          : "text-gray-600"
                      )}
                    >
                      {process.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Process Details */}
          <div className="md:col-span-8 lg:col-span-9">
            <div className="space-y-16">
              {processes.map((process) => (
                <div
                  id={`process-${process.id}`}
                  key={process.id}
                  className="scroll-mt-24 transition-all duration-500"
                  ref={(el) => {
                    processSectionsRef.current[process.id - 1] = el;
                  }}
                >
                  <h3 className="text-2xl font-bold mb-4">{process.title}</h3>
                  <p className="text-gray-700 mb-6">{process.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {process.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-100"
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3 text-sm">
                            {idx + 1}
                          </div>
                          <span>{step}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
