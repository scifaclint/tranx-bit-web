"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
interface TranxBitLoaderProps {
  variant?: "light" | "dark";
  isForm?: boolean;
}

interface TypewriterTextProps {
  text: string;
  onComplete?: () => void;
  isDark?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  onComplete,
  isDark = false,
}) => {
  const [displayText, setDisplayText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 80); // Slightly faster typing (was 120ms)
      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      // Call onComplete when typing finishes
      const completeTimeout = setTimeout(() => {
        onComplete();
      }, 1500); // Wait 1.5s after typing completes before signaling
      return () => clearTimeout(completeTimeout);
    }
  }, [currentIndex, text, onComplete]);

  return (
    <span>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className={`ml-1 ${isDark ? "text-blue-400" : "text-indigo-500"}`}
      >
        |
      </motion.span>
    </span>
  );
};

interface TranxBitLoaderProps {
  variant?: "light" | "dark";
  isForm?: boolean;
}

const brands = [
  "apex-legends-1",
  "apple-11",
  "at-t-4",
  "best-buy",
  "bookingcom-1",
  "calvin-klein-1",
  "ea-sports-2",
  "ebay",
  "gift-card",
  "google-play-4",
  "itunes-1",
  "logo-amazon",
  "playstation-6",
  "razorpay",
  "spotify-logo",
  "steam-1",
  "target",
  "tmall-logo",
  "uber-eats",
  "xbox-3",
];

const headingTexts = [
  "Buy Giftcards Instantly",
  "Sell Your Giftcards at Best Rates",
  "Fast & Secure Transactions",
  "Trusted Giftcard Marketplace",
  "Seamless Gift Card Trading",
];

