import React from 'react';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import MinimalImageTemplate from './templates/MinimalImageTemplate';

const ResumePreview = ({ resumeData, template = 'modern', accentColor = '#2563eb' }) => {
    // Template mapping
    const templates = {
        classic: ClassicTemplate,
        modern: ModernTemplate,
        minimal: MinimalTemplate,
        'minimal-image': MinimalImageTemplate
    };

    // Get the selected template component
    const TemplateComponent = templates[template] || ModernTemplate;

    return (
        <div className="w-full h-full overflow-auto bg-gray-100">
            <div className="min-h-full flex items-start justify-center p-8">
                <div className="bg-white shadow-2xl" style={{ width: '8.5in', minHeight: '11in' }}>
                    <TemplateComponent resumeData={resumeData} accentColor={accentColor} />
                </div>
            </div>
        </div>
    );
};

export default ResumePreview;
