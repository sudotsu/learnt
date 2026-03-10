import { login } from "@/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <main style={{
      minHeight: "100dvh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "20px",
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--tx)", marginBottom: 8,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--g)", boxShadow: "0 0 8px var(--g)",
              display: "block",
            }} />
            FIELD NOTES
          </div>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--mu)", letterSpacing: "0.08em" }}>
            PRIVATE ACCESS
          </p>
        </div>

        <form action={login} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            name="passcode"
            type="password"
            placeholder="Passcode"
            autoFocus
            autoComplete="current-password"
            style={{
              background: "var(--s1)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 5, padding: "12px 14px",
              fontFamily: "var(--mono)", fontSize: 14, color: "var(--tx)",
              outline: "none", width: "100%", letterSpacing: "0.1em",
            }}
          />
          {error && (
            <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--r)", letterSpacing: "0.06em" }}>
              Wrong passcode.
            </p>
          )}
          <button
            type="submit"
            style={{
              background: "var(--g)", border: "none", borderRadius: 5,
              padding: "12px", cursor: "pointer",
              fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#020C05",
            }}
          >
            Enter
          </button>
        </form>
      </div>
    </main>
  );
}
