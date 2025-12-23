import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe, Briefcase, GraduationCap, Code, Award, Star } from 'lucide-react';

const ModernTemplate = ({ resumeData, accentColor = '#2563eb' }) => {
    const { personalInfo, summary, education, experience, projects, skills, achievements } = resumeData;

    const SectionHeading = ({ icon: Icon, children }) => (
        <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
                <Icon size={18} style={{ color: accentColor }} />
            </div>
            <h2 className="text-lg font-bold uppercase tracking-wide" style={{ color: accentColor }}>
                {children}
            </h2>
        </div>
    );

    return (
        <div className="modern-resume bg-white min-h-[1100px] font-sans">
            <div className="grid grid-cols-[35%_65%] h-full">
                {/* Left Sidebar */}
                <div className="sidebar p-8" style={{ backgroundColor: `${accentColor}08` }}>
                    {/* Profile Image */}
                    {personalInfo?.profileImage && (
                        <div className="mb-6">
                            <div className="profile-img w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                                <img
                                    src={personalInfo.profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="mb-8">
                        <SectionHeading icon={Mail}>Contact</SectionHeading>
                        <div className="space-y-3 text-sm text-gray-700">
                            {personalInfo?.email && (
                                <div className="flex items-start gap-2">
                                    <Mail size={16} className="mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                                    <span className="break-all">{personalInfo.email}</span>
                                </div>
                            )}
                            {personalInfo?.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={16} style={{ color: accentColor }} />
                                    <span>{personalInfo.phone}</span>
                                </div>
                            )}
                            {personalInfo?.location && (
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                                    <span>{personalInfo.location}</span>
                                </div>
                            )}
                            {personalInfo?.linkedIn && (
                                <div className="flex items-start gap-2">
                                    <Linkedin size={16} className="mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                                    <span className="break-all text-xs">{personalInfo.linkedIn}</span>
                                </div>
                            )}
                            {personalInfo?.website && (
                                <div className="flex items-start gap-2">
                                    <Globe size={16} className="mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                                    <span className="break-all text-xs">{personalInfo.website}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Education */}
                    {education && education.length > 0 && (
                        <div className="mb-8">
                            <SectionHeading icon={GraduationCap}>Education</SectionHeading>
                            <div className="space-y-4">
                                {education.map((edu, idx) => (
                                    <div key={idx} className="text-sm">
                                        <h3 className="font-bold text-gray-900 mb-1">{edu.degree}</h3>
                                        <p className="text-gray-700 font-medium">{edu.institution}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {edu.endDate || edu.year}
                                            {edu.gpa && ` • ${edu.gpa}`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {skills && skills.length > 0 && (
                        <div className="mb-8">
                            <SectionHeading icon={Code}>Skills</SectionHeading>
                            <div className="flex flex-wrap gap-2">
                                {(Array.isArray(skills) ? skills : skills.split(',')).map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 text-xs font-medium rounded text-white"
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        {typeof skill === 'string' ? skill.trim() : skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Achievements */}
                    {achievements && achievements.length > 0 && (
                        <div>
                            <SectionHeading icon={Award}>Achievements</SectionHeading>
                            <ul className="space-y-2">
                                {achievements.map((achievement, idx) => (
                                    <li key={idx} className="text-xs text-gray-700 leading-relaxed flex gap-2">
                                        <Star size={12} className="mt-1 flex-shrink-0" style={{ color: accentColor }} />
                                        <span>{achievement}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right Main Content */}
                <div className="main-content p-8 bg-white">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2" style={{ color: accentColor }}>
                            {personalInfo?.fullName || 'Your Name'}
                        </h1>
                        {personalInfo?.profession && (
                            <p className="text-xl text-gray-600">{personalInfo.profession}</p>
                        )}
                        <div className="h-1 w-24 rounded-full mt-3" style={{ backgroundColor: accentColor }} />
                    </div>

                    {/* Professional Summary */}
                    {summary && (
                        <div className="mb-8">
                            <SectionHeading icon={Briefcase}>Professional Summary</SectionHeading>
                            <p className="text-sm text-gray-700 leading-relaxed text-justify">
                                {summary}
                            </p>
                        </div>
                    )}

                    {/* Experience */}
                    {experience && experience.length > 0 && (
                        <div className="mb-8">
                            <SectionHeading icon={Briefcase}>Experience</SectionHeading>
                            <div className="space-y-6">
                                {experience.map((exp, idx) => (
                                    <div key={idx} className="relative pl-6 border-l-2" style={{ borderColor: `${accentColor}40` }}>
                                        <div
                                            className="absolute -left-2 top-1 w-4 h-4 rounded-full border-2 border-white"
                                            style={{ backgroundColor: accentColor }}
                                        />
                                        <div className="flex justify-between items-baseline mb-2">
                                            <h3 className="text-base font-bold text-gray-900">
                                                {exp.jobTitle || exp.title}
                                            </h3>
                                            <span className="text-xs text-gray-500">
                                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold mb-2" style={{ color: accentColor }}>
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

                    {/* Projects */}
                    {projects && projects.length > 0 && (
                        <div>
                            <SectionHeading icon={Code}>Projects</SectionHeading>
                            <div className="space-y-5">
                                {projects.map((proj, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-baseline justify-between mb-1">
                                            <h3 className="text-base font-bold text-gray-900">{proj.title}</h3>
                                            {proj.technologies && proj.technologies.length > 0 && (
                                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                                                    {Array.isArray(proj.technologies) ? proj.technologies.slice(0, 2).join(' • ') : proj.technologies}
                                                </span>
                                            )}
                                        </div>
                                        {proj.description && (
                                            <p className="text-sm text-gray-700 leading-relaxed mb-2">{proj.description}</p>
                                        )}
                                        <div className="flex gap-3 text-xs">
                                            {proj.githubLink && (
                                                <a href={proj.githubLink} className="hover:underline" style={{ color: accentColor }}>
                                                    GitHub →
                                                </a>
                                            )}
                                            {proj.liveLink && (
                                                <a href={proj.liveLink} className="hover:underline" style={{ color: accentColor }}>
                                                    Live Demo →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
              @media print {
                .modern-resume {
                  min-height: auto !important;
                  max-height: 11in;
                  font-size: 9pt;
                }
                .modern-resume h1 {
                  font-size: 24pt !important;
                  margin-bottom: 4pt !important;
                }
                .modern-resume h2 {
                  font-size: 11pt !important;
                  margin-bottom: 6pt !important;
                }
                .modern-resume h3 {
                  font-size: 10pt !important;
                }
                .modern-resume p {
                  font-size: 8.5pt !important;
                  line-height: 1.3 !important;
                }
                .modern-resume .section-spacing {
                  margin-bottom: 12pt !important;
                }
                .modern-resume .sidebar {
                  padding: 16pt !important;
                }
                .modern-resume .main-content {
                  padding: 16pt !important;
                }
                .modern-resume .profile-img {
                  width: 80pt !important;
                  height: 80pt !important;
                  margin-bottom: 8pt !important;
                }
                .modern-resume .contact-item {
                  margin-bottom: 4pt !important;
                }
                .modern-resume .experience-item {
                  margin-bottom: 10pt !important;
                  padding-left: 12pt !important;
                }
              }
            `}</style>
        </div>
    );
};

export default ModernTemplate;
