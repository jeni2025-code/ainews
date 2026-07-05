"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import NewsCard, { Article } from "@/components/NewsCard";
import NotificationToast, { Toast } from "@/components/NotificationToast";
import UserProfileModal from "@/components/UserProfileModal";
import { useProfile } from "@/contexts/ProfileContext";

interface TrendingTopic { topic: string; count: number; }

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CATEGORY_ICONS: Record<string, string> = {
  All: "✨", AI: "🤖", Security: "🔐", Startups: "🚀",
  Programming: "💻", Gadgets: "📱", Science: "🔬", Business: "📈",
};

export default function Home() {
  const { profile, setIsProfileOpen } = useProfile();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Dropdown states
  const [isTrendingOpen, setIsTrendingOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // Ref for click outside
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsTrendingOpen(false);
        setIsCategoryOpen(false);
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dismissToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const triggerCategoryNotifications = useCallback((arts: Article[]) => {
    if (!profile.notificationsEnabled || !profile.selectedCategories.length) return;
    const newToasts: Toast[] = [];
    for (const cat of profile.selectedCategories) {
      const matching = arts.filter(a => a.category === cat);
      if (matching.length > 0) {
        newToasts.push({
          id: `${cat}-${Date.now()}`,
          category: cat,
          title: matching[0].title,
          count: matching.length,
        });
      }
    }
    if (newToasts.length) {
      setToasts(newToasts);
      setTimeout(() => setToasts([]), 7000);
    }
  }, [profile.notificationsEnabled, profile.selectedCategories]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [newsRes, catRes, trendRes] = await Promise.all([
        fetch(`${API}/api/news`),
        fetch(`${API}/api/news/categories`),
        fetch(`${API}/api/news/trending?top_n=12`),
      ]);
      if (!newsRes.ok) throw new Error("Failed to fetch news");
      const newsData = await newsRes.json();
      const catData = catRes.ok ? await catRes.json() : { categories: [] };
      const trendData = trendRes.ok ? await trendRes.json() : { trending: [] };

      setArticles(newsData.data || []);
      setCategories(catData.categories || []);
      setTrending(trendData.trending || []);
      setLastFetch(new Date());
      triggerCategoryNotifications(newsData.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [triggerCategoryNotifications]);

  useEffect(() => { fetchData(); }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Filter articles
  const filtered = articles.filter(a => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleTrendClick = (topic: string) => {
    setSearchQuery(topic);
    setActiveCategory("All");
    setIsTrendingOpen(false);
  };

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    setSearchQuery("");
    setIsCategoryOpen(false);
  };

  const allCategories = ["All", ...categories];

  return (
    <>
      <UserProfileModal />
      {/* Keeping bottom toasts for critical alerts, but moving history to nav if needed later */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />

      <div className="main-layout">
        {/* ── Unified Navbar ── */}
        <nav className="unified-nav" ref={navRef}>
          <div className="nav-container">
            {/* Left: Brand */}
            <div className="nav-brand">
              <span className="brand-icon">⚡</span>
              <span className="brand-name">AI <span className="brand-accent">News Intel</span></span>
            </div>

            {/* Center: Search & Categories */}
            <div className="nav-center hidden md:flex">
              <div className="nav-search">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input-small"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="search-clear-small" onClick={() => setSearchQuery("")}>✕</button>
                )}
              </div>

              <div className="dropdown-container">
                <button 
                  className="nav-dropdown-btn"
                  onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsTrendingOpen(false); }}
                >
                  {CATEGORY_ICONS[activeCategory] || "📰"} {activeCategory} ▾
                </button>
                {isCategoryOpen && (
                  <div className="dropdown-menu">
                    {allCategories.map(cat => (
                      <button 
                        key={cat} 
                        className={`dropdown-item ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => handleCategorySelect(cat)}
                      >
                        <span className="mr-2">{CATEGORY_ICONS[cat] || "📰"}</span> {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="nav-actions">
              <div className="dropdown-container hidden sm:block">
                <button 
                  className="nav-action-btn trending-action-btn"
                  onClick={() => { setIsTrendingOpen(!isTrendingOpen); setIsCategoryOpen(false); }}
                  title="Trending Topics"
                >
                  🔥 <span className="hidden lg:inline ml-1">Trending</span>
                </button>
                {isTrendingOpen && (
                  <div className="dropdown-menu right-0 w-64">
                    <div className="dropdown-header">Trending Now</div>
                    {trending.length === 0 ? (
                      <div className="dropdown-empty">No trends available</div>
                    ) : (
                      trending.map((t, i) => (
                        <button 
                          key={t.topic} 
                          className="dropdown-item flex justify-between"
                          onClick={() => handleTrendClick(t.topic)}
                        >
                          <span><span className="text-gray-500 mr-2">#{i+1}</span> {t.topic}</span>
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{t.count}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              <div className="dropdown-container">
                 <button 
                  className="nav-action-btn relative"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  title="Notifications"
                >
                  🔔
                  {toasts.length > 0 && (
                    <span className="notif-badge">{toasts.length}</span>
                  )}
                </button>
                 {isNotifOpen && (
                  <div className="dropdown-menu right-0 w-72">
                    <div className="dropdown-header">Recent Alerts</div>
                    {toasts.length === 0 ? (
                      <div className="dropdown-empty">No new notifications</div>
                    ) : (
                      toasts.map(t => (
                        <div key={t.id} className="p-3 border-b border-white/5 hover:bg-white/5 text-sm">
                           <div className="font-bold text-blue-400">{t.category}</div>
                           <div className="text-gray-300 truncate">{t.title}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button className="nav-action-btn" onClick={fetchData} title="Refresh News">
                🔄
              </button>

              <button
                className="nav-profile-btn"
                onClick={() => setIsProfileOpen(true)}
                title="Profile Settings"
              >
                {profile.avatar}
              </button>
            </div>
          </div>
          
          {/* Mobile Search/Filter Row (shown only on small screens) */}
          <div className="nav-mobile-row md:hidden">
             <div className="nav-search w-full">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input-small"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                  className="nav-dropdown-btn ml-2"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                >
                  {CATEGORY_ICONS[activeCategory] || "📰"} ▾
              </button>
          </div>
        </nav>

        <main className="app-content">
          {/* ── Minimal Hero ── */}
          <header className="minimal-hero">
            <h1 className="hero-title-small">
              The <span className="gradient-text">Future</span> is Now.
            </h1>
            <p className="hero-subtitle-small">
              Curated tech intelligence powered by AI.
            </p>
            {profile.selectedCategories.length > 0 && (
              <div className="watching-bar-small">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mr-2">Watching</span>
                {profile.selectedCategories.map(c => (
                  <span key={c} className="watching-chip-small">{c}</span>
                ))}
              </div>
            )}
          </header>

          {/* ── Stats Strip ── */}
          {!loading && !error && (
            <div className="stats-strip">
              <span>📰 {articles.length} articles</span>
              <span>•</span>
              <span>🔍 {filtered.length} shown</span>
              {lastFetch && (
                 <>
                   <span>•</span>
                   <span>Last updated: {lastFetch.toLocaleTimeString()}</span>
                 </>
              )}
            </div>
          )}

          {/* ── Content ── */}
          {loading ? (
            <div className="loader-wrap">
              <div className="spinner" />
              <p className="loader-text">Fetching latest AI news…</p>
            </div>
          ) : error ? (
            <div className="error-card">
              <p className="error-title">⚠️ Could not load news</p>
              <p className="error-msg">{error}</p>
              <button className="retry-btn" onClick={fetchData}>Try Again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span>🔭</span>
              <p>No articles match your criteria.</p>
              <button className="retry-btn" onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}>
                Reset View
              </button>
            </div>
          ) : (
            <div className="news-grid">
              {filtered.map((article, i) => (
                <NewsCard key={i} article={article} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
