import type { Metadata } from "next";
import BuyGiftCardPage from "@/components/pages/buy-giftcard";

export const metadata: Metadata = {
  title: "Buy Gift Cards",
  description: "Purchase a wide range of gift cards (iTunes, Amazon, Steam, etc.) at the best rates with instant delivery.",
};

export default function Page() {
  return <BuyGiftCardPage />;
}
