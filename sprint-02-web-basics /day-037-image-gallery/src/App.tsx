import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Image {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  author: string;
  width: number;
  height: number;
  color: string;
  tags: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TAGS = ["All", "Nature", "City", "Architecture", "People", "Technology", "Abstract"];

const IMAGES: Image[] = [
  { id: "1", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200", thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", alt: "Mountain landscape", author: "Samuel Ferrara", width: 1200, height: 800, color: "#4a7c59", tags: ["Nature"] },
  { id: "2", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200", thumb: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400", alt: "City skyline at night", author: "Roberto Nickson", width: 1200, height: 900, color: "#1a2a4a", tags: ["City"] },
  { id: "3", url: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1200", thumb: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400", alt: "Modern architecture", author: "Alain Pham", width: 1200, height: 800, color: "#c8c8c8", tags: ["Architecture"] },
  { id: "4", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200", thumb: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400", alt: "Green forest aerial", author: "Geran de Klerk", width: 1200, height: 800, color: "#2d5a27", tags: ["Nature"] },
  { id: "5", url: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=1200", thumb: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400", alt: "Code on screen", author: "Shahadat Rahman", width: 1200, height: 800, color: "#0d1117", tags: ["Technology"] },
  { id: "6", url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1200", thumb: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400", alt: "Person in crowd", author: "Aranxa Esteve", width: 1200, height: 900, color: "#8a6a4a", tags: ["People"] },
  { id: "7", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200", thumb: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", alt: "Abstract color", author: "Matt Moloney", width: 1200, height: 800, color: "#e84393", tags: ["Abstract"] },
  { id: "8", url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200", thumb: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400", alt: "City street", author: "Pedro Lastra", width: 1200, height: 800, color: "#3a3a3a", tags: ["City"] },
  { id: "9", url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200", thumb: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400", alt: "Lake reflection", author: "Luca Bravo", width: 1200, height: 800, color: "#4a6fa5", tags: ["Nature"] },
  { id: "10", url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200", thumb: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400", alt: "Glass building", width: 1200, height: 900, color: "#6a8fa5", author: "Nik Shuliahin", tags: ["Architecture"] },
  { id: "11", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200", thumb: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400", alt: "Circuit board", author: "Alexandre Debiève", width: 1200, height: 800, color: "#1a3a2a", tags: ["Technology"] },
  { id: "12", url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200", thumb: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400", alt: "Portrait close up", author: "Valeria Zoncoll", width: 1200, height: 1500, color: "#c8a882", tags: ["People"] },
  { id: "13", url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=1200", thumb: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=400", alt: "Abstract waves", author: "Pietro Jeng", width: 1200, height: 800, color: "#1a1a4a", tags: ["Abstract"] },
  { id: "14", url: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200", thumb: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400", alt: "City bridge", author: "Sawyer Bengtson", width: 1200, height: 800, color: "#2a2a3a", tags: ["City"] },
  { id: "15", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200", thumb: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400", alt: "Mountain peak", author: "Kalen Emsley", width: 1200, height: 800, color: "#5a6a7a", tags: ["Nature"] },
  { id: "16", url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200", thumb: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400", alt: "Laptop on desk", author: "Glenn Carstens-Peters", width: 1200, height: 800, color: "#e8e8e8", tags: ["Technology"] },
];

// ─── Lazy Image ───────────────────────────────────────────────────────────────

const LazyImage: React.FC<{
  src: string;
  alt: string;
  color: string;
  onClick: () => void;
}> = ({ src, alt, color, onClick }) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="lazy-wrap" onClick={onClick}>
      {/* Placeholder */}
      <div
        className={`lazy-placeholder ${loaded ? "hidden" : ""}`}
        style={{ background: color + "44" }}
      >
        <div className="lazy-shimmer" />
      </div>
      {/* Image — only renders src when in view */}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`lazy-img ${loaded ? "visible" : ""}`}
          onLoad={() => setLoaded(true)}
        />
      )}
      <div className="img-overlay">
        <span className="img-zoom">+</span>
      </div>
    </div>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────

