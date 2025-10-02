import { ArrowRight, Code, Cpu, Layers, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
const Hero = () => {
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
        duration: 0.8,
      },
    },
  };
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };
  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: "smooth",
      });
    }
  };
  return (
    <motion.div
      className="relative w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="banner-container bg-black relative overflow-hidden h-screen w-full">
        <div className="absolute inset-0 bg-black w-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="https://res.cloudinary.com/dcsrmdeiq/video/upload/so_0/Swim_ydjzfv.jpg"
            className="w-full h-full object-cover opacity-70 grayscale"
          >
            <source
              src="https://res.cloudinary.com/dcsrmdeiq/video/upload/f_auto,q_auto/Swim_ydjzfv.mp4"
              type="video/mp4"
            />
            <source
              src="https://res.cloudinary.com/dcsrmdeiq/video/upload/f_auto,q_auto/Swim_ydjzfv.webm"
              type="video/webm"
            />
            {/* Fallback image */}
            <img
              src="https://res.cloudinary.com/dcsrmdeiq/video/upload/so_0/Swim_ydjzfv.jpg"
              alt="WRLDS Technologies Connected People"
              className="w-full h-full object-cover opacity-70 grayscale"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-white"></div>
        </div>

        <div className="banner-overlay bg-transparent absolute inset-0 flex items-end pb-16 md:pb-20">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="-bottom-0 \xA7">
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight text-left"
              >
                Take care of your body. It’s the only place you have to live.
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-gray-300 mt-4 sm:mt-6 md:text-base text-left"
              >
                7+ years building IoT products that combine hardware
                engineering, software & AI, and production scale.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8"
                variants={itemVariants}
              >
                <button
                  className="min-h-[44px] px-6 sm:px-8 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all shadow-lg hover:shadow-xl hover:shadow-gray-300/20 flex items-center justify-center group text-sm sm:text-base font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    const projectsSection = document.getElementById("projects");
                    if (projectsSection) {
                      projectsSection.scrollIntoView({
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  className="min-h-[44px] px-6 sm:px-8 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:shadow-gray-300/20 flex items-center justify-center group text-sm sm:text-base font-medium"
                  onClick={scrollToContact}
                >
                  Contact Us
                  <MessageSquare className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <motion.div
          className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{
            delay: 0.6,
          }}
        >
          <motion.div
            className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            variants={itemVariants}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 flex items-center justify-center rounded-lg text-gray-500 mb-2 md:mb-3">
              <Cpu className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-800">
              Hardware Engineering
            </h3>
            <p className="text-gray-600 text-xs md:text-sm">
              Circuit design, power management, mechanical engineering, and
              connectivity solutions.
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            variants={itemVariants}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 flex items-center justify-center rounded-lg text-gray-500 mb-2 md:mb-3">
              <Code className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-800">
              Software & AI
            </h3>
            <p className="text-gray-600 text-xs md:text-sm">
              Embedded firmware, cloud platforms, mobile apps, and machine
              learning analytics.
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            variants={itemVariants}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 flex items-center justify-center rounded-lg text-gray-500 mb-2 md:mb-3">
              <Layers className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-800">
              Production & Scale
            </h3>
            <p className="text-gray-600 text-xs md:text-sm">
              Manufacturing partnerships, certification, quality assurance, and
              market deployment.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
export default Hero;
