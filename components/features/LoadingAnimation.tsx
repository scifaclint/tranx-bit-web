import { motion } from "framer-motion";
import TranxBitLogo from "../design/tranx-bit-logo";
import { usePathname } from "next/navigation";
interface LoadingAnimationProps {
  logo?: React.ReactNode;
  displayText?: string;
}

export default function LoadingAnimation({ logo }: LoadingAnimationProps) {
  const getLoadingMessage = (pathname: string): string => {
    switch (true) {
      case pathname.startsWith("/auth"):
        return "Authenticating your account";
      default:
        return "Loading...";
    }
  };

  const useLoadingMessage = (): string => {
    const pathname = usePathname();
    return getLoadingMessage(pathname);
  };

  const loadingMessage = useLoadingMessage();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-slate-100 dark:from-gray-950 dark:via-blue-950 dark:to-slate-950 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-8">
        {/* Logo Container with Pulse */}
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Outer glow ring */}
          <motion.div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Logo Box */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-2xl border border-gray-200 dark:border-gray-800">
            {/* Logo - can be passed as prop or default text */}
            {logo || <TranxBitLogo variant="dark" size="medium" />}
          </div>
        </motion.div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-4">
          {/* Animated dots */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ width: "50%" }}
            />
          </div>

          {/* Loading text */}
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-400 font-medium"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {loadingMessage || "Loading..."}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
