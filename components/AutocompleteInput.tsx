'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Building, Plus, Check } from 'lucide-react';

interface AutocompleteInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  required?: boolean;
  onAddNew?: (newValue: string) => Promise<boolean>;
  userInfo?: string; // For tracking who added the college
}

export default function AutocompleteInput({
  placeholder,
  value,
  onChange,
  suggestions,
  loading = false,
  className = '',
  icon,
  required = false,
  onAddNew,
  userInfo
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [addingNew, setAddingNew] = useState(false);
  const [addNewSuccess, setAddNewSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen && suggestions.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [suggestions, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(newValue.length > 1);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    if (value.length > 1) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay closing to allow click events on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  const handleAddNew = async () => {
    if (!onAddNew || !userInfo || !value.trim()) return;

    setAddingNew(true);
    try {
      const success = await onAddNew(value.trim());
      if (success) {
        setAddNewSuccess(true);
        // Close the dropdown immediately after successful addition
        setIsOpen(false);
        setHighlightedIndex(-1);
        // Clear success state after a delay
        setTimeout(() => {
          setAddNewSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error adding new college:', error);
    } finally {
      setAddingNew(false);
      // Ensure dropdown is closed
      if (!addNewSuccess) {
        setIsOpen(false);
      }
    }
  };

  const shouldShowAddNew = onAddNew &&
    value.length > 2 &&
    suggestions.length === 0 &&
    !loading &&
    !addingNew &&
    !addNewSuccess &&
    isOpen;

  const canAddToSuggestions = suggestions.length > 0 && value.length > 2 &&
    !suggestions.some(s => s.toLowerCase() === value.toLowerCase());

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          className={`w-full px-5 py-4 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-blue-300 focus:outline-none text-base shadow placeholder-[#a78bfa] font-semibold transition pr-10 ${className}`}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
          )}
          {icon || <Building size={18} className="text-blue-400" />}
          {suggestions.length > 0 && isOpen && (
            <ChevronDown size={16} className="text-gray-400 rotate-180 transition-transform" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (suggestions.length > 0 || shouldShowAddNew) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <ul
              ref={listRef}
              className="bg-white border-2 border-[#E0D5FA] rounded-2xl shadow-xl max-h-60 overflow-y-auto py-2"
            >
              {suggestions.map((suggestion, index) => (
                <motion.li
                  key={suggestion}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`px-4 py-3 cursor-pointer text-[#23185B] font-medium transition-colors border-l-4 ${
                    index === highlightedIndex
                      ? 'bg-[#E0D5FA] border-[#5B3DF6] text-[#5B3DF6]'
                      : 'hover:bg-[#faf7ed] border-transparent hover:border-[#E0D5FA]'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    <Building size={16} className="text-blue-400 flex-shrink-0" />
                    <span className="truncate">{suggestion}</span>
                  </div>
                </motion.li>
              ))}

              {/* Add new college option */}
              {canAddToSuggestions && onAddNew && (
                <motion.li
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: suggestions.length * 0.02 }}
                  className="px-4 py-3 cursor-pointer border-l-4 border-t border-gray-200 hover:bg-green-50 hover:border-green-400 transition-colors"
                  onClick={handleAddNew}
                >
                  <div className="flex items-center gap-3">
                    {addingNew ? (
                      <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                    ) : addNewSuccess ? (
                      <Check size={16} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <Plus size={16} className="text-green-500 flex-shrink-0" />
                    )}
                    <span className="text-green-600 font-semibold">
                      {addingNew
                        ? 'Adding college...'
                        : addNewSuccess
                        ? 'College added!'
                        : `Add "${value}" as new college`}
                    </span>
                  </div>
                </motion.li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {shouldShowAddNew && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 z-50"
        >
          <div className="bg-white border-2 border-[#E0D5FA] rounded-2xl shadow-xl py-4">
            <div className="px-4 text-center">
              <Building size={20} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-500 mb-3">College not found</p>
              <motion.button
                onClick={handleAddNew}
                disabled={addingNew}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {addingNew ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : addNewSuccess ? (
                  <>
                    <Check size={16} />
                    Added!
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add "{value}"
                  </>
                )}
              </motion.button>
              {!addingNew && !addNewSuccess && (
                <p className="text-xs text-gray-400 mt-2">This will help other students find your college</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}