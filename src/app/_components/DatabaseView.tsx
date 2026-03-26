"use client";

import { useState, useTransition, useRef } from "react";
import { addGroup } from "@/actions/items";
import AddForm from "./AddForm";
import AccordionGroup from "./AccordionGroup";
import UndoBtn from "./UndoBtn";
import type { Data, GroupDef, Item, ItemType } from "@/lib/types";

const CSS = `
  .item { display: flex; align-items: flex-start; gap: 10px; }
  .item:hover .del-btn  { opacity: 1 !important; color: var(--r) !important; }
  .item:hover .edit-btn { opacity: 0.5 !important; }
  .item:hover .edit-btn:hover { opacity: 1 !important; color: var(--tx) !important; }
  @media (max-width: 900px) {
    .columns { grid-template-columns: 1fr !important; }
  }
`;

function filterItems(items: Item[], query: string): Item[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(i =>
    i.text.toLowerCase().includes(q) ||
    i.group.toLowerCase().includes(q) ||
    (i.subgroup?.toLowerCase().includes(q))
  );
}

function NewGroupForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = inputRef.current?.value.trim();
    if (!name) return;
    startTransition(async () => {
      await addGroup(name);
      if (inputRef.current) inputRef.current.value = "";
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em",
          textTransform: "uppercase", padding: "4px 6px", borderRadius: 3,
          color: "var(--dim)", transition: "color 0.12s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--mu)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--dim)")}
      >
        + group
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 6, alignItems: "center", padding: "4px 0" }}>
      <input
        ref={inputRef}
        placeholder="Group name..."
        onKeyDown={e => e.key === "Escape" && setOpen(false)}
        style={{
          flex: 1, background: "var(--bg)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 4, padding: "5px 10px",
          fontFamily: "var(--mono)", fontSize: 11,
          color: "var(--tx)", outline: "none",
        }}
      />
      <button type="submit" disabled={pending} style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "var(--mono)", fontSize: 13, color: "var(--g)",
        opacity: pending ? 0.4 : 1,
      }}>
        {pending ? "·" : "✓"}
      </button>
      <button type="button" onClick={() => setOpen(false)} style={{
        background: "none", border: "none", cursor: "pointer",
        fontSize: 16, color: "var(--mu)",
      }}>
        ×
      </button>
    </form>
  );
}

function Column({
  label, color, type, items, groups, searchQuery,
}: {
  label: string; color: string; type: ItemType;
  items: Item[]; groups: GroupDef[]; searchQuery: string;
}) {
  const itemsByGroup: Record<string, Item[]> = {};
  for (const item of items) {
    if (!itemsByGroup[item.group]) itemsByGroup[item.group] = [];
    itemsByGroup[item.group].push(item);
  }

  // When searching, only show groups that have matching items
  const groupsToShow = searchQuery.trim()
    ? groups.filter(g => (itemsByGroup[g.name]?.length ?? 0) > 0)
    : groups;

  return (
    <div style={{ background: "var(--s1)", borderRadius: 8, overflow: "clip" }}>
      {/* Sticky column header */}
      <div style={{
        position: "sticky", top: 54, zIndex: 10,
        background: "var(--s1)",
        padding: "14px 16px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: 12, fontWeight: 700, letterSpacing: "0.16em",
          textTransform: "uppercase", color,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0, display: "block" }} />
          {label}
          {items.length > 0 && (
            <span style={{ color: "var(--dim)", fontWeight: 400, fontSize: 10 }}>{items.length}</span>
          )}
        </div>
        <AddForm type={type} groups={groups} />
      </div>

      {/* Items */}
      <div style={{ padding: "10px 14px 14px", display: "flex", flexDirection: "column", gap: 2, minHeight: 60 }}>
        {groupsToShow.length === 0 ? (
          <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--dim)", textAlign: "center", padding: 20 }}>
            {searchQuery ? "No matches." : "Nothing yet."}
          </p>
        ) : (
          groupsToShow.map(group => (
            <AccordionGroup
              key={group.name}
              group={group}
              items={itemsByGroup[group.name] ?? []}
              type={type}
              searchQuery={searchQuery}
            />
          ))
        )}

        {/* New group button — hidden while searching */}
        {!searchQuery && (
          <div style={{ paddingTop: 4 }}>
            <NewGroupForm />
          </div>
        )}
      </div>
    </div>
  );
}

export default function DatabaseView({ data }: { data: Data }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMust  = filterItems(data.must,  searchQuery);
  const filteredNice  = filterItems(data.nice,  searchQuery);
  const filteredDonot = filterItems(data.donot, searchQuery);

  const total    = data.must.length + data.nice.length + data.donot.length;
  const filtered = filteredMust.length + filteredNice.length + filteredDonot.length;
  const hasUndo  = !!data.lastDeleted;

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Global sticky header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(7,9,10,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 clamp(16px,4vw,48px)", height: 54,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        {/* Title */}
        <div style={{
          fontFamily: "IBM Plex Mono, monospace", fontSize: 15, fontWeight: 700,
          letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--tx)",
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--g)", boxShadow: "0 0 8px var(--g)", display: "block",
          }} />
          FIELD NOTES
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
          <span style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            color: "var(--mu)", fontSize: 13, pointerEvents: "none", userSelect: "none",
          }}>⌕</span>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 5, padding: "6px 30px 6px 28px",
              fontFamily: "IBM Plex Mono, monospace", fontSize: 12,
              color: "var(--tx)", outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--mu)", fontSize: 16, lineHeight: 1, padding: 0,
              }}
            >×</button>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto", flexShrink: 0 }}>
          <UndoBtn hasUndo={hasUndo} />
          <span style={{
            fontFamily: "IBM Plex Mono, monospace", fontSize: 13,
            color: "var(--mu)", letterSpacing: "0.08em",
          }}>
            {searchQuery
              ? `${filtered} / ${total}`
              : `${total} ${total === 1 ? "entry" : "entries"}`}
          </span>
        </div>
      </header>

      {/* Three columns */}
      <div style={{ width: "min(96vw, 2000px)", margin: "0 auto", padding: "32px clamp(20px,2vw,40px) 80px" }}>
        <div className="columns" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16, alignItems: "start",
        }}>
          <Column label="Must Know / Need To Do" color="var(--g)" type="must"  items={filteredMust}  groups={data.groups} searchQuery={searchQuery} />
          <Column label="Nice To Have / Remember" color="var(--a)" type="nice"  items={filteredNice}  groups={data.groups} searchQuery={searchQuery} />
          <Column label="Do Not"                  color="var(--r)" type="donot" items={filteredDonot} groups={data.groups} searchQuery={searchQuery} />
        </div>
      </div>
    </main>
  );
}
