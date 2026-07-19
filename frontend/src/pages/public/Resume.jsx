import { useState } from "react";

const TABS = ["Experience", "Education", "Certification", "Skills", "About me"];

const RESUME_DATA = {
  Experience: {
    heading: "My experience",
    subheading:
      "Demonstrated expertise through impactful internships and personal projects, delivering innovative & high-quality solutions.",
    items: [
      {
        dateRange: "06 Jan. 2025 - 30 Jun. 2025",
        role: "SDE Intern",
        details: ["99Acres, Info Edge, Noida"],
      },
      {
        dateRange: "Jul. 2024 - Aug. 2024",
        role: "ML Intern",
        details: ["IRDE lab, DRDO, Dehradun"],
      },
      {
        dateRange: "01 Jun. 2024 - 29 Jun. 2024",
        role: "Participant",
        details: ["Amazon ML School, Remote"],
      },
      {
        dateRange: "Apr. 24 - Aug. 24",
        role: "External Relations Officer",
        details: ["GEU ACM, Dehradun"],
      },
    ],
  },
  Education: {
    heading: "My education",
    subheading:
      "Academic foundation built through rigorous coursework and hands-on learning experiences.",
    items: [
      {
        dateRange: "2021 - 2025",
        role: "B.Tech Computer Science",
        details: ["Graphic Era University, Dehradun", "CGPA: 8.4 / 10"],
      },
      {
        dateRange: "2019 - 2021",
        role: "Class XII — PCM",
        details: ["St. Joseph's Academy, Dehradun", "Percentage: 92.8%"],
      },
      {
        dateRange: "2009 - 2019",
        role: "Class X",
        details: ["St. Joseph's Academy, Dehradun", "Percentage: 94.2%"],
      },
    ],
  },
  Certification: {
    heading: "My certifications",
    subheading:
      "Industry-recognised credentials validating expertise across machine learning, development, and cloud platforms.",
    items: [
      {
        dateRange: "2024",
        role: "Machine Learning Specialization",
        details: ["Coursera — Andrew Ng, Stanford"],
      },
      {
        dateRange: "2024",
        role: "AWS Cloud Practitioner Essentials",
        details: ["Amazon Web Services"],
      },
      {
        dateRange: "2023",
        role: "Full Stack Web Development",
        details: ["Udemy — Angela Yu"],
      },
      {
        dateRange: "2023",
        role: "Data Structures & Algorithms",
        details: ["Striver A2Z DSA Course"],
      },
    ],
  },
  Skills: {
    heading: "My skills",
    subheading:
      "Versatile in programming, advanced in algorithm design, and experienced in developing solutions across multiple domains.",
    categories: [
      {
        label: "Languages",
        skills: ["Python", "JavaScript", "Java", "C++", "SQL"],
      },
      {
        label: "ML / AI",
        skills: ["TensorFlow", "Keras", "Scikit-learn", "MLflow", "OpenCV"],
      },
      {
        label: "Web",
        skills: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
      },
      {
        label: "Tools & Cloud",
        skills: ["Git", "Docker", "AWS", "DVC", "Postman"],
      },
    ],
  },
  "About me": {
    heading: "About me",
    subheading:
      "AI enthusiast and soon-to-be graduate, driven by a passion for problem-solving and innovation in software development.",
    info: [
      { label: "Name", value: "Akshar Gupta" },
      { label: "Phone", value: "(+91) 9876543210" },
      { label: "Nationality", value: "Indian" },
      { label: "Email", value: "akshar2024wrk@gmail.com" },
      { label: "Freelance", value: "Available" },
      { label: "Languages", value: "English, Hindi" },
    ],
  },
};

export default function Resume() {
  const [activeTab, setActiveTab] = useState("Experience");
  const data = RESUME_DATA[activeTab];

  return (
    <div className="page-enter">
      <section className="section-container py-16">
        <div className="flex flex-col md:flex-row gap-12 min-h-[500px]">
          {/* Sidebar Tabs */}
          <aside className="flex flex-col gap-3 md:w-72 flex-shrink-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="w-full py-4 px-5 rounded-lg text-center text-sm font-semibold cursor-pointer border-0 transition-all duration-200"
                  style={{
                    backgroundColor: isActive
                      ? "var(--accent)"
                      : "var(--bg-card)",
                    color: isActive ? "#1c1c1e" : "var(--text-primary)",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "#333336";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "var(--bg-card)";
                    }
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </aside>

          {/* Content Panel */}
          <div className="flex-1 min-w-0">
            <h2
              className="font-mono text-3xl md:text-4xl font-bold mb-3"
              style={{ color: "var(--accent)" }}
            >
              {data.heading}
            </h2>
            <p
              className="font-mono text-sm leading-relaxed mb-8 max-w-2xl"
              style={{ color: "var(--text-secondary)" }}
            >
              {data.subheading}
            </p>

            {/* Experience / Education / Certification */}
            {data.items && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {data.items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-7 flex flex-col gap-3 transition-all duration-200"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0,255,136,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                    }}
                  >
                    <span
                      className="font-mono text-sm"
                      style={{ color: "var(--accent)" }}
                    >
                      {item.dateRange}
                    </span>
                    <h3
                      className="font-mono text-lg font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.role}
                    </h3>
                    <ul className="list-none flex flex-col gap-1 mt-1">
                      {item.details.map((d, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 font-mono text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <span style={{ color: "var(--accent)" }}>•</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {data.categories && (
              <div className="flex flex-col gap-6">
                {data.categories.map((cat) => (
                  <div key={cat.label}>
                    <p
                      className="font-mono text-xs font-semibold mb-3 tracking-widest uppercase"
                      style={{ color: "var(--accent)" }}
                    >
                      {cat.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cat.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-4 py-1.5 rounded-full font-mono text-xs font-medium"
                          style={{
                            backgroundColor: "var(--bg-card)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* About me — structured info grid */}
            {data.info && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 max-w-2xl">
                {data.info.map((item, i) => (
                  <div key={i} className="flex items-baseline gap-3">
                    <span
                      className="font-mono text-sm"
                      style={{ color: "var(--accent)" }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="font-mono text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

