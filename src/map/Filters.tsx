import type { Filters, PriceLevel } from "../types";
import { CUISINES, PRICE_OPTIONS } from "./cuisines";

const labelStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--ink-dim)",
};

const fieldStyle: React.CSSProperties = {
  background: "var(--ground)",
  color: "var(--ink)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  padding: "8px 10px",
  font: "inherit",
  fontSize: 14,
};

export function FiltersPanel({
  value,
  onChange,
  disabled,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="checkbox"
          checked={value.openNow}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, openNow: e.target.checked })}
          style={{ width: 16, height: 16, accentColor: "var(--green)" }}
        />
        <span style={{ fontSize: 14 }}>Open now</span>
      </label>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={labelStyle}>Cuisine</span>
        <select
          style={fieldStyle}
          disabled={disabled}
          value={value.cuisine ?? ""}
          onChange={(e) =>
            onChange({ ...value, cuisine: e.target.value || null })
          }
        >
          {CUISINES.map((c) => (
            <option key={c || "any"} value={c}>
              {c || "Any"}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={labelStyle}>Max price</span>
        <select
          style={fieldStyle}
          disabled={disabled}
          value={value.maxPrice ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              maxPrice: e.target.value
                ? (Number(e.target.value) as PriceLevel)
                : null,
            })
          }
        >
          <option value="">Any</option>
          {PRICE_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
