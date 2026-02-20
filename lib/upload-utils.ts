import { toast } from "sonner";

export const validateImageSizeAndType = (file: File, maxMB: number = 3): boolean => {
    const MAX_SIZE = maxMB * 1024 * 1024;

    if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
            description: "Please select an image file (e.g., png, jpg, webp)",
        });
        return false;
    }

    if (file.size > MAX_SIZE) {
        toast.error(`Image too large`, {
            description: `Please select an image smaller than ${maxMB}MB`,
        });
        return false;
    }

    return true;
};
