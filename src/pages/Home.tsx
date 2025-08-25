import React from 'react'
import ProjectCard from '../components/ProjectCard'
import TechStack from '../components/TechStack'
import ContactForm from '../components/ContactForm'
import Footer from '../components/Footer'
import './Home.css'

const Home: React.FC = () => {
  const projects = [
    {
      title: "House Treasures Project",
      description: "Let's sedation free juste this project for your purpose! In this book, I was all that here we just connect into each that have my best camera with each that.",
      additionalInfo: "Buy your daily job online.",
      image: "/images/house-treasures.png",
      githubUrl: "https://github.com/dushriane/house_treasures",
      websiteUrl: "#"
    },
    {
      title: "Lost and Found Matchmaker",
      description: "Let's sedation free juste this project for your purpose! In this book, I was all that here we just connect into each that have my best camera with each that.",
      additionalInfo: "Web App developed using Bolt AI for a hackathon.",
      image: "/images/Lost-Found-MatchMaker.png",
      githubUrl: "https://github.com/dushriane/boltnew-lostandfound",
      websiteUrl: "https://boltlostandfound.netlify.app/"
    },
    {
      title: "Lost and Found Matchmaker PL/SQL Project",
      description: "Let's sedation free juste this project for your purpose! In this book, I was all that here we just connect into each that have my best camera with each that.",
      additionalInfo: "Created using PL/SQL using Oracle Database",
      image: "/images/tablelost.PNG",
      githubUrl: "https://github.com/dushriane/Wed_25584_LostandFoundMatchmaker",
      websiteUrl: "#"
    }
  ]

  const techCategories = [
    {
      title: "Languages",
      items: ["JavaScript", "Python", "Java", "HTML", "CSS"]
    },
    {
      title: "Frameworks & Runtimes",
      items: ["React", "Node.js", "Vite"]
    },
    {
      title: "Database",
      items: ["PostgreSQL", "MongoDB"]
    },
    {
      title: "Infra & Tools",
      items: ["Docker", "Kubernetes", "Git"]
    }
  ]

  return (
    <main className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Muraho</h1>
          <p>
            I'm Ariane Dushime, an aspiring software engineer who cares about
          </p>
          <div className="hero-section-tags">
            <span>CREATIVITY</span>
            <span>QUALITY</span>
            <span>DESIGN</span>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section">
        <div className="container">
          <h2 className="section-title">PROJECTS</h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech">
        <div className="container">
          <h2 className="section-title">TECH STACK</h2>
          <TechStack categories={techCategories} />
        </div>
      </section>

      {/* Experience Section */}
      <section className="experience section">
        <div className="container">
          <h2 className="section-title">WORK EXPERIENCE</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>Web Development Intern</h3>
                <span className="company">Up Skills Hub</span>
                <span className="date">Jun 2025 - Aug 2025</span>
                <ul className="responsibilities">
                  <li>Assisted in building and maintaining client websites</li>
                  <li>Implemented accessibility improvements across 15+ sites</li>
                  <li>Participated in Agile development sprints</li>
                </ul>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>AUCA Innovation Center Innovator</h3>
                <span className="company">AUCA Innovation Center</span>
                <span className="date">Aug 2024 - present</span>
                <ul className="responsibilities">
                  <li>Solving local problems through technology and innovation</li>
                  <li>Developed both a webapp and a mobile app along with their Figma Prototypes</li>
                  <li>Participated in Agile development sprints</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="education section">
        <div className="container">
          <h2 className="section-title">EDUCATION</h2>
          <div className="education-grid">
            <div className="education-card card">
              <div className="education-details">
                <h3>BSIT of Software Engineering</h3>
                <span className="institution">Adventist University of Central Africa</span>
                <span className="date">2022 - 2026</span>
                <p className="achievements">Ongoing</p>
              </div>
            </div>
            
            <div className="education-card card">
              <div className="education-details">
                <h3>High School A-level</h3>
                <span className="institution">Lycee de Kigali</span>
                <span className="date">2018-2021</span>
                <p className="achievements">High School Diploma</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact">
        <div className="container">
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}

export default Home
