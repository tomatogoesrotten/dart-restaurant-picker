import { useGame } from "../state/store";
import { useThrowUI } from "../state/throwStore";

const mono: React.CSSProperties = { fontFamily: "ui-monospace, monospace" };

/** First-person HUD: aim hint, live power meter, and what you're aimed at. */
export default function Hud() {
  const phase = useGame((s) => s.phase);
  const power = useThrowUI((s) => s.power);
  const charging = useThrowUI((s) => s.charging);
  const aimLabel = useThrowUI((s) => s.aimLabel);

  if (phase !== "aim" && phase !== "throw") return null;
  const aiming = phase === "aim";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 28,
        display: "grid",
        justifyItems: "center",
        gap: 12,
        pointerEvents: "none",
      }}
    >
      {aiming && (
        <div
          style={{
            ...mono,
            fontSize: 12.5,
            color: aimLabel ? "var(--green)" : "var(--ink-dim)",
            background: "rgba(13,16,20,0.7)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: "6px 12px",
          }}
        >
          {aimLabel ? `▶ ${aimLabel}` : "Aim near a green pin"}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, width: 320, maxWidth: "80vw" }}>
        <span style={{ ...mono, fontSize: 10.5, letterSpacing: "0.18em", color: "var(--ink-dim)" }}>
          POWER
        </span>
        <div
          style={{
            flex: 1,
            height: 8,
            borderRadius: 99,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid var(--line)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.round(power * 100)}%`,
              background: "linear-gradient(90deg, var(--brass), var(--red))",
            }}
          />
        </div>
      </div>

      {aiming && (
        <div style={{ ...mono, fontSize: 12, color: "var(--ink-dim)" }}>
          {charging ? "Release to throw" : "Hold anywhere to charge"}
        </div>
      )}
    </div>
  );
}
