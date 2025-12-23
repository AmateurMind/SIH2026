import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Building,
  Users,
  FileText,
  TrendingUp,
  Plus,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  BarChart3
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    myInternships: [],
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedStudents: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [internshipsRes, applicationsRes] = await Promise.all([
        axios.get('/internships/my-postings'),
        axios.get('/applications')
      ]);

      const myInternships = internshipsRes.data.internships || [];
      const allApplications = applicationsRes.data.applications || [];

      // Filter applications for my internships
      const myInternshipIds = new Set(myInternships.map(i => i.id));
      const myApplications = allApplications.filter(app =>
        myInternshipIds.has(app.internshipId)
      );

      setAnalytics({
        myInternships,
        totalApplications: myApplications.length,
        pendingApplications: myApplications.filter(app =>
          ['applied', 'pending_mentor_approval'].includes(app.status)
        ).length,
        shortlistedStudents: myApplications.filter(app =>
          ['approved', 'interview_scheduled'].includes(app.status)
        ).length
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const { myInternships, totalApplications, pendingApplications, shortlistedStudents } = analytics;
  const activeInternships = myInternships.filter(i => i.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your internship postings and candidate pipeline at {user.company}
            </p>
          </div>
          <Link to="/recruiter/internships" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center font-medium shadow-sm">
            <Plus className="h-4 w-4 mr-2" /> Post New Internship
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Postings</p>
                <p className="text-2xl font-bold text-gray-900">{myInternships.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Active Postings</p>
                <p className="text-2xl font-bold text-gray-900">{activeInternships}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900">{shortlistedStudents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-gray-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/recruiter/internships" className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium">
                <Building className="h-4 w-4 mr-2 text-blue-600" />
                Manage Postings
              </Link>
              <Link to="/recruiter/students" className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium">
                <Users className="h-4 w-4 mr-2 text-purple-600" />
                Browse Candidates
              </Link>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed bg-gray-50" disabled>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interviews
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed bg-gray-50" disabled>
                <FileText className="h-4 w-4 mr-2" />
                View Reports
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              Application Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3 ring-2 ring-yellow-100"></div>
                  <span className="text-sm font-medium text-gray-600">Pending Review</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{pendingApplications}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 ring-2 ring-green-100"></div>
                  <span className="text-sm font-medium text-gray-600">Shortlisted</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{shortlistedStudents}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 ring-2 ring-blue-100"></div>
                  <span className="text-sm font-medium text-gray-600">Total Received</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{totalApplications}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Internship Postings */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building className="h-5 w-5 mr-2 text-gray-500" />
              Recent Postings
            </h3>
            <Link to="/recruiter/internships" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center hover:underline">
              View All
              <Eye className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {myInternships.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4 font-medium">No internships posted yet</p>
              <Link to="/recruiter/internships" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center text-sm font-medium">
                <Plus className="h-4 w-4 mr-2" /> Post Your First Internship
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Position</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Applications</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {myInternships.slice(0, 5).map((internship) => (
                    <tr key={internship._id || internship.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{internship.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{internship.location} • {internship.workMode}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${internship.status === 'active'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                          {internship.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">
                          {internship.currentApplications || 0} applicants
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        {new Date(internship.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
