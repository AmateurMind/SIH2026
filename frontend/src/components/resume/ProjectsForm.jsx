import React from 'react';
import { Plus, Trash2, GripVertical, Github, Globe, Code } from 'lucide-react';

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
        <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Projects</h3>
                <button
                    onClick={addProject}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-800 transition-colors bg-primary-50 px-2 py-1 rounded-lg hover:bg-primary-100 border border-primary-200"
                >
                    <Plus size={14} /> Add Project
                </button>
            </div>

            {projects.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-2 text-xs">No projects added yet</p>
                    <button
                        onClick={addProject}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Add Your First Project
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {projects.map((proj, index) => (
                    <div
                        key={index}
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2 text-gray-500">
                                <GripVertical size={14} className="cursor-move" />
                                <span className="text-xs font-medium">Project {index + 1}</span>
                            </div>
                            <button
                                onClick={() => removeProject(index)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                title="Remove project"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">Project Name</label>
                                <div className="relative">
                                    <Code size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={proj.title}
                                        onChange={(e) => handleChange(index, 'title', e.target.value)}
                                        placeholder="E-commerce App"
                                        className="w-full pl-8 pr-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">Technologies Used</label>
                                <input
                                    type="text"
                                    value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                                    onChange={(e) => handleTechChange(index, e.target.value)}
                                    placeholder="React, Node.js, MongoDB (comma separated)"
                                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">GitHub Link</label>
                                <div className="relative">
                                    <Github size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                                    <input
                                        type="url"
                                        value={proj.githubLink}
                                        onChange={(e) => handleChange(index, 'githubLink', e.target.value)}
                                        placeholder="github.com/username/repo"
                                        className="w-full pl-8 pr-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">Live Demo Link</label>
                                <div className="relative">
                                    <Globe size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                                    <input
                                        type="url"
                                        value={proj.liveLink}
                                        onChange={(e) => handleChange(index, 'liveLink', e.target.value)}
                                        placeholder="myapp.com"
                                        className="w-full pl-8 pr-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-medium text-gray-600 uppercase">Description</label>
                                    {onAiEnhance && (
                                        <button
                                            onClick={() => onAiEnhance(index, proj.description)}
                                            className="text-[10px] font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
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
                                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none text-gray-900 placeholder-gray-400"
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
