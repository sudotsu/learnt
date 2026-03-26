"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: "40px 20px", gap: 24,
    }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        maxWidth: 420, textAlign: "center",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--r)", boxShadow: "0 0 10px var(--r)", display: "block",
        }} />
        <p style={{
          fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--r)",
        }}>
          Database Error
        </p>
        <p style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--mu)", lineHeight: 1.6 }}>
          {error.message || "Could not load your notes. The database may be temporarily unreachable."}
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 8,
            background: "none", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 5, cursor: "pointer",
            fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--tx)", padding: "8px 20px",
            transition: "border-color 0.12s, color 0.12s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
