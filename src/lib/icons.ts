import { 
  Utensils, 
  Home, 
  Car, 
  ShoppingBag, 
  Zap, 
  HeartPulse, 
  Film, 
  Coffee, 
  ShoppingCart,
  Fuel,
  MoreHorizontal,
  LucideIcon
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  "Food": Utensils,
  "Groceries": ShoppingCart,
  "Café": Coffee,
  "Rent": Home,
  "Utilities": Zap,
  "Shopping": ShoppingBag,
  "Transport": Car,
  "Fuel": Fuel,
  "Entertainment": Film,
  "Health": HeartPulse,
  "Other": MoreHorizontal,
};

export const getCategoryIcon = (category: string) => {
  return categoryIcons[category] || MoreHorizontal;
};
