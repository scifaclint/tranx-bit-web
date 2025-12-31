"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
// import TranxBitLogo from "../design/tranx-bit-logo";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface LoadingAnimationProps {
  logo?: React.ReactNode;
  displayText?: string;
}

// Giftcard brand logos - using your actual brand images
const giftcardBrands = [
  { src: "/brands/logo-amazon.svg", alt: "Amazon" },
  { src: "/brands/apple-11.svg", alt: "Apple" },
  { src: "/brands/google-play-4.svg", alt: "Google Play" },
  { src: "/brands/steam-1.svg", alt: "Steam" },
  { src: "/brands/spotify-logo.svg", alt: "Spotify" },
  { src: "/brands/xbox-3.svg", alt: "Xbox" },
  { src: "/brands/playstation-6.svg", alt: "PlayStation" },
  { src: "/brands/itunes-1.svg", alt: "iTunes" },
  { src: "/brands/ebay.svg", alt: "eBay" },
  { src: "/brands/best-buy.svg", alt: "Best Buy" },
  { src: "/brands/uber-eats.svg", alt: "Uber Eats" },
  { src: "/brands/target.svg", alt: "Target" },
];

// Fixed positions for orbiting logos (spread around the center)
const orbitPositions = [
  { x: 180, y: 0 },
  { x: 127, y: 127 },
  { x: 0, y: 180 },
  { x: -127, y: 127 },
  { x: -180, y: 0 },
  { x: -127, y: -127 },
  { x: 0, y: -180 },
  { x: 127, y: -127 },
  { x: 220, y: 80 },
  { x: -220, y: 80 },
  { x: 220, y: -80 },
  { x: -220, y: -80 },
];

export default function LoadingAnimation({}: LoadingAnimationProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const getLoadingMessage = (pathname: string): string => {
    switch (true) {
      case pathname.startsWith("/auth"):
        return "Authenticating your account...";
      case pathname.startsWith("/dashboard"):
        return "Loading your dashboard...";
      case pathname.startsWith("/buy-giftcards"):
        return "Finding the best deals for you...";
      case pathname.startsWith("/sell-giftcards"):
        return "Preparing your selling dashboard...";
      case pathname.startsWith("/transactions"):
        return "Fetching your transactions...";
      case pathname.startsWith("/profile"):
        return "Loading your profile...";
      case pathname.startsWith("/settings"):
        return "Loading settings...";
      default:
        return "Loading...";
    }
  };

  const loadingMessage = getLoadingMessage(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-linear-to-br from-gray-50 via-blue-50 to-slate-100 dark:from-gray-950 dark:via-blue-950 dark:to-slate-950 flex items-center justify-center z-50 overflow-hidden">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Orbiting Brand Logos */}
      <AnimatePresence>
        {giftcardBrands.map((brand, index) => (
          <motion.div
            key={brand.alt}
            className="absolute"
            initial={{
              opacity: 0,
              scale: 0,
              x: orbitPositions[index].x,
              y: orbitPositions[index].y,
            }}
            animate={{
              opacity: [0, 0.8, 0.8, 0],
              scale: [0, 1, 1, 0],
              x: [orbitPositions[index].x, orbitPositions[index].x * 0.3, 0],
              y: [orbitPositions[index].y, orbitPositions[index].y * 0.3, 0],
            }}
            transition={{
              duration: 3,
              delay: index * 0.25,
              repeat: Infinity,
              repeatDelay: giftcardBrands.length * 0.25,
              ease: "easeInOut",
            }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 flex items-center justify-center">
              <Image
                src={brand.src}
                alt={brand.alt}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Center focal point - subtle glow only */}
      <motion.div
        className="relative z-10 w-4 h-4"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-linear-to-br from-cyan-500 to-blue-500 blur-xl"
          animate={{
            scale: [1, 3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Bottom Loading Section */}
      <motion.div
        className="absolute bottom-12 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Animated dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-linear-to-r from-cyan-500 to-blue-600"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <motion.p
          className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {loadingMessage}
        </motion.p>
      </motion.div>
    </div>
  );
}
