'use client';

import { useState, useEffect, useRef } from 'react';

export interface Option {
  value: string;
  label: string;
}

interface SearchDropdownProps {
  options: Option[];
  onChange: (value: Option) => void;
  value?: Option | null; // New prop for controlled input
  disabled?: boolean;
  placeholder?: string;
}

const SearchableDropdown = ({
  options,
  onChange,
  value = null,
  disabled = false,
  placeholder = 'Select an option...',
}: SearchDropdownProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(
    value ? value.label : null
  );
  const dropdownRef = useRef<HTMLDivElement>(null); // Reference to the dropdown container

  // Filter options based on the search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    setSelectedLabel(option.label); // Set the selected label for display
    setSearchTerm(''); // Clear the search term for the next search
    onChange(option); // Pass selected value to parent
    setIsOpen(false); // Close the dropdown
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update selected label when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedLabel(value.label);
    } else {
      setSelectedLabel(null);
    }
  }, [value]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm || selectedLabel || ''}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setSelectedLabel(null); // Clear the selected label when typing
          setIsOpen(true); // Ensure the dropdown remains open when typing
        }}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        placeholder={placeholder}
      />
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                className="cursor-pointer px-4 py-2 hover:bg-blue-100"
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableDropdown;
