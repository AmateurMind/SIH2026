import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Search, MapPin, DollarSign, Calendar, Briefcase, Trash2, Edit, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SKILLS_LIST = [
    "JavaScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go", "Rust", "TypeScript",
    "React", "Angular", "Vue.js", "Svelte", "Next.js", "Nuxt.js", "Node.js", "Express.js", "Django", "Flask",
    "Spring Boot", "ASP.NET", "Laravel", "Ruby on Rails",
    "HTML", "CSS", "Sass", "Less", "Tailwind CSS", "Bootstrap",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Firebase", "Supabase", "Oracle", "Cassandra",
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Git",
    "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Data Analysis", "Machine Learning", "AI",
    "Figma", "Adobe XD", "Photoshop", "Illustrator",
    "Mobile Development", "Web Development", "Data Science", "DevOps", "Cybersecurity", "Blockchain",
    "Communication", "Teamwork", "Leadership", "Problem Solving", "Time Management", "Agile", "Scrum"
];

const RecruiterInternships = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Skill Suggestions State
    const [skillSuggestions, setSkillSuggestions] = useState([]);
    const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
    const suggestionsRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        stipend: '',
        location: '',
        duration: '',
        workMode: 'On-site',
        requiredSkills: '',
        eligibleDepartments: '',
        applicationDeadline: '',
        startDate: '',
        endDate: '',
        minimumCGPA: '6.0',
        minimumSemester: '4',
        maxApplications: '50',
    });

    useEffect(() => {
        fetchInternships();

        // Click outside to close suggestions
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSkillSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchInternships = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/internships/my-postings');
            if (response.data) {
                // Handle both array response and object with internships key
                const data = Array.isArray(response.data) ? response.data :
                    (response.data.internships || []);
                setInternships(data);
            }
        } catch (error) {
            console.error('Error fetching internships:', error);
            // Fallback to all internships if my-postings fails (dev mode fallback)
            try {
                const response = await axios.get('/internships');
                if (response.data.success) {
                    setInternships(response.data.data || []);
                }
            } catch (e) {
                toast.error('Failed to load internships');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillChange = (e) => {
        const { value } = e.target;
        handleInputChange(e);

        const parts = value.split(',');
        const lastPart = parts[parts.length - 1].trim();

        if (lastPart.length > 0) {
            const usedSkills = parts.slice(0, -1).map(s => s.trim().toLowerCase());
            const filtered = SKILLS_LIST.filter(skill =>
                skill.toLowerCase().startsWith(lastPart.toLowerCase()) &&
                !usedSkills.includes(skill.toLowerCase())
            );
            setSkillSuggestions(filtered);
            setShowSkillSuggestions(filtered.length > 0);
        } else {
            setShowSkillSuggestions(false);
        }
    };

    const handleSelectSkill = (skill) => {
        const parts = formData.requiredSkills.split(',');
        parts.pop(); // Remove the partial chunk
        parts.push(skill);
        const newValue = parts.join(', ') + ', ';

        setFormData(prev => ({ ...prev, requiredSkills: newValue }));
        setShowSkillSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.title || !formData.description || !formData.requiredSkills || !formData.eligibleDepartments) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);

            // Format data for backend
            const payload = {
                ...formData,
                requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
                eligibleDepartments: formData.eligibleDepartments.split(',').map(d => d.trim()).filter(Boolean),
                minimumCGPA: parseFloat(formData.minimumCGPA),
                minimumSemester: parseInt(formData.minimumSemester),
                maxApplications: parseInt(formData.maxApplications)
            };

            await axios.post('/internships/submit', payload);
            toast.success('Job posted successfully!');
            setIsModalOpen(false);

            // Reset form
            setFormData({
                title: '',
                description: '',
                stipend: '',
                location: '',
                duration: '',
                workMode: 'On-site',
                requiredSkills: '',
                eligibleDepartments: '',
                applicationDeadline: '',
                startDate: '',
                endDate: '',
                minimumCGPA: '6.0',
                minimumSemester: '4',
                maxApplications: '50',
            });

            fetchInternships();
        } catch (error) {
            console.error('Submit error:', error);
            const msg = error.response?.data?.error || 'Failed to post job';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this posting?')) return;
        try {
            await axios.delete(`/internships/${id}`);
            setInternships(internships.filter(i => i.id !== id));
            toast.success('Internship deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete internship');
        }
    };

    const filteredInternships = internships.filter(internship =>
        (internship.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (internship.company?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
                        <p className="text-gray-600 mt-1">Manage your internship opportunities</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        Post New Job
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search job postings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Internships Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="animate-spin text-blue-600 w-10 h-10 mx-auto" />
                        <p className="mt-4 text-gray-500">Loading postings...</p>
                    </div>
                ) : filteredInternships.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900">No job postings found</h3>
                        <p className="text-gray-500 mb-4">Create your first internship opportunity to get started.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Post a Job
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInternships.map((internship) => (
                            <div key={internship.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col group">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                                            {internship.companyLogo ? (
                                                <img src={internship.companyLogo} alt="Logo" className="w-8 h-8 object-contain" />
                                            ) : (
                                                <Briefcase className="text-blue-600" size={24} />
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${internship.status === 'active' ? 'bg-green-50 text-green-700' :
                                            internship.status === 'submitted' ? 'bg-yellow-50 text-yellow-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            {internship.status ? internship.status.charAt(0).toUpperCase() + internship.status.slice(1) : 'Active'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{internship.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{internship.company}</p>

                                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span className="truncate">{internship.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            {internship.stipend}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            {internship.duration}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                    <button className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                                        <Edit size={16} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(internship.id)}
                                        className="flex-1 px-4 py-2 bg-white border border-gray-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Post Job Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">Post New Job</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Software Engineer Intern"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                    <textarea
                                        name="description"
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                        placeholder="Job responsibilities and details..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stipend *</label>
                                    <input
                                        type="text"
                                        name="stipend"
                                        required
                                        value={formData.stipend}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. ₹25,000/month"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                                    <input
                                        type="text"
                                        name="duration"
                                        required
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. 6 months"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                    <input
                                        type="text"
                                        name="location"
                                        required
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Bangalore"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
                                    <select
                                        name="workMode"
                                        value={formData.workMode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="On-site">On-site</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>

                                <div className="col-span-2 relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma separated) *</label>
                                    <input
                                        type="text"
                                        name="requiredSkills"
                                        required
                                        value={formData.requiredSkills}
                                        onChange={handleSkillChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. React, Node.js, MongoDB"
                                        autoComplete="off"
                                    />
                                    {showSkillSuggestions && (
                                        <div
                                            ref={suggestionsRef}
                                            className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                                        >
                                            {skillSuggestions.map((skill, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleSelectSkill(skill)}
                                                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 text-gray-700 text-sm transition-colors border-b border-gray-50 last:border-none"
                                                >
                                                    {skill}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Departments (comma separated) *</label>
                                    <input
                                        type="text"
                                        name="eligibleDepartments"
                                        required
                                        value={formData.eligibleDepartments}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. CSE, IT, ECE"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                                    <input
                                        type="date"
                                        name="applicationDeadline"
                                        value={formData.applicationDeadline}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        'Submit for Approval'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterInternships;
