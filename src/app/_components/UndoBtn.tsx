"use client";

import { useEffect, useState, useTransition } from "react";
import { undoDelete } from "@/actions/items";

export default function UndoBtn({ hasUndo }: { hasUndo: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleUndo() {
    setError(null);
    startTransition(async () => {
      try {
        await undoDelete();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Undo failed.");
        setTimeout(() => setError(null), 3000);
      }
    });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && hasUndo) {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasUndo]);

  if (!hasUndo && !error) return null;

  if (error) {
    return (
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--r)" }}>{error}</span>
    );
  }

  return (
    <button
      onClick={handleUndo}
      disabled={pending}
      title="Undo last delete (Ctrl+Z)"
      style={{
        background: "rgba(240,165,0,0.1)", border: "1px solid rgba(240,165,0,0.25)",
        borderRadius: 4, cursor: "pointer", fontFamily: "var(--mono)",
        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        color: "var(--a)", padding: "4px 12px",
        transition: "background 0.12s, opacity 0.12s", opacity: pending ? 0.5 : 1,
      }}
    >
      ↩ Undo
    </button>
  );
}
