"use client";
import { useEffect, useState } from "react";

export interface Toast {
  id: string;
  category: string;
  title: string;
  count: number;
}

interface NotificationToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className="toast-card">
          <div className="toast-icon">🔔</div>
          <div className="toast-body">
            <p className="toast-category">{toast.category} is trending!</p>
            <p className="toast-msg">{toast.count} new articles • Latest: "{toast.title}"</p>
          </div>
          <button className="toast-close" onClick={() => onDismiss(toast.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
