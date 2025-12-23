import React from 'react';
import { Check } from 'lucide-react';

const TemplateSelector = ({ selectedTemplate, onTemplateChange }) => {
    const templates = [
        {
            id: 'classic',
            name: 'Classic',
            description: 'Traditional single-column layout',
            icon: '📄',
            preview: 'Formal and professional'
        },
        {
            id: 'modern',
            name: 'Modern',
            description: 'Two-column contemporary design',
            icon: '🎨',
            preview: 'Clean and stylish'
        },
        {
            id: 'minimal',
            name: 'Minimal',
            description: 'Ultra-clean with maximum whitespace',
            icon: '⚪',
            preview: 'Simple and elegant'
        },
        {
            id: 'minimal-image',
            name: 'Minimal Image',
            description: 'Minimal design with profile photo',
            icon: '📸',
            preview: 'Photo-focused minimal'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
                <div
                    key={template.id}
                    onClick={() => onTemplateChange(template.id)}
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-lg ${selectedTemplate === template.id
                            ? 'border-blue-500 shadow-lg ring-2 ring-blue-200 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                >
                    {/* Selection indicator */}
                    {selectedTemplate === template.id && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <Check size={14} strokeWidth={3} />
                        </div>
                    )}

                    {/* Template icon */}
                    <div className="text-center mb-3">
                        <div className="text-4xl mb-2">{template.icon}</div>
                        <h4 className="font-bold text-gray-900 text-sm">{template.name}</h4>
                    </div>

                    {/* Template description */}
                    <p className="text-xs text-gray-600 text-center mb-2">{template.description}</p>
                    <p className="text-xs text-gray-400 text-center italic">{template.preview}</p>
                </div>
            ))}
        </div>
    );
};

export default TemplateSelector;
