"use client";
import { useProfile } from "@/contexts/ProfileContext";

const ALL_CATEGORIES = ["AI", "Security", "Startups", "Programming", "Gadgets", "Science", "Business"];

const CATEGORY_ICONS: Record<string, string> = {
  AI: "🤖", Security: "🔐", Startups: "🚀", Programming: "💻",
  Gadgets: "📱", Science: "🔬", Business: "📈",
};

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function UserProfileModal() {
  const { profile, updateProfile, AVATARS, isProfileOpen, setIsProfileOpen } = useProfile();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subMsg, setSubMsg] = useState("");

  if (!isProfileOpen) return null;

  const toggleCategory = (cat: string) => {
    const current = profile.selectedCategories;
    const updated = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    updateProfile({ selectedCategories: updated });
  };

  const handleSubscribe = async () => {
    if (!profile.email || !profile.email.includes("@")) {
      setSubMsg("Please enter a valid email.");
      return;
    }
    setIsSubscribing(true);
    try {
      const res = await fetch(`${API}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubMsg("Subscribed successfully! 🎉");
        updateProfile({ isSubscribed: true });
      } else {
        setSubMsg(data.detail || "Subscription failed.");
      }
    } catch (e) {
      setSubMsg("Network error.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsProfileOpen(false)}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">My Profile</h2>
          <button className="modal-close" onClick={() => setIsProfileOpen(false)}>✕</button>
        </div>

        {/* Avatar picker */}
        <div className="profile-section">
          <label className="section-label">Choose Avatar</label>
          <div className="avatar-grid">
            {AVATARS.map(av => (
              <button
                key={av}
                className={`avatar-btn ${profile.avatar === av ? "avatar-selected" : ""}`}
                onClick={() => updateProfile({ avatar: av })}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="profile-section">
          <label className="section-label" htmlFor="profile-name">Display Name</label>
          <input
            id="profile-name"
            className="profile-input"
            value={profile.name}
            onChange={e => updateProfile({ name: e.target.value })}
            placeholder="Enter your name"
          />
        </div>

        {/* Category preferences */}
        <div className="profile-section">
          <label className="section-label">Favorite Categories</label>
          <p className="section-hint">Selected categories will trigger trend alerts</p>
          <div className="category-grid">
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`cat-chip ${profile.selectedCategories.includes(cat) ? "cat-chip-active" : ""}`}
                onClick={() => toggleCategory(cat)}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications toggle */}
        <div className="profile-section notification-row">
          <div>
            <p className="section-label">Trend Notifications</p>
            <p className="section-hint">Get alerts when trending topics match your categories</p>
          </div>
          <button
            className={`toggle-btn ${profile.notificationsEnabled ? "toggle-on" : "toggle-off"}`}
            onClick={() => updateProfile({ notificationsEnabled: !profile.notificationsEnabled })}
          >
            {profile.notificationsEnabled ? "ON" : "OFF"}
          </button>
        </div>

        {/* Daily Newsletter */}
        <div className="profile-section" style={{ background: "rgba(255,255,255,0.02)", padding: "1.25rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <label className="section-label" style={{ color: "#63b3ed" }}>💌 Daily Newsletter</label>
          <p className="section-hint mb-2">Get the top curated AI news delivered to your inbox every morning.</p>
          
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <input
              type="email"
              className="profile-input"
              value={profile.email}
              onChange={e => updateProfile({ email: e.target.value })}
              placeholder="Enter your email address"
              disabled={profile.isSubscribed}
              style={{ flex: 1 }}
            />
            <button 
              onClick={handleSubscribe}
              disabled={isSubscribing || profile.isSubscribed}
              style={{
                background: profile.isSubscribed ? "rgba(72,187,120,0.15)" : "#2563eb",
                color: profile.isSubscribed ? "#48bb78" : "white",
                border: profile.isSubscribed ? "1px solid rgba(72,187,120,0.3)" : "none",
                borderRadius: "8px",
                padding: "0 1rem",
                fontWeight: 700,
                cursor: (isSubscribing || profile.isSubscribed) ? "default" : "pointer",
                opacity: isSubscribing ? 0.7 : 1,
              }}
            >
              {isSubscribing ? "..." : profile.isSubscribed ? "Subscribed ✓" : "Subscribe"}
            </button>
          </div>
          {subMsg && <p style={{ fontSize: "0.75rem", marginTop: "0.5rem", color: subMsg.includes("🎉") ? "#48bb78" : "#fc8181" }}>{subMsg}</p>}
        </div>

        <button className="save-btn" onClick={() => setIsProfileOpen(false)}>
          Save & Close
        </button>
      </div>
    </div>
  );
}
