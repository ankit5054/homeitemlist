import React from 'react';
const SearchBar=({searchTerm,onSearchChange,placeholder})=><div className="search-wrap"><span aria-hidden="true">⌕</span><input type="text" aria-label={placeholder} placeholder={placeholder} value={searchTerm} onChange={e=>onSearchChange(e.target.value)}/></div>;
export default SearchBar;
