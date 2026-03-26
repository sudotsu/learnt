"use server";

import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";
import type { Data, Item, ItemType, GroupDef } from "@/lib/types";

const KEY = "fieldnotes:v2";

const VALID_TYPES = new Set<ItemType>(["must", "nice", "donot"]);

function assertType(type: unknown): asserts type is ItemType {
  if (!VALID_TYPES.has(type as ItemType)) throw new Error(`Invalid item type: ${type}`);
}

const SEED_GROUPS: GroupDef[] = [
  { name: "AI/LLMs",   subgroups: [] },
  { name: "Prompts",   subgroups: [] },
  { name: "Shipping",  subgroups: [] },
  { name: "Social",    subgroups: [] },
  { name: "SEO",       subgroups: [] },
  { name: "Marketing", subgroups: [] },
  { name: "Design",    subgroups: [] },
  { name: "Coding",    subgroups: ["Emacs", "Python", "Git", "Terminal", "PowerShell"] },
  { name: "Health",    subgroups: [] },
  { name: "Habits",    subgroups: [] },
  { name: "Work",      subgroups: [] },
];

const SEED: Data = {
  groups: SEED_GROUPS,
  must: [
    { id: "m1",  type: "must", group: "AI/LLMs",  createdAt: 0, text: "When passing a prompt from another AI: append \"from [name], without our context\" — you are the human API between two isolated systems." },
    { id: "m2",  type: "must", group: "Prompts",  createdAt: 0, text: "Protective context = keep. Social lubrication = drop. Only include context that guards decisions already made." },
    { id: "m3",  type: "must", group: "Shipping", createdAt: 0, text: "Before building anything, ask: \"Does this put a user in front of the product?\" If no — it's the dopamine loop. Stop." },
    { id: "m4",  type: "must", group: "Social",   createdAt: 0, text: "Don't pre-answer objections in the post. Let skeptics comment — you agree, trust is built, engagement drives reach." },
    { id: "m5",  type: "must", group: "SEO",      createdAt: 0, text: "Technical first (metadata, OG, JSON-LD, sitemap) → content second → backlinks third. Paid tools last or never." },
    { id: "m6",  type: "must", group: "SEO",      createdAt: 0, text: "Geo keywords live in metadata + footer copy. Never force location into hero headline — kills conversion outside that region." },
    { id: "m7",  type: "must", group: "Prompts",  createdAt: 0, text: "Four pillars every prompt needs: Role (who the AI is), Task (what it must do), Context (background), Format (how you want the answer)." },
    { id: "m8",  type: "must", group: "Prompts",  createdAt: 0, text: "XML tags are bulletproof for multi-part prompts: <section>...</section> — instructions can't bleed across blocks. Use when --- isn't enough." },
    { id: "m9",  type: "must", group: "Prompts",  createdAt: 0, text: "**Bold** non-negotiable requirements — literally increases attention weight on that token. \"Make the button **Red**\" vs \"make it red\"." },
    { id: "m10", type: "must", group: "Prompts",  createdAt: 0, text: "Always put a blank line before and after --- or some parsers merge it with adjacent text." },
    { id: "m11", type: "must", group: "Prompts",  createdAt: 0, text: "Triple backticks + language name for all code blocks — also fixes copy-paste indentation. Model ignores bad spacing, reads syntax instead." },
    { id: "m12", type: "must", group: "AI/LLMs",  createdAt: 0, text: "Break complex tasks into subtasks, not one monolithic prompt — attention mechanism scales quadratically with input length, coherence degrades." },
  ],
  nice: [
    { id: "n1",  type: "nice", group: "Social",    createdAt: 0, text: "Every shareable site needs an OG image (1200×630). Without it, every share preview is blank." },
    { id: "n2",  type: "nice", group: "SEO",       createdAt: 0, text: "FAQPage JSON-LD schema targets People Also Ask. Use verbatim search query as H2 — don't paraphrase." },
    { id: "n3",  type: "nice", group: "SEO",       createdAt: 0, text: "Google Trends + Search Console before any paid tool. GSC shows real queries 2–4 weeks post-launch." },
    { id: "n4",  type: "nice", group: "Marketing", createdAt: 0, text: "Marketing materials should fit existing venue fixtures. A card that slips into a keno holder gets picked up — a flyer on the bar doesn't." },
    { id: "n5",  type: "nice", group: "Design",    createdAt: 0, text: "Background texture (number grids, patterns) adds depth. ~0.07 opacity is the sweet spot on dark themes." },
    { id: "n6",  type: "nice", group: "Prompts",   createdAt: 0, text: "\"\"\" triple quotes = treat this block exactly as-is. Separates your content from your instructions in summarization/extraction tasks." },
    { id: "n7",  type: "nice", group: "Prompts",   createdAt: 0, text: "*italics* = soft emphasis / tone signal, not a rule. Bold = hard constraint, italics = nuance or non-literal usage." },
    { id: "n8",  type: "nice", group: "Prompts",   createdAt: 0, text: "One or two few-shot examples in the prompt beats describing the format in words — show the pattern, don't explain it." },
    { id: "n9",  type: "nice", group: "Prompts",   createdAt: 0, text: "# comments inside prompts let you annotate your own reasoning without the model treating those lines as instructions." },
    { id: "n10", type: "nice", group: "Prompts",   createdAt: 0, text: "'Single quotes' for UI labels/internal thoughts, \"double quotes\" for actual data or spoken text — models respect this distinction." },
  ],
  donot: [
    { id: "x1",  type: "donot", group: "Shipping", createdAt: 0, text: "Build tools for the dopamine hit — ship to users first" },
    { id: "x2",  type: "donot", group: "Social",   createdAt: 0, text: "Use \"Got tired of X so I built Y\" Reddit titles" },
    { id: "x3",  type: "donot", group: "Social",   createdAt: 0, text: "Pre-answer objections in a post — let comments do it" },
    { id: "x4",  type: "donot", group: "SEO",      createdAt: 0, text: "Put geo keywords in hero headlines — use metadata/footer" },
    { id: "x5",  type: "donot", group: "SEO",      createdAt: 0, text: "Pay for SEMrush when GSC + Trends is free and sufficient" },
    { id: "x6",  type: "donot", group: "Design",   createdAt: 0, text: "Use white text on bright green — dark text on green only" },
    { id: "x7",  type: "donot", group: "Coding",   createdAt: 0, text: "Start a new project with npm — use pnpm" },
    { id: "x8",  type: "donot", group: "Prompts",  createdAt: 0, text: "Rely on air quotes alone to signal sarcasm — model may read \"idea\" as a literal string. Add a parenthetical to clarify." },
    { id: "x9",  type: "donot", group: "AI/LLMs",  createdAt: 0, text: "Assume the model has calibrated to your style across sessions — weights are static, re-establish context each time." },
    { id: "x10", type: "donot", group: "Prompts",  createdAt: 0, text: "Use vague format instructions — always specify explicitly: list, numbered steps, code block, prose, etc." },
  ],
};

