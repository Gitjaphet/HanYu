"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, X, Zap } from "lucide-react";
import styles from "./Toast.module.css";

/* ── Types ── */
export type ToastType = "success" | "error" | "info" | "xp";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

/* ── Contexte global léger via un event bus ── */
let _showToast: ((item: Omit<ToastItem, "id">) => void) | null = null;

export function showToast(message: string, type: ToastType = "info") {
  _showToast?.({ message, type });
}

/* ── Icônes par type ── */
const ICONS: Record<ToastType, React.FC<{ size: number }>> = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
  xp:      Zap,
};

/* ── Composant Toast unique ── */
function Toast({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const Icon = ICONS[item.type];

  useEffect(() => {
    /* Entrée */
    const t1 = setTimeout(() => setVisible(true), 10);
    /* Sortie automatique après 3s */
    const t2 = setTimeout(() => { setVisible(false); setTimeout(onClose, 350); }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onClose]);

  return (
    <div
      className={[styles.toast, styles[item.type], visible ? styles.visible : ""].join(" ")}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.icon}><Icon size={16} /></span>
      <span className={styles.msg}>{item.message}</span>
      <button className={styles.close} onClick={() => { setVisible(false); setTimeout(onClose, 350); }} aria-label="Fermer">
        <X size={13} />
      </button>
    </div>
  );
}

/* ── Provider à placer dans le layout ── */
export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((item: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...item, id }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => { _showToast = add; return () => { _showToast = null; }; }, [add]);

  return (
    <div className={styles.wrap} aria-label="Notifications">
      {toasts.map((t) => (
        <Toast key={t.id} item={t} onClose={() => remove(t.id)} />
      ))}
    </div>
  );
}