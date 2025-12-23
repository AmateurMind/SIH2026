import React, { useState, useRef, useEffect } from 'react';
import { Check, Palette } from 'lucide-react';

const ColorPicker = ({ accentColor, onAccentColorChange }) => {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Exactly 8 preset colors
    const presetColors = [
        '#2563eb', // Blue
        '#7c3aed', // Purple
        '#059669', // Green
        '#dc2626', // Red
        '#ea580c', // Orange
        '#db2777', // Pink
        '#0d9488', // Teal
        '#1f2937'  // Black
    ];

    return (
        <div className="relative" ref={pickerRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                title="Change Theme"
            >
                <span className="text-xs font-medium text-gray-500">Theme:</span>
                <div
                    className="w-4 h-4 rounded-full border border-gray-200 shadow-sm ring-1 ring-gray-100"
                    style={{ backgroundColor: accentColor }}
                />
            </button>

            {/* Horizontal Color Popover */}
            {showPicker && (
                <div className="absolute right-full top-0 mr-2 bg-white rounded-full shadow-xl border border-gray-200 p-2 z-50 animate-fadeIn">
                    <div className="flex items-center gap-2">
                        {presetColors.map((color) => (
                            <button
                                key={color}
                                onClick={() => {
                                    onAccentColorChange(color);
                                    setShowPicker(false);
                                }}
                                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 relative flex items-center justify-center ${accentColor === color
                                    ? 'ring-2 ring-offset-2 ring-gray-400'
                                    : 'hover:ring-2 hover:ring-offset-1 hover:ring-gray-200'
                                    }`}
                                style={{ backgroundColor: color }}
                                title={color}
                            >
                                {accentColor === color && (
                                    <Check size={12} className="text-white drop-shadow-md" strokeWidth={3} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorPicker;
