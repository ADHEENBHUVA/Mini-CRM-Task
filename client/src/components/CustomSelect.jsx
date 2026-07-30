import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, name, className = '', placeholder = 'Select...' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const selectedOption = options.find(opt => opt.value === value);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (optValue) => {
        onChange({ target: { name, value: optValue } });
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-[#151D2C] border border-slate-200 dark:border-[#2A374C] rounded-xl text-slate-900 dark:text-white font-medium transition-all duration-200 hover:border-indigo-400 dark:hover:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
                <span className="truncate">{displayLabel}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-300 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#2A374C] rounded-xl shadow-xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
                    {options.map((opt) => (
                        <button
                            type="button"
                            key={opt.value}
                            onClick={() => handleSelect(opt.value)}
                            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-150 ${value === opt.value
                                    ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#151D2C]'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
