import React from 'react';
import { Upload, X, User, Mail, Phone, MapPin, Linkedin, Globe, Briefcase } from 'lucide-react';

const PersonalInfoForm = ({ personalInfo, onChange, onImageUpload }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...personalInfo, [name]: value });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
            </div>

            {/* Profile Image Upload */}
            <div className="flex items-center gap-6 mb-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                        {personalInfo.profileImage ? (
                            <img
                                src={personalInfo.profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={40} className="text-gray-400" />
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                        <Upload size={14} />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onImageUpload}
                        />
                    </label>
                </div>

                <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Profile Photo</h4>
                    <p className="text-xs text-gray-500 mb-3">
                        Upload a professional photo. Supported formats: JPG, PNG.
                    </p>
                    {/* Placeholder for AI Background Removal Toggle - to be implemented with backend */}
                    {/* <div className="flex items-center gap-2">
            <input type="checkbox" id="bg-remove" className="rounded text-blue-600 focus:ring-blue-500" />
            <label htmlFor="bg-remove" className="text-xs text-gray-600">Remove background with AI</label>
          </div> */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User size={14} /> Full Name
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={personalInfo.fullName || ''}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Briefcase size={14} /> Professional Title
                    </label>
                    <input
                        type="text"
                        name="profession"
                        value={personalInfo.profession || ''}
                        onChange={handleChange}
                        placeholder="Software Engineer"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail size={14} /> Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={personalInfo.email || ''}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone size={14} /> Phone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={personalInfo.phone || ''}
                        onChange={handleChange}
                        placeholder="+1 234 567 890"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin size={14} /> Location
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={personalInfo.location || ''}
                        onChange={handleChange}
                        placeholder="New York, NY"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Linkedin size={14} /> LinkedIn URL
                    </label>
                    <input
                        type="url"
                        name="linkedIn"
                        value={personalInfo.linkedIn || ''}
                        onChange={handleChange}
                        placeholder="linkedin.com/in/johndoe"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Globe size={14} /> Portfolio / Website
                    </label>
                    <input
                        type="url"
                        name="website"
                        value={personalInfo.website || ''}
                        onChange={handleChange}
                        placeholder="johndoe.com"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoForm;
