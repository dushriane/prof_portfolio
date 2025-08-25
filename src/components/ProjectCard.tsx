import React from 'react'
import './ProjectCard.css'

interface ProjectCardProps {
  title: string
  description: string
  additionalInfo?: string
  image: string
  githubUrl: string
  websiteUrl?: string
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  additionalInfo,
  image,
  githubUrl,
  websiteUrl
}) => {
  return (
    <div className="project-card card hover-lift">
      <div className="project-image">
        <img src={image} alt={title} />
      </div>
      <div className="project-content">
        <h3>{title}</h3>
        <p>{description}</p>
        {additionalInfo && <p className="additional-info">{additionalInfo}</p>}
        <div className="project-links">
          <a 
            href={githubUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            GitHub
          </a>
          {websiteUrl && (
            <a 
              href={websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
