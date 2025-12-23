import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Building, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ippService from '../../services/ippService';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import IPPStatusBadge from '../../components/ipp/IPPStatusBadge';
import toast from 'react-hot-toast';

const JobsPage = () => {
  const { user } = useAuth();
  // Passport tab state
  const [ipps, setIpps] = useState([]);
  const [eligibleInternships, setEligibleInternships] = useState([]);
  const [passportLoading, setPassportLoading] = useState(true);
  const [creating, setCreating] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    fetchPassportData();
  }, [user?.id]);

  const fetchPassportData = async () => {
    if (!user?.id) return;

    try {
      setPassportLoading(true);

      // 1. Fetch existing IPPs
      const ippsResponse = await ippService.getStudentIPPs(user.id);
      setIpps(ippsResponse.data);

      // 2. Fetch applications to find eligible internships
      const appsResponse = await axios.get('/applications');
      const applications = appsResponse.data.applications || [];

      // Create a Set of internship IDs that already have an IPP
      const existingIppInternshipIds = new Set(ippsResponse.data.map(ipp => ipp.internshipId));

      const eligible = applications.filter(app =>
        (app.status === 'accepted' || app.status === 'offered' || app.status === 'completed') &&
        (!app.ippId || app.ippStatus === 'pending_creation' || app.ippStatus === 'not_applicable') &&
        !existingIppInternshipIds.has(app.internshipId)
      );

      setEligibleInternships(eligible);

    } catch (error) {
      console.error('Error fetching IPP data:', error);
      toast.error('Failed to load passport data');
    } finally {
      setPassportLoading(false);
    }
  };


  const handleCreateIPP = async (application) => {
    if (!user?.id) return;

    try {
      setCreating(application.id);

      const response = await ippService.createIPP({
        studentId: user.id,
        internshipId: application.internshipId,
        applicationId: application.id
      });

      toast.success('IPP initialized successfully!');
      fetchPassportData();

    } catch (error) {
      console.error('Error creating IPP:', error);
      toast.error(error.response?.data?.error || 'Failed to create IPP');
    } finally {
      setCreating(null);
    }
  };


  const renderPassportTab = () => {
    if (passportLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Eligible Internships Section */}
        {eligibleInternships.length > 0 && (
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              Start New Passport
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {eligibleInternships.map((app) => (
                <Card key={app.id} className="bg-white border-slate-100 shadow-soft hover:shadow-soft-hover transition-all duration-300 rounded-2xl overflow-hidden group">
                  <CardHeader className="pb-3 p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div className="bg-blue-50 p-2 sm:p-2.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <Building className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                    </div>
                    <CardTitle className="mt-4 text-base sm:text-lg font-bold text-slate-900">{app.internship?.title || 'Internship'}</CardTitle>
                    <CardDescription className="text-sm text-slate-600">{app.internship?.company || 'Company'}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                        <span className="break-words">Accepted on {new Date(app.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCreateIPP(app)}
                      disabled={creating === app.id}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 sm:h-11 shadow-sm text-sm sm:text-base"
                    >
                      {creating === app.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">Initializing...</span>
                          <span className="sm:hidden">Loading...</span>
                        </>
                      ) : (
                        'Initialize IPP'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Active IPPs Section */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            My Passports
          </h2>

          {ipps.length === 0 ? (
            <Card className="bg-white border-slate-200 border-dashed shadow-sm rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                <div className="bg-slate-50 p-3 sm:p-4 rounded-full mb-4">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-slate-900">No Passports Yet</h3>
                <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-sm">
                  Once you complete an internship, you can create a passport to get verified credentials and certificates.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {ipps.map((ipp) => {
                return (
                  <div key={ipp.ippId}>
                    <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group">
                      <CardContent className="p-0">
                        <div className="p-4 sm:p-6 pb-4">
                          <div className="flex flex-col md:flex-row justify-between gap-4 sm:gap-6">
                            <div className="flex gap-3 sm:gap-5 min-w-0 flex-1">
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${['verified', 'published'].includes(ipp.status) ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                <Building className="h-5 w-5 sm:h-7 sm:w-7" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-wrap mb-1">
                                  <h3 className="text-base sm:text-xl font-bold text-slate-900 break-words">
                                    {ipp.internshipDetails?.role || 'Intern Role'}
                                  </h3>
                                  <IPPStatusBadge status={ipp.status} />
                                </div>
                                <p className="text-sm sm:text-base text-slate-600 font-medium break-words">
                                  {ipp.internshipDetails?.company || 'Company Name'}
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-slate-400">
                                  <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 w-fit">
                                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500 flex-shrink-0" />
                                    <span className="text-slate-600 whitespace-nowrap">{new Date(ipp.createdAt).toLocaleDateString()}</span>
                                  </span>
                                  <span className="font-mono text-xs text-slate-400 break-all sm:break-normal">ID: {ipp.ippId}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-start md:justify-end">
                              <Link to={ipp.status === 'pending_student_submission' ? `/student/ipp/${ipp.ippId}/submit` : `/student/ipp/${ipp.ippId}`} className="w-full md:w-auto">
                                <Button
                                  className={`w-full md:w-auto rounded-xl shadow-none transition-all text-sm sm:text-base ${ipp.status === 'pending_student_submission'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6'
                                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 sm:px-6'
                                    }`}
                                >
                                  <span className="hidden sm:inline">{ipp.status === 'pending_student_submission' ? 'Complete Submission' : 'View Details'}</span>
                                  <span className="sm:hidden">{ipp.status === 'pending_student_submission' ? 'Complete' : 'View'}</span>
                                  <ChevronRight className={`ml-2 h-4 w-4 flex-shrink-0 ${ipp.status === 'pending_student_submission' ? '' : 'text-slate-400'}`} />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-slate-50 pt-[30px] pb-20 md:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Jobs</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">Manage your internship performance passports.</p>
        </div>

        {/* Content */}
        <div>
          {renderPassportTab()}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;

