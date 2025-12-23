import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Star, Building, Send, Search, Filter, X, Calendar, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, addMonths, parseISO } from 'date-fns';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { useNavigate } from 'react-router-dom';

const StudentInternships = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('internships');
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({ coverLetter: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Applied tab state
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'internships') {
      fetchInternships();
    } else if (activeTab === 'applied') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchInternships = async () => {
    try {
      const response = await axios.get('/internships?recommended=true');
      setInternships(response.data.internships);
    } catch (error) {
      toast.error('Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (internship) => {
    if (internship.hasApplied || !internship.isEligible) {
      return;
    }
    setSelectedInternship(internship);
    setShowApplicationModal(true);
  };

  const submitApplication = async () => {
    try {
      await axios.post('/applications', {
        internshipId: selectedInternship.id,
        coverLetter: applicationData.coverLetter
      });
      toast.success('Application submitted successfully!');
      setShowApplicationModal(false);
      setApplicationData({ coverLetter: '' });

      setInternships(prev => prev.map(internship =>
        internship.id === selectedInternship.id
          ? { ...internship, hasApplied: true }
          : internship
      ));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit application');
    }
  };

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const response = await axios.get('/applications');
      setApplications(response.data.applications || []);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      applied: {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Clock,
        label: 'Applied'
      },
      pending_mentor_approval: {
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: AlertCircle,
        label: 'Pending Approval'
      },
      approved: {
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle,
        label: 'Approved'
      },
      rejected: {
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
        label: 'Rejected'
      },
      interview_scheduled: {
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Calendar,
        label: 'Interview Scheduled'
      },
      offered: {
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: CheckCircle,
        label: 'Offered'
      }
    };
    return configs[status] || {
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: FileText,
      label: status.replace(/_/g, ' ')
    };
  };

  const filteredInternships = internships.filter(internship =>
    internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" className="text-primary-600" />
      </div>
    );
  }

  const renderAppliedTab = () => {
    if (applicationsLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="large" className="text-primary-600" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card className="bg-white border-dashed border-gray-200 shadow-sm rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">No applications yet</h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-sm mb-6">You haven't applied to any internships yet. Start browsing to find your next opportunity.</p>
              <Button onClick={() => setActiveTab('internships')} className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-blue-900/20 text-sm sm:text-base">
                Browse Internships
              </Button>
            </CardContent>
          </Card>
        ) : (
          applications.map((application) => {
            const statusConfig = getStatusConfig(application.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={application.id} className="bg-white border-gray-100 shadow-soft hover:shadow-soft-hover transition-all duration-300 rounded-2xl overflow-hidden group">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gray-50 border border-gray-100 p-1.5 sm:p-2 flex items-center justify-center flex-shrink-0">
                        <Building className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors break-words">
                          {application.internship?.title || 'Unknown Position'}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-1 sm:gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-gray-500">
                          <span className="font-medium text-gray-700 flex items-center">
                            {application.internship?.company || 'Unknown Company'}
                          </span>
                          <span className="hidden sm:inline text-gray-300">|</span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-gray-400 flex-shrink-0" />
                            <span className="whitespace-nowrap">Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium border flex items-center gap-1.5 sm:gap-2 self-start sm:self-center flex-shrink-0 ${statusConfig.color}`}>
                      <StatusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="whitespace-nowrap">{statusConfig.label}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[30px] pb-20 md:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Internships</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Discover and apply for opportunities that match your skills.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-full sm:max-w-md">
            <button
              onClick={() => setActiveTab('internships')}
              className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${activeTab === 'internships'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Internships
            </button>
            <button
              onClick={() => setActiveTab('applied')}
              className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${activeTab === 'applied'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Applied
            </button>
          </div>
        </div>

        {activeTab === 'internships' && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search internships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white border-gray-200 focus:border-primary-500 rounded-xl text-sm sm:text-base h-10 sm:h-11"
              />
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div>
          {activeTab === 'internships' ? (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredInternships.map((internship) => (
                <Card key={internship.id} className="bg-white border-gray-100 shadow-soft hover:shadow-soft-hover transition-all duration-300 rounded-2xl overflow-hidden group flex flex-col h-full">
                  <CardContent className="p-4 sm:p-6 flex-1">
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gray-50 border border-gray-100 p-1.5 sm:p-2 flex items-center justify-center flex-shrink-0">
                        <img
                          src={internship.companyLogo || `https://ui-avatars.com/api/?name=${internship.company}&background=random`}
                          alt={internship.company}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      {internship.recommendationScore && (
                        <div className="flex items-center bg-green-50 text-green-700 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-green-100 flex-shrink-0">
                          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 fill-green-700" />
                          <span className="hidden sm:inline">{internship.recommendationScore}% Match</span>
                          <span className="sm:hidden">{internship.recommendationScore}%</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {internship.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 font-medium flex items-center">
                      <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{internship.company}</span>
                    </p>

                    <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-2.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{internship.location}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-2.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{internship.stipend}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-2.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{internship.duration}</span>
                      </div>
                      {internship.startDate && (
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-2.5 text-gray-400 flex-shrink-0" />
                          <span className="text-[10px] sm:text-xs break-words">
                            {(() => {
                              try {
                                const startDate = parseISO(internship.startDate);
                                let endDate;
                                if (internship.endDate) {
                                  endDate = parseISO(internship.endDate);
                                } else {
                                  const durationMatch = internship.duration?.match(/(\d+)/);
                                  const months = durationMatch ? parseInt(durationMatch[0]) : 0;
                                  endDate = addMonths(startDate, months);
                                }
                                return `${format(startDate, 'd MMM yyyy')} - ${format(endDate, 'd MMM yyyy')}`;
                              } catch (e) {
                                return 'Date TBD';
                              }
                            })()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-2">
                      {internship.requiredSkills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-50 text-gray-600 border border-gray-100 text-[10px] sm:text-xs font-medium rounded-lg">
                          {skill}
                        </span>
                      ))}
                      {internship.requiredSkills.length > 3 && (
                        <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-50 text-gray-500 text-[10px] sm:text-xs font-medium rounded-lg border border-gray-100">
                          +{internship.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 sm:p-6 pt-0 mt-auto">
                    <Button
                      onClick={() => handleApply(internship)}
                      disabled={!internship.isEligible || internship.hasApplied || internship.rejectionCooldown}
                      className={`w-full rounded-xl font-semibold shadow-sm text-sm sm:text-base h-10 sm:h-11 ${internship.hasApplied
                        ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                        : internship.rejectionCooldown
                          ? 'bg-orange-50 text-orange-700 border border-orange-200 cursor-not-allowed'
                          : internship.isEligible
                            ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-blue-900/20'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {internship.hasApplied ? (
                        <>
                          <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          <span>Applied</span>
                        </>
                      ) : internship.rejectionCooldown ? (
                        <>
                          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          <span className="hidden sm:inline">Reapply in {internship.rejectionCooldown}h</span>
                          <span className="sm:hidden">{internship.rejectionCooldown}h</span>
                        </>
                      ) : internship.isEligible ? (
                        'Apply Now'
                      ) : (
                        'Not Eligible'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            renderAppliedTab()
          )}
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-3 mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words flex-1">Apply for {selectedInternship?.title}</h3>
              <button onClick={() => setShowApplicationModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              Applying to <span className="font-semibold text-gray-700">{selectedInternship?.company}</span>.
              Make sure your profile is up to date before submitting.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Cover Letter</label>
                <textarea
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({ coverLetter: e.target.value })}
                  placeholder="Explain why you're a great fit for this role..."
                  className="w-full h-32 p-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                <Button
                  onClick={() => setShowApplicationModal(false)}
                  variant="outline"
                  className="w-full sm:flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm sm:text-base h-10 sm:h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitApplication}
                  disabled={!applicationData.coverLetter.trim()}
                  className="w-full sm:flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-blue-900/20 text-sm sm:text-base h-10 sm:h-11"
                >
                  Submit Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInternships;