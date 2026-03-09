import React, { useState } from "react";
import styled, { createGlobalStyle, ThemeProvider, keyframes } from "styled-components";

// ─── Themes ───────────────────────────────────────────────────────────────────

const lightTheme = {
  name: "light",
  bg: "#f2ede4",
  bgAlt: "#e8e0d2",
  surface: "#fff",
  ink: "#1a1208",
  inkMuted: "#6b5f4e",
  inkFaint: "#9c9080",
  accent: "#d4521a",
  accentLight: "#fbeee6",
  accentDark: "#a33d10",
  border: "#d8cfbf",
  navBg: "rgba(242, 237, 228, 0.85)",
};

const darkTheme = {
  name: "dark",
  bg: "#0e0c09",
  bgAlt: "#161410",
  surface: "#1c1a15",
  ink: "#f0ead8",
  inkMuted: "#a8997e",
  inkFaint: "#6b5f4e",
  accent: "#e8651f",
  accentLight: "#2a1a0e",
  accentDark: "#f07840",
  border: "#2a2620",
  navBg: "rgba(14, 12, 9, 0.85)",
};

type Theme = typeof lightTheme;

// ─── Global Styles ────────────────────────────────────────────────────────────

const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Libre+Baskerville:ital@0;1&family=Jost:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Jost', sans-serif;
    background: ${({ theme }) => theme.bg};
    color: ${({ theme }) => theme.ink};
    transition: background 0.4s ease, color 0.4s ease;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  ::selection {
    background: ${({ theme }) => theme.accent};
    color: #fff;
  }
`;

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.04); }
`;

// ─── Nav ─────────────────────────────────────────────────────────────────────

const Nav = styled.nav<{ theme: Theme }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 64px;
  background: ${({ theme }) => theme.navBg};
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${({ theme }) => theme.border};
  transition: background 0.4s ease, border-color 0.4s ease;

  @media (max-width: 768px) { padding: 16px 24px; }
`;

const NavLogo = styled.span<{ theme: Theme }>`
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 900;
  color: ${({ theme }) => theme.accent};
  letter-spacing: -0.5px;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;

  @media (max-width: 768px) { gap: 16px; }
`;

const NavLink = styled.a<{ theme: Theme }>`
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.inkMuted};
  text-decoration: none;
  transition: color 0.2s;

  &:hover { color: ${({ theme }) => theme.accent}; }

  @media (max-width: 600px) { display: none; }
`;

const ThemeToggle = styled.button<{ theme: Theme }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.ink};
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
  }
`;

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HeroSection = styled.section<{ theme: Theme }>`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 120px 64px 80px;
  gap: 64px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, ${({ theme }) => theme.accent}18 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 100px 24px 60px;
    text-align: center;
  }
`;

const HeroLeft = styled.div`
  animation: ${fadeUp} 0.8s ease both;
`;

const HeroBadge = styled.span<{ theme: Theme }>`
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: ${({ theme }) => theme.accent};
  background: ${({ theme }) => theme.accentLight};
  border: 1px solid ${({ theme }) => theme.accent}40;
  padding: 6px 14px;
  margin-bottom: 24px;
  animation: ${slideIn} 0.6s ease both;
`;

const HeroTitle = styled.h1<{ theme: Theme }>`
  font-family: 'Playfair Display', serif;
  font-size: clamp(42px, 6vw, 80px);
  font-weight: 900;
  line-height: 1.05;
  color: ${({ theme }) => theme.ink};
  margin-bottom: 24px;

  em {
    font-style: italic;
    color: ${({ theme }) => theme.accent};
  }
`;

const HeroSub = styled.p<{ theme: Theme }>`
  font-family: 'Libre Baskerville', serif;
  font-size: 17px;
  line-height: 1.8;
  color: ${({ theme }) => theme.inkMuted};
  font-style: italic;
  max-width: 480px;
  margin-bottom: 40px;

  @media (max-width: 900px) { margin: 0 auto 40px; }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 900px) { justify-content: center; }
`;

const PrimaryBtn = styled.a<{ theme: Theme }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: ${({ theme }) => theme.accent};
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-decoration: none;
  border: 2px solid ${({ theme }) => theme.accent};
  cursor: pointer;
  transition: all 0.2s;
  animation: ${pulse} 3s ease infinite;

  &:hover {
    background: ${({ theme }) => theme.accentDark};
    border-color: ${({ theme }) => theme.accentDark};
    animation: none;
    transform: translateY(-2px);
  }
`;

const SecondaryBtn = styled.a<{ theme: Theme }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: transparent;
  color: ${({ theme }) => theme.ink};
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-decoration: none;
  border: 2px solid ${({ theme }) => theme.border};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.ink};
    transform: translateY(-2px);
  }
`;

const HeroRight = styled.div<{ theme: Theme }>`
  animation: ${fadeUp} 0.8s 0.2s ease both;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 40px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    right: -8px;
    bottom: -8px;
    border: 1px solid ${({ theme }) => theme.accent}40;
    pointer-events: none;
    z-index: -1;
  }

  @media (max-width: 900px) { display: none; }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
`;

