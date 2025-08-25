import React from 'react'
import './TechStack.css'

interface TechStackProps {
  categories: {
    title: string
    items: string[]
  }[]
}

const TechStack: React.FC<TechStackProps> = ({ categories }) => {
  return (
    <section className="tech section">
      <div className="container">
        <h2 className="section-title">TECH STACK</h2>
        <div className="tech-stack">
          {categories.map((category, index) => (
            <div key={index} className="tech-category card hover-lift">
              <h3>{category.title}</h3>
              <ul>
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TechStack
