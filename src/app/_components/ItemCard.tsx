"use client";

import { useState, useTransition, useRef } from "react";
import { editItem } from "@/actions/items";
import DeleteBtn from "./DeleteBtn";
import type { Item } from "@/lib/types";

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} style={{ background: "rgba(240,165,0,0.28)", color: "inherit", borderRadius: 2, padding: "0 1px" }}>
            {part}
          </mark>
        ) : part
      )}
    </>
  );
}

export default function ItemCard({ item, searchQuery = "" }: { item: Item; searchQuery?: string }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const isDonot = item.type === "donot";

  const cardStyle: React.CSSProperties = {
    background: "var(--s2)", borderRadius: 5, padding: "14px 18px",
    border: isDonot ? "1px solid rgba(212,80,80,0.1)" : "1px solid rgba(255,255,255,0.04)",
    borderLeft: isDonot ? "2px solid rgba(212,80,80,0.4)" : undefined,
  };

  const textColor = isDonot ? "#E08080" : "var(--tx)";
  const accentColor = isDonot ? "var(--r)" : "var(--g)";

  function handleEdit() {
    setError(null);
    setEditing(true);
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 50);
  }

  function handleSave() {
    const text = inputRef.current?.value.trim();
    if (!text || text === item.text) { setEditing(false); return; }
    startTransition(async () => {
      try {
        await editItem(item.type, item.id, text);
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") { setEditing(false); setError(null); }
  }

  if (editing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div className="item" style={cardStyle}>
          <input
            ref={inputRef}
            defaultValue={item.text}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, background: "var(--bg)", border: `1px solid ${accentColor}55`,
              borderRadius: 4, padding: "6px 10px", fontFamily: "var(--mono)",
              fontSize: 13, color: textColor, outline: "none", lineHeight: 1.65,
            }}
          />
          <button onClick={handleSave} disabled={pending} title="Save" style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "var(--mono)", fontSize: 14, color: "var(--g)",
            padding: "0 3px", flexShrink: 0, opacity: pending ? 0.4 : 1, transition: "opacity 0.12s",
          }}>
            {pending ? "·" : "✓"}
          </button>
          <button onClick={() => { setEditing(false); setError(null); }} title="Cancel" style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 16, color: "var(--mu)", padding: "0 2px", flexShrink: 0,
          }}>×</button>
        </div>
        {error && <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--r)", paddingLeft: 4 }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="item" style={cardStyle}>
      <p style={{ flex: 1, fontSize: 15, lineHeight: 1.65, color: textColor, fontWeight: 400 }}>
        <Highlight text={item.text} query={searchQuery} />
      </p>
      <button onClick={handleEdit} title="Edit" className="edit-btn" style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--mu)", fontSize: 13, lineHeight: 1,
        padding: "0 3px", flexShrink: 0, opacity: 0, transition: "opacity 0.12s, color 0.12s",
      }}>✎</button>
      <DeleteBtn type={item.type} id={item.id} />
    </div>
  );
}