const TranxBitLoader: React.FC<TranxBitLoaderProps> = ({
  variant = "dark",
  isForm = false,
}) => {
  const isDark = variant === "dark";
  const [currentBrandIndex, setCurrentBrandIndex] = React.useState(0);
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0);
  const [typingComplete, setTypingComplete] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Only render animation elements after mounting on client side
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBrandIndex((prev) => (prev + 1) % brands.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Reset typing complete flag when text index changes
  React.useEffect(() => {
    setTypingComplete(false);
  }, [currentTextIndex]);

  // Handle text cycling based on typing completion
  React.useEffect(() => {
    if (isForm && typingComplete) {
      const nextTimeout = setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % headingTexts.length);
      }, 1500); // Wait 1.5 seconds after typing completes before changing text
      return () => clearTimeout(nextTimeout);
    }
  }, [isForm, typingComplete]);

  const handleTypingComplete = React.useCallback(() => {
    setTypingComplete(true);
  }, []);

  const colors = {
    bg: isDark
      ? "from-slate-950 via-slate-900 to-black"
      : isForm
      ? "bg-gradient-to-br from-blue-50 via-slate-100 to-indigo-100"
      : "from-gray-50 via-white to-gray-100",
    gridLine: isDark
      ? "rgba(255,255,255,0.03)"
      : isForm
      ? "rgba(0,0,0,0.05)"
      : "rgba(0,0,0,0.03)",
    particle: isDark ? "bg-blue-400" : isForm ? "bg-indigo-500" : "bg-blue-600",
    gradient: isDark
      ? "conic-gradient(from 0deg, transparent, #3b82f6, #8b5cf6, transparent)"
      : isForm
      ? "conic-gradient(from 45deg, transparent, #6366f1, #4f46e5, #3730a3, transparent)"
      : "conic-gradient(from 0deg, transparent, #2563eb, #7c3aed, transparent)",
    glowBg: isDark ? "bg-blue-500" : isForm ? "bg-indigo-500" : "bg-blue-600",
    textPrimary: isDark
      ? "text-white"
      : isForm
      ? "text-indigo-800"
      : "text-black",
    textSecondary: isDark
      ? "text-gray-400"
      : isForm
      ? "text-indigo-600"
      : "text-gray-600",
    dotColor: isDark ? "bg-blue-400" : isForm ? "bg-indigo-500" : "bg-blue-600",
    overlayBg: isDark ? "bg-slate-950" : isForm ? "bg-white" : "bg-white",
    cardBg: isDark ? "bg-slate-800/50" : isForm ? "bg-white/70" : "bg-white/80",
    cardBorder: isDark
      ? "border-slate-700"
      : isForm
      ? "border-indigo-200"
      : "border-gray-200",
    cardShadow: isDark
      ? "shadow-md shadow-blue-900/20"
      : isForm
      ? "shadow-lg shadow-indigo-500/20"
      : "shadow-md shadow-gray-200",
  };

  const getOrbitPosition = (index: number, total: number) => {
    const angle = (index / total) * Math.PI * 2;
    const radius = isForm ? 200 : 280;
    // Use parseFloat and toFixed to ensure consistent number formatting between server and client
    return {
      x: parseFloat((Math.cos(angle) * radius).toFixed(3)),
      y: parseFloat((Math.sin(angle) * radius).toFixed(3)),
    };
  };

  const containerClasses = isForm
    ? `w-full min-h-screen ${colors.bg} flex items-center justify-center overflow-hidden relative`
    : `fixed inset-0 bg-gradient-to-br ${colors.bg} flex items-center justify-center overflow-hidden`;

  return (
    <div className={containerClasses}>
      {/* Animated background grid */}
      <div
        className={`absolute inset-0 ${isForm ? "opacity-30" : "opacity-20"}`}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${colors.gridLine} 1px, transparent 1px),
                           linear-gradient(90deg, ${colors.gridLine} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            animation: isMounted
              ? `${
                  isForm ? "gridMoveEnhanced" : "gridMove"
                } 25s linear infinite`
              : "none",
          }}
        />
      </div>
      {/* Orbiting brand logos */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isMounted ? (
          <motion.div
            className="relative w-full h-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {brands.map((brand, index) => {
              const pos = getOrbitPosition(index, brands.length);
              return (
                <motion.div
                  key={brand}
                  className={`absolute top-1/2 left-1/2 ${
                    isForm ? "w-12 h-12" : "w-16 h-16"
                  } ${colors.cardBg} backdrop-blur-sm border ${
                    colors.cardBorder
                  } rounded-xl p-2 ${colors.cardShadow} ${
                    isForm && currentBrandIndex === index
                      ? "ring-2 ring-indigo-400 ring-opacity-50"
                      : ""
                  }`}
                  // Using translateX/Y in className instead of style for consistent hydration
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: currentBrandIndex === index ? 1 : 0.4,
                    scale: currentBrandIndex === index ? 1.2 : 1,
                    x: pos.x - (isForm ? 24 : 32),
                    y: pos.y - (isForm ? 24 : 32),
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 40,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-full h-full relative"
                  >
                    {isForm && currentBrandIndex === index && (
                      <div className="absolute inset-0 bg-indigo-400/20 rounded-lg filter blur-sm animate-pulse"></div>
                    )}
                    <Image
                      src={`/brands/${brand}.svg`}
                      alt={brand}
                      className={`w-full h-full object-contain ${
                        isForm && currentBrandIndex === index
                          ? "drop-shadow-md"
                          : ""
                      }`}
                      height={14}
                      width={14}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="relative w-full h-full"></div>
        )}
      </div>{" "}
      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center">
        {!isForm && isMounted && (
          <>
            {/* Rotating gradient ring - for non-form mode only */}
            <div className={`absolute inset-0 -m-20`}>
              <motion.div
                className="w-full h-full rounded-full"
                style={{
                  background: colors.gradient,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <div
                className={`absolute inset-2 ${colors.overlayBg} rounded-full`}
              />
            </div>

            {/* Pulsing glow effect - for non-form mode only */}
            <motion.div
              className={`absolute inset-0 -m-16`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className={`w-full h-full rounded-full ${colors.glowBg} blur-3xl`}
              />
            </motion.div>
          </>
        )}

        {/* Logo Section */}
        <div className="relative">
          {isForm ? (
            // Form mode: Cleaner logo presentation
            isMounted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center relative"
              >
                {!isDark && (
                  <div className="absolute -z-10 w-80 h-80 -top-40 opacity-20">
                    <motion.div
                      animate={{
                        rotate: 360,
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        rotate: {
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        },
                        opacity: {
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }}
                      className="w-full h-full rounded-full bg-gradient-to-br from-indigo-300 to-blue-400 blur-3xl"
                    />
                  </div>
                )}
                {/* Logo Placeholder - Replace with your actual logo */}
                {/* <TranxBitLogo variant="dark" size="medium" /> */}

                {/* Typing Animation */}
                <div className="h-16 flex items-center justify-center min-w-[300px]">
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={currentTextIndex}
                      className={`text-xl font-semibold ${
                        colors.textPrimary
                      } text-center ${isForm ? "drop-shadow-sm" : ""}`}
                      initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -20, filter: "blur(5px)" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <TypewriterText
                        text={headingTexts[currentTextIndex]}
                        onComplete={handleTypingComplete}
                        isDark={isDark}
                      />
                    </motion.h2>
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="h-16 flex items-center justify-center min-w-[300px]"></div>
              </div>
            )
          ) : // Non-form mode: Original animated logo
          isMounted ? (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg
                width={100}
                height={100}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.circle
                  cx={50}
                  cy={50}
                  r={45}
                  fill={isDark ? "#000" : "#fff"}
                  stroke={isDark ? "#fff" : "#000"}
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <g transform="translate(50, 50)">
                  <motion.rect
                    x={-18}
                    y={-25}
                    width={36}
                    height={5}
                    fill={isDark ? "#fff" : "#000"}
                    rx="2"
                    animate={{ scaleX: [1, 0.9, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <motion.rect
                    x={-2.5}
                    y={-25}
                    width={5}
                    height={30}
                    fill={isDark ? "#fff" : "#000"}
                    rx="2"
                    animate={{ scaleY: [1, 0.95, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  />

                  <motion.path
                    d="M -10 10 L -15 15 L -10 20 M -15 15 L 15 15"
                    stroke={isDark ? "#fff" : "#000"}
                    strokeWidth="2"
                    fill="none"
                    animate={{ x: [-2, 2, -2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <motion.path
                    d="M 10 10 L 15 15 L 10 20"
                    stroke={isDark ? "#fff" : "#000"}
                    strokeWidth="2"
                    fill="none"
                    animate={{ x: [2, -2, 2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </g>
              </svg>
            </motion.div>
          ) : (
            <div className="w-[100px] h-[100px]"></div>
          )}
        </div>

        {/* Content below logo - different based on mode */}
        {!isForm && isMounted && (
          // Loading mode: Show featured brand and connecting message
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBrandIndex}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className={`${colors.cardBg} backdrop-blur-md border ${colors.cardBorder} rounded-lg p-3 shadow-xl`}
                >
                  <Image
                    src={`/brands/${brands[currentBrandIndex]}.svg`}
                    alt={brands[currentBrandIndex]}
                    className="w-12 h-12 object-contain"
                    width={14}
                    height={14}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {isMounted ? (
              <motion.div
                className="mt-20 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className={`text-2xl font-bold ${colors.textPrimary}`}>
                    Tranx
                  </span>
                  <span
                    className={`text-2xl font-bold ${colors.textSecondary}`}
                  >
                    B
                  </span>
                  <span
                    className={`text-2xl font-bold ${colors.textSecondary}`}
                  >
                    $t
                  </span>
                </div>
                {/* <motion.p
                className={`text-sm ${colors.textSecondary} mb-3`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
               
              </motion.p> */}
                <div className="flex items-center justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 ${colors.dotColor} rounded-full`}
                      animate={{
                        y: [-4, 4, -4],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="mt-20 text-center"></div>
            )}
          </>
        )}
      </div>
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes gridMoveEnhanced {
          0% { transform: translate(0, 0); opacity: 0.7; }
          50% { opacity: 1; }
          100% { transform: translate(60px, 60px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default TranxBitLoader;
