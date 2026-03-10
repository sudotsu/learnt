import { getItems } from "@/actions/items";
import AddForm from "./_components/AddForm";
import DeleteBtn from "./_components/DeleteBtn";
import UndoBtn from "./_components/UndoBtn";
import type { Item } from "@/lib/types";

const CSS = `
  .item { display: flex; align-items: flex-start; gap: 10px; }
  .item:hover .del-btn { opacity: 1 !important; color: var(--r) !important; }
  @media (max-width: 900px) {
    .columns { grid-template-columns: 1fr !important; }
  }
`;

function SectionHeader({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
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
      </div>
      {children}
    </div>
  );
}

function ItemCard({ item }: { item: Item }) {
  return (
    <div className="item" style={{
      background: "var(--s2)", borderRadius: 5,
      padding: "14px 18px",
      border: "1px solid rgba(255,255,255,0.04)",
    }}>
      <p style={{ flex: 1, fontSize: 15, lineHeight: 1.65, color: "var(--tx)", fontWeight: 400 }}>
        {item.text}
      </p>
      <DeleteBtn type={item.type} id={item.id} />
    </div>
  );
}

function DonotCard({ item }: { item: Item }) {
  return (
    <div className="item" style={{
      background: "var(--s2)", borderRadius: 5,
      padding: "14px 18px",
      border: "1px solid rgba(212,80,80,0.1)",
      borderLeft: "2px solid rgba(212,80,80,0.4)",
    }}>
      <p style={{ flex: 1, fontSize: 15, lineHeight: 1.65, color: "#E08080", fontWeight: 400 }}>
        {item.text}
      </p>
      <DeleteBtn type={item.type} id={item.id} />
    </div>
  );
}

export default async function HomePage() {
  const data = await getItems();
  const total = data.must.length + data.nice.length + data.donot.length;
  const hasUndo = !!data.lastDeleted;

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(7,9,10,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 clamp(16px,4vw,48px)", height: 54,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{
          fontFamily: "IBM Plex Mono, monospace", fontSize: 15, fontWeight: 700,
          letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--tx)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--g)", boxShadow: "0 0 8px var(--g)", display: "block",
          }} />
          FIELD NOTES
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <UndoBtn hasUndo={hasUndo} />
          <span style={{
            fontFamily: "IBM Plex Mono, monospace", fontSize: 13,
            color: "var(--mu)", letterSpacing: "0.08em",
          }}>
            {total} {total === 1 ? "entry" : "entries"}
          </span>
        </div>
      </header>

      {/* Content */}
      <div style={{ width: "min(96vw, 2000px)", margin: "0 auto", padding: "32px clamp(20px,2vw,40px) 80px" }}>

        {/* Three columns */}
        <div className="columns" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16, alignItems: "start",
        }}>

          {/* MUST KNOW */}
          <div style={{ background: "var(--s1)", borderRadius: 8, overflow: "hidden" }}>
            <SectionHeader label="Must Know / Need To Do" color="var(--g)">
              <AddForm type="must" />
            </SectionHeader>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
              {data.must.length ? data.must.map(item => <ItemCard key={item.id} item={item} />) : (
                <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--dim)", textAlign: "center", padding: 20 }}>Nothing yet.</p>
              )}
            </div>
          </div>

          {/* NICE TO HAVE */}
          <div style={{ background: "var(--s1)", borderRadius: 8, overflow: "hidden" }}>
            <SectionHeader label="Nice To Have / Remember" color="var(--a)">
              <AddForm type="nice" />
            </SectionHeader>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
              {data.nice.length ? data.nice.map(item => <ItemCard key={item.id} item={item} />) : (
                <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--dim)", textAlign: "center", padding: 20 }}>Nothing yet.</p>
              )}
            </div>
          </div>

          {/* DO NOT */}
          <div style={{ background: "var(--s1)", borderRadius: 8, overflow: "hidden" }}>
            <SectionHeader label="Do Not" color="var(--r)">
              <AddForm type="donot" />
            </SectionHeader>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
              {data.donot.length ? data.donot.map(item => <DonotCard key={item.id} item={item} />) : (
                <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--dim)", textAlign: "center", padding: 20 }}>Nothing yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
