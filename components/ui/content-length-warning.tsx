import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ContentLengthWarningProps {
  percentage?: number;
  className?: string;
  type?: 'length' | 'incompatible-models';
  message?: string;
  models?: string[];
}

export function ContentLengthWarning({ 
  percentage, 
  className,
  type = 'length',
  message,
  models = []
}: ContentLengthWarningProps) {
  // Calculate excess percentage
  const excessPercentage = percentage ? Math.round(percentage - 100) : 0;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <div 
        className={cn(
          "flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-3xl text-[14px] backdrop-blur-sm w-full text-orange-500",
          type === 'length' ? (
            percentage && percentage > 100 
              ? " text-orange-600 dark:text-orange-400" 
              : " text-orange-600 dark:text-orange-400"
          ) : "text-orange-500",
          className
        )}
      >
        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
        <span className="text-center text-orange-500">
          {type === 'length' ? (
            <>
              Context length exceeded by <span className="font-medium">{excessPercentage}%</span>. 
              Please reduce your content to continue.
            </>
          ) : (
            <>
              {message || "Some models don't support image uploads: "}
              {models.length > 0 && (
                <span className="font-bold italic"> {models.join(', ')}</span>
              )}
            </>
          )}
        </span>
      </div>
    </motion.div>
  );
}