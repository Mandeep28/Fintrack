"use client";

import Link from "next/link";
import { ShieldAlert, AlertTriangle, ArrowRight, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getCategoryIcon, getCategoryColor } from "@/lib/icons";
import Modal from "@/components/ui/Modal";

interface ExceededCategory {
  category: string;
  budget: number | null;
  spent: number;
  remaining: number | null;
  percentage: number;
}

interface BudgetExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  exceededCategories: ExceededCategory[];
}

export default function BudgetExceededModal({
  isOpen,
  onClose,
  exceededCategories,
}: BudgetExceededModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Budget Exceeded Alerts">
      <div className="space-y-5">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-400">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-300">
              {exceededCategories.length} category limit has been breached
            </p>
            <p className="mt-0.5 text-rose-400/90">
              Your spending has surpassed the allocated monthly target. Review or adjust your limits below.
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {exceededCategories.map((item) => {
            const Icon = getCategoryIcon(item.category);
            const color = getCategoryColor(item.category);
            const overAmount = Math.abs(item.remaining || 0);

            return (
              <div
                key={item.category}
                className="p-4 bg-secondary/40 border border-rose-500/30 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{item.category}</h4>
                    <p className="text-xs text-muted-foreground">
                      Spent: <span className="font-bold text-rose-400">{formatCurrency(item.spent)}</span> / {formatCurrency(item.budget || 0)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl block w-fit ml-auto">
                    +{formatCurrency(overAmount)} over
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    {item.percentage}% of limit
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-bold transition-all"
          >
            Dismiss
          </button>
          <Link
            href="/categories"
            onClick={onClose}
            className="w-full sm:flex-1 py-3.5 px-5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
          >
            <span>Adjust Budgets on Categories Page</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Modal>
  );
}