const StatBox = styled.div<{ theme: Theme }>`
  padding: 20px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
`;

const StatNum = styled.div<{ theme: Theme }>`
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  font-weight: 900;
  color: ${({ theme }) => theme.accent};
  line-height: 1;
  margin-bottom: 4px;
`;

const StatLabel = styled.div<{ theme: Theme }>`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.inkFaint};
  font-weight: 500;
`;

const ProgressItem = styled.div`
  margin-bottom: 16px;
`;

const ProgressLabel = styled.div<{ theme: Theme }>`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: ${({ theme }) => theme.inkMuted};
  margin-bottom: 6px;
  font-weight: 500;
`;

const ProgressBar = styled.div<{ theme: Theme }>`
  height: 3px;
  background: ${({ theme }) => theme.border};
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: string; theme: Theme }>`
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: ${({ width }) => width};
  background: ${({ theme }) => theme.accent};
  animation: ${fadeUp} 1s ease both;
`;

// ─── Features Section ─────────────────────────────────────────────────────────

const Section = styled.section<{ theme: Theme; alt?: boolean }>`
  padding: 100px 64px;
  background: ${({ theme, alt }) => (alt ? theme.bgAlt : theme.bg)};
  transition: background 0.4s ease;

  @media (max-width: 768px) { padding: 60px 24px; }
`;

const SectionLabel = styled.div<{ theme: Theme }>`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: ${({ theme }) => theme.accent};
  font-weight: 500;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h2<{ theme: Theme }>`
  font-family: 'Playfair Display', serif;
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 700;
  color: ${({ theme }) => theme.ink};
  line-height: 1.15;
  margin-bottom: 16px;
`;

const SectionSub = styled.p<{ theme: Theme }>`
  font-size: 16px;
  color: ${({ theme }) => theme.inkMuted};
  line-height: 1.8;
  max-width: 560px;
  margin-bottom: 56px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const FeatureCard = styled.div<{ theme: Theme }>`
  background: ${({ theme }) => theme.surface};
  padding: 40px 32px;
  border: 1px solid ${({ theme }) => theme.border};
  transition: all 0.3s;
  cursor: default;

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 12px 40px ${({ theme }) => theme.accent}18;
  }
`;

const FeatureIcon = styled.div<{ theme: Theme }>`
  font-size: 28px;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3<{ theme: Theme }>`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.ink};
  margin-bottom: 12px;
`;

const FeatureDesc = styled.p<{ theme: Theme }>`
  font-size: 14px;
  line-height: 1.8;
  color: ${({ theme }) => theme.inkMuted};
  font-weight: 300;
`;

// ─── Testimonial ──────────────────────────────────────────────────────────────

const TestimonialSection = styled(Section)`
  text-align: center;
`;

const Quote = styled.blockquote<{ theme: Theme }>`
  font-family: 'Playfair Display', serif;
  font-size: clamp(20px, 3vw, 32px);
  font-weight: 400;
  font-style: italic;
  color: ${({ theme }) => theme.ink};
  line-height: 1.6;
  max-width: 760px;
  margin: 0 auto 32px;

  &::before { content: '\u201C'; color: ${({ theme }) => theme.accent}; font-size: 1.5em; }
  &::after  { content: '\u201D'; color: ${({ theme }) => theme.accent}; font-size: 1.5em; }
`;

const QuoteAuthor = styled.div<{ theme: Theme }>`
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.inkFaint};
`;

// ─── CTA ─────────────────────────────────────────────────────────────────────

const CtaSection = styled.section<{ theme: Theme }>`
  padding: 100px 64px;
  background: ${({ theme }) => theme.accent};
  text-align: center;

  @media (max-width: 768px) { padding: 60px 24px; }
`;

const CtaTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 16px;
`;

const CtaSub = styled.p`
  font-size: 16px;
  color: rgba(255,255,255,0.8);
  margin-bottom: 40px;
  font-style: italic;
  font-family: 'Libre Baskerville', serif;
`;

const CtaBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 40px;
  background: #fff;
  color: #d4521a;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-decoration: none;
  transition: all 0.2s;

  &:hover { background: #f0ead8; transform: translateY(-2px); }
`;

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer = styled.footer<{ theme: Theme }>`
  padding: 40px 64px;
  background: ${({ theme }) => theme.bg};
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: ${({ theme }) => theme.inkFaint};
  transition: background 0.4s ease;

  @media (max-width: 768px) { padding: 32px 24px; flex-direction: column; gap: 12px; }
`;

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: "⚡",
    title: "Blazing Fast",
    desc: "Built with Vite and React 18. Instant hot reload during development and optimised production bundles that load in milliseconds.",
  },
  {
    icon: "🎨",
    title: "Fully Themed",
    desc: "Dark and light mode powered by styled-components ThemeProvider. Every colour, shadow, and surface adapts instantly — no flash, no glitch.",
  },
  {
    icon: "📱",
    title: "Responsive",
    desc: "Fluid layouts that work on any screen. CSS Grid with thoughtful breakpoints for mobile, tablet, and desktop experiences.",
  },
  {
    icon: "🔷",
    title: "Type Safe",
    desc: "Every component, prop, and theme value is typed with TypeScript. Catch errors at compile time, not in production.",
  },
  {
    icon: "✨",
    title: "Animated",
    desc: "Keyframe animations on hero load, hover lifts on cards, and a pulsing CTA button. Subtle motion that adds polish without distraction.",
  },
  {
    icon: "🧱",
    title: "Component Driven",
    desc: "Each section is a self-contained styled component. Swap themes, reorder sections, or extend with new blocks effortlessly.",
  },
];

