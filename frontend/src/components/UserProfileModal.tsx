"use client";
import { useProfile } from "@/contexts/ProfileContext";

const ALL_CATEGORIES = ["AI", "Security", "Startups", "Programming", "Gadgets", "Science", "Business"];

const CATEGORY_ICONS: Record<string, string> = {
  AI: "🤖", Security: "🔐", Startups: "🚀", Programming: "💻",
  Gadgets: "📱", Science: "🔬", Business: "📈",
};

export default function UserProfileModal() {
  const { profile, updateProfile, AVATARS, isProfileOpen, setIsProfileOpen } = useProfile();

  if (!isProfileOpen) return null;

  const toggleCategory = (cat: string) => {
    const current = profile.selectedCategories;
    const updated = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    updateProfile({ selectedCategories: updated });
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

        <button className="save-btn" onClick={() => setIsProfileOpen(false)}>
          Save & Close
        </button>
      </div>
    </div>
  );
}
