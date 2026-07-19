import { useState } from 'react'
import { SouthWest as SouthWestIcon, NorthEast as NorthEastIcon } from "@mui/icons-material";

const SERVICES = [
  {
    number: '01',
    title: 'Machine Learning',
    description:
      'Advanced machine learning for insights and innovation. Expertise in predictive analytics and real-time solutions.',
  },
  {
    number: '02',
    title: 'Web Development',
    description:
      'Creating dynamic, responsive web design using modern frameworks for a seamless user experience.',
  },
  {
    number: '03',
    title: 'Java Development',
    description:
      'Developing robust Java applications with expertise in core Java, JDBC and graphical interfaces using Swing.',
  },
  {
    number: '04',
    title: 'Video Editing',
    description:
      'Transform raw footage into polished, engaging content with expert editing and enhanced visuals.',
  },
]

export default function Services() {
  return (
    <div className="page-enter">
      <section className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.number} service={service} index={index} />
          ))}
        </div>
      </section>
    </div>
  )
}

function ServiceCard({ service, index }) {
  const isRightCol = index % 2 === 1
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative group flex flex-col gap-4 py-12 px-6 cursor-pointer transition-colors duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row: number + arrow */}
      <div className="flex items-center justify-between">
        <span
          className="outlined-number transition-all duration-300"
          style={{
            WebkitTextStroke: hovered
              ? '2px var(--accent)'
              : '2px rgba(255,255,255,0.25)',
          }}
        >
          {service.number}
        </span>

        <div
          className="arrow-btn transition-all duration-300"
          style={{
            backgroundColor: hovered ? 'var(--accent)' : '#ffffff',
            color: '#1c1c1e',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {hovered ? (
            <NorthEastIcon sx={{ fontSize: 22 }} />
          ) : (
            <SouthWestIcon sx={{ fontSize: 22 }} />
          )}
        </div>
      </div>

      {/* Title */}
      <h2
        className="font-mono text-2xl md:text-3xl font-bold mt-2 transition-colors duration-300"
        style={{ color: hovered ? 'var(--accent)' : 'var(--text-primary)' }}
      >
        {service.title}
      </h2>

      {/* Description */}
      <p
        className="font-mono text-sm leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {service.description}
      </p>

      {/* Bottom divider */}
      <hr className="section-divider mt-4" />
    </div>
  )
}