const skills = [
  { label: "TypeScript / React", value: "85%" },
  { label: "Node.js / Express", value: "75%" },
  { label: "Python / AI APIs", value: "70%" },
  { label: "CSS / Styled Components", value: "80%" },
];

// ─── App ─────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle theme={theme} />

      {/* Nav */}
      <Nav theme={theme}>
        <NavLogo theme={theme}>Henry.dev</NavLogo>
        <NavLinks>
          <NavLink href="#features" theme={theme}>Features</NavLink>
          <NavLink href="#about" theme={theme}>About</NavLink>
          <NavLink href="#contact" theme={theme}>Contact</NavLink>
          <ThemeToggle theme={theme} onClick={() => setIsDark(!isDark)}>
            {isDark ? "☀️" : "🌙"}
          </ThemeToggle>
        </NavLinks>
      </Nav>

      {/* Hero */}
      <HeroSection theme={theme}>
        <HeroLeft>
          <HeroBadge theme={theme}>300 Days of Code — Sprint 2</HeroBadge>
          <HeroTitle theme={theme}>
            Build things that<br />
            <em>actually matter.</em>
          </HeroTitle>
          <HeroSub theme={theme}>
            A themed landing page built with React, TypeScript, and styled-components.
            Dark mode, animations, and full responsiveness. All from a single ThemeProvider.
          </HeroSub>
          <ButtonRow>
            <PrimaryBtn href="#features" theme={theme}>View Features</PrimaryBtn>
            <SecondaryBtn href="https://github.com/Henry2005Max" theme={theme}>GitHub</SecondaryBtn>
          </ButtonRow>
        </HeroLeft>

        <HeroRight theme={theme}>
          <StatGrid>
            <StatBox theme={theme}>
              <StatNum theme={theme}>32</StatNum>
              <StatLabel theme={theme}>Days Done</StatLabel>
            </StatBox>
            <StatBox theme={theme}>
              <StatNum theme={theme}>268</StatNum>
              <StatLabel theme={theme}>Days Left</StatLabel>
            </StatBox>
            <StatBox theme={theme}>
              <StatNum theme={theme}>10</StatNum>
              <StatLabel theme={theme}>Sprints Total</StatLabel>
            </StatBox>
            <StatBox theme={theme}>
              <StatNum theme={theme}>300</StatNum>
              <StatLabel theme={theme}>Projects Goal</StatLabel>
            </StatBox>
          </StatGrid>

          {skills.map((s) => (
            <ProgressItem key={s.label}>
              <ProgressLabel theme={theme}>
                <span>{s.label}</span>
                <span>{s.value}</span>
              </ProgressLabel>
              <ProgressBar theme={theme}>
                <ProgressFill width={s.value} theme={theme} />
              </ProgressBar>
            </ProgressItem>
          ))}
        </HeroRight>
      </HeroSection>

      {/* Features */}
      <Section id="features" theme={theme} alt>
        <SectionLabel theme={theme}>What's Inside</SectionLabel>
        <SectionTitle theme={theme}>Everything you need<br />to ship fast.</SectionTitle>
        <SectionSub theme={theme}>
          Six key features demonstrating what styled-components ThemeProvider
          unlocks when combined with TypeScript and React 18.
        </SectionSub>
        <FeaturesGrid>
          {features.map((f) => (
            <FeatureCard key={f.title} theme={theme}>
              <FeatureIcon theme={theme}>{f.icon}</FeatureIcon>
              <FeatureTitle theme={theme}>{f.title}</FeatureTitle>
              <FeatureDesc theme={theme}>{f.desc}</FeatureDesc>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </Section>

      {/* Testimonial */}
      <TestimonialSection id="about" theme={theme}>
        <SectionLabel theme={theme}>The Mission</SectionLabel>
        <Quote theme={theme}>
          Consistency beats talent when talent doesn't show up every day.
          Ship something real, every single day, for 300 days.
        </Quote>
        <QuoteAuthor theme={theme}>Henry Ehindero — 300 Days of Code</QuoteAuthor>
      </TestimonialSection>

      {/* CTA */}
      <CtaSection id="contact" theme={theme}>
        <CtaTitle>Ready to follow the journey?</CtaTitle>
        <CtaSub>30 days down. 270 to go. Come watch it happen.</CtaSub>
        <CtaBtn href="https://github.com/Henry2005Max">View on GitHub</CtaBtn>
      </CtaSection>

      {/* Footer */}
      <Footer theme={theme}>
        <span>Day 32 — 300 Days of Code</span>
        <span>Built with React + TypeScript + styled-components</span>
      </Footer>
    </ThemeProvider>
  );
};

export default App;
