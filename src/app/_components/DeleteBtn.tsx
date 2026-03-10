"use client";

import { useTransition } from "react";
import { deleteItem } from "@/actions/items";
import type { ItemType } from "@/lib/types";

export default function DeleteBtn({ type, id }: { type: ItemType; id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => deleteItem(type, id))}
      disabled={pending}
      title="Remove"
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--mu)", fontSize: 16, lineHeight: 1,
        padding: "0 2px", flexShrink: 0,
        transition: "color 0.12s, opacity 0.12s", opacity: 0.35,
      }}
      className="del-btn"
    >
      {pending ? "·" : "×"}
    </button>
  );
}
