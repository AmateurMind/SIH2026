import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FileText, Sparkles, Download, Save, Eye, Wand2,
  ChevronLeft, ChevronRight, Share2, Printer,
  Palette, Globe, Lock
} from 'lucide-react';

// Import new components
import TemplateSelector from '../../components/resume/TemplateSelector';
import ColorPicker from '../../components/resume/ColorPicker';
import ResumePreview from '../../components/resume/ResumePreview';
import PersonalInfoForm from '../../components/resume/PersonalInfoForm';
import ExperienceForm from '../../components/resume/ExperienceForm';
import EducationForm from '../../components/resume/EducationForm';
import ProjectsForm from '../../components/resume/ProjectsForm';
import SkillsForm from '../../components/resume/SkillsForm';

const ResumeBuilder = () => {
  const { resumeId } = useParams(); // Get resumeId from URL for edit mode
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [resumeDbId, setResumeDbId] = useState(null); // Store DB ID for updates

  // Resume Data State
  const [resumeData, setResumeData] = useState({
    title: 'My Resume',
    template: 'modern',
    accentColor: '#2563eb',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      profession: '',
      linkedIn: '',
      website: '',
      profileImage: null
    },
    summary: '',
    education: [],
    experience: [],
    projects: [],
    skills: [],
    achievements: []
  });

  // Steps configuration
  const steps = [
    { id: 'personal', title: 'Personal Info', icon: '👤' },
    { id: 'education', title: 'Education', icon: '🎓' },
    { id: 'experience', title: 'Experience', icon: '💼' },
    { id: 'projects', title: 'Projects', icon: '🚀' },
    { id: 'skills', title: 'Skills', icon: '⚡' },
    { id: 'achievements', title: 'Achievements', icon: '🏆' },
    { id: 'summary', title: 'Summary', icon: '📝' }
  ];

  // Load resume data on mount (edit mode) or user profile (create mode)
  useEffect(() => {
    if (resumeId) {
      loadExistingResume();
    } else {
      loadUserProfile();
    }
  }, [resumeId]);

  const loadExistingResume = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/resume-management/${resumeId}`);

      if (response.data.success) {
        const resume = response.data.resume;
        setResumeData(resume);
        setIsPublic(resume.isPublic);
        setResumeDbId(resume._id);
        toast.success('Resume loaded successfully');
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      toast.error('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/auth/profile');

      const user = response.data.user;

      // Map user data to resume structure
      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          location: user.address || '', // Mapping address to location
          profession: user.department ? `${user.department} Student` : ''
        }
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for data updates
  const handlePersonalInfoChange = (newData) => {
    setResumeData(prev => ({ ...prev, personalInfo: newData }));
  };

  const handleExperienceChange = (newData) => {
    setResumeData(prev => ({ ...prev, experience: newData }));
  };

  const handleEducationChange = (newData) => {
    setResumeData(prev => ({ ...prev, education: newData }));
  };

  const handleProjectsChange = (newData) => {
    setResumeData(prev => ({ ...prev, projects: newData }));
  };

  const handleSkillsChange = (newData) => {
    setResumeData(prev => ({ ...prev, skills: newData }));
  };

  const handleSummaryChange = (e) => {
    setResumeData(prev => ({ ...prev, summary: e.target.value }));
  };

  const handleAchievementsChange = (e) => {
    // Split by newlines for simple text area input
    const achievements = e.target.value.split('\n').filter(item => item.trim());
    setResumeData(prev => ({ ...prev, achievements }));
  };

  // Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            profileImage: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Handlers (Mocked for now)
  const handleAiEnhance = async (index, text) => {
    toast.loading('Enhancing content with AI...');
    // Simulate API call
    setTimeout(() => {
      toast.dismiss();
      toast.success('Content enhanced!');
    }, 1500);
  };

  const handleGenerateSummary = async () => {
    toast.loading('Generating summary...');
    // Simulate API call
    setTimeout(() => {
      toast.dismiss();
      const mockSummary = `Motivated ${resumeData.personalInfo.profession} with a strong foundation in ${resumeData.skills.slice(0, 3).join(', ')}. Proven ability to deliver high-quality results in challenging environments. Passionate about leveraging technology to solve real-world problems.`;
      setResumeData(prev => ({ ...prev, summary: mockSummary }));
      toast.success('Summary generated!');
    }, 1500);
  };

  // Navigation Handlers
  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(curr => curr + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(curr => curr - 1);
  };

  // Save Handler
  const handleSave = async () => {
    try {
      setLastSaved('Saving...');

      if (resumeDbId) {
        // Update existing resume
        const response = await axios.put(
          `/resume-management/update/${resumeDbId}`,
          resumeData
        );

        if (response.data.success) {
          setLastSaved(`Saved at ${new Date().toLocaleTimeString()}`);
          toast.success('Resume updated successfully');
        }
      } else {
        // Create new resume
        const response = await axios.post(
          '/resume-management/create',
          resumeData
        );

        if (response.data.success) {
          setResumeDbId(response.data.resume._id);
          setLastSaved(`Saved at ${new Date().toLocaleTimeString()}`);
          toast.success('Resume created successfully');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save resume');
      setLastSaved('Failed to save');
    }
  };

  // Toggle visibility handler
  const handleToggleVisibility = async () => {
    if (!resumeDbId) {
      toast.error('Please save the resume first');
      return;
    }

    try {
      const response = await axios.patch(
        `/resume-management/${resumeDbId}/visibility`,
        { isPublic: !isPublic }
      );

      if (response.data.success) {
        setIsPublic(response.data.isPublic);
        toast.success(`Resume is now ${response.data.isPublic ? 'public' : 'private'}`);

        if (response.data.isPublic && response.data.publicUrl) {
          const fullUrl = `${window.location.origin}${response.data.publicUrl}`;
          navigator.clipboard.writeText(fullUrl);
          toast.success('Public link copied to clipboard!');
        }
      }
    } catch (error) {
      console.error('Toggle visibility error:', error);
      toast.error('Failed to update visibility');
    }
  };

  // Download/Print Handler
  const handlePrint = async () => {
    try {
      setGeneratingPDF(true);
      toast.loading('Generating PDF...');

      // Import libraries dynamically
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      // Get the resume preview element
      const resumeElement = document.querySelector('.resume-preview-container');

      if (!resumeElement) {
        throw new Error('Resume preview not found');
      }

      // Temporarily reset scale for capture
      const originalTransform = resumeElement.style.transform;
      resumeElement.style.transform = 'scale(1)';

      // Capture the resume as canvas
      const canvas = await html2canvas(resumeElement, {
        scale: 1.5, // Reduced scale for smaller file size
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Restore original scale
      resumeElement.style.transform = originalTransform;

      // Create PDF (Use JPEG with compression to ensure <10MB)
      const imgData = canvas.toDataURL('image/jpeg', 0.80);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Download the PDF
      const fileName = resumeData.personalInfo.fullName
        ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`
        : 'Resume.pdf';

      pdf.save(fileName);

      toast.dismiss();
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'personal':
        return (
          <PersonalInfoForm
            personalInfo={resumeData.personalInfo}
            onChange={handlePersonalInfoChange}
            onImageUpload={handleImageUpload}
          />
        );
      case 'education':
        return (
          <EducationForm
            education={resumeData.education}
            onChange={handleEducationChange}
          />
        );
      case 'experience':
        return (
          <ExperienceForm
            experience={resumeData.experience}
            onChange={handleExperienceChange}
            onAiEnhance={handleAiEnhance}
          />
        );
      case 'projects':
        return (
          <ProjectsForm
            projects={resumeData.projects}
            onChange={handleProjectsChange}
            onAiEnhance={handleAiEnhance}
          />
        );
      case 'skills':
        return (
          <SkillsForm
            skills={resumeData.skills}
            onChange={handleSkillsChange}
            onAiSuggest={() => toast.success('AI suggestions coming soon!')}
          />
        );
      case 'achievements':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
            <textarea
              value={resumeData.achievements.join('\n')}
              onChange={handleAchievementsChange}
              className="w-full p-4 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
              rows={6}
              placeholder="• Won first place in hackathon&#10;• Published research paper&#10;• Led team of 5 developers"
            />
          </div>
        );
      case 'summary':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Professional Summary</h3>
              <button
                onClick={handleGenerateSummary}
                className="text-xs flex items-center gap-1.5 text-primary-700 font-semibold bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition border border-primary-200"
              >
                <Wand2 size={13} /> AI Generate
              </button>
            </div>
            <textarea
              value={resumeData.summary}
              onChange={handleSummaryChange}
              className="w-full p-4 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
              rows={6}
              placeholder="Write a compelling summary of your professional background..."
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 relative overflow-hidden text-gray-900" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Main Container */}
      <div className="relative z-10 max-w-[1600px] mx-auto p-2 sm:p-4 lg:p-6 min-h-screen md:h-screen flex flex-col gap-3 sm:gap-4 lg:gap-6 pb-20 md:pb-6">

        {/* 2. Main Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6 overflow-hidden min-h-0">

          {/* LEFT: Editor Panel */}
          <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-4 h-full min-h-0 animate-fadeIn">

            {/* Progress Stepper */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg sm:rounded-xl p-1.5 sm:p-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center justify-between w-full px-0.5 sm:px-1 gap-0.5 sm:gap-1 min-w-max">
                {steps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => setCurrentStep(idx)}
                      className={`relative flex flex-col items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all min-w-[45px] sm:min-w-[50px] flex-1 touch-manipulation ${currentStep === idx
                        ? 'bg-primary-50 text-primary-700 shadow-sm scale-105 border border-primary-200'
                        : currentStep > idx
                          ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                        }`}
                    >
                      <span className="text-sm sm:text-base mb-0 sm:mb-0.5">{step.icon}</span>
                      <span className="text-[8px] sm:text-[9px] font-medium leading-tight whitespace-nowrap hidden xs:block">{step.title}</span>
                      {currentStep > idx && (
                        <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 w-1 h-1 bg-green-500 rounded-full" />
                      )}
                    </button>
                    {idx < steps.length - 1 && (
                      <div className={`w-1 sm:w-2 h-px shrink-0 ${idx < currentStep ? 'bg-primary-200' : 'bg-gray-200'
                        }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Form Container */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg sm:rounded-xl flex-1 flex flex-col relative overflow-hidden animate-slideUp">
              <div className="p-3 sm:p-4 lg:p-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">{steps[currentStep].icon}</span>
                  <span className="hidden sm:inline">{steps[currentStep].title}</span>
                </h2>
                {steps[currentStep].id === 'summary' && (
                  <button
                    onClick={handleGenerateSummary}
                    className="text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 text-primary-700 font-semibold bg-primary-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg hover:bg-primary-100 active:bg-primary-200 transition border border-primary-200 touch-manipulation"
                  >
                    <Wand2 size={12} className="sm:w-[13px] sm:h-[13px]" />
                    <span className="hidden sm:inline">AI Generate</span>
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 custom-scrollbar space-y-3 sm:space-y-4">
                {renderStepContent()}
              </div>

              <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between gap-2 shrink-0">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  ← <span className="hidden sm:inline">Back</span>
                </button>
                <button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 hover:shadow-lg active:scale-[0.98] transition-all text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  <span className="hidden sm:inline">Next</span> <span className="sm:hidden">Next</span> <ChevronRight size={14} className="sm:w-[15px] sm:h-[15px]" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="lg:col-span-7 h-full min-h-0 flex flex-col gap-3 sm:gap-4">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg sm:rounded-xl flex-1 overflow-hidden relative flex flex-col animate-slideUp" style={{ animationDelay: '0.1s' }}>
              {/* Preview Header Controls */}
              <div className="p-1 sm:p-1.5 border-b border-gray-100 flex flex-wrap justify-between items-center bg-white shrink-0 gap-2">
                <TemplateSelector
                  selectedTemplate={resumeData.template}
                  onTemplateChange={(id) => setResumeData(prev => ({ ...prev, template: id }))}
                />
                <ColorPicker
                  accentColor={resumeData.accentColor}
                  onAccentColorChange={(c) => setResumeData(prev => ({ ...prev, accentColor: c }))}
                />
              </div>

              <div className="flex-1 overflow-auto custom-scrollbar p-2 sm:p-4 lg:p-8 flex justify-center items-start bg-gray-50/50">
                <div className="relative">
                  <div className="resume-preview-container relative origin-top transform scale-[0.4] xs:scale-[0.5] sm:scale-[0.65] md:scale-[0.75] lg:scale-[0.85] xl:scale-100 transition-transform duration-300 ease-out shadow-xl">
                    {/* The Actual Resume Paper */}
                    <ResumePreview
                      resumeData={resumeData}
                      template={resumeData.template}
                      accentColor={resumeData.accentColor}
                    />
                  </div>
                </div>
              </div>

              {/* Preview Footer Actions */}
              <div className="p-2 sm:p-3 border-t border-gray-100 bg-white flex flex-wrap justify-between items-center shrink-0 gap-2">
                <button
                  onClick={handleToggleVisibility}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                  title={isPublic ? "Public" : "Private"}
                >
                  {isPublic ? (
                    <>
                      <Globe size={14} className="sm:w-4 sm:h-4 text-gray-500" />
                      <span className="hidden sm:inline">Public</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} className="sm:w-4 sm:h-4 text-gray-400" />
                      <span className="hidden sm:inline">Private</span>
                    </>
                  )}
                </button>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button onClick={handleSave} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation">
                    <Save size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    disabled={generatingPDF}
                    className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-1.5 sm:py-2 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 hover:shadow-lg active:scale-[0.98] transition-all font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <Download size={14} className="sm:w-4 sm:h-4" />
                    <span>{generatingPDF ? 'Generating...' : <span className="hidden sm:inline">Download</span>}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: #d1d5db;
        }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Touch optimization */
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .resume-preview-container {
            transform-origin: top center !important;
          }
        }

        /* Print Overrides */
        @media print {
          .glass-panel, .bg-gradient-to-br, [class*="bg-["] { 
            background: none !important; 
            backdrop-filter: none !important; 
            border: none !important; 
            box-shadow: none !important; 
          }
          .fixed, header, .print\\:hidden, button { display: none !important; }
          .lg\\:col-span-7 { display: block !important; width: 100% !important; height: auto !important; overflow: visible !important; }
          body { background: white; overflow: visible; }
        }

        /* Smooth Animations */
        .animate-slideDown { 
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
        .animate-slideUp { 
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animate-fadeIn { 
          animation: fadeIn 0.5s ease-out forwards; 
          opacity: 0;
        }
        
        @keyframes slideDown { 
          from { transform: translateY(-20px); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; } 
        }
        @keyframes slideUp { 
          from { transform: translateY(20px); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; } 
        }
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;
