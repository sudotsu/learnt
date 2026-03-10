import { getItems } from "@/actions/items";
import AddForm from "./_components/AddForm";
import DeleteBtn from "./_components/DeleteBtn";
import type { Item } from "@/lib/types";

const CSS = `
  .item { display: flex; align-items: flex-start; gap: 10px; }
  .item:hover .del-btn { opacity: 1 !important; }
  .donot-pill:hover .del-btn { opacity: 1 !important; }
  @media (max-width: 720px) {
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
        fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
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
      padding: "11px 14px",
      border: "1px solid rgba(255,255,255,0.04)",
    }}>
      <p style={{ flex: 1, fontSize: 13.5, lineHeight: 1.62, color: "var(--tx)", fontWeight: 400 }}>
        {item.text}
      </p>
      <DeleteBtn type={item.type} id={item.id} />
    </div>
  );
}

function DonotPill({ item }: { item: Item }) {
  return (
    <div className="donot-pill" style={{
      background: "var(--rd)",
      border: "1px solid rgba(212,80,80,0.18)",
      borderRadius: 4, padding: "6px 12px",
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: 11.5, color: "#E08080",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span>{item.text}</span>
      <DeleteBtn type="donot" id={item.id} />
    </div>
  );
}

export default async function HomePage() {
  const data = await getItems();
  const total = data.must.length + data.nice.length + data.donot.length;

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
          fontFamily: "IBM Plex Mono, monospace", fontSize: 13, fontWeight: 700,
          letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--tx)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--g)", boxShadow: "0 0 8px var(--g)", display: "block",
          }} />
          FIELD NOTES
        </div>
        <span style={{
          fontFamily: "IBM Plex Mono, monospace", fontSize: 11,
          color: "var(--mu)", letterSpacing: "0.08em",
        }}>
          {total} {total === 1 ? "entry" : "entries"}
        </span>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px clamp(16px,4vw,48px) 80px" }}>

        {/* Two columns */}
        <div className="columns" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 12, marginBottom: 12,
        }}>

          {/* MUST KNOW */}
          <div style={{ background: "var(--s1)", borderRadius: 8, overflow: "hidden" }}>
            <SectionHeader label="Must Know / Need To Do" color="var(--g)">
              <AddForm type="must" />
            </SectionHeader>
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6, minHeight: 60 }}>
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
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6, minHeight: 60 }}>
              {data.nice.length ? data.nice.map(item => <ItemCard key={item.id} item={item} />) : (
                <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--dim)", textAlign: "center", padding: 20 }}>Nothing yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* DO NOT */}
        <div style={{ background: "var(--s1)", borderRadius: 8, overflow: "hidden" }}>
          <SectionHeader label="Do Not" color="var(--r)">
            <AddForm type="donot" />
          </SectionHeader>
          <div style={{ padding: "12px 16px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.donot.length ? data.donot.map(item => <DonotPill key={item.id} item={item} />) : (
              <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--dim)", padding: "8px 4px" }}>None yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
