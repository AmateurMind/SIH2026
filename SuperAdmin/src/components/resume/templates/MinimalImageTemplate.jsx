import React from 'react';

const MinimalImageTemplate = ({ resumeData, accentColor = '#2563eb' }) => {
    const { personalInfo, summary, education, experience, projects, skills, achievements } = resumeData;

    const SectionHeading = ({ children }) => (
        <h2
            className="text-sm font-bold uppercase tracking-widest mb-4"
            style={{ color: accentColor }}
        >
            {children}
        </h2>
    );

    return (
        <div className="bg-white p-16 min-h-[1100px] font-sans text-gray-900 max-w-[800px] mx-auto">
            {/* Header with Image */}
            <div className="flex items-start gap-8 mb-12">
                {/* Profile Image with Accent Background */}
                <div className="flex-shrink-0">
                    <div
                        className="w-32 h-32 rounded-full p-1 shadow-lg"
                        style={{ backgroundColor: accentColor }}
                    >
                        <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                            {personalInfo?.profileImage ? (
                                <img
                                    src={personalInfo.profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-gray-300 text-4xl">👤</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Header Info */}
                <div className="flex-1 pt-2">
                    <h1 className="text-4xl font-light mb-2 tracking-tight">
                        {personalInfo?.fullName || 'Your Name'}
                    </h1>
                    {personalInfo?.profession && (
                        <p className="text-lg text-gray-600 font-light mb-4">{personalInfo.profession}</p>
                    )}

                    {/* Contact - Minimal inline */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                        {personalInfo?.email && <span>{personalInfo.email}</span>}
                        {personalInfo?.phone && <span>{personalInfo.phone}</span>}
                        {personalInfo?.location && <span>{personalInfo.location}</span>}
                    </div>
                    {(personalInfo?.linkedIn || personalInfo?.website) && (
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 mt-2">
                            {personalInfo?.linkedIn && <span>{personalInfo.linkedIn}</span>}
                            {personalInfo?.website && <span>{personalInfo.website}</span>}
                        </div>
                    )}
                </div>
            </div>

            <div className="h-px w-full mb-12" style={{ backgroundColor: `${accentColor}30` }} />

            {/* Professional Summary */}
            {summary && (
                <div className="mb-12">
                    <SectionHeading>Summary</SectionHeading>
                    <p className="text-base leading-relaxed text-gray-700 font-light">
                        {summary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
                <div className="mb-12">
                    <SectionHeading>Experience</SectionHeading>
                    <div className="space-y-8">
                        {experience.map((exp, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {exp.jobTitle || exp.title}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-light">
                                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <p className="text-sm mb-3" style={{ color: accentColor }}>
                                    {exp.company}
                                    {exp.location && <span className="text-gray-500"> • {exp.location}</span>}
                                </p>
                                {exp.description && (
                                    <p className="text-sm text-gray-600 leading-relaxed font-light">{exp.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
                <div className="mb-12">
                    <SectionHeading>Education</SectionHeading>
                    <div className="space-y-6">
                        {education.map((edu, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-lg font-medium text-gray-900">{edu.degree}</h3>
                                    <span className="text-xs text-gray-500 font-light">{edu.endDate || edu.year}</span>
                                </div>
                                <p className="text-sm" style={{ color: accentColor }}>
                                    {edu.institution}
                                </p>
                                {edu.fieldOfStudy && (
                                    <p className="text-sm text-gray-600 font-light">{edu.fieldOfStudy}</p>
                                )}
                                {edu.gpa && (
                                    <p className="text-sm text-gray-600 font-light">GPA: {edu.gpa}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
                <div className="mb-12">
                    <SectionHeading>Projects</SectionHeading>
                    <div className="space-y-6">
                        {projects.map((proj, idx) => (
                            <div key={idx}>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">{proj.title}</h3>
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <p className="text-xs mb-2" style={{ color: accentColor }}>
                                        {Array.isArray(proj.technologies) ? proj.technologies.join(' • ') : proj.technologies}
                                    </p>
                                )}
                                {proj.description && (
                                    <p className="text-sm text-gray-600 leading-relaxed font-light mb-2">{proj.description}</p>
                                )}
                                {(proj.githubLink || proj.liveLink) && (
                                    <div className="flex gap-4 text-xs text-gray-500">
                                        {proj.githubLink && <a href={proj.githubLink} className="underline">GitHub</a>}
                                        {proj.liveLink && <a href={proj.liveLink} className="underline">Live</a>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
                <div className="mb-12">
                    <SectionHeading>Skills</SectionHeading>
                    <p className="text-sm text-gray-700 font-light leading-relaxed">
                        {(Array.isArray(skills) ? skills : skills.split(',')).map(s => typeof s === 'string' ? s.trim() : s).join(' • ')}
                    </p>
                </div>
            )}

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
                <div>
                    <SectionHeading>Achievements</SectionHeading>
                    <ul className="space-y-2">
                        {achievements.map((achievement, idx) => (
                            <li key={idx} className="text-sm text-gray-700 font-light leading-relaxed">
                                • {achievement}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MinimalImageTemplate;
