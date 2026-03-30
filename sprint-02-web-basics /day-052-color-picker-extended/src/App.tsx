import React, { useState, useMemo, useCallback, useRef } from "react";
import "./App.css";

// Types
type ColorSpace = "hsl" | "rgb" | "hex" | "oklch";

interface Color {
  h: number; s: number; l: number;
}

interface Swatch {
  id: string;
  hex: string;
  name: string;
  color: Color;
  locked: boolean;
}

interface GradientStop {
  color: Color;
  position: number;
}

// Color math
function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100, ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1))).toString(16).padStart(2, "0");
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
  const f = (n: number) => Math.round(255 * (ln - a * Math.max(Math.min((n + h / 30) % 12 - 3, 9 - (n + h / 30) % 12, 1), -1)));
  return [f(0), f(8), f(4)];
}

function hslToOklch(h: number, s: number, l: number): string {
  // Approximation for display purposes
  const L = (l / 100) * 1.0;
  const C = (s / 100) * 0.3;
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${h}deg)`;
}

function getContrast(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "#1a1814" : "#ffffff";
}

function nameColor(h: number, s: number, l: number): string {
  if (l > 95) return "White";
  if (l < 5) return "Black";
  if (s < 10) return l > 60 ? "Light Gray" : l < 30 ? "Dark Gray" : "Gray";
  const hues = [[0,15,"Red"],[15,45,"Orange"],[45,70,"Yellow"],[70,150,"Green"],[150,195,"Teal"],[195,255,"Blue"],[255,285,"Indigo"],[285,330,"Purple"],[330,360,"Pink"]];
  const name = (hues.find(([mn, mx]) => h >= (mn as number) && h < (mx as number))?.[2] ?? "Red") as string;
  if (l > 75) return `Light ${name}`;
  if (l < 30) return `Dark ${name}`;
  if (s > 80) return `Vivid ${name}`;
  return name;
}

function generatePalette(h: number, s: number, type: string): Color[] {
  switch (type) {
    case "monochromatic": return [90,75,60,45,30,15].map(ll => ({ h, s, l: ll }));
    case "complementary": return [60,45,30].flatMap(ll => [{ h, s, l: ll }, { h: (h+180)%360, s, l: ll }]);
    case "triadic": return [60,40].flatMap(ll => [{ h, s, l: ll }, { h: (h+120)%360, s, l: ll }, { h: (h+240)%360, s, l: ll }]);
    case "analogous": return [60,45,30].flatMap(ll => [{ h:(h-30+360)%360, s, l:ll }, { h, s, l:ll }, { h:(h+30)%360, s, l:ll }]);
    case "split": return [60,40].flatMap(ll => [{ h, s, l:ll }, { h:(h+150)%360, s, l:ll }, { h:(h+210)%360, s, l:ll }]);
    default: return [{ h, s, l: 50 }];
  }
}

const PALETTE_TYPES = ["monochromatic", "complementary", "triadic", "analogous", "split"];

// Canvas color picker 2D
const ColorCanvas: React.FC<{ hue: number; s: number; l: number; onChange: (s: number, l: number) => void }> = ({ hue, s, l, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width, h = canvas.height;
    // Saturation gradient (left = white, right = vivid)
    const satGrad = ctx.createLinearGradient(0, 0, w, 0);
    satGrad.addColorStop(0, "#fff");
    satGrad.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
    ctx.fillStyle = satGrad;
    ctx.fillRect(0, 0, w, h);
    // Lightness gradient (top = transparent, bottom = black)
    const litGrad = ctx.createLinearGradient(0, 0, 0, h);
    litGrad.addColorStop(0, "rgba(0,0,0,0)");
    litGrad.addColorStop(1, "#000");
    ctx.fillStyle = litGrad;
    ctx.fillRect(0, 0, w, h);
  }, [hue]);

  React.useEffect(() => { draw(); }, [draw]);

  const pick = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    // Convert x,y to s,l
    const newS = Math.round(x * 100);
    const newL = Math.round((1 - y) * 50 + (1 - x) * 0);
    onChange(newS, Math.max(0, Math.min(100, Math.round(100 - y * 50 - x * 50))));
  };

  return (
    <div className="color-canvas-wrap">
      <canvas
        ref={canvasRef} width={300} height={180} className="color-canvas"
        onMouseDown={(e) => { dragging.current = true; pick(e); }}
        onMouseMove={(e) => { if (dragging.current) pick(e); }}
        onMouseUp={() => { dragging.current = false; }}
        onMouseLeave={() => { dragging.current = false; }}
      />
      <div className="canvas-cursor" style={{
        left: `${s}%`,
        top: `${100 - l * 2}%`,
        borderColor: l > 50 ? "#000" : "#fff",
      }} />
    </div>
  );
};

// App
const App: React.FC = () => {
  const [color, setColor] = useState<Color>({ h: 220, s: 65, l: 55 });
  const [activeSpace, setActiveSpace] = useState<ColorSpace>("hsl");
  const [paletteType, setPaletteType] = useState("monochromatic");
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [hexInput, setHexInput] = useState("");
  const [copied, setCopied] = useState("");
  const [gradientStops, setGradientStops] = useState<GradientStop[]>([
    { color: { h: 220, s: 70, l: 55 }, position: 0 },
    { color: { h: 280, s: 70, l: 55 }, position: 100 },
  ]);
  const [activeTab, setActiveTab] = useState<"picker" | "palette" | "gradient" | "swatches">("picker");

  const hex = useMemo(() => hslToHex(color.h, color.s, color.l), [color]);
  const [r, g, b] = useMemo(() => hslToRgb(color.h, color.s, color.l), [color]);
  const contrast = useMemo(() => getContrast(hex), [hex]);
  const colorName = useMemo(() => nameColor(color.h, color.s, color.l), [color]);
  const palette = useMemo(() => generatePalette(color.h, color.s, paletteType), [color.h, color.s, paletteType]);

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1800);
  }, []);

  const addSwatch = () => {
    if (swatches.find((s) => s.hex === hex)) return;
    setSwatches((prev) => [{
      id: Date.now().toString(), hex, name: colorName, color: { ...color }, locked: false,
    }, ...prev].slice(0, 24));
  };

  const handleHexInput = (val: string) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) { setColor(hexToHsl(val)); setHexInput(""); }
  };

  const colorValues: Record<ColorSpace, string> = {
    hsl: `hsl(${color.h}, ${color.s}%, ${color.l}%)`,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hex: hex.toUpperCase(),
    oklch: hslToOklch(color.h, color.s, color.l),
  };

  const gradientCSS = useMemo(() => {
    const stops = [...gradientStops].sort((a, b) => a.position - b.position);
    const parts = stops.map((s) => `${hslToHex(s.color.h, s.color.s, s.color.l)} ${s.position}%`).join(", ");
    return `linear-gradient(90deg, ${parts})`;
  }, [gradientStops]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 52</span>
          <h1 className="header-title">Color Picker Extended</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        <div className="layout">

          {/* Left */}
          <div className="left-col">
            {/* Preview */}
            <div className="preview-card" style={{ background: hex }}>
              <span className="preview-name" style={{ color: contrast }}>{colorName}</span>
              <span className="preview-hex" style={{ color: contrast }}>{hex.toUpperCase()}</span>
              <span className="preview-sub" style={{ color: contrast + "99" }}>{colorValues.hsl}</span>
            </div>

            {/* Copy bar */}
            <div className="copy-bar">
              {(["hex","hsl","rgb","oklch"] as ColorSpace[]).map((space) => (
                <button key={space} className={`copy-btn ${copied === space ? "copied" : ""}`}
                  onClick={() => copy(colorValues[space], space)}>
                  {copied === space ? "✓" : space.toUpperCase()}
                </button>
              ))}
              <button className="save-btn" onClick={addSwatch}>+ Save</button>
            </div>

            {/* Hex paste */}
            <input className="hex-input" placeholder="Paste any hex (#1a2b3c)..."
              value={hexInput} onChange={(e) => handleHexInput(e.target.value)} maxLength={7} />

            {/* Tabs */}
            <div className="tabs">
              {(["picker","palette","gradient","swatches"] as const).map((t) => (
                <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab: Picker */}
            {activeTab === "picker" && (
              <div className="picker-panel">
                <ColorCanvas hue={color.h} s={color.s} l={color.l}
                  onChange={(s, l) => setColor((c) => ({ ...c, s, l }))} />

                {/* Hue strip */}
                <div className="hue-wrap">
                  <div className="hue-track">
                    <input type="range" min={0} max={360} value={color.h}
                      className="hue-slider"
                      onChange={(e) => setColor((c) => ({ ...c, h: Number(e.target.value) }))} />
                  </div>
                </div>

                {/* HSL sliders */}
                {[
                  { label: "H", val: color.h, max: 360, key: "h" as const, unit: "°" },
                  { label: "S", val: color.s, max: 100, key: "s" as const, unit: "%" },
                  { label: "L", val: color.l, max: 100, key: "l" as const, unit: "%" },
                ].map(({ label, val, max, key, unit }) => (
                  <div key={key} className="slider-row">
                    <span className="slider-label">{label}</span>
                    <input type="range" min={0} max={max} value={val}
                      onChange={(e) => setColor((c) => ({ ...c, [key]: Number(e.target.value) }))} />
                    <span className="slider-val">{val}{unit}</span>
                  </div>
                ))}

                {/* Space switcher */}
                <div className="space-row">
                  {(["hsl","rgb","hex","oklch"] as ColorSpace[]).map((sp) => (
                    <button key={sp} className={`space-btn ${activeSpace === sp ? "active" : ""}`}
                      onClick={() => setActiveSpace(sp)}>{sp.toUpperCase()}</button>
                  ))}
                </div>
                <div className="space-value">{colorValues[activeSpace]}</div>
              </div>
            )}

            {/* Tab: Palette */}
            {activeTab === "palette" && (
              <div className="palette-panel">
                <div className="palette-types">
                  {PALETTE_TYPES.map((t) => (
                    <button key={t} className={`pal-btn ${paletteType === t ? "active" : ""}`}
                      onClick={() => setPaletteType(t)}>{t}</button>
                  ))}
                </div>
                <div className="palette-grid">
                  {palette.map((c, i) => {
                    const ph = hslToHex(c.h, c.s, c.l);
                    return (
                      <div key={i} className="pal-swatch" style={{ background: ph }}
                        onClick={() => setColor(c)} title={ph.toUpperCase()}>
                        <span style={{ color: getContrast(ph), fontSize: 10 }}>{ph.toUpperCase()}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="panel-note">Click any swatch to set it as the active color</p>
              </div>
            )}

            {/* Tab: Gradient */}
            {activeTab === "gradient" && (
              <div className="gradient-panel">
                <div className="gradient-preview" style={{ background: gradientCSS }} />
                <div className="gradient-css">
                  <code>{gradientCSS}</code>
                  <button className={`copy-btn ${copied === "gradient" ? "copied" : ""}`}
                    onClick={() => copy(gradientCSS, "gradient")}>
                    {copied === "gradient" ? "✓" : "Copy"}
                  </button>
                </div>
                <div className="gradient-stops">
                  {gradientStops.map((stop, i) => (
                    <div key={i} className="gradient-stop">
                      <div className="stop-swatch" style={{ background: hslToHex(stop.color.h, stop.color.s, stop.color.l) }}
                        onClick={() => setColor(stop.color)} />
                      <div className="stop-controls">
                        <label className="stop-label">Stop {i + 1} — Position: {stop.position}%</label>
                        <input type="range" min={0} max={100} value={stop.position}
                          onChange={(e) => setGradientStops((prev) => prev.map((s, j) => j === i ? { ...s, position: Number(e.target.value) } : s))} />
                        <div className="stop-hue">
                          <label className="stop-label">Hue: {stop.color.h}°</label>
                          <input type="range" min={0} max={360} value={stop.color.h}
                            onChange={(e) => setGradientStops((prev) => prev.map((s, j) => j === i ? { ...s, color: { ...s.color, h: Number(e.target.value) } } : s))} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="add-stop-btn"
                    onClick={() => setGradientStops((prev) => [...prev, { color: { ...color }, position: 50 }])}>
                    + Add Stop
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Swatches */}
            {activeTab === "swatches" && (
              <div className="swatches-panel">
                {swatches.length === 0 ? (
                  <p className="panel-note">No saved swatches yet. Hit "+ Save" on any color.</p>
                ) : (
                  <div className="swatches-grid">
                    {swatches.map((sw) => (
                      <div key={sw.id} className="sw-item" onClick={() => setColor(sw.color)}
                        style={{ background: sw.hex }}>
                        <span className="sw-hex" style={{ color: getContrast(sw.hex) }}>{sw.hex.toUpperCase()}</span>
                        <button className="sw-del" style={{ color: getContrast(sw.hex) }}
                          onClick={(e) => { e.stopPropagation(); setSwatches((p) => p.filter((s) => s.id !== sw.id)); }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {swatches.length > 0 && (
                  <button className="clear-sw-btn" onClick={() => setSwatches([])}>Clear all swatches</button>
                )}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="right-col">
            <div className="info-card">
              <h3 className="info-title">Color Values</h3>
              {Object.entries(colorValues).map(([space, val]) => (
                <div key={space} className="info-row" onClick={() => copy(val, space + "-info")}>
                  <span className="info-key">{space.toUpperCase()}</span>
                  <span className="info-val">{val}</span>
                </div>
              ))}
            </div>

            {/* Contrast checker */}
            <div className="contrast-card">
              <h3 className="info-title">Contrast Check</h3>
              <div className="contrast-pair">
                <div className="contrast-sample" style={{ background: hex, color: "#fff" }}>White on {colorName}</div>
                <div className="contrast-sample" style={{ background: hex, color: "#000" }}>Black on {colorName}</div>
              </div>
              <div className="contrast-rec">
                Best choice: <strong style={{ color: contrast === "#ffffff" ? "#7c3aed" : "#c4622d" }}>
                  {contrast === "#ffffff" ? "White" : "Black"} text
                </strong>
              </div>
            </div>

            {/* Color wheel reference */}
            <div className="wheel-card">
              <h3 className="info-title">Current Color</h3>
              <div className="wheel-values">
                <div className="wv-item"><span className="wv-val">{color.h}°</span><span className="wv-lbl">Hue</span></div>
                <div className="wv-item"><span className="wv-val">{color.s}%</span><span className="wv-lbl">Saturation</span></div>
                <div className="wv-item"><span className="wv-val">{color.l}%</span><span className="wv-lbl">Lightness</span></div>
                <div className="wv-item"><span className="wv-val">{r}</span><span className="wv-lbl">Red</span></div>
                <div className="wv-item"><span className="wv-val">{g}</span><span className="wv-lbl">Green</span></div>
                <div className="wv-item"><span className="wv-val">{b}</span><span className="wv-lbl">Blue</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;