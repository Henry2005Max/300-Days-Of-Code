import React, { useState, useCallback, useRef } from "react";
import "./App.css";

// ─── Types 

interface Color {
  h: number;
  s: number;
  l: number;
}

interface SavedColor {
  id: string;
  hex: string;
  name: string;
  hsl: Color;
}

// ─── Color Conversions 

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100, ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): Color {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100, ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)));
  };
  return [f(0), f(8), f(4)];
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1a1814" : "#ffffff";
}

function generateHarmony(h: number, s: number, l: number, type: string): string[] {
  switch (type) {
    case "complementary":
      return [hslToHex(h, s, l), hslToHex((h + 180) % 360, s, l)];
    case "triadic":
      return [hslToHex(h, s, l), hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
    case "analogous":
      return [hslToHex((h - 30 + 360) % 360, s, l), hslToHex(h, s, l), hslToHex((h + 30) % 360, s, l)];
    case "split":
      return [hslToHex(h, s, l), hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)];
    case "tetradic":
      return [hslToHex(h, s, l), hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)];
    default:
      return [hslToHex(h, s, l)];
  }
}

function generateShades(h: number, s: number): string[] {
  return [90, 80, 70, 60, 50, 40, 30, 20, 10].map((l) => hslToHex(h, s, l));
}

function nameColor(h: number, s: number, l: number): string {
  if (l > 95) return "White";
  if (l < 5) return "Black";
  if (s < 10) return l > 60 ? "Light Gray" : l < 30 ? "Dark Gray" : "Gray";
  const hueNames = [
    [0, 15, "Red"], [15, 45, "Orange"], [45, 70, "Yellow"],
    [70, 150, "Green"], [150, 195, "Teal"], [195, 255, "Blue"],
    [255, 285, "Indigo"], [285, 330, "Purple"], [330, 360, "Pink"],
  ];
  const name = hueNames.find(([min, max]) => h >= (min as number) && h < (max as number));
  const hueName = name ? name[2] as string : "Red";
  if (l > 75) return `Light ${hueName}`;
  if (l < 30) return `Dark ${hueName}`;
  if (s > 80) return `Vivid ${hueName}`;
  return hueName;
}

// ─── Slider 

const Slider: React.FC<{
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
  gradient: string;
  unit?: string;
}> = ({ label, value, max, onChange, gradient, unit = "" }) => (
  <div className="slider-row">
    <div className="slider-header">
      <span className="slider-label">{label}</span>
      <span className="slider-val">{value}{unit}</span>
    </div>
    <div className="slider-track-wrap" style={{ background: gradient }}>
      <input
        type="range" min={0} max={max} value={value}
        className="slider"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  </div>
);

// ─── App 

const HARMONY_TYPES = ["complementary", "triadic", "analogous", "split", "tetradic"];

