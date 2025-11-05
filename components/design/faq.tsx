import { useState, useRef } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
export default function TranxbitFAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const headingRef = useRef(null);
  const faqRef = useRef(null);
  const cardRef = useRef(null);

  const headingInView = useInView(headingRef, { once: true, margin: "-100px" });
  const faqInView = useInView(faqRef, { once: true, margin: "-50px" });
  const cardInView = useInView(cardRef, { once: true, margin: "-100px" });

  const teamImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      alt: "Team member 1",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      alt: "Team member 2",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop",
      alt: "Team member 3",
    },
  ];

  const faqs = [
    {
      question: "How does Tranxbit work?",
      answer:
        "Tranxbit is a secure platform for buying and selling gift cards. Simply create an account, browse available gift cards or list your own for sale. Our platform connects buyers and sellers, ensuring safe transactions with escrow protection and instant digital delivery.",
    },
    {
      question: "What types of gift cards can I trade?",
      answer:
        "Tranxbit supports a wide variety of gift cards including Amazon, iTunes, Google Play, Steam, Vanilla, eBay, Walmart, Target, and many more. Both physical and digital gift cards are accepted. Check our supported cards page for the complete list.",
    },
    {
      question: "How do I sell my gift cards?",
      answer:
        "To sell your gift cards: 1) Log into your account, 2) Click 'Sell Gift Card', 3) Select the card type and enter the amount, 4) Upload clear images of the card, 5) Set your price, and 6) Submit for verification. Once approved, your card will be listed on our marketplace.",
    },
    {
      question: "How long does it take to receive payment?",
      answer:
        "Once your gift card is purchased and verified by the buyer, payment is typically released within 5-15 minutes. For first-time sellers, there may be a 24-hour verification period. Payments are instantly available in your Tranxbit wallet.",
    },
    {
      question: "What payment methods do you support?",
      answer:
        "Tranxbit supports multiple payment methods including bank transfers, mobile money (MTN, Vodafone, AirtelTigo), PayPal, cryptocurrency (Bitcoin, USDT), and direct wallet-to-wallet transfers within the platform.",
    },
    {
      question: "Are transactions on Tranxbit secure?",
      answer:
        "Yes, absolutely. We use bank-level encryption and escrow services to protect both buyers and sellers. Gift cards are held in escrow until the transaction is verified. We also have a dispute resolution team and fraud detection systems in place.",
    },
    {
      question: "What are the fees for trading?",
      answer:
        "Tranxbit charges a small service fee: 2% for sellers and 1% for buyers. There are no hidden fees. Withdrawal fees vary depending on your chosen payment method, typically ranging from 0-2%.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const faqItemVariants = {
    hidden: {
      opacity: 0,
      x: -30,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Centered heading */}
        <motion.div
          ref={headingRef}
          className="text-center mb-12"
          initial="hidden"
          animate={headingInView ? "visible" : "hidden"}
          variants={headingVariants}
        >
          <h1 className="text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <span className="text-lg">
            Everything you need to know about the us.
          </span>
        </motion.div>

        {/* Card-based questions */}
        <motion.div
          ref={faqRef}
          className="space-y-0"
          initial="hidden"
          animate={faqInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={faqItemVariants}
              className={`overflow-hidden transition-all duration-300 ${
                openIndex !== index ? "" : ""
              } ${index !== 0 ? "border-t border-gray-200 pt-4" : ""}`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-3 py-3 flex items-center justify-between text-left transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Plus className="w-6 h-6 text-blue-600" />
                  )}
                </div>
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
                className="overflow-hidden"
              >
                <div className="px-8 pb-8 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Team Images */}
        <motion.div
          ref={cardRef}
          className="flex justify-center mt-16"
          initial="hidden"
          animate={cardInView ? "visible" : "hidden"}
          variants={cardVariants}
        >
          <div className="w-full max-w-2xl bg-white rounded-lg shadow border border-gray-100">
            <div className="pt-6 pb-6 px-6 text-center">
              {/* Profile Images */}
              <div className="flex justify-center mb-8">
                <div className="flex -space-x-4">
                  {teamImages.map((img, i) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={
                        cardInView
                          ? {
                              opacity: 1,
                              scale: 1,
                            }
                          : {
                              opacity: 0,
                              scale: 0.5,
                            }
                      }
                      transition={{
                        delay: 0.2 + i * 0.1,
                        duration: 0.5,
                      }}
                      className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white overflow-hidden relative"
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Still have questions?
              </h2>

              {/* Subheading */}
              <p className="text-lg text-gray-600 mb-8">
                {`Can't find the answer you're looking for? Please chat to our
                friendly team.`}
              </p>

              {/* Button */}
              <div className="flex justify-center">
                <div className="relative inline-flex items-center justify-center group">
                  <div className="absolute inset-0 duration-1000 opacity-60 transition-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200"></div>
                  <button className="relative bg-gray-900 px-8 py-3 rounded-xl text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30">
                    Get in touch
                    <svg
                      className="ml-2 inline-block stroke-white stroke-2"
                      fill="none"
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      aria-hidden="true"
                    >
                      <path
                        className="transition opacity-0 group-hover:opacity-100"
                        d="M0 5h7"
                      ></path>
                      <path
                        className="transition group-hover:translate-x-[3px]"
                        d="M1 1l4 4-4 4"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
