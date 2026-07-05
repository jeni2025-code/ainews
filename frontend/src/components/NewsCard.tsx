import React from "react";

export interface Article {
  title: string;
  url: string;
  source: string;
  published: string;
  summary: string;
  category: string;
  sentiment: string;
}

interface NewsCardProps {
  article: Article;
}

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="news-card block p-6 rounded-2xl flex flex-col h-full cursor-pointer no-underline text-inherit"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
          {article.category}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(article.published).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>
      
      <h3 className="text-xl font-bold mb-3 leading-tight text-white group-hover:text-blue-400 transition-colors">
        {article.title}
      </h3>
      
      <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
        {article.summary}
      </p>
      
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center text-xs text-gray-500 font-medium">
          <span className="w-5 h-5 rounded-full bg-white/10 mr-2 flex items-center justify-center text-white/50 text-[10px]">
            {article.source.charAt(0)}
          </span>
          {article.source}
        </div>
        
        <span className={`text-xs px-2 py-1 rounded-md ${
          article.sentiment === 'Positive' ? 'bg-green-500/10 text-green-400' :
          article.sentiment === 'Negative' ? 'bg-red-500/10 text-red-400' :
          'bg-gray-500/10 text-gray-400'
        }`}>
          {article.sentiment}
        </span>
      </div>
    </a>
  );
}
