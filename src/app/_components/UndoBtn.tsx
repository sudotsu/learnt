"use client";

import { useEffect, useTransition } from "react";
import { undoDelete } from "@/actions/items";

export default function UndoBtn({ hasUndo }: { hasUndo: boolean }) {
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && hasUndo) {
        e.preventDefault();
        startTransition(() => undoDelete());
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasUndo]);

  if (!hasUndo) return null;

  return (
    <button
      onClick={() => startTransition(() => undoDelete())}
      disabled={pending}
      title="Undo last delete (Ctrl+Z)"
      style={{
        background: "rgba(240,165,0,0.1)",
        border: "1px solid rgba(240,165,0,0.25)",
        borderRadius: 4, cursor: "pointer",
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 11, fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "var(--a)", padding: "4px 12px",
        transition: "background 0.12s, opacity 0.12s",
        opacity: pending ? 0.5 : 1,
      }}
    >
      ↩ Undo
    </button>
  );
}
