"use client"
import { Plus, Minus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface CartItem {
  id: string;
  brand: string;
  amount: number;
  rate: number;
  condition: string;
  image: string;
  quantity: number;
}

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

export const CartItemCard = ({
  item,
  onQuantityChange,
  onRemove,
}: CartItemCardProps) => {
  const handleMinus = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handlePlus = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const totalValue = (item.rate * item.amount * item.quantity).toFixed(2);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      {/* Card Image */}
      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={item.image}
          alt={`${item.brand} gift card`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Card Info & Controls */}
      <div className="flex-1 min-w-0">
        {/* Brand and Amount */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {item.brand}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-600 font-medium">${item.amount}</span>
              <Badge variant="secondary" className="text-xs">
                {item.condition}
              </Badge>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Rate: ₵{item.rate}/$1
            </div>
          </div>
        </div>

        {/* Quantity Controls and Total */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleMinus}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4 text-gray-700" />
            </button>

            <span className="w-8 text-center font-semibold text-gray-800">
              {item.quantity}
            </span>

            <button
              onClick={handlePlus}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-lg font-bold text-green-600">
              ₵{totalValue}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="w-10 h-10 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors flex-shrink-0"
      >
        <Trash2 className="w-5 h-5 text-red-500" />
      </button>
    </div>
  );
};

// // Example usage
// export default function App() {
//   const [cartItems, setCartItems] = useState<CartItem[]>([
//     {
//       id: "1",
//       brand: "iTunes",
//       amount: 100,
//       rate: 14.5,
//       condition: "E-code",
//       image:
//         "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
//       quantity: 2,
//     },
//     {
//       id: "2",
//       brand: "Amazon",
//       amount: 50,
//       rate: 13.8,
//       condition: "Physical",
//       image:
//         "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400&h=300&fit=crop",
//       quantity: 1,
//     },
//   ]);

//   const handleQuantityChange = (id: string, newQuantity: number) => {
//     setCartItems((items) =>
//       items.map((item) =>
//         item.id === id ? { ...item, quantity: newQuantity } : item
//       )
//     );
//   };

//   const handleRemove = (id: string) => {
//     setCartItems((items) => items.filter((item) => item.id !== id));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-2xl mx-auto space-y-4">
//         <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h2>
//         {cartItems.map((item) => (
//           <CartItemCard
//             key={item.id}
//             item={item}
//             onQuantityChange={handleQuantityChange}
//             onRemove={handleRemove}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }
