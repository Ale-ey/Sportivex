import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Users,
  
  CreditCard,
  Bell,
  
  Shield,
  
  
  ArrowRight,
  Activity,
  
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

const AnimatedCounter = ({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const inView = useInView(countRef, {
    once: true,
    margin: "-100px",
  });
  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    let animationFrame: number;
    const startAnimation = (timestamp: number) => {
      startTime = timestamp;
      animate(timestamp);
    };
    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentCount = progress * end;
      setCount(currentCount);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(startAnimation);
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, inView]);
  return (
    <span ref={countRef} className="font-bold tabular-nums">
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const WhyWrlds = () => {
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
    <section
      id="why-wrlds"
      className="relative py-16 md:py-24 bg-white overflow-hidden"
    >
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: "-100px",
          }}
          variants={containerVariants}
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1e40af] mb-3"
          >
            Why Sportivex?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-600 text-lg max-w-3xl mx-auto"
          >
            A smart connection system for athletes with convenient registration, 
            event news, billing, and comprehensive sports complex management
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: "-100px",
          }}
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-[#1e40af]/10 to-[#1e40af]/5 p-6 rounded-xl border border-[#1e40af]/20 text-center hover:shadow-lg transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-[#1e40af] flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-[#1e40af] text-2xl lg:text-3xl font-bold mb-3">
              <AnimatedCounter end={500} suffix="+" /> Athletes
            </h3>
            <p className="text-gray-700">
              Active athletes using our smart connection system for registration, 
              event updates, and billing management
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-[#1e40af]/10 to-[#1e40af]/5 p-6 rounded-xl border border-[#1e40af]/20 text-center hover:shadow-lg transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-[#1e40af] flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-[#1e40af] text-2xl lg:text-3xl font-bold mb-3">
              <AnimatedCounter end={11} suffix="" /> Sports
            </h3>
            <p className="text-gray-700">
              Comprehensive sports modules including swimming, gym, badminton, 
              horse riding, wall climbing, and more
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-[#1e40af]/10 to-[#1e40af]/5 p-6 rounded-xl border border-[#1e40af]/20 text-center hover:shadow-lg transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-[#1e40af] flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-[#1e40af] text-2xl lg:text-3xl font-bold mb-3">
              <AnimatedCounter end={100} suffix="%" />
            </h3>
            <p className="text-gray-700">
              Digital management coverage for all sports complex operations 
              including bookings, payments, and event coordination
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: "-100px",
          }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-[#1e40af] mb-3">
              What Sportivex Gives You
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A comprehensive smart connection system for athletes with convenient 
              registration, event news, billing, and complete sports complex management
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-[#1e40af]/10 to-[#1e40af]/5 p-6 rounded-xl border border-[#1e40af]/20 hover:shadow-lg transition-all"
            >
              <div className="flex items-start">
                <div className="bg-[#1e40af] rounded-full p-3 mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#1e40af] mb-2">
                    Smart Registration System
                  </h4>
                  <p className="text-gray-700">
                    Easy athlete registration with automated membership management 
                    and profile tracking across all sports modules.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-[#1e40af]/10 to-[#1e40af]/5 p-6 rounded-xl border border-[#1e40af]/20 hover:shadow-lg transition-all"
            >
              <div className="flex items-start">
                <div className="bg-[#1e40af] rounded-full p-3 mr-4">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#1e40af] mb-2">
                    Event News & Updates
                  </h4>
                  <p className="text-gray-700">
                    Real-time notifications about competitions, training sessions, 
                    and important announcements for all athletes.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-[#1e40af]/10 to-[#1e40af]/5 p-6 rounded-xl border border-[#1e40af]/20 hover:shadow-lg transition-all"
            >
              <div className="flex items-start">
                <div className="bg-[#1e40af] rounded-full p-3 mr-4">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#1e40af] mb-2">
                    Automated Billing
                  </h4>
                  <p className="text-gray-700">
                    Seamless payment processing with automated invoicing, 
                    subscription management, and financial tracking.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-[#1e40af]/10 to-[#1e40af]/5 p-6 rounded-xl border border-[#1e40af]/20 hover:shadow-lg transition-all"
            >
              <div className="flex items-start">
                <div className="bg-[#1e40af] rounded-full p-3 mr-4">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#1e40af] mb-2">
                    Complete Sports Complex Management
                  </h4>
                  <p className="text-gray-700">
                    Comprehensive online management system for facilities, 
                    equipment, staff coordination, and operational efficiency.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mt-10">
            <Link
              to="/sports"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center px-6 py-3 bg-[#1e40af] text-white rounded-lg hover:bg-blue-900 transition-all group"
            >
              Explore our sports management modules
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyWrlds;
