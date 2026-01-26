import { toast } from "sonner";

export const validateImageSizeAndType = (file: File): boolean => {
    const MAX_SIZE = 3 * 1024 * 1024; // 3MB

    if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
            description: "Please select an image file (e.g., png, jpg, webp)",
        });
        return false;
    }

    if (file.size > MAX_SIZE) {
        toast.error("Image too large", {
            description: "Please select an image smaller than 3MB",
        });
        return false;
    }

    return true;
};
