"use client";

import { useEffect, useState } from "react";
import NewsCard, { Article } from "@/components/NewsCard";

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("http://localhost:8000/api/news");
        if (!res.ok) throw new Error("Failed to fetch news");
        const data = await res.json();
        setArticles(data.data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    
    fetchNews();
  }, []);

  return (
    <main className="min-h-screen p-8 md:p-16 lg:p-24 max-w-7xl mx-auto">
      <header className="mb-16 text-center md:text-left">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
          AI <span className="gradient-text">News Intel</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl">
          Automated curation of the tech world's most important stories, analyzed and summarized by AI in real-time.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center">
          <p className="font-semibold text-lg">Error loading news</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <NewsCard key={index} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}
