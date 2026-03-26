"use client";

import { useState, useTransition, useRef } from "react";
import { addSubgroup } from "@/actions/items";
import ItemCard from "./ItemCard";
import type { GroupDef, Item, ItemType } from "@/lib/types";

function SubgroupSection({ name, items, searchQuery }: { name: string; items: Item[]; searchQuery: string }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ marginBottom: 2 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          background: "none", border: "none", cursor: "pointer",
          padding: "3px 4px", borderRadius: 3, fontFamily: "var(--mono)",
          fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--dim)", transition: "color 0.12s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--mu)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--dim)")}
      >
        <span style={{
          fontSize: 7, display: "inline-block",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.15s",
        }}>▶</span>
        {name}
        {items.length > 0 && <span style={{ color: "var(--dim)" }}> ({items.length})</span>}
      </button>
      <div className={`accordion-body ${open ? "open" : ""}`}>
        <div className="accordion-inner" style={{ paddingLeft: 10, paddingTop: 3 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 4 }}>
            {items.length === 0
              ? <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", padding: "2px 0 4px" }}>empty</p>
              : items.map(item => <ItemCard key={item.id} item={item} searchQuery={searchQuery} />)
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function NewSubgroupForm({ groupName }: { groupName: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = inputRef.current?.value.trim();
    if (!name) return;
    setError(null);
    startTransition(async () => {
      try {
        await addSubgroup(groupName, name);
        if (inputRef.current) inputRef.current.value = "";
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create subgroup.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em",
          textTransform: "uppercase", padding: "2px 4px", borderRadius: 3,
          color: "var(--dim)", transition: "color 0.12s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--mu)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--dim)")}
      >
        + sub
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 6, alignItems: "center", paddingLeft: 4 }}>
        <input
          ref={inputRef}
          placeholder="Subgroup name..."
          onKeyDown={e => e.key === "Escape" && setOpen(false)}
          style={{
            background: "var(--bg)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 3, padding: "3px 7px", fontFamily: "var(--mono)",
            fontSize: 10, color: "var(--tx)", outline: "none",
          }}
        />
        <button type="submit" disabled={pending} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--mono)", fontSize: 12, color: "var(--g)",
          opacity: pending ? 0.4 : 1,
        }}>{pending ? "·" : "✓"}</button>
        <button type="button" onClick={() => setOpen(false)} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 14, color: "var(--mu)",
        }}>×</button>
      </form>
      {error && <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--r)", paddingLeft: 4 }}>{error}</p>}
    </div>
  );
}

export default function AccordionGroup({ group, items, type, searchQuery }: {
  group: GroupDef; items: Item[]; type: ItemType; searchQuery: string;
}) {
  const [open, setOpen] = useState(true);

  const accentColor = type === "must" ? "var(--g)" : type === "nice" ? "var(--a)" : "var(--r)";
  const ungroupedItems = items.filter(i => !i.subgroup);
  const isEmpty = items.length === 0 && group.subgroups.length === 0;

  return (
    <div style={{ marginBottom: 6 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          padding: "5px 4px", borderRadius: 4, fontFamily: "var(--mono)",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--mu)", transition: "color 0.12s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--tx)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--mu)")}
      >
        <span style={{
          fontSize: 8, color: accentColor, display: "inline-block", flexShrink: 0,
          transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s",
        }}>▶</span>
        {group.name}
        {items.length > 0 && <span style={{ color: "var(--dim)", fontWeight: 400, fontSize: 10 }}> {items.length}</span>}
      </button>

      <div className={`accordion-body ${open ? "open" : ""}`}>
        <div className="accordion-inner">
          <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 14, paddingTop: 2, paddingBottom: 4 }}>
            {group.subgroups.map(sub => (
              <SubgroupSection
                key={sub}
                name={sub}
                items={items.filter(i => i.subgroup === sub)}
                searchQuery={searchQuery}
              />
            ))}
            {ungroupedItems.map(item => <ItemCard key={item.id} item={item} searchQuery={searchQuery} />)}
            {isEmpty && <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)", padding: "2px 0" }}>empty</p>}
            <NewSubgroupForm groupName={group.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