export async function getItems(): Promise<Data> {
  let data: Data | null;
  try {
    data = await redis.get<Data>(KEY);
  } catch (err) {
    console.error("[getItems] Redis read failed:", err);
    throw new Error("Could not reach the database. Check back in a moment.");
  }
  if (!data) {
    console.warn("[getItems] No data found — seeding defaults.");
    try {
      await redis.set(KEY, SEED);
    } catch (err) {
      console.error("[getItems] Redis seed write failed:", err);
    }
    return SEED;
  }
  return data;
}

export async function addItem(type: ItemType, text: string, group: string, subgroup?: string): Promise<void> {
  assertType(type);
  if (!text.trim() || !group.trim()) return;
  const data = await getItems();
  const item: Item = {
    id: crypto.randomUUID(),
    text: text.trim(),
    type,
    group: group.trim(),
    subgroup: subgroup?.trim() || undefined,
    createdAt: Date.now(),
  };
  data[type].push(item);
  let groupDef = data.groups.find(g => g.name === group.trim());
  if (!groupDef) {
    groupDef = { name: group.trim(), subgroups: [] };
    data.groups.push(groupDef);
  }
  if (subgroup?.trim() && !groupDef.subgroups.includes(subgroup.trim())) {
    groupDef.subgroups.push(subgroup.trim());
  }
  try {
    await redis.set(KEY, data);
  } catch (err) {
    console.error("[addItem] Redis write failed:", err);
    throw new Error("Failed to save. Please try again.");
  }
  revalidatePath("/");
}

export async function editItem(type: ItemType, id: string, text: string): Promise<void> {
  assertType(type);
  if (!text.trim()) return;
  const data = await getItems();
  const item = data[type].find(i => i.id === id);
  if (!item) return;
  item.text = text.trim();
  try {
    await redis.set(KEY, data);
  } catch (err) {
    console.error("[editItem] Redis write failed:", err);
    throw new Error("Failed to save edit. Please try again.");
  }
  revalidatePath("/");
}

export async function deleteItem(type: ItemType, id: string): Promise<void> {
  assertType(type);
  const data = await getItems();
  const item = data[type].find(i => i.id === id);
  data[type] = data[type].filter(i => i.id !== id);
  data.lastDeleted = item;
  try {
    await redis.set(KEY, data);
  } catch (err) {
    console.error("[deleteItem] Redis write failed:", err);
    throw new Error("Failed to delete. Please try again.");
  }
  revalidatePath("/");
}

export async function undoDelete(): Promise<void> {
  const data = await getItems();
  if (!data.lastDeleted) return;
  const item = data.lastDeleted;
  data[item.type].push(item);
  delete data.lastDeleted;
  try {
    await redis.set(KEY, data);
  } catch (err) {
    console.error("[undoDelete] Redis write failed:", err);
    throw new Error("Failed to undo. Please try again.");
  }
  revalidatePath("/");
}

export async function addGroup(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const data = await getItems();
  if (data.groups.find(g => g.name === trimmed)) return;
  data.groups.push({ name: trimmed, subgroups: [] });
  try {
    await redis.set(KEY, data);
  } catch (err) {
    console.error("[addGroup] Redis write failed:", err);
    throw new Error("Failed to create group. Please try again.");
  }
  revalidatePath("/");
}

export async function addSubgroup(groupName: string, subgroupName: string): Promise<void> {
  const trimmed = subgroupName.trim();
  if (!trimmed) return;
  const data = await getItems();
  const group = data.groups.find(g => g.name === groupName);
  if (!group || group.subgroups.includes(trimmed)) return;
  group.subgroups.push(trimmed);
  try {
    await redis.set(KEY, data);
  } catch (err) {
    console.error("[addSubgroup] Redis write failed:", err);
    throw new Error("Failed to create subgroup. Please try again.");
  }
  revalidatePath("/");
}
