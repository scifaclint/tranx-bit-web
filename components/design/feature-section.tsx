import React from "react";
import {
  CreditCard,
  DollarSign,
  Shield,
  Zap,
  RefreshCw,
  Headphones,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function GiftCardFeatures() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Transactions",
      description:
        "Trade your gift cards in minutes with automated verification and instant payouts. No waiting, no hassle—just fast cash in your account.",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Best Market Rates",
      description:
        "Get competitive rates for your gift cards with real-time pricing. Compare offers instantly and sell at the highest market value available.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Protected",
      description:
        "Trade with confidence using our encrypted platform with fraud detection, secure escrow, and buyer protection for every transaction.",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Multiple Payment Options",
      description:
        "Receive payments via bank transfer, mobile money, PayPal, or crypto. Choose the method that works best for you with zero hassle.",
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "100+ Card Brands Accepted",
      description:
        "Buy and sell gift cards from Amazon, iTunes, Google Play, Steam, Visa, and 100+ more brands. Physical or digital cards welcome.",
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "24/7 Customer Support",
      description:
        "Our dedicated support team is available round the clock to assist you. Get help via chat, email, or phone whenever you need it.",
    },
  ];

  return (
    <div className="py-24 px-8 relative">
      <div
        className="absolute inset-0 bg-contain bg-no-repeat"
        style={{
          backgroundImage: "url(/images/background-image-2.webp)",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.h2
            className="text-5xl font-bold bg-gradient-to-r text-black bg-clip-text mb-6"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", repeat: 0 }}
          >
            Turn Unused Gift Cards into Cash
          </motion.h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-4 font-medium">
            The smartest way to sell gift cards and get paid instantly.
            Competitive rates, secure transactions, and trusted by thousands of
            users daily.
          </p>
          <p className="text-gray-600 text-sm font-medium">
            Trusted by over 10,000 traders worldwide
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              <Card className="h-full p-6 hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm border-blue-50 text-center flex flex-col items-center">
                <CardContent className="p-0 flex flex-col items-center w-full space-y-6">
                  {/* Icon with animation */}
                  <motion.div
                    className="mb-2 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600"
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "#dbeafe",
                      transition: { duration: 0.2 },
                    }}
                  >
                    {feature.icon}
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
