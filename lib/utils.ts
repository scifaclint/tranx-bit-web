import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export function extractErrorMessage(error: any): string {
  // Try to extract validation errors (e.g. { errors: { email: ["..."] } })
  const validationErrors = error?.response?.data?.errors;
  if (validationErrors && typeof validationErrors === "object") {
    // Get the first error array and take its first message
    const firstErrorKey = Object.keys(validationErrors)[0];
    const firstErrorMsg = validationErrors[firstErrorKey]?.[0];
    if (firstErrorMsg) return firstErrorMsg;
  }

  // Fallbacks for other possible error shapes
  return (
    error?.response?.data?.message || // Backend sends { message: "..." }
    error?.response?.data?.error || // Backend sends { error: "..." }
    error?.message ||
    // Manually thrown Error (new Error(...))
    "Something went wrong, please try again"
  );
}