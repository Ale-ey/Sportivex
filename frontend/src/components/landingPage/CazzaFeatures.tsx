import { motion } from "framer-motion";
import {
  Database,
  Zap,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Loader2,
  BarChart3,
  Smartphone,
} from "lucide-react";

const CazzaFeatures = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  const features = [
    {
      icon: Database,
      title: "Break Down Data Silos",
      description:
        "Stop logging into five different dashboards. We centralize your Amazon Seller Central, TikTok Shop, and Shopify data into one single source of truth.",
      step: 1,
      visual: "logos",
    },
    {
      icon: Zap,
      title: "Automate the Grunt Work",
      description:
        "Cazza automates the heavy lifting of reconciliation. We map every penny of revenue and expense to Xero, ensuring your books are tax-ready 24/7.",
      step: 2,
      visual: "processing",
    },
    {
      icon: MessageSquare,
      title: "Your 24/7 AI CFO",
      description:
        "Don't wait days for your accountant to reply to an email. Your AI assistant is always awake, trained on UK tax laws and e-commerce nuance, ready to answer complex queries.",
      step: 3,
      visual: "chat",
    },
    {
      icon: TrendingUp,
      title: "Scale With Confidence",
      description:
        "Understand your true unit economics. Spot unprofitable SKUs instantly and double down on winners with financial visibility previously reserved for 7-figure sellers.",
      step: 4,
      visual: "dashboard",
    },
  ];

  return (
    <section
      id="cazza-features"
      className="relative py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white overflow-hidden"
    >
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            One Platform. Zero Headaches.
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-600 text-lg max-w-3xl mx-auto"
          >
            Centralize your e-commerce finances, automate reconciliation, and get
            instant answers from your AI CFO
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={itemVariants}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                {/* Step Number & Icon */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {feature.step}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                  </div>
                </div>

                <p className="text-gray-600 text-base md:text-lg mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Visual Representation */}
                <div className="mt-6 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 min-h-[200px] flex items-center justify-center relative">
                  {feature.visual === "logos" && (
                    <div className="flex items-center justify-center gap-4 md:gap-6 p-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white shadow-lg flex items-center justify-center border-2 border-orange-200"
                      >
                        <span className="text-xs md:text-sm font-bold text-orange-600">
                          Amazon
                        </span>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"
                      />
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, type: "spring" }}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white shadow-lg flex items-center justify-center border-2 border-pink-200"
                      >
                        <span className="text-xs md:text-sm font-bold text-pink-600">
                          TikTok
                        </span>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"
                      />
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1, type: "spring" }}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white shadow-lg flex items-center justify-center border-2 border-green-200"
                      >
                        <span className="text-xs md:text-sm font-bold text-green-600">
                          Xero
                        </span>
                      </motion.div>
                    </div>
                  )}

                  {feature.visual === "processing" && (
                    <div className="p-6 w-full">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Loader2 className="w-12 h-12 text-blue-500" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                              initial={{ width: "0%" }}
                              whileInView={{ width: "100%" }}
                              viewport={{ once: true }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <div className="h-3 bg-gray-300 rounded mb-1"></div>
                          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <div className="h-3 bg-gray-300 rounded mb-1"></div>
                          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1 }}
                        className="mt-4 text-center"
                      >
                        <BarChart3 className="w-16 h-16 text-green-500 mx-auto" />
                        <p className="text-sm text-gray-600 mt-2">Clean Data</p>
                      </motion.div>
                    </div>
                  )}

                  {feature.visual === "chat" && (
                    <div className="p-6 w-full max-w-md mx-auto">
                      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">AI CFO Assistant</span>
                          </div>
                        </div>
                        <div className="p-4 space-y-3 min-h-[150px]">
                          <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">AI</span>
                            </div>
                            <div className="flex-1 bg-gray-100 rounded-lg p-3">
                              <p className="text-sm text-gray-700">
                                How can I help you with your e-commerce finances today?
                              </p>
                            </div>
                          </div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="flex gap-2 justify-end"
                          >
                            <div className="flex-1 bg-blue-500 rounded-lg p-3 max-w-[80%]">
                              <motion.div
                                animate={{ width: ["0%", "100%"] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-sm text-white"
                              >
                                What's my profit margin for...
                              </motion.div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  )}

                  {feature.visual === "dashboard" && (
                    <div className="p-6 w-full">
                      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">Net Profit</h4>
                          <Smartphone className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">This Month</span>
                            <span className="text-lg font-bold text-green-600">£12,450</span>
                          </div>
                          <motion.div
                            className="h-32 bg-gradient-to-t from-green-100 to-green-50 rounded-lg p-4 flex items-end"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                          >
                            <div className="w-full flex items-end justify-between gap-1">
                              {[40, 55, 45, 70, 60, 80, 90].map((height, i) => (
                                <motion.div
                                  key={i}
                                  className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                                  initial={{ height: 0 }}
                                  whileInView={{ height: `${height}%` }}
                                  viewport={{ once: true }}
                                  transition={{ delay: i * 0.1, duration: 0.5 }}
                                />
                              ))}
                            </div>
                          </motion.div>
                          <div className="flex items-center gap-2 mt-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600 font-semibold">
                              +23% from last month
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="mt-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default CazzaFeatures;


