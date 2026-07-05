"use client";

interface TrendingTopic {
  topic: string;
  count: number;
}

interface TrendingBarProps {
  topics: TrendingTopic[];
  onTopicClick: (topic: string) => void;
}

export default function TrendingBar({ topics, onTopicClick }: TrendingBarProps) {
  if (!topics.length) return null;

  return (
    <div className="trending-bar">
      <div className="trending-label">
        <span className="trending-fire">🔥</span>
        <span>Trending</span>
      </div>
      <div className="trending-scroll">
        {topics.map((t, i) => (
          <button
            key={t.topic}
            id={`trend-${t.topic}`}
            className="trending-pill"
            onClick={() => onTopicClick(t.topic)}
            title={`${t.count} mentions`}
          >
            <span className="trending-rank">#{i + 1}</span>
            <span>{t.topic}</span>
            <span className="trending-count">{t.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
