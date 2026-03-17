import React from "react";

const resume = {
  name: "Henry Ehindero",
  title: "Aspiring AI Engineer & Full-Stack Developer",
  location: "Lagos, Nigeria",
  email: "ehinderohenry7@gmail.com",
  github: "github.com/Henry2005Max",
  linkedin: "linkedin.com/in/henry-ehindero",
  summary:
    "Building expertise in software development and AI systems through consistent daily practice. Currently on a 300 Days of Code challenge, shipping real projects across TypeScript, React, Node.js, and AI engineering. Passionate about building tools that solve real problems.",
  skills: [
    { category: "Languages", items: ["TypeScript", "JavaScript", "Python", "C++"] },
    { category: "Frontend", items: ["React", "Tailwind CSS", "HTML/CSS"] },
    { category: "Backend", items: ["Node.js", "Express", "REST APIs"] },
    { category: "Tools", items: ["Git", "GitHub Actions", "VS Code", "Jest"] },
    { category: "AI & Data", items: ["Anthropic API", "LangChain", "Papaparse", "Lodash"] },
  ],
  experience: [
    {
      role: "Freelance Web Developer",
      company: "Self-Employed",
      period: "2024 — Present",
      points: [
        "Built and delivered client websites including school and business sites",
        "Handled full project scope: design, development, and deployment",
        "Worked directly with Nigerian clients to deliver practical, responsive solutions",
      ],
    },
  ],
  projects: [
    {
      name: "300 Days of Code — Sprint 1 & 2",
      tech: "TypeScript · React · Node.js · lodash · Axios",
      desc: "40-day coding challenge building CLI tools, React UIs, and full data pipelines. All projects pushed to GitHub daily.",
    },
    {
      name: "Self-Improving Coding Agent",
      tech: "Python · Anthropic API · Rich · subprocess",
      desc: "An AI agent that writes, tests, and improves its own code. Features sandboxed execution, memory, and a safety layer.",
    },
    {
      name: "School Website",
      tech: "HTML · CSS · JavaScript",
      desc: "Full client website for a Nigerian school. Responsive design with pages for admissions, staff, and announcements.",
    },
  ],
  education: [
    {
      degree: "Self-Directed Software Engineering",
      institution: "300 Days of Code Challenge",
      period: "2025 — Present",
      note: "Structured learning across TypeScript, React, Node.js, C++, and AI engineering",
    },
  ],
};

// ─── Section ──────────────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-10">
    <div className="flex items-center gap-4 mb-6">
      <h2 className="font-serif text-xl font-normal text-gray-900 whitespace-nowrap">{title}</h2>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
    {children}
  </section>
);

// ─── App ─────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header bar */}
      <div className="bg-stone-900 text-white px-6 py-3 flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-orange-400 bg-white/10 border border-white/20 px-2 py-1">Day 40</span>
        <span className="text-sm font-semibold flex-1">Resume — Tailwind Responsive</span>
        <span className="text-xs text-white/40">Sprint 2 — Web Basics</span>
      </div>

      <div className="lg:grid lg:grid-cols-[280px_1fr] min-h-[calc(100vh-44px)]">

        {/* ── Sidebar ────────────────────────────────────────── */}
        <aside className="bg-stone-900 text-stone-100 p-8 lg:p-10 flex flex-col gap-7">

          {/* Avatar + Name */}
          <div className="flex flex-col items-start gap-3">
            <div className="w-14 h-14 rounded bg-orange-600 flex items-center justify-center font-serif text-xl text-white tracking-wide">
              {resume.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-normal text-white leading-tight">{resume.name}</h1>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mt-1 leading-relaxed">{resume.title}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="border-t border-stone-700 pt-6 flex flex-col gap-3">
            {[
              { label: "Location", value: resume.location },
              { label: "Email", value: resume.email },
              { label: "GitHub", value: resume.github },
              { label: "LinkedIn", value: resume.linkedin },
            ].map(item => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">{item.label}</span>
                <span className="text-xs text-stone-300 break-all">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="border-t border-stone-700 pt-6 flex flex-col gap-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">Skills</h3>
            {resume.skills.map(group => (
              <div key={group.category} className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-300">{group.category}</span>
                <div className="flex flex-wrap gap-1">
                  {group.items.map(item => (
                    <span key={item} className="text-[11px] bg-stone-800 border border-stone-700 text-stone-400 px-2 py-0.5">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main ───────────────────────────────────────────── */}
        <main className="p-8 lg:p-14 bg-stone-50">

          {/* Summary */}
          <Section title="Summary">
            <p className="text-sm text-gray-500 leading-relaxed font-light max-w-xl">{resume.summary}</p>
          </Section>

          {/* Experience */}
          <Section title="Experience">
            {resume.experience.map(exp => (
              <div key={exp.role} className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{exp.role}</h3>
                    <span className="text-sm text-orange-600 font-medium">{exp.company}</span>
                  </div>
                  <span className="text-xs text-gray-400 sm:pt-1">{exp.period}</span>
                </div>
                <ul className="pl-4 flex flex-col gap-1.5">
                  {exp.points.map((p, i) => (
                    <li key={i} className="text-sm text-gray-500 font-light leading-relaxed list-disc">{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>

          {/* Projects */}
          <Section title="Projects">
            <div className="flex flex-col gap-3">
              {resume.projects.map(proj => (
                <div key={proj.name} className="bg-white border border-gray-200 border-l-4 border-l-orange-500 p-5 hover:border-l-gray-900 transition-all">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{proj.name}</h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-orange-500">{proj.tech}</span>
                  <p className="text-sm text-gray-500 font-light leading-relaxed mt-2">{proj.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Education */}
          <Section title="Education">
            {resume.education.map(edu => (
              <div key={edu.degree} className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{edu.degree}</h3>
                    <span className="text-sm text-orange-600 font-medium">{edu.institution}</span>
                  </div>
                  <span className="text-xs text-gray-400 sm:pt-1">{edu.period}</span>
                </div>
                <p className="text-sm text-gray-400 font-light">{edu.note}</p>
              </div>
            ))}
          </Section>

          {/* Tailwind showcase note */}
          <div className="border border-dashed border-gray-300 p-5 mt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Day 40 — What Changed from Day 31</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Replaced custom CSS with Tailwind utility classes",
                "lg:grid-cols-[280px_1fr] — responsive two-column layout",
                "Sidebar stacks above main on mobile",
                "sm:flex-row — job title/date row wraps on small screens",
                "Hover transitions using hover: and transition-all",
                "Spacing, color, typography all via Tailwind tokens",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-orange-400 mt-0.5">→</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;