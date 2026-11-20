"use client";

import { useState } from "react";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import { Tag, Plus, X, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useCategoryKeywordsQuery, useCategoriesQuery, useInvalidateData } from "@/hooks/useQueries";
import { getCategoryIcon, getCategoryColor } from "@/lib/icons";

interface CategoryKeywordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string | null;
}

export default function CategoryKeywordsModal({
  isOpen,
  onClose,
  initialCategory,
}: CategoryKeywordsModalProps) {
  const { data: keywordsData, isLoading } = useCategoryKeywordsQuery();
  const { data: categoriesData } = useCategoriesQuery();
  const { invalidateKeywords } = useInvalidateData();

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    return initialCategory || "Food";
  });

  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Combine standard and custom category list
  const categoryList: string[] = Array.from(
    new Set([
      "Food",
      "Travel",
      "Bills & Utilities",
      "Shopping",
      "Entertainment",
      "Health",
      ...(categoriesData?.custom?.map((c: any) => c.name) || []),
    ])
  );

  const currentCategory = categoryList.includes(selectedCategory) ? selectedCategory : categoryList[0] || "Food";
  const color = getCategoryColor(currentCategory);
  const Icon = getCategoryIcon(currentCategory);

  const systemKeywords: string[] = keywordsData?.systemKeywords?.[currentCategory] || [];
  const userKeywords: Array<{ id: string; keyword: string; category: string }> = (
    keywordsData?.userKeywords || []
  ).filter((k: any) => k.category === currentCategory);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newKeywordInput.trim().toLowerCase();
    if (!clean || clean.length < 2) {
      toast.error("Keyword must be at least 2 characters long");
      return;
    }

    setAdding(true);
    try {
      await axios.post("/api/categories/keywords", {
        keyword: clean,
        category: currentCategory,
      });

      toast.success(`Added "${clean}" to ${currentCategory}!`);
      setNewKeywordInput("");
      invalidateKeywords();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add keyword");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteKeyword = async (id: string, keyword: string) => {
    setDeletingId(id);
    try {
      await axios.delete(`/api/categories/keywords/${id}`);
      toast.success(`Removed "${keyword}"`);
      invalidateKeywords();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove keyword");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Category Recognition Keywords" className="max-w-2xl">
      <div className="space-y-6 pt-1">
        {/* Category Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Select Category to View & Edit Keywords
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
            {categoryList.map((cat) => {
              const CatIcon = getCategoryIcon(cat);
              const isSelected = cat === currentCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary/60 hover:bg-secondary text-foreground border border-border"
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Category Header */}
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.bg} ${color.text}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{currentCategory}</h4>
              <p className="text-xs text-muted-foreground">
                {userKeywords.length} custom &amp; {systemKeywords.length} default keywords
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: User's Custom Keywords */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Your Custom Keywords (Private to You)</span>
            </label>
            <span className="text-[11px] text-muted-foreground font-semibold">
              Highest matching priority
            </span>
          </div>

          {/* Add custom keyword form */}
          <form onSubmit={handleAddKeyword} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newKeywordInput}
                onChange={(e) => setNewKeywordInput(e.target.value)}
                placeholder={`Add custom keyword for ${currentCategory} (e.g. "sagar ratna")...`}
                className="w-full bg-secondary border border-border text-foreground text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={adding || !newKeywordInput.trim()}
              className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Add</span>
            </button>
          </form>

          {/* User's custom chips */}
          <div className="min-h-[50px] p-3 rounded-2xl bg-secondary/40 border border-border flex flex-wrap items-center gap-2">
            {userKeywords.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No custom keywords added yet for {currentCategory}. Type above to add one!
              </p>
            ) : (
              userKeywords.map((uk) => (
                <span
                  key={uk.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/25 shadow-xs"
                >
                  <span>{uk.keyword}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteKeyword(uk.id, uk.keyword)}
                    disabled={deletingId === uk.id}
                    className="hover:text-rose-500 rounded-full transition-colors cursor-pointer"
                    title="Remove keyword"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Default System Keywords */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Default System Keywords ({systemKeywords.length})</span>
            </label>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Global baseline recognition
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto p-3 rounded-2xl bg-secondary/20 border border-border flex flex-wrap gap-1.5">
            {isLoading ? (
              <p className="text-xs text-muted-foreground">Loading keywords...</p>
            ) : systemKeywords.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No default keywords for this category.</p>
            ) : (
              systemKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-secondary/80 text-foreground border border-border"
                >
                  {kw}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
