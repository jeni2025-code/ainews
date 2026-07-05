"use client";

const CATEGORY_ICONS: Record<string, string> = {
  All: "✨", AI: "🤖", Security: "🔐", Startups: "🚀",
  Programming: "💻", Gadgets: "📱", Science: "🔬", Business: "📈",
};

interface CategoryFilterProps {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  const all = ["All", ...categories];
  return (
    <div className="category-filter-bar">
      {all.map(cat => (
        <button
          key={cat}
          id={`cat-btn-${cat.toLowerCase()}`}
          className={`filter-chip ${active === cat ? "filter-chip-active" : ""}`}
          onClick={() => onChange(cat)}
        >
          <span>{CATEGORY_ICONS[cat] || "📰"}</span>
          <span>{cat}</span>
        </button>
      ))}
    </div>
  );
}
