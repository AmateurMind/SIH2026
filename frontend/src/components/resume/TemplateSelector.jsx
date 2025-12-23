import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Layout, Check } from 'lucide-react';

const TemplateSelector = ({ selectedTemplate, onTemplateChange }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const templates = [
        { id: 'classic', name: 'Classic', icon: '📄' },
        { id: 'modern', name: 'Modern', icon: '🎨' },
        { id: 'minimal', name: 'Minimal', icon: '⚪' },
        { id: 'minimal-image', name: 'Photo', icon: '📸' }
    ];

    const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                title="Change Template"
            >
                <Layout size={14} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-500">Template:</span>
                <span className="text-xs font-bold text-gray-900">{currentTemplate.name}</span>
                <ChevronDown size={12} className="text-gray-400" />
            </button>

            {/* Horizontal Template Popover */}
            {showDropdown && (
                <div className="absolute left-full top-0 ml-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 animate-fadeIn min-w-[320px]">
                    <div className="flex items-center gap-2">
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => {
                                    onTemplateChange(template.id);
                                    setShowDropdown(false);
                                }}
                                className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:bg-gray-50 border ${selectedTemplate === template.id
                                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                                    : 'border-transparent text-gray-600'
                                    }`}
                            >
                                <span className="text-2xl">{template.icon}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wide">{template.name}</span>
                                {selectedTemplate === template.id && (
                                    <div className="absolute top-1 right-1">
                                        <Check size={10} className="text-primary-600" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateSelector;
