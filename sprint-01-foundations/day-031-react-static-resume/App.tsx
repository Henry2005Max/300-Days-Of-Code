import React from "react";
import "./App.css";

const resume = {
  name: "Henry Ehindero",
  title: "Aspiring AI Engineer & Full-Stack Developer",
  location: "Lagos, Nigeria",
  email: "henry@example.com",
  github: "github.com/Henry2005Max",
  linkedin: "linkedin.com/in/henry-ehindero",
  summary:
    "Building expertise in software development and AI systems through consistent daily practice. Currently on a 300 Days of Code challenge, shipping real projects across TypeScript, React, Node.js, and AI engineering. Passionate about building tools that solve real problems.",
  skills: [
    { category: "Languages", items: ["TypeScript", "JavaScript", "Python", "C++"] },
    { category: "Frontend", items: ["React", "HTML/CSS", "Tailwind CSS"] },
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
      name: "300 Days of Code — Sprint 1",
      tech: "TypeScript · Node.js · lodash · papaparse · node-cron",
      desc: "30-day CLI challenge building tools from calculators to full data pipelines. All projects pushed to GitHub daily.",
    },
    {
      name: "Self-Improving Coding Agent",
      tech: "Python · Anthropic API · Rich · subprocess",
      desc: "An AI agent that writes, tests, and improves its own code. Features sandboxed execution, memory system, safety layer, and circuit breaker.",
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

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="section">
    <div className="section-header">
      <h2>{title}</h2>
      <div className="section-line" />
    </div>
    {children}
  </section>
);

const App: React.FC = () => {
  return (
    <div className="page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="avatar">
          {resume.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <h1 className="name">{resume.name}</h1>
        <p className="title">{resume.title}</p>

        <div className="contact-block">
          <div className="contact-item">
            <span className="contact-label">Location</span>
            <span>{resume.location}</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Email</span>
            <span>{resume.email}</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">GitHub</span>
            <span>{resume.github}</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">LinkedIn</span>
            <span>{resume.linkedin}</span>
          </div>
        </div>

        <div className="skills-sidebar">
          <h3 className="skills-heading">Skills</h3>
          {resume.skills.map((group) => (
            <div key={group.category} className="skill-group">
              <span className="skill-category">{group.category}</span>
              <div className="skill-tags">
                {group.items.map((item) => (
                  <span key={item} className="skill-tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <Section title="Summary">
          <p className="summary-text">{resume.summary}</p>
        </Section>

        <Section title="Experience">
          {resume.experience.map((exp) => (
            <div key={exp.role} className="exp-block">
              <div className="exp-header">
                <div>
                  <h3 className="exp-role">{exp.role}</h3>
                  <span className="exp-company">{exp.company}</span>
                </div>
                <span className="exp-period">{exp.period}</span>
              </div>
              <ul className="exp-points">
                {exp.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>

        <Section title="Projects">
          <div className="projects-grid">
            {resume.projects.map((proj) => (
              <div key={proj.name} className="project-card">
                <h3 className="project-name">{proj.name}</h3>
                <span className="project-tech">{proj.tech}</span>
                <p className="project-desc">{proj.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Education">
          {resume.education.map((edu) => (
            <div key={edu.degree} className="exp-block">
              <div className="exp-header">
                <div>
                  <h3 className="exp-role">{edu.degree}</h3>
                  <span className="exp-company">{edu.institution}</span>
                </div>
                <span className="exp-period">{edu.period}</span>
              </div>
              <p className="edu-note">{edu.note}</p>
            </div>
          ))}
        </Section>
      </main>
    </div>
  );
};

export default App;
