import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <Search size={20} className="search-icon" />
      <input
        type="text"
        placeholder="Search your memories..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      {query && (
        <button type="button" className="search-clear" onClick={handleClear}>
          <X size={18} />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