const Lightbox: React.FC<{
  image: Image;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}> = ({ image, onClose, onPrev, onNext, hasPrev, hasNext }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [image, onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lb-close" onClick={onClose}>✕</button>
      <button className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} disabled={!hasPrev}>‹</button>
      <div className="lb-content" onClick={(e) => e.stopPropagation()}>
        {!loaded && <div className="lb-loading">Loading...</div>}
        <img
          src={image.url}
          alt={image.alt}
          className={`lb-img ${loaded ? "visible" : ""}`}
          onLoad={() => setLoaded(true)}
        />
        <div className="lb-info">
          <span className="lb-alt">{image.alt}</span>
          <span className="lb-author">Photo by {image.author}</span>
          <div className="lb-tags">
            {image.tags.map((t) => <span key={t} className="lb-tag">{t}</span>)}
          </div>
        </div>
      </div>
      <button className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); onNext(); }} disabled={!hasNext}>›</button>
    </div>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [activeTag, setActiveTag] = useState("All");
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [columns, setColumns] = useState(3);

  const filtered = IMAGES.filter((img) => {
    const matchTag = activeTag === "All" || img.tags.includes(activeTag);
    const matchSearch = img.alt.toLowerCase().includes(search.toLowerCase()) || img.author.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  const openLightbox = useCallback((index: number) => setLightbox(index), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const prevImage = useCallback(() => {
    if (lightbox !== null && lightbox > 0) setLightbox(lightbox - 1);
  }, [lightbox]);

  const nextImage = useCallback(() => {
    if (lightbox !== null && lightbox < filtered.length - 1) setLightbox(lightbox + 1);
  }, [lightbox, filtered.length]);

  // Build masonry columns
  const buildColumns = () => {
    const cols: Image[][] = Array.from({ length: columns }, () => []);
    filtered.forEach((img, i) => cols[i % columns].push(img));
    return cols;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="header-day">Day 37</span>
          <h1 className="header-title">Image Gallery</h1>
          <span className="header-sprint">Sprint 2 — Web Basics</span>
        </div>
      </header>

      <main className="main">
        {/* Controls */}
        <div className="controls-bar">
          <input
            className="search-input"
            placeholder="Search by subject or photographer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="col-toggle">
            {[2, 3, 4].map((n) => (
              <button key={n} className={`col-btn ${columns === n ? "active" : ""}`} onClick={() => setColumns(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="tags-bar">
          {TAGS.map((t) => (
            <button key={t} className={`tag-btn ${activeTag === t ? "active" : ""}`} onClick={() => setActiveTag(t)}>
              {t}
              <span className="tag-count">
                {t === "All" ? IMAGES.length : IMAGES.filter((i) => i.tags.includes(t)).length}
              </span>
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="results-bar">
          {filtered.length} {filtered.length === 1 ? "image" : "images"}
          {search && ` matching "${search}"`}
          {activeTag !== "All" && ` in ${activeTag}`}
        </div>

        {/* Masonry Grid */}
        {filtered.length > 0 ? (
          <div className="masonry" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {buildColumns().map((col, ci) => (
              <div key={ci} className="masonry-col">
                {col.map((img) => {
                  const globalIndex = filtered.indexOf(img);
                  return (
                    <div key={img.id} className="masonry-item">
                      <LazyImage
                        src={img.thumb}
                        alt={img.alt}
                        color={img.color}
                        onClick={() => openLightbox(globalIndex)}
                      />
                      <div className="item-meta">
                        <span className="item-alt">{img.alt}</span>
                        <span className="item-author">{img.author}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No images found. Try a different search or tag.</div>
        )}
      </main>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <Lightbox
          image={filtered[lightbox]}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
          hasPrev={lightbox > 0}
          hasNext={lightbox < filtered.length - 1}
        />
      )}
    </div>
  );
};

export default App;