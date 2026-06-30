import { useGame } from "../state/store";

const mono: React.CSSProperties = { fontFamily: "ui-monospace, monospace" };

function priceText(level: number | null): string {
  return level ? "$".repeat(level) : "—";
}

function btnStyle(primary?: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: "11px 14px",
    borderRadius: 10,
    border: primary ? "none" : "1px solid var(--line)",
    background: primary ? "var(--red)" : "transparent",
    color: primary ? "#fff" : "var(--ink)",
    fontWeight: 700,
  };
}

/** Result/retry overlay: the chosen restaurant on a hit, or a miss prompt. */
export default function ResultPanel() {
  const phase = useGame((s) => s.phase);
  const result = useGame((s) => s.result);
  const throwAgain = useGame((s) => s.throwAgain);
  const pickNewArea = useGame((s) => s.pickNewArea);

  if (phase !== "result/retry" || !result) return null;
  const r = result.restaurant;
  const hit = result.hit && r;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 36,
        transform: "translateX(-50%)",
        width: 360,
        maxWidth: "calc(100vw - 32px)",
        background: "rgba(13,16,20,0.94)",
        border: `1px solid ${hit ? "var(--green)" : "var(--line)"}`,
        borderRadius: 16,
        padding: 22,
        display: "grid",
        gap: 16,
        backdropFilter: "blur(6px)",
      }}
    >
      {hit && r ? (
        <>
          <div style={{ ...mono, fontSize: 11, letterSpacing: "0.16em", color: "var(--green)" }}>
            🎯 LUNCH DECIDED
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>
              {r.name}
            </div>
            <div style={{ marginTop: 6, color: "var(--ink-dim)", fontSize: 14 }}>
              {r.cuisine} · {priceText(r.priceLevel)}
              {r.rating != null && (
                <span style={{ color: "var(--brass)" }}> · ★ {r.rating.toFixed(1)}</span>
              )}
            </div>
          </div>
          <a
            href={r.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...mono,
              fontSize: 13,
              color: "var(--green)",
              textDecoration: "none",
              borderBottom: "1px solid currentColor",
              justifySelf: "start",
              paddingBottom: 2,
            }}
          >
            Open in Google Maps →
          </a>
        </>
      ) : (
        <>
          <div style={{ ...mono, fontSize: 11, letterSpacing: "0.16em", color: "var(--red)" }}>
            MISS
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            No pin hit — pick up the dart and try again.
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={throwAgain} style={btnStyle(true)}>
          Throw again
        </button>
        <button onClick={pickNewArea} style={btnStyle(false)}>
          Pick new area
        </button>
      </div>
    </div>
  );
}
