import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BrainCircuit, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CareerPage = () => {
    const tools = [
        {
            id: 'resume',
            title: 'Resume Builder',
            description: 'Create a professional, ATS-friendly resume with AI-powered suggestions and modern templates.',
            icon: Sparkles,
            color: 'from-purple-500 to-indigo-600',
            bgColor: 'bg-purple-50',
            path: '/student/resume-builder',
            stats: 'ATS-Friendly'
        },
        {
            id: 'interview',
            title: 'AI Mock Interview',
            description: 'Practice your interview skills with our AI mentor. Get real-time feedback and behavioral analysis.',
            icon: BrainCircuit,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-blue-50',
            path: '/ai-interview',
            stats: 'Real-time FB'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tools.map((tool, index) => (
                    <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link
                            to={tool.path}
                            className="group relative flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 overflow-hidden h-full"
                        >
                            {/* Visual Accent */}
                            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${tool.color}`} />

                            <div className="p-8 flex-1">
                                <div className={`inline-flex items-center justify-center p-4 rounded-2xl ${tool.bgColor} mb-6 transition-transform group-hover:scale-110 duration-300`}>
                                    <tool.icon size={32} className={`text-white p-1 rounded-lg bg-gradient-to-br ${tool.color}`} />
                                </div>

                                <div className="flex items-center space-x-2 mb-3">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                                        {tool.stats}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-primary-600">
                                        Premium
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                                    {tool.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {tool.description}
                                </p>
                            </div>

                            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between group-hover:bg-primary-50/50 transition-colors">
                                <span className="text-sm font-bold text-gray-900">Launch Tool</span>
                                <div className="p-2 rounded-full bg-white shadow-sm border border-gray-100 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CareerPage;
