import { ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageLayout>
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <Link
              to="/"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold mb-6"
            >
              About WRLDS Technologies
            </motion.h1>

            <div className="prose prose-lg max-w-none">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-600 mb-12"
              >
                We're an end-to-end smart product development partner with 7+
                years of experience turning connected product visions into
                market reality.
              </motion.p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-bold">Our Mission</h2>
                  <p className="text-gray-600">
                    At WRLDS Technologies, we transform connected product ideas
                    into market-ready solutions by combining hardware
                    engineering, software & AI development, and production
                    expertise under one roof.
                  </p>
                  <p className="text-gray-600">
                    We believe that the future belongs to intelligent, connected
                    products that enhance human capabilities and improve quality
                    of life across industries.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
                >
                  <h3 className="text-2xl font-bold mb-4">Our Three Pillars</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-700 mt-1 mr-3 flex-shrink-0" />
                      <span>
                        <strong>Hardware Engineering:</strong> Circuit design,
                        mechanical engineering, and connectivity solutions.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-700 mt-1 mr-3 flex-shrink-0" />
                      <span>
                        <strong>Software & AI:</strong> Embedded firmware, cloud
                        platforms, mobile apps, and machine learning.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-700 mt-1 mr-3 flex-shrink-0" />
                      <span>
                        <strong>Production & Scale:</strong> Manufacturing
                        partnerships, certification, and market deployment.
                      </span>
                    </li>
                  </ul>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                  <p className="text-gray-600 mb-4">
                    We started with the ambition to make an inherently scattered
                    and complex IoT development landscape modular, accessible,
                    and available to brands across industries. After
                    successfully raising funding for development, we spent years
                    building our comprehensive technology platform.
                  </p>
                  <p className="text-gray-600 mb-4">
                    The goal was to turn all the scattered hardware and software
                    building blocks into simple modules to be assembled like
                    Lego. During this time we worked with a range of customers,
                    building prototypes and full products to ensure our platform
                    had real-world applicability.
                  </p>
                  <p className="text-gray-600">
                    By 2023, we had reached a technology maturity level that
                    allowed us to work at enterprise scale. Since then, we have
                    successfully launched multiple connected products in market,
                    from sports equipment to safety gear, proving our end-to-end
                    development capabilities.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold mb-6">Our Team</h2>
                <p className="text-gray-600 mb-8">
                  Our diverse team combines expertise in hardware engineering,
                  software development, AI/machine learning, and
                  industry-specific knowledge to deliver comprehensive IoT
                  solutions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      name: "Felix von Heland",
                      role: "CEO and Founder",
                      bio: "Leading WRLDS with a vision to democratize IoT product development across industries.",
                      image:
                        "/lovable-uploads/aa5291bd-2417-4c1e-9a02-0bcc71a92507.png",
                    },
                    {
                      name: "Niek Bijman",
                      role: "Software Lead",
                      bio: "Specializing in cloud infrastructure, APIs, and scalable software architectures.",
                      image:
                        "/lovable-uploads/e502f601-c519-43a8-86f5-5fa89ae50d2f.png",
                    },
                    {
                      name: "Chengjie Li",
                      role: "Hardware Lead",
                      bio: "Expert in embedded systems, circuit design, and hardware-software integration.",
                      image:
                        "/lovable-uploads/3de85ddd-15e1-4216-9697-f91abb9a47ce.png",
                    },
                    {
                      name: "Love",
                      role: "COO",
                      bio: "Overseeing operations and ensuring successful product launches from development to market.",
                      image:
                        "/lovable-uploads/a9bb9110-964a-43b0-a5ab-7162140cd133.png",
                    },
                  ].map((member, i) => (
                    <Card
                      key={i}
                      className="bg-gray-50 border border-gray-100 overflow-hidden"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="w-32 h-32 relative mb-4 rounded-full overflow-hidden">
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover filter grayscale"
                            />
                          </div>
                          <h3 className="font-bold text-lg">{member.name}</h3>
                          <p className="text-gray-500 text-sm mb-2">
                            {member.role}
                          </p>
                          <p className="text-gray-600 text-sm">{member.bio}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-200">
              <Link
                to="/careers"
                className="inline-flex items-center px-5 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all group"
              >
                Join Our Team
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default About;
