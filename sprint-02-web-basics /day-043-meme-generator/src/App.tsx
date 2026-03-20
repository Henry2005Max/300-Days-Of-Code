import React, { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";

// Types
interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  strokeColor: string;
  fontFamily: string;
  align: CanvasTextAlign;
  bold: boolean;
  italic: boolean;
}

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
}

// Templates
const TEMPLATES: MemeTemplate[] = [
  { id: "1", name: "Drake", url: "https://i.imgflip.com/30b1gx.jpg" },
  { id: "2", name: "Distracted Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg" },
  { id: "3", name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg" },
  { id: "4", name: "Change My Mind", url: "https://i.imgflip.com/24y43o.jpg" },
  { id: "5", name: "This Is Fine", url: "https://i.imgflip.com/wxica.jpg" },
  { id: "6", name: "Expanding Brain", url: "https://i.imgflip.com/1jwhww.jpg" },
  { id: "7", name: "Surprised Pikachu", url: "https://i.imgflip.com/2kbn1e.jpg" },
  { id: "8", name: "One Does Not Simply", url: "https://i.imgflip.com/1bij.jpg" },
];

const FONTS = ["Impact", "Arial", "Comic Sans MS", "Georgia", "Courier New", "Verdana"];

function makeLayer(overrides?: Partial<TextLayer>): TextLayer {
  return {
    id: Date.now().toString(),
    text: "YOUR TEXT HERE",
    x: 50,
    y: 10,
    fontSize: 40,
    color: "#ffffff",
    strokeColor: "#000000",
    fontFamily: "Impact",
    align: "center",
    bold: false,
    italic: false,
    ...overrides,
  };
}

// Canvas renderer
function drawMeme(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | null,
  layers: TextLayer[]
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (image) {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#333";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Select a template or upload an image", canvas.width / 2, canvas.height / 2);
  }

  layers.forEach((layer) => {
    const style = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${layer.fontSize}px ${layer.fontFamily}`;
    ctx.font = style;
    ctx.textAlign = layer.align;
    ctx.fillStyle = layer.color;
    ctx.strokeStyle = layer.strokeColor;
    ctx.lineWidth = layer.fontSize / 10;
    ctx.lineJoin = "round";

    const x = (layer.x / 100) * canvas.width;
    const y = (layer.y / 100) * canvas.height;

    // Word wrap
    const words = layer.text.split(" ");
    const maxWidth = canvas.width * 0.9;
    const lines: string[] = [];
    let current = "";

    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);

    const lineHeight = layer.fontSize * 1.2;
    lines.forEach((line, i) => {
      const ly = y + i * lineHeight;
      ctx.strokeText(line, x, ly);
      ctx.fillText(line, x, ly);
    });
  });
}

// App
const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [layers, setLayers] = useState<TextLayer[]>([
    makeLayer({ text: "TOP TEXT", x: 50, y: 8 }),
    makeLayer({ id: "2", text: "BOTTOM TEXT", x: 50, y: 88 }),
  ]);
  const [activeId, setActiveId] = useState<string>(layers[0].id);
  const [canvasSize] = useState({ w: 560, h: 420 });

  const activeLayer = layers.find((l) => l.id === activeId) ?? layers[0];

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawMeme(canvas, image, layers);
  }, [image, layers]);

  useEffect(() => { redraw(); }, [redraw]);

  const updateLayer = (patch: Partial<TextLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === activeId ? { ...l, ...patch } : l)));
  };

  const loadTemplate = (url: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.src = url;
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addLayer = () => {
    const layer = makeLayer({ text: "NEW TEXT", x: 50, y: 50 });
    setLayers((prev) => [...prev, layer]);
    setActiveId(layer.id);
  };

  const deleteLayer = (id: string) => {
    if (layers.length === 1) return;
    const remaining = layers.filter((l) => l.id !== id);
    setLayers(remaining);
    setActiveId(remaining[0].id);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 43</span>
          <h1 className="header-title">Meme Generator</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        <div className="layout">

          {/* Left — Controls */}
          <div className="controls-col">

            {/* Templates */}
            <div className="panel">
              <h3 className="panel-title">Templates</h3>
              <div className="templates-grid">
                {TEMPLATES.map((t) => (
                  <button key={t.id} className="template-btn" onClick={() => loadTemplate(t.url)} title={t.name}>
                    <img src={t.url} alt={t.name} className="template-thumb" crossOrigin="anonymous" />
                    <span className="template-name">{t.name}</span>
                  </button>
                ))}
              </div>
              <button className="upload-btn" onClick={() => fileRef.current?.click()}>
                Upload Image
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>

            {/* Text Layers */}
            <div className="panel">
              <div className="panel-row">
                <h3 className="panel-title">Text Layers</h3>
                <button className="icon-btn" onClick={addLayer}>+ Add</button>
              </div>
              <div className="layers-list">
                {layers.map((l) => (
                  <div key={l.id} className={`layer-item ${l.id === activeId ? "active" : ""}`} onClick={() => setActiveId(l.id)}>
                    <span className="layer-text">{l.text.slice(0, 24) || "Empty"}</span>
                    <button className="del-btn" onClick={(e) => { e.stopPropagation(); deleteLayer(l.id); }}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Text Editor */}
            <div className="panel">
              <h3 className="panel-title">Edit Layer</h3>

              <div className="field">
                <label className="field-label">Text</label>
                <textarea className="text-input" rows={2} value={activeLayer.text}
                  onChange={(e) => updateLayer({ text: e.target.value })} />
              </div>

              <div className="field">
                <label className="field-label">Font</label>
                <select className="select-input" value={activeLayer.fontFamily}
                  onChange={(e) => updateLayer({ fontFamily: e.target.value })}>
                  {FONTS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>

              <div className="two-col">
                <div className="field">
                  <label className="field-label">Size: {activeLayer.fontSize}px</label>
                  <input type="range" min={12} max={100} value={activeLayer.fontSize}
                    onChange={(e) => updateLayer({ fontSize: Number(e.target.value) })} />
                </div>
                <div className="field">
                  <label className="field-label">Align</label>
                  <select className="select-input" value={activeLayer.align}
                    onChange={(e) => updateLayer({ align: e.target.value as CanvasTextAlign })}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <div className="two-col">
                <div className="field">
                  <label className="field-label">Text Color</label>
                  <input type="color" className="color-input" value={activeLayer.color}
                    onChange={(e) => updateLayer({ color: e.target.value })} />
                </div>
                <div className="field">
                  <label className="field-label">Stroke</label>
                  <input type="color" className="color-input" value={activeLayer.strokeColor}
                    onChange={(e) => updateLayer({ strokeColor: e.target.value })} />
                </div>
              </div>

              <div className="two-col">
                <div className="field">
                  <label className="field-label">X: {activeLayer.x}%</label>
                  <input type="range" min={0} max={100} value={activeLayer.x}
                    onChange={(e) => updateLayer({ x: Number(e.target.value) })} />
                </div>
                <div className="field">
                  <label className="field-label">Y: {activeLayer.y}%</label>
                  <input type="range" min={0} max={100} value={activeLayer.y}
                    onChange={(e) => updateLayer({ y: Number(e.target.value) })} />
                </div>
              </div>

              <div className="toggle-row">
                <label className="toggle-label">
                  <input type="checkbox" checked={activeLayer.bold} onChange={(e) => updateLayer({ bold: e.target.checked })} />
                  Bold
                </label>
                <label className="toggle-label">
                  <input type="checkbox" checked={activeLayer.italic} onChange={(e) => updateLayer({ italic: e.target.checked })} />
                  Italic
                </label>
              </div>
            </div>
          </div>

          {/* Right — Canvas */}
          <div className="canvas-col">
            <div className="canvas-wrap">
              <canvas ref={canvasRef} width={canvasSize.w} height={canvasSize.h} className="canvas" />
            </div>
            <button className="download-btn" onClick={download}>Download Meme</button>
            <p className="canvas-hint">Select a template, edit text layers, then download.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;