import { useState } from 'react';

export const AdvancedSearch = () => {
  const [filters, setFilters] = useState({
    category: '',
    tags: [],
    dateRange: '',
    sortBy: 'newest'
  });

  return (
    <div className="advanced-search">
      <div className="search-filters">
        <select 
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">All Categories</option>
          <option value="web-development">Web Development</option>
          <option value="mobile-apps">Mobile Apps</option>
          <option value="ui-ux">UI/UX Design</option>
        </select>
        
        <div className="tag-selector">
          {/* Multi-select tag component */}
        </div>
        
        <select value={filters.sortBy}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
    </div>
  );
};