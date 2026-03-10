"use client";

import { useRef, useState, useTransition } from "react";
import { addItem } from "@/actions/items";
import type { ItemType } from "@/lib/types";

export default function AddForm({ type }: { type: ItemType }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const accentColor = type === "must" ? "var(--g)" : type === "nice" ? "var(--a)" : "var(--r)";

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text) return;
    startTransition(async () => {
      await addItem(type, text);
      if (inputRef.current) inputRef.current.value = "";
      setOpen(false);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em",
          textTransform: "uppercase", padding: "4px 10px", borderRadius: 3,
          color: "var(--mu)", transition: "color 0.12s, background 0.12s",
        }}
        onMouseEnter={e => { (e.target as HTMLElement).style.color = "var(--tx)"; (e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
        onMouseLeave={e => { (e.target as HTMLElement).style.color = "var(--mu)"; (e.target as HTMLElement).style.background = "none"; }}
      >
        + Add
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: 8, padding: "0 12px 12px" }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={type === "donot" ? "Never do this again..." : "What did you learn?"}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1, background: "var(--bg)",
          border: `1px solid ${accentColor}44`,
          borderRadius: 4, padding: "8px 12px",
          fontFamily: "var(--mono)", fontSize: 12,
          color: type === "donot" ? "#E08080" : "var(--tx)",
          outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={pending}
        style={{
          background: pending ? "rgba(255,255,255,0.05)" : accentColor,
          border: "none", cursor: pending ? "not-allowed" : "pointer",
          borderRadius: 4, padding: "8px 14px",
          fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.1em", color: type === "donot" ? "var(--r)" : "#020C05",
          transition: "background 0.12s",
        }}
      >
        {pending ? "..." : "Save"}
      </button>
    </form>
  );
}
