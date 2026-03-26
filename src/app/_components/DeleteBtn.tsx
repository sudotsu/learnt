"use client";

import { useState, useTransition } from "react";
import { deleteItem } from "@/actions/items";
import type { ItemType } from "@/lib/types";

export default function DeleteBtn({ type, id }: { type: ItemType; id: string }) {
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(false);
    startTransition(async () => {
      try {
        await deleteItem(type, id);
      } catch {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title={error ? "Delete failed — try again" : "Remove"}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: error ? "var(--r)" : "var(--mu)",
        fontSize: 16, lineHeight: 1, padding: "0 2px", flexShrink: 0,
        transition: "color 0.12s, opacity 0.12s", opacity: error ? 1 : 0.35,
      }}
      className="del-btn"
    >
      {pending ? "·" : error ? "!" : "×"}
    </button>
  );
}
