import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe, Calendar, Award } from 'lucide-react';

const ClassicTemplate = ({ resumeData, accentColor = '#2563eb' }) => {
    const { personalInfo, summary, education, experience, projects, skills, achievements } = resumeData;

    const SectionHeading = ({ children }) => (
        <h2
            className="text-xl font-bold uppercase tracking-wide mb-4 pb-2 border-b-2"
            style={{ color: accentColor, borderColor: accentColor }}
        >
            {children}
        </h2>
    );

    return (
        <div className="bg-white p-12 min-h-[1100px] font-serif text-gray-900">
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b-4" style={{ borderColor: accentColor }}>
                <h1 className="text-4xl font-bold mb-3" style={{ color: accentColor }}>
                    {personalInfo?.fullName || 'Your Name'}
                </h1>
                {personalInfo?.profession && (
                    <p className="text-xl text-gray-600 mb-4">{personalInfo.profession}</p>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                    {personalInfo?.email && (
                        <div className="flex items-center gap-1">
                            <Mail size={14} />
                            <span>{personalInfo.email}</span>
                        </div>
                    )}
                    {personalInfo?.phone && (
                        <div className="flex items-center gap-1">
                            <Phone size={14} />
                            <span>{personalInfo.phone}</span>
                        </div>
                    )}
                    {personalInfo?.location && (
                        <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{personalInfo.location}</span>
                        </div>
                    )}
                    {personalInfo?.linkedIn && (
                        <div className="flex items-center gap-1">
                            <Linkedin size={14} />
                            <span>{personalInfo.linkedIn}</span>
                        </div>
                    )}
                    {personalInfo?.website && (
                        <div className="flex items-center gap-1">
                            <Globe size={14} />
                            <span>{personalInfo.website}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Professional Summary */}
            {summary && (
                <div className="mb-8">
                    <SectionHeading>Professional Summary</SectionHeading>
                    <p className="text-base leading-relaxed text-gray-700 text-justify">
                        {summary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
                <div className="mb-8">
                    <SectionHeading>Professional Experience</SectionHeading>
                    <div className="space-y-6">
                        {experience.map((exp, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-baseline mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {exp.jobTitle || exp.title}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <p className="text-base font-semibold mb-2" style={{ color: accentColor }}>
                                    {exp.company}
                                    {exp.location && <span className="text-gray-500 font-normal"> • {exp.location}</span>}
                                </p>
                                {exp.description && (
                                    <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
                <div className="mb-8">
                    <SectionHeading>Education</SectionHeading>
                    <div className="space-y-4">
                        {education.map((edu, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                                    <span className="text-sm text-gray-500">{edu.endDate || edu.year}</span>
                                </div>
                                <p className="text-base font-semibold" style={{ color: accentColor }}>
                                    {edu.institution}
                                </p>
                                {edu.fieldOfStudy && (
                                    <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                                )}
                                {edu.gpa && (
                                    <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
                <div className="mb-8">
                    <SectionHeading>Projects</SectionHeading>
                    <div className="space-y-5">
                        {projects.map((proj, idx) => (
                            <div key={idx}>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{proj.title}</h3>
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <p className="text-sm font-semibold mb-2" style={{ color: accentColor }}>
                                        {Array.isArray(proj.technologies) ? proj.technologies.join(' • ') : proj.technologies}
                                    </p>
                                )}
                                {proj.description && (
                                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{proj.description}</p>
                                )}
                                <div className="flex gap-4 text-xs text-gray-500">
                                    {proj.githubLink && <a href={proj.githubLink} className="underline">GitHub</a>}
                                    {proj.liveLink && <a href={proj.liveLink} className="underline">Live Demo</a>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
                <div className="mb-8">
                    <SectionHeading>Skills</SectionHeading>
                    <div className="flex flex-wrap gap-2">
                        {(Array.isArray(skills) ? skills : skills.split(',')).map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 text-sm font-medium border-2 rounded"
                                style={{ borderColor: accentColor, color: accentColor }}
                            >
                                {typeof skill === 'string' ? skill.trim() : skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
                <div className="mb-8">
                    <SectionHeading>Achievements & Awards</SectionHeading>
                    <ul className="list-disc ml-6 space-y-2">
                        {achievements.map((achievement, idx) => (
                            <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                                {achievement}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ClassicTemplate;
