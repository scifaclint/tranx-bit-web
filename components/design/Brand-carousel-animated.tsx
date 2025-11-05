"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function BrandCarousel() {
  // Array of brand images from the public folder
  const brands = [
    {
      name: "Amazon",
      logo: "/brands/logo-amazon.svg",
      width: 120,
      height: 36,
    },
    {
      name: "Apple",
      logo: "/brands/apple-11.svg",
      width: 40,
      height: 46,
    },
    {
      name: "Google Play",
      logo: "/brands/google-play-4.svg",
      width: 120,
      height: 40,
    },
    {
      name: "PlayStation",
      logo: "/brands/playstation-6.svg",
      width: 120,
      height: 30,
    },
    {
      name: "Spotify",
      logo: "/brands/spotify-logo.svg",
      width: 120,
      height: 36,
    },
    {
      name: "Steam",
      logo: "/brands/steam-1.svg",
      width: 120,
      height: 36,
    },
    {
      name: "Target",
      logo: "/brands/target.svg",
      width: 50,
      height: 50,
    },
    {
      name: "Uber Eats",
      logo: "/brands/uber-eats.svg",
      width: 120,
      height: 36,
    },
    {
      name: "Xbox",
      logo: "/brands/xbox-3.svg",
      width: 120,
      height: 36,
    },
  ];

  // Double the brands array for a seamless infinite scroll effect
  const doubledBrands = [...brands, ...brands];

  return (
    <div className="w-full py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header with title and vertical lines */}
        <div className="text-center mb-16 relative">
          {/* Left vertical line */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-20 w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent hidden md:block"></div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            All Your Favorite Gift Cards, One Secure Marketplace.
          </motion.h2>

          {/* Right vertical line */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-20 w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent hidden md:block"></div>
        </div>

        {/* Brand carousel with infinite animation */}
        <div className="relative">
          {/* Inner container with overflow hidden for the animation */}
          <div className="w-full overflow-hidden">
            <motion.div
              className="flex items-center gap-16 py-6"
              animate={{
                x: [0, -50 * brands.length], // Move from 0 to the negative width of all brands
              }}
              transition={{
                x: {
                  duration: 35, // Slow, subtle movement
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop",
                },
              }}
            >
              {doubledBrands.map((brand, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  whileHover={{
                    scale: 1.1,
                    y: -5,
                  }}
                >
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={brand.width}
                    height={brand.height}
                    className="object-contain"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Fade gradient on the left */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>

          {/* Fade gradient on the right */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
        </div>
      </div>
    </div>
  );
}
