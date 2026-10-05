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
  Compass,
  FileText,
  LucideIcon
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  // Broad Categories
  "Food": Utensils,
  "Travel": Compass,
  "Bills & Utilities": Zap,
  "Shopping": ShoppingBag,
  "Entertainment": Film,
  "Health": HeartPulse,
  "Other": MoreHorizontal,

  // Legacy / Granular mappings for backwards-compatibility
  "Groceries": ShoppingCart,
  "Café": Coffee,
  "Rent": Home,
  "Utilities": Zap,
  "Transport": Car,
  "Fuel": Fuel,
};

export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "Food": { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  "Travel": { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  "Bills & Utilities": { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  "Shopping": { bg: "bg-pink-500/10", text: "text-pink-500", border: "border-pink-500/20" },
  "Entertainment": { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  "Health": { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
  "Other": { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
};

export const getCategoryIcon = (category: string): LucideIcon => {
  return categoryIcons[category] || MoreHorizontal;
};

export const getCategoryColor = (category: string) => {
  return categoryColors[category] || categoryColors["Other"];
};
