import React, { useState, FormEvent } from 'react';

// Simple Loupe/Search Icon SVG
const LoupeIcon: React.FC<{ size?: string, color?: string }> = ({ size = "20px", color = "#757575" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} width={size} height={size}>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

interface SearchBarProps {
  initialSearchTerm?: string;
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  isLoading?: boolean; // To disable input during search
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  initialSearchTerm = '', 
  onSearch,
  placeholder = "Rechercher une activité…",
  isLoading = false 
}) => {
  const [inputValue, setInputValue] = useState(initialSearchTerm);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(inputValue.trim());
  };

  const searchBarContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '48px', // Spec: Height 48px
    backgroundColor: '#FFFFFF', // Spec: Background #FFFFFF
    borderRadius: '8px', // Spec: Border-radius 8px
    border: '1px solid #DDDDDD', // Spec: Border 1px #DDDDDD
    paddingLeft: '12px', // Space for the icon
    paddingRight: '12px',
    boxSizing: 'border-box',
  };

  const iconStyle: React.CSSProperties = {
    marginRight: '8px', // Space between icon and input
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '1rem', // Adjust as needed
    fontFamily: 'var(--font-primary, Montserrat)',
    backgroundColor: 'transparent', // Input itself is transparent
  };

  return (
    <form onSubmit={handleSubmit} style={searchBarContainerStyle}>
      <div style={iconStyle}>
        <LoupeIcon />
      </div>
      <input
        type="search" // Use type="search" for better semantics and potential browser features (like 'x' to clear)
        style={inputStyle}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        aria-label="Search activities"
      />
      {/* A search button can be added here if explicit click is desired, 
          but visual specs imply icon-in-field and Enter key submission.
          If adding a button, it should be styled and potentially hide form's default submit.
      <button type="submit" style={{ display: 'none' }}>Search</button> 
      */}
    </form>
  );
};

export default SearchBar;
