"use client";

import { useRef, useState, useTransition } from "react";
import { addItem } from "@/actions/items";
import type { ItemType, GroupDef } from "@/lib/types";

export default function AddForm({ type, groups }: { type: ItemType; groups: GroupDef[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubgroup, setSelectedSubgroup] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const accentColor = type === "must" ? "var(--g)" : type === "nice" ? "var(--a)" : "var(--r)";
  const currentGroupDef = groups.find(g => g.name === selectedGroup);
  const isNewGroup = selectedGroup === "__new__";
  const resolvedGroup = isNewGroup ? newGroupName.trim() : selectedGroup;

  function handleOpen() {
    setOpen(true);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleClose() {
    setOpen(false);
    setError(null);
    setSelectedGroup("");
    setSelectedSubgroup("");
    setNewGroupName("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text || !resolvedGroup) return;
    setError(null);
    startTransition(async () => {
      try {
        await addItem(type, text, resolvedGroup, selectedSubgroup || undefined);
        if (inputRef.current) inputRef.current.value = "";
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  const selectStyle: React.CSSProperties = {
    background: "var(--bg)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 4, padding: "6px 8px", fontFamily: "var(--mono)",
    fontSize: 11, color: "var(--tx)", outline: "none", cursor: "pointer", flex: 1,
  };

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
        onMouseEnter={e => { e.currentTarget.style.color = "var(--tx)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "var(--mu)"; e.currentTarget.style.background = "none"; }}
      >
        + Add
      </button>
    );
  }

  // When open, flex: "1 0 100%" causes the form to wrap onto its own row
  // inside the column header's flexWrap: "wrap" container
  return (
    <form
      onSubmit={handleSubmit}
      style={{ flex: "1 0 100%", display: "flex", flexDirection: "column", gap: 8, paddingTop: 10, paddingBottom: 4 }}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select
          value={selectedGroup}
          onChange={e => { setSelectedGroup(e.target.value); setSelectedSubgroup(""); }}
          style={selectStyle}
        >
          <option value="">Group...</option>
          {groups.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
          <option value="__new__">+ New group</option>
        </select>
        {isNewGroup && (
          <input
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            placeholder="Group name..."
            style={{ ...selectStyle, cursor: "text" }}
          />
        )}
        {!isNewGroup && currentGroupDef && currentGroupDef.subgroups.length > 0 && (
          <select value={selectedSubgroup} onChange={e => setSelectedSubgroup(e.target.value)} style={selectStyle}>
            <option value="">Subgroup (optional)</option>
            {currentGroupDef.subgroups.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          type="text"
          placeholder={type === "donot" ? "Never do this again..." : "What did you learn?"}
          onKeyDown={e => e.key === "Escape" && handleClose()}
          style={{
            flex: 1, background: "var(--bg)", border: `1px solid ${accentColor}44`,
            borderRadius: 4, padding: "8px 12px", fontFamily: "var(--mono)",
            fontSize: 12, color: type === "donot" ? "#E08080" : "var(--tx)", outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={pending || !resolvedGroup}
          style={{
            background: pending || !resolvedGroup ? "rgba(255,255,255,0.05)" : accentColor,
            border: "none", cursor: pending || !resolvedGroup ? "not-allowed" : "pointer",
            borderRadius: 4, padding: "8px 14px", fontFamily: "var(--mono)",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
            color: type === "donot" ? "var(--r)" : "#020C05", transition: "background 0.12s",
          }}
        >{pending ? "..." : "Save"}</button>
        <button
          type="button" onClick={handleClose}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--mu)", padding: "0 4px" }}
        >×</button>
      </div>
      {error && <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--r)" }}>{error}</p>}
    </form>
  );
}
