import React, { useState, useEffect } from 'react';
import { Building, Calendar, Clock, CheckCircle, XCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/applications');
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Failed to fetch applications');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" className="text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-[30px] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Applications</h1>
            <p className="text-gray-500 mt-1">Track the status of your internship applications.</p>
          </div>
          <Button onClick={() => navigate('/student/internships')} variant="outline" className="hidden sm:flex border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl">
            Browse More <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {applications.length === 0 ? (
            <Card className="bg-white border-dashed border-gray-200 shadow-sm rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No applications yet</h3>
                <p className="text-gray-500 max-w-sm mb-6">You haven't applied to any internships yet. Start browsing to find your next opportunity.</p>
                <Button onClick={() => navigate('/student/internships')} className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-blue-900/20">
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
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center flex-shrink-0">
                          <Building className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {application.internship?.title || 'Unknown Position'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                            <span className="font-medium text-gray-700 flex items-center">
                              {application.internship?.company || 'Unknown Company'}
                            </span>
                            <span className="hidden sm:inline text-gray-300">|</span>
                            <span className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                              Applied on {new Date(application.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-2 self-start sm:self-center ${statusConfig.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        {statusConfig.label}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentApplications;