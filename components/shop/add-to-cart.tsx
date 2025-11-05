import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
interface Card {
  brand: string;
  amount: number;
  rate: number;
  condition: string;
  image: string;
}

interface GiftCardItemProps {
  card: Card;
}

export const AddtoCartItems = ({ card }: GiftCardItemProps) => {
  const [quantity, setQuantity] = useState<number>(1);

  const handleMinus = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handlePlus = () => {
    setQuantity(quantity + 1);
  };

  const totalValue = (card.rate * card.amount * quantity).toFixed(2);

  return (
    <div className="w-80 bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Card Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Image
          src={card.image}
          alt={`${card.brand} gift card`}
          className="w-full h-full object-cover"
          layout="fill"
        />

        {/* Denomination Badge - Bottom Right */}
        <Badge className="absolute bottom-3 right-3 bg-white text-gray-900 hover:bg-white text-lg font-bold px-4 py-2 shadow-lg">
          ${card.amount}
        </Badge>

        {/* Condition Badge - Top Right */}
        <Badge className="absolute top-3 right-3 bg-black/60 text-white hover:bg-black/60 backdrop-blur-sm">
          {card.condition}
        </Badge>
      </div>

      {/* Card Details */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">Exchange Rate</div>
            <div className="text-lg font-bold text-gray-800">
              ₵{card.rate}/$1
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{`You'll receive`}</div>
            <div className="text-lg font-bold text-green-600">
              ₵{totalValue}
            </div>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleMinus}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <Minus className="w-5 h-5 text-gray-700" />
          </button>

          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>

          <button
            onClick={handlePlus}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Quantity Display */}
        <div className="text-center text-sm text-gray-600">
          Quantity:{" "}
          <span className="font-semibold text-gray-800">{quantity}</span>
        </div>
      </div>
    </div>
  );
};

// Example usage
// export default function App() {
//   const sampleCard = {
//     brand: "iTunes",
//     amount: 100,
//     rate: 14.5,
//     condition: "E-code",
//     image:
//       "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop", // Placeholder - replace with actual card image
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
//       <GiftCardItem card={sampleCard} />
//     </div>
//   );
// }
