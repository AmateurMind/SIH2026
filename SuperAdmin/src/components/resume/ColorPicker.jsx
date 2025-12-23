import React, { useState } from 'react';
import { Palette } from 'lucide-react';

const ColorPicker = ({ accentColor, onAccentColorChange }) => {
    const [showPicker, setShowPicker] = useState(false);

    // Preset color palette
    const presetColors = [
        { name: 'Blue', value: '#2563eb' },
        { name: 'Purple', value: '#7c3aed' },
        { name: 'Green', value: '#059669' },
        { name: 'Red', value: '#dc2626' },
        { name: 'Orange', value: '#ea580c' },
        { name: 'Pink', value: '#db2777' },
        { name: 'Teal', value: '#0d9488' },
        { name: 'Indigo', value: '#4f46e5' },
        { name: 'Gray', value: '#6b7280' },
        { name: 'Black', value: '#1f2937' }
    ];

    return (
        <div className="relative">
            {/* Color picker button */}
            <button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
                <Palette size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Accent Color</span>
                <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: accentColor }}
                />
            </button>

            {/* Color picker dropdown */}
            {showPicker && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 min-w-[280px]">
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Preset Colors
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {presetColors.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => {
                                        onAccentColorChange(color.value);
                                        setShowPicker(false);
                                    }}
                                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${accentColor === color.value
                                            ? 'border-gray-900 ring-2 ring-gray-300'
                                            : 'border-gray-200'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Custom Color
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                value={accentColor}
                                onChange={(e) => onAccentColorChange(e.target.value)}
                                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={accentColor}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^#[0-9A-F]{6}$/i.test(val)) {
                                        onAccentColorChange(val);
                                    }
                                }}
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="#2563eb"
                                maxLength={7}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setShowPicker(false)}
                        className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                        Done
                    </button>
                </div>
            )}

            {/* Backdrop to close picker */}
            {showPicker && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPicker(false)}
                />
            )}
        </div>
    );
};

export default ColorPicker;