const App: React.FC = () => {
  const [color, setColor] = useState<Color>({ h: 220, s: 70, l: 55 });
  const [hexInput, setHexInput] = useState("");
  const [harmony, setHarmony] = useState("complementary");
  const [saved, setSaved] = useState<SavedColor[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sliders" | "shades" | "harmony">("sliders");
  const inputRef = useRef<HTMLInputElement>(null);

  const hex = hslToHex(color.h, color.s, color.l);
  const [r, g, b] = hslToRgb(color.h, color.s, color.l);
  const contrastColor = getContrastColor(hex);
  const harmonyColors = generateHarmony(color.h, color.s, color.l, harmony);
  const shades = generateShades(color.h, color.s);
  const colorName = nameColor(color.h, color.s, color.l);

  const copy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  }, []);

  const saveColor = () => {
    if (saved.find((s) => s.hex === hex)) return;
    setSaved((prev) => [{ id: Date.now().toString(), hex, name: colorName, hsl: { ...color } }, ...prev].slice(0, 20));
  };

  const handleHexInput = (val: string) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setColor(hexToHsl(val));
      setHexInput("");
    }
  };

  const hGradient = `linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`;
  const sGradient = `linear-gradient(to right, ${hslToHex(color.h, 0, color.l)}, ${hslToHex(color.h, 100, color.l)})`;
  const lGradient = `linear-gradient(to right, #000, ${hslToHex(color.h, color.s, 50)}, #fff)`;

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 42</span>
          <h1 className="header-title">Color Picker</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        <div className="layout">

          {/* ── Left: Preview + Controls  */}
          <div className="left-col">

            {/* Color Preview */}
            <div className="preview-card" style={{ background: hex }}>
              <div className="preview-top">
                <span className="preview-name" style={{ color: contrastColor }}>{colorName}</span>
                <span className="preview-hex" style={{ color: contrastColor }}>{hex.toUpperCase()}</span>
              </div>
              <div className="preview-values" style={{ color: contrastColor + "cc" }}>
                <span>HSL({color.h}, {color.s}%, {color.l}%)</span>
                <span>RGB({r}, {g}, {b})</span>
              </div>
            </div>

            {/* Copy Buttons */}
            <div className="copy-row">
              {[
                { label: "HEX", val: hex.toUpperCase() },
                { label: "HSL", val: `hsl(${color.h}, ${color.s}%, ${color.l}%)` },
                { label: "RGB", val: `rgb(${r}, ${g}, ${b})` },
              ].map(({ label, val }) => (
                <button key={label} className={`copy-btn ${copied === label ? "copied" : ""}`} onClick={() => copy(val, label)}>
                  {copied === label ? "Copied!" : `Copy ${label}`}
                </button>
              ))}
              <button className="save-btn" onClick={saveColor} title="Save color">
                {saved.find((s) => s.hex === hex) ? "✓ Saved" : "+ Save"}
              </button>
            </div>

            {/* Hex Input */}
            <div className="hex-input-row">
              <input
                ref={inputRef}
                className="hex-input"
                placeholder="#1a2b3c — paste any hex"
                value={hexInput}
                onChange={(e) => handleHexInput(e.target.value)}
                maxLength={7}
              />
            </div>

            {/* Tabs */}
            <div className="tabs">
              {(["sliders", "shades", "harmony"] as const).map((t) => (
                <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "sliders" && (
              <div className="sliders-panel">
                <Slider label="Hue" value={color.h} max={360} onChange={(v) => setColor((c) => ({ ...c, h: v }))} gradient={hGradient} unit="°" />
                <Slider label="Saturation" value={color.s} max={100} onChange={(v) => setColor((c) => ({ ...c, s: v }))} gradient={sGradient} unit="%" />
                <Slider label="Lightness" value={color.l} max={100} onChange={(v) => setColor((c) => ({ ...c, l: v }))} gradient={lGradient} unit="%" />
              </div>
            )}

            {activeTab === "shades" && (
              <div className="shades-panel">
                <p className="panel-note">9 shades from light to dark</p>
                <div className="shades-grid">
                  {shades.map((shade, i) => (
                    <div key={i} className="shade-item" onClick={() => { setColor(hexToHsl(shade)); copy(shade.toUpperCase(), shade); }}
                      style={{ background: shade }} title={shade.toUpperCase()}>
                      <span style={{ color: getContrastColor(shade), fontSize: 11 }}>{shade.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "harmony" && (
              <div className="harmony-panel">
                <div className="harmony-types">
                  {HARMONY_TYPES.map((t) => (
                    <button key={t} className={`harmony-btn ${harmony === t ? "active" : ""}`} onClick={() => setHarmony(t)}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="harmony-colors">
                  {harmonyColors.map((hc, i) => (
                    <div key={i} className="harmony-item" onClick={() => { setColor(hexToHsl(hc)); copy(hc.toUpperCase(), hc); }}
                      style={{ background: hc }}>
                      <span style={{ color: getContrastColor(hc), fontSize: 11 }}>{hc.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
                <p className="panel-note">Click any color to set it as active</p>
              </div>
            )}
          </div>

          {/* ── Right: Saved Colors  */}
          <div className="right-col">
            <div className="saved-panel">
              <div className="saved-header">
                <h3 className="saved-title">Saved Colors</h3>
                <span className="saved-count">{saved.length}/20</span>
              </div>

              {saved.length === 0 ? (
                <p className="saved-empty">Hit "+ Save" to save colors here.</p>
              ) : (
                <div className="saved-list">
                  {saved.map((sc) => (
                    <div key={sc.id} className="saved-item" onClick={() => setColor(sc.hsl)}>
                      <div className="saved-swatch" style={{ background: sc.hex }} />
                      <div className="saved-info">
                        <span className="saved-name">{sc.name}</span>
                        <span className="saved-hex-val">{sc.hex.toUpperCase()}</span>
                      </div>
                      <button className="saved-copy" onClick={(e) => { e.stopPropagation(); copy(sc.hex.toUpperCase(), sc.hex); }}>
                        {copied === sc.hex ? "✓" : "⎘"}
                      </button>
                      <button className="saved-delete" onClick={(e) => { e.stopPropagation(); setSaved((p) => p.filter((x) => x.id !== sc.id)); }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {saved.length > 0 && (
                <button className="clear-saved-btn" onClick={() => setSaved([])}>Clear all</button>
              )}
            </div>

            {/* Color Info */}
            <div className="info-panel">
              <h3 className="info-title">Color Info</h3>
              <div className="info-rows">
                {[
                  ["Name", colorName],
                  ["HEX", hex.toUpperCase()],
                  ["HSL", `hsl(${color.h}, ${color.s}%, ${color.l}%)`],
                  ["RGB", `rgb(${r}, ${g}, ${b})`],
                  ["Hue", `${color.h}°`],
                  ["Saturation", `${color.s}%`],
                  ["Lightness", `${color.l}%`],
                  ["Contrast", contrastColor === "#ffffff" ? "Dark bg" : "Light bg"],
                ].map(([k, v]) => (
                  <div key={k} className="info-row">
                    <span className="info-key">{k}</span>
                    <span className="info-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;