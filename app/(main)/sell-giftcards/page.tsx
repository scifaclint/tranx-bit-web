import type { Metadata } from "next";
import SellGiftCards from "@/components/pages/sell-giftcards";

export const metadata: Metadata = {
  title: "Sell Gift Cards",
  description: "Sell your gift cards for cash instantly. We offer high rates and fast payouts for all major gift card brands.",
};

export default function Page() {
  return (
    <div>
      <SellGiftCards />
    </div>
  );
}
