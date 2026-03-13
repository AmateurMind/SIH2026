import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  X, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react';

const ATSScoreCard = ({ studentId = null, isFacultyView = false }) => {
  const [atsScore, setAtsScore] = useState(null);
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchATSScore();
  }, [studentId]);

  const fetchATSScore = async () => {
    try {
      setLoading(true);
      const endpoint = isFacultyView && studentId 
        ? `/ats/student/${studentId}`
        : '/ats/my-score';
      
      const res = await axios.get(endpoint);
      
      if (res.data.success) {
        setAtsScore(res.data.atsScore);
        if (res.data.latestResume?.atsAnalysis) {
          setAtsAnalysis(res.data.latestResume.atsAnalysis);
        }
      }
    } catch (error) {
      console.error('Failed to fetch ATS score:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.type !== 'application/pdf' && 
        file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      toast.error('Only PDF and DOCX files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await axios.post('/ats/analyze', formData);

      if (res.data.success) {
        toast.success(`Resume analyzed! ATS Score: ${res.data.atsScore}`);
        setAtsScore(res.data.atsScore);
        setAtsAnalysis(res.data.analysis);
        setShowUploadModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Analysis failed');
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    if (score >= 40) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    if (score >= 40) return 'Below Average';
    return 'Needs Improvement';
  };

  const getScoreIcon = (score) => {
    if (score >= 75) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (score >= 40) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <AlertTriangle className="w-5 h-5 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-500">Loading ATS Score...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
            ATS Resume Score
          </h3>
          
          {!isFacultyView && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Upload size={16} />
              <span>Analyze Resume</span>
            </button>
          )}
        </div>

        {atsScore !== null && atsScore !== undefined ? (
          <div className="space-y-4">
            {/* Score Display */}
            <div className={`flex items-center justify-between p-4 rounded-xl ${getScoreBgColor(atsScore)} border border-gray-200`}>
              <div className="flex items-center gap-3">
                {getScoreIcon(atsScore)}
                <div>
                  <p className="text-sm text-gray-500">Your ATS Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${getScoreColor(atsScore)}`}>
                      {atsScore}
                    </span>
                    <span className="text-gray-400">/100</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(atsScore)} ${getScoreColor(atsScore)}`}>
                  {getScoreLabel(atsScore)}
                </span>
              </div>
            </div>

            {/* View Analysis Button */}
            <button
              onClick={() => setShowAnalysisModal(true)}
              className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Info size={16} />
              View Detailed Analysis
            </button>

            {/* Quick Stats */}
            {atsAnalysis && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Sections</p>
                  <p className="font-semibold text-gray-900">
                    {atsAnalysis.details?.sections?.found?.length || 0}/{4}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Action Verbs</p>
                  <p className="font-semibold text-gray-900">
                    {atsAnalysis.details?.content?.actionVerbs || 0}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Achievements</p>
                  <p className="font-semibold text-gray-900">
                    {atsAnalysis.details?.content?.quantifiableAchievements || 0}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Keywords</p>
                  <p className="font-semibold text-gray-900">
                    {atsAnalysis.details?.keywords?.uniqueWords || 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">No ATS analysis yet</p>
            {!isFacultyView && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Upload size={16} />
                Upload Resume for Analysis
              </button>
            )}
            {isFacultyView && (
              <p className="text-sm text-gray-400">Student hasn't uploaded a resume for analysis</p>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Analyze Resume</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Upload your resume (PDF or DOCX) to get an ATS compatibility score and detailed feedback.
              </p>
              <label className="block w-full cursor-pointer group">
                <div className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all gap-3">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  ) : (
                    <>
                      <Upload size={32} className="text-blue-500 group-hover:scale-110 transition-transform" />
                      <p className="font-medium">Click to select PDF or DOCX</p>
                      <p className="text-xs text-gray-400">Max 10MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleAnalyzeResume}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Info size={16} />
                What is ATS?
              </h4>
              <p className="text-sm text-blue-800">
                Applicant Tracking Systems (ATS) are software used by employers to screen resumes. 
                This analysis checks how well your resume is optimized for ATS parsing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Details Modal */}
      {showAnalysisModal && atsAnalysis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">ATS Analysis Details</h3>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              {/* Score Summary */}
              <div className={`flex items-center justify-between p-4 rounded-xl ${getScoreBgColor(atsScore)} border border-gray-200`}>
                <div className="flex items-center gap-3">
                  {getScoreIcon(atsScore)}
                  <div>
                    <p className="text-sm text-gray-500">Overall Score</p>
                    <span className={`text-3xl font-bold ${getScoreColor(atsScore)}`}>
                      {atsScore}/100
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(atsScore)} ${getScoreColor(atsScore)}`}>
                  {getScoreLabel(atsScore)}
                </span>
              </div>

              {/* Suggestions */}
              {atsAnalysis.suggestions && atsAnalysis.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {atsAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Issues */}
              {atsAnalysis.issues && atsAnalysis.issues.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Issues Found</h4>
                  <div className="space-y-2">
                    {atsAnalysis.issues.map((issue, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg border ${
                          issue.severity === 'high' 
                            ? 'bg-red-50 border-red-200' 
                            : issue.severity === 'medium'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {issue.severity === 'high' ? (
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          ) : issue.severity === 'medium' ? (
                            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-gray-500 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{issue.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{issue.impact}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sections */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Resume Sections</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle size={14} />
                      Found: {atsAnalysis.details?.sections?.found?.join(', ') || 'None'}
                    </p>
                    {atsAnalysis.details?.sections?.missing?.length > 0 && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <X size={14} />
                        Missing: {atsAnalysis.details.sections.missing.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm flex items-center gap-1">
                      {atsAnalysis.details?.contact?.hasEmail ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <X size={14} className="text-red-500" />
                      )}
                      <span className={atsAnalysis.details?.contact?.hasEmail ? 'text-green-700' : 'text-red-700'}>
                        Email {atsAnalysis.details?.contact?.hasEmail ? 'Found' : 'Missing'}
                      </span>
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      {atsAnalysis.details?.contact?.hasPhone ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <X size={14} className="text-red-500" />
                      )}
                      <span className={atsAnalysis.details?.contact?.hasPhone ? 'text-green-700' : 'text-red-700'}>
                        Phone {atsAnalysis.details?.contact?.hasPhone ? 'Found' : 'Missing'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Formatting */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Formatting</h4>
                  <p className="text-sm text-gray-600">
                    Word Count: <span className="font-medium">{atsAnalysis.details?.formatting?.wordCount || 0}</span>
                  </p>
                </div>

                {/* Content */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Content Quality</h4>
                  <p className="text-sm text-gray-600">
                    Action Verbs: <span className="font-medium">{atsAnalysis.details?.content?.actionVerbs || 0}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantifiable Achievements: <span className="font-medium">{atsAnalysis.details?.content?.quantifiableAchievements || 0}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ATSScoreCard;
