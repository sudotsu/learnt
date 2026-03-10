"use server";

import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";
import type { Data, Item, ItemType } from "@/lib/types";

const KEY = "fieldnotes:v1";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const SEED: Data = {
  must: [
    {
      id: "m1", type: "must", createdAt: 0,
      text: "[LLM Bridge] When passing a prompt from another AI: append \"from [name], without our context\" — you are the human API between two isolated systems.",
    },
    {
      id: "m2", type: "must", createdAt: 0,
      text: "[Prompts] Protective context = keep. Social lubrication = drop. Only include context that guards decisions already made.",
    },
    {
      id: "m3", type: "must", createdAt: 0,
      text: "[Shipping] Before building anything, ask: \"Does this put a user in front of the product?\" If no — it's the dopamine loop. Stop.",
    },
    {
      id: "m4", type: "must", createdAt: 0,
      text: "[Reddit] Don't pre-answer objections in the post. Let skeptics comment — you agree, trust is built, engagement drives reach.",
    },
    {
      id: "m5", type: "must", createdAt: 0,
      text: "[SEO Order] Technical first (metadata, OG, JSON-LD, sitemap) → content second → backlinks third. Paid tools last or never.",
    },
    {
      id: "m6", type: "must", createdAt: 0,
      text: "[Geo SEO] Geo keywords live in metadata + footer copy. Never force location into hero headline — kills conversion outside that region.",
    },
  ],
  nice: [
    {
      id: "n1", type: "nice", createdAt: 0,
      text: "[Social] Every shareable site needs an OG image (1200×630). Without it, every share preview is blank.",
    },
    {
      id: "n2", type: "nice", createdAt: 0,
      text: "[SEO] FAQPage JSON-LD schema targets People Also Ask. Use verbatim search query as H2 — don't paraphrase.",
    },
    {
      id: "n3", type: "nice", createdAt: 0,
      text: "[Keywords] Google Trends + Search Console before any paid tool. GSC shows real queries 2–4 weeks post-launch.",
    },
    {
      id: "n4", type: "nice", createdAt: 0,
      text: "[Physical] Marketing materials should fit existing venue fixtures. A card that slips into a keno holder gets picked up — a flyer on the bar doesn't.",
    },
    {
      id: "n5", type: "nice", createdAt: 0,
      text: "[Design] Background texture (number grids, patterns) adds depth. ~0.07 opacity is the sweet spot on dark themes.",
    },
  ],
  donot: [
    { id: "x1", type: "donot", createdAt: 0, text: "Build tools for the dopamine hit — ship to users first" },
    { id: "x2", type: "donot", createdAt: 0, text: "Use \"Got tired of X so I built Y\" Reddit titles" },
    { id: "x3", type: "donot", createdAt: 0, text: "Pre-answer objections in a post — let comments do it" },
    { id: "x4", type: "donot", createdAt: 0, text: "Put geo keywords in hero headlines — use metadata/footer" },
    { id: "x5", type: "donot", createdAt: 0, text: "Pay for SEMrush when GSC + Trends is free and sufficient" },
    { id: "x6", type: "donot", createdAt: 0, text: "Use white text on bright green — dark text on green only" },
    { id: "x7", type: "donot", createdAt: 0, text: "Start a new project with npm — use pnpm" },
  ],
};

export async function getItems(): Promise<Data> {
  const data = await redis.get<Data>(KEY);
  if (!data) {
    await redis.set(KEY, SEED);
    return SEED;
  }
  return data;
}

export async function addItem(type: ItemType, text: string): Promise<void> {
  if (!text.trim()) return;
  const data = await getItems();
  const item: Item = { id: uid(), text: text.trim(), type, createdAt: Date.now() };
  data[type].push(item);
  await redis.set(KEY, data);
  revalidatePath("/");
}

export async function deleteItem(type: ItemType, id: string): Promise<void> {
  const data = await getItems();
  const item = data[type].find((i) => i.id === id);
  data[type] = data[type].filter((i) => i.id !== id);
  data.lastDeleted = item ?? null;
  await redis.set(KEY, data);
  revalidatePath("/");
}

export async function undoDelete(): Promise<void> {
  const data = await getItems();
  if (!data.lastDeleted) return;
  const item = data.lastDeleted;
  data[item.type].push(item);
  data.lastDeleted = null;
  await redis.set(KEY, data);
  revalidatePath("/");
}
