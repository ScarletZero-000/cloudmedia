"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TriangleAlert } from "lucide-react";

export type ConfirmState = {
  title: string;
  body?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
} | null;

// Styled replacement for window.confirm — hard-edged editorial dialog.
// Usage: const [confirmState, setConfirmState] = useState<ConfirmState>(null);
// <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
export default function ConfirmDialog({
  state,
  onClose,
}: {
  state: ConfirmState;
  onClose: () => void;
}) {
  // close on Escape
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, onClose]);

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/70 p-4"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm border-2 border-ink bg-paper-raised shadow-[6px_6px_0_0_#0c0c0c]"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            <div className={`flex items-start gap-3 border-b-2 p-5 ${state.danger ? "border-accent bg-accent/5" : "border-ink bg-paper-dim"}`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 ${state.danger ? "border-accent text-accent" : "border-ink text-ink"}`}>
                <TriangleAlert className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="heading-classic text-lg">{state.title}</h2>
                {state.body && <p className="mt-1 text-sm text-ink-soft">{state.body}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5">
              <button onClick={onClose} className="btn-ghost px-4 py-2 text-xs">
                Cancel
              </button>
              <button
                autoFocus
                onClick={() => {
                  state.onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-xs font-bold transition-all ${state.danger ? "btn-accent" : "btn-classic"}`}
              >
                {state.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
