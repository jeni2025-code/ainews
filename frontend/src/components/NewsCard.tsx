export interface Article {
  title: string;
  url: string;
  source: string;
  published: string;
  summary: string;
  category: string;
  sentiment: "Positive" | "Neutral" | "Negative";
}

function sentimentClass(s: string) {
  if (s === "Positive") return "card-sentiment sentiment-positive";
  if (s === "Negative") return "card-sentiment sentiment-negative";
  return "card-sentiment sentiment-neutral";
}

function formatDate(raw: string) {
  if (!raw) return "";
  try { return new Date(raw).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return raw.slice(0, 16); }
}

export default function NewsCard({ article }: { article: Article }) {
  return (
    <article className="news-card">
      <div className="card-meta">
        <span className="card-source">{article.source}</span>
        <span className="card-category">{article.category}</span>
      </div>

      <a
        className="card-title"
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {article.title}
      </a>

      <p className="card-summary">{article.summary}</p>

      <div className="card-footer">
        <span className="card-date">{formatDate(article.published)}</span>
        <span className={sentimentClass(article.sentiment)}>{article.sentiment}</span>
      </div>
    </article>
  );
}
