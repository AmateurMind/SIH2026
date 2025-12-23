import React from 'react';
import { Upload, X, User, Mail, Phone, MapPin, Linkedin, Globe, Briefcase } from 'lucide-react';

const PersonalInfoForm = ({ personalInfo, onChange, onImageUpload }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...personalInfo, [name]: value });
    };

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Profile Image Upload */}
            <div className="flex flex-row items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="relative group shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
                        {personalInfo.profileImage ? (
                            <img
                                src={personalInfo.profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={24} className="sm:w-8 sm:h-8 text-gray-400" />
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-white text-primary-600 p-1 sm:p-1.5 rounded-full cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-all shadow-md border border-gray-200 touch-manipulation">
                        <Upload size={10} className="sm:w-3 sm:h-3" />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onImageUpload}
                        />
                    </label>
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5">Profile Photo</h4>
                    <p className="text-[9px] sm:text-[10px] text-gray-500">
                        Upload a professional photo. Supported formats: JPG, PNG.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-1">
                    <label className="text-[11px] sm:text-xs font-medium text-gray-700 flex items-center gap-1.5">
                        <User size={11} className="sm:w-3 sm:h-3 text-gray-400" /> Full Name
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={personalInfo.fullName || ''}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-2.5 sm:px-3 py-2 rounded-md bg-white border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-gray-900 placeholder-gray-400"
                    />
                </div>

                <div className="space-y-1.5 col-span-1">
                    <label className="text-[11px] sm:text-xs font-medium text-gray-700 flex items-center gap-1.5">
                        <Briefcase size={11} className="sm:w-3 sm:h-3 text-gray-400" /> Professional Title
                    </label>
                    <input
                        type="text"
                        name="profession"
                        value={personalInfo.profession || ''}
                        onChange={handleChange}
                        placeholder="Software Engineer"
                        className="w-full px-2.5 sm:px-3 py-2 rounded-md bg-white border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-gray-900 placeholder-gray-400"
                    />
                </div>

                <div className="space-y-1.5 col-span-1">
                    <label className="text-[11px] sm:text-xs font-medium text-gray-700 flex items-center gap-1.5">
                        <Mail size={11} className="sm:w-3 sm:h-3 text-gray-400" /> Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={personalInfo.email || ''}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full px-2.5 sm:px-3 py-2 rounded-md bg-white border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-gray-900 placeholder-gray-400"
                    />
                </div>

                <div className="space-y-1.5 col-span-1">
                    <label className="text-[11px] sm:text-xs font-medium text-gray-700 flex items-center gap-1.5">
                        <Phone size={11} className="sm:w-3 sm:h-3 text-gray-400" /> Phone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={personalInfo.phone || ''}
                        onChange={handleChange}
                        placeholder="+1 234 567 890"
                        className="w-full px-2.5 sm:px-3 py-2 rounded-md bg-white border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-gray-900 placeholder-gray-400"
                    />
                </div>

                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-[11px] sm:text-xs font-medium text-gray-700 flex items-center gap-1.5">
                        <MapPin size={11} className="sm:w-3 sm:h-3 text-gray-400" /> Location
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={personalInfo.location || ''}
                        onChange={handleChange}
                        placeholder="New York, USA"
                        className="w-full px-2.5 sm:px-3 py-2 rounded-md bg-white border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-gray-900 placeholder-gray-400"
                    />
                </div>

                <div className="space-y-1.5 col-span-1">
                    <label className="text-[11px] sm:text-xs font-medium text-gray-700 flex items-center gap-1.5">
                        <Linkedin size={11} className="sm:w-3 sm:h-3 text-gray-400" /> LinkedIn
                    </label>
                    <input
                        type="url"
                        name="linkedIn"
                        value={personalInfo.linkedIn || ''}
                        onChange={handleChange}
                        placeholder="linkedin.com/in/johndoe"
                        className="w-full px-2.5 sm:px-3 py-2 rounded-md bg-white border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-gray-900 placeholder-gray-400"
                    />
                </div>

                <div className="space-y-1.5 col-span-1">
                    <label className="text-[11px] sm:text-xs font-medium text-gray-700 flex items-center gap-1.5">
                        <Globe size={11} className="sm:w-3 sm:h-3 text-gray-400" /> Website
                    </label>
                    <input
                        type="url"
                        name="website"
                        value={personalInfo.website || ''}
                        onChange={handleChange}
                        placeholder="johndoe.com"
                        className="w-full px-2.5 sm:px-3 py-2 rounded-md bg-white border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm text-gray-900 placeholder-gray-400"
                    />
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoForm;
