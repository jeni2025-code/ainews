"use client";

import { useEffect, useState, useCallback } from "react";
import NewsCard, { Article } from "@/components/NewsCard";
import CategoryFilter from "@/components/CategoryFilter";
import TrendingBar from "@/components/TrendingBar";
import NotificationToast, { Toast } from "@/components/NotificationToast";
import UserProfileModal from "@/components/UserProfileModal";
import { useProfile } from "@/contexts/ProfileContext";

interface TrendingTopic { topic: string; count: number; }

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  };

  return (
    <>
      <UserProfileModal />
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />

      <main className="app-shell">
        {/* ── Navbar ── */}
        <nav className="navbar">
          <div className="navbar-brand">
            <span className="brand-icon">⚡</span>
            <span className="brand-name">AI <span className="brand-accent">News Intel</span></span>
          </div>
          <div className="navbar-right">
            {lastFetch && (
              <span className="last-updated">Updated {lastFetch.toLocaleTimeString()}</span>
            )}
            <button id="refresh-btn" className="icon-btn" onClick={fetchData} title="Refresh">
              🔄
            </button>
            <button
              id="profile-btn"
              className="profile-avatar-btn"
              onClick={() => setIsProfileOpen(true)}
              title="Open profile"
            >
              <span className="avatar-emoji">{profile.avatar}</span>
              <span className="avatar-name">{profile.name}</span>
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <header className="hero">
          <div className="hero-badge">🤖 AI-Powered Curation</div>
          <h1 className="hero-title">
            Stay Ahead of the <span className="gradient-text">Curve</span>
          </h1>
          <p className="hero-subtitle">
            Real-time AI news intelligence — curated, categorised, and trending topics at a glance.
          </p>
          {profile.selectedCategories.length > 0 && (
            <div className="watching-bar">
              <span>🔔 Watching:</span>
              {profile.selectedCategories.map(c => (
                <span key={c} className="watching-chip">{c}</span>
              ))}
            </div>
          )}
        </header>

        {/* ── Trending Bar ── */}
        <TrendingBar topics={trending} onTopicClick={handleTrendClick} />

        {/* ── Search + Filter ── */}
        <div className="controls-row">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              id="search-input"
              className="search-input"
              placeholder="Search articles…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>
        </div>

        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onChange={cat => { setActiveCategory(cat); setSearchQuery(""); }}
        />

        {/* ── Stats Strip ── */}
        {!loading && !error && (
          <div className="stats-strip">
            <span>📰 {articles.length} articles</span>
            <span>•</span>
            <span>🗂 {categories.length} categories</span>
            <span>•</span>
            <span>🔍 {filtered.length} shown</span>
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
            <p>No articles match your filter.</p>
            <button className="retry-btn" onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}>
              Clear Filters
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
    </>
  );
}
