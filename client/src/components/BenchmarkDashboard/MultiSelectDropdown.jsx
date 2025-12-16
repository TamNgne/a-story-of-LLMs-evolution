import React, { useState, useEffect, useRef } from 'react';
import styles from './MultiSelectDropdown.module.css';

const MultiSelectDropdown = ({ options, selected, onChange, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleSelect = (option) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const handleSelectAll = () => {
        onChange(options);
    };

    const handleClearAll = () => {
        onChange([]);
    };

    const filteredOptions = options.filter(opt =>
        opt.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <div className={styles.dropdownTrigger} onClick={handleToggle}>
                <div className={styles.selectedTags}>
                    {selected.length === 0 ? (
                        <span className={styles.placeholder}>{placeholder}</span>
                    ) : (
                        selected.slice(0, 2).map(item => (
                            <div key={item} className={styles.tag}>
                                {item}
                                <span className={styles.tagClose} onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(item);
                                }}>×</span>
                            </div>
                        ))
                    )}
                    {selected.length > 2 && (
                        <div className={styles.tag}>+{selected.length - 2} more</div>
                    )}
                </div>
                <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Search..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={handleSelectAll}>Select All</button>
                        <button className={styles.actionBtn} onClick={handleClearAll}>Clear</button>
                    </div>
                    <ul className={styles.optionsList}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <li key={option} className={styles.optionItem} onClick={() => handleSelect(option)}>
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(option)}
                                        readOnly
                                        className={styles.checkbox}
                                    />
                                    {option}
                                </li>
                            ))
                        ) : (
                            <li style={{ padding: '8px 12px', color: '#999' }}>No results</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
