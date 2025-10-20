import { ArrowRight, Trophy, Users, Activity, MessageSquare } from "lucide-react";
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

  
  return (
    <motion.div
      className="relative w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="banner-container bg-[#1e40af] relative overflow-hidden h-screen w-full">
        <div className="absolute inset-0 bg-[#1e40af] w-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="https://res.cloudinary.com/dcsrmdeiq/video/upload/so_0/Swim_ydjzfv.jpg"
            className="w-full h-full object-cover opacity-30"
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
              alt="Sportivex Sports Management System"
              className="w-full h-full object-cover opacity-30"
            />
          </video>
          <div className="absolute inset-0 bg-[#1e40af]/80"></div>
        </div>

        <div className="banner-overlay bg-transparent absolute inset-0 flex items-end pb-16 md:pb-20">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <motion.div variants={itemVariants} className="-bottom-0 \xA7">
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight text-left font-bold"
              >
                NUST University Sports Management System
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-gray-200 mt-4 sm:mt-6 md:text-base text-left"
              >
                Comprehensive sports management platform for competitions, training, 
                gym, horse riding, swimming, squash, bowling, badminton and more.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8"
                variants={itemVariants}
              >
                <button
                  className="min-h-[44px] px-6 sm:px-8 py-3 bg-white text-[#1e40af] rounded-md hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/20 flex items-center justify-center group text-sm sm:text-base font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/auth/signin';
                  }}
                >
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  className="min-h-[44px] px-6 sm:px-8 py-3 bg-[#1e40af] text-white rounded-md hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/20 flex items-center justify-center group text-sm sm:text-base font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/auth/signup';
                  }}
                >
                  Sign Up
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
            className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-blue-500/20"
            variants={itemVariants}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1e40af] flex items-center justify-center rounded-lg text-white mb-2 md:mb-3">
              <Trophy className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-[#1e40af]">
              Sports Competitions
            </h3>
            <p className="text-gray-600 text-xs md:text-sm">
              Organize and manage tournaments, leagues, and competitive events
              across all sports disciplines.
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-blue-500/20"
            variants={itemVariants}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1e40af] flex items-center justify-center rounded-lg text-white mb-2 md:mb-3">
              <Users className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-[#1e40af]">
              Training & Coaching
            </h3>
            <p className="text-gray-600 text-xs md:text-sm">
              Professional coaching programs, skill development, and personalized
              training schedules for all sports.
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-blue-500/20"
            variants={itemVariants}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1e40af] flex items-center justify-center rounded-lg text-white mb-2 md:mb-3">
              <Activity className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-[#1e40af]">
              Facility Management
            </h3>
            <p className="text-gray-600 text-xs md:text-sm">
              Complete facility management for gym, swimming pool, courts, and
              all sports infrastructure with real-time monitoring.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
export default Hero;
