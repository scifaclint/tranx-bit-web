"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/layout/side-bar";
import HeaderWithBalance from "@/components/layout/header-with-balance";
import TawkToWidget from "@/components/services/twak-to-widget";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

const userData = {
  name: "John Doe",
  email: "john@gmail.com",
  userId: "123",
};

// Generate random starting positions outside the circle
const getRandomStartPosition = () => {
  const angle = Math.random() * Math.PI * 2;
  const distance = 300 + Math.random() * 100;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showLoader, setShowLoader] = useState(true);
  const [floatingCards, setFloatingCards] = useState<
    Array<{ id: number; brand: string; startPos: { x: number; y: number }; timestamp: number }>
  >([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Initialize with 4 cards
    const now = Date.now();
    const initialCards = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      brand: brands[Math.floor(Math.random() * brands.length)],
      startPos: getRandomStartPosition(),
      timestamp: now,
    }));
    setFloatingCards(initialCards);

    let cardIdCounter = 4;
    let cardInterval: NodeJS.Timeout;

    // Add new cards periodically
    cardInterval = setInterval(() => {
      setFloatingCards((prev) => {
        const now = Date.now();
        // Remove cards older than 4 seconds
        const filtered = prev.filter((card) => now - card.timestamp < 4000);
        
        // Add new card
        return [
          ...filtered,
          {
            id: cardIdCounter++,
            brand: brands[Math.floor(Math.random() * brands.length)],
            startPos: getRandomStartPosition(),
            timestamp: now,
          },
        ];
      });
    }, 700);

    // Stop loader after 2.5 seconds
    const timer = setTimeout(() => {
      setShowLoader(false);
      clearInterval(cardInterval);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(cardInterval);
    };
  }, []);

  if (showLoader) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50 overflow-hidden">
        <div className="relative flex items-center justify-center">
          {/* Pulse Rings - Multiple layers */}
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
              initial={{ width: 200, height: 200, opacity: 0 }}
              animate={{
                width: [200, 350, 450],
                height: [200, 350, 450],
                opacity: [0.6, 0.3, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: index * 0.8,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Main Breathing Circle */}
          <motion.div
            className="relative bg-white/90 backdrop-blur-xl rounded-full border-2 border-purple-200 shadow-2xl flex items-center justify-center"
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 20px 60px rgba(147, 51, 234, 0.2)",
                "0 25px 80px rgba(147, 51, 234, 0.3)",
                "0 20px 60px rgba(147, 51, 234, 0.2)",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ width: 200, height: 200 }}
          >
            {/* Center glow effect */}
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Floating Cards - Flying INTO the circle */}
          <AnimatePresence>
            {floatingCards.map((card) => (
              <motion.div
                key={card.id}
                className="absolute w-16 h-16 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 shadow-xl border-2 border-purple-200"
                initial={{
                  x: card.startPos.x,
                  y: card.startPos.y,
                  opacity: 0,
                  scale: 0.3,
                  rotate: Math.random() * 360 - 180,
                }}
                animate={{
                  x: 0,
                  y: 0,
                  opacity: [0, 1, 1, 1, 0],
                  scale: [0.3, 1.1, 1, 0.8, 0.2],
                  rotate: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 3.5,
                  ease: [0.34, 1.56, 0.64, 1],
                  opacity: {
                    times: [0, 0.2, 0.6, 0.8, 1],
                    duration: 3.5,
                  },
                  scale: {
                    times: [0, 0.3, 0.5, 0.8, 1],
                    duration: 3.5,
                  },
                }}
              >
                <Image
                  src={`/brands/${card.brand}.svg`}
                  alt={card.brand}
                  className="w-full h-full object-contain"
                  width={64}
                  height={64}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Content Below Circle */}
          <motion.div
            className="absolute -bottom-28 flex flex-col items-center gap-3 w-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* TranxBit Text */}
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TranxBit
            </h2>

            {/* Loading dots */}
            <div className="flex items-center gap-1.5 mb-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  animate={{
                    y: [-3, 3, -3],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 2.5,
                  ease: "linear",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 
          ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}
          flex flex-col items-start py-10
        `}
      >
        <div className="w-full px-4 sm:px-6 md:px-8">
          <HeaderWithBalance />
          <div className="w-full max-w-6xl mx-auto mt-10 mb-6 sm:mb-8">
            {children}
          </div>
        </div>
      </main>
      {pathname === "/" ? null : (
        <TawkToWidget
          hideOnRoutes={["/login", "/signup", "/auth/*"]}
          user={userData}
        />
      )}
    </div>
  );
}