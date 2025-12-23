import React from 'react';
import { Plus, Trash2, GripVertical, Github, Globe, Code, ExternalLink } from 'lucide-react';

const ProjectsForm = ({ projects, onChange, onAiEnhance }) => {
    const handleChange = (index, field, value) => {
        const newProjects = [...projects];
        newProjects[index] = { ...newProjects[index], [field]: value };
        onChange(newProjects);
    };

    const handleTechChange = (index, value) => {
        // Split by comma and trim
        const technologies = value.split(',').map(t => t.trim());
        handleChange(index, 'technologies', technologies);
    };

    const addProject = () => {
        onChange([
            ...projects,
            {
                title: '',
                type: '',
                description: '',
                technologies: [],
                githubLink: '',
                liveLink: '',
                startDate: '',
                endDate: ''
            }
        ]);
    };

    const removeProject = (index) => {
        const newProjects = projects.filter((_, i) => i !== index);
        onChange(newProjects);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Projects</h3>
                <button
                    onClick={addProject}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <Plus size={16} /> Add Project
                </button>
            </div>

            {projects.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-2">No projects added yet</p>
                    <button
                        onClick={addProject}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Add Your First Project
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {projects.map((proj, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <GripVertical size={16} className="cursor-move" />
                                <span className="text-sm font-medium">Project {index + 1}</span>
                            </div>
                            <button
                                onClick={() => removeProject(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Remove project"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Project Name</label>
                                <div className="relative">
                                    <Code size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={proj.title}
                                        onChange={(e) => handleChange(index, 'title', e.target.value)}
                                        placeholder="E-commerce App"
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Technologies Used</label>
                                <input
                                    type="text"
                                    value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                                    onChange={(e) => handleTechChange(index, e.target.value)}
                                    placeholder="React, Node.js, MongoDB (comma separated)"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">GitHub Link</label>
                                <div className="relative">
                                    <Github size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="url"
                                        value={proj.githubLink}
                                        onChange={(e) => handleChange(index, 'githubLink', e.target.value)}
                                        placeholder="github.com/username/repo"
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Live Demo Link</label>
                                <div className="relative">
                                    <Globe size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="url"
                                        value={proj.liveLink}
                                        onChange={(e) => handleChange(index, 'liveLink', e.target.value)}
                                        placeholder="myapp.com"
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                                    {onAiEnhance && (
                                        <button
                                            onClick={() => onAiEnhance(index, proj.description)}
                                            className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                        >
                                            ✨ Enhance with AI
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={proj.description}
                                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                                    placeholder="Describe the project features and your role..."
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectsForm;
