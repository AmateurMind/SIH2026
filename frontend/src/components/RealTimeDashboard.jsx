import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  Users, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Building
} from 'lucide-react';
import axios from 'axios';

const RealTimeDashboard = ({ userRole }) => {
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    recentActivities: [],
    upcomingDeadlines: [],
    pendingApprovals: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [userRole]);

  const fetchDashboardData = async () => {
    try {
      const endpoints = {
        admin: [
          '/analytics/dashboard',
          '/applications',
          '/internships/pending',
          '/notifications/stats'
        ],
        mentor: [
          '/applications/pending/mentor',
          '/applications',
          '/notifications/my-notifications'
        ],
        student: [
          '/applications',
          '/internships?recommended=true',
          '/notifications/my-notifications'
        ],
        recruiter: [
          '/internships/my-postings',
          '/applications',
          '/notifications/my-notifications'
        ]
      };

      const userEndpoints = endpoints[userRole] || endpoints.student;
      const responses = await Promise.all(
        userEndpoints.map(endpoint => axios.get(endpoint).catch(err => ({ data: {} })))
      );

      // Process responses based on user role
      if (userRole === 'admin') {
        setDashboardData({
          overview: responses[0]?.data || {},
          recentActivities: responses[1]?.data?.applications?.slice(0, 5) || [],
          pendingApprovals: responses[2]?.data?.internships || [],
          notifications: responses[3]?.data || {}
        });
      } else if (userRole === 'mentor') {
        setDashboardData({
          pendingApprovals: responses[0]?.data?.applications || [],
          recentActivities: responses[1]?.data?.applications?.slice(0, 5) || [],
          notifications: responses[2]?.data?.notifications || []
        });
      } else if (userRole === 'student') {
        setDashboardData({
          applications: responses[0]?.data?.applications || [],
          recommendedInternships: responses[1]?.data?.internships?.slice(0, 3) || [],
          notifications: responses[2]?.data?.notifications || []
        });
      } else if (userRole === 'recruiter') {
        setDashboardData({
          myInternships: responses[0]?.data?.internships || [],
          applications: responses[1]?.data?.applications || [],
          notifications: responses[2]?.data?.notifications || []
        });
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingDeadlines = () => {
    const deadlines = [];
    const now = new Date();
    
    // For students - upcoming internship deadlines
    if (userRole === 'student' && dashboardData.recommendedInternships) {
      dashboardData.recommendedInternships.forEach(internship => {
        if (internship.applicationDeadline) {
          const deadline = new Date(internship.applicationDeadline);
          const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
          
          if (daysUntil > 0 && daysUntil <= 7 && !internship.hasApplied) {
            deadlines.push({
              type: 'application',
              title: internship.title,
              company: internship.company,
              deadline: deadline,
              daysUntil: daysUntil,
              urgent: daysUntil <= 2
            });
          }
        }
      });
    }

    // For all users - upcoming interviews
    if (dashboardData.applications) {
      dashboardData.applications.forEach(app => {
        if (app.interviewScheduled && app.interviewScheduled.date) {
          const interviewDate = new Date(app.interviewScheduled.date);
          const daysUntil = Math.ceil((interviewDate - now) / (1000 * 60 * 60 * 24));
          
          if (daysUntil >= 0 && daysUntil <= 7) {
            deadlines.push({
              type: 'interview',
              title: app.internship?.title || 'Interview',
              company: app.internship?.company || 'Company',
              deadline: interviewDate,
              daysUntil: daysUntil,
              urgent: daysUntil <= 1,
              mode: app.interviewScheduled.mode
            });
          }
        }
      });
    }

    return deadlines.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const renderAdminDashboard = () => (
    <>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="h-6 w-6" />}
          title="Total Students"
          value={dashboardData.overview?.totalStudents || 0}
          color="blue"
          trend="+12%"
        />
        <StatCard
          icon={<Building className="h-6 w-6" />}
          title="Active Internships"
          value={dashboardData.overview?.activeInternships || 0}
          color="green"
          trend="+5%"
        />
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          title="Applications Today"
          value={dashboardData.recentActivities?.length || 0}
          color="purple"
          trend="+18%"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          title="Placement Rate"
          value={`${dashboardData.overview?.placementRate || 0}%`}
          color="orange"
          trend="+3%"
        />
      </div>

      {/* Pending Approvals Alert */}
      {dashboardData.pendingApprovals?.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="font-medium text-yellow-800">
              {dashboardData.pendingApprovals.length} internship(s) pending approval
            </span>
          </div>
        </div>
      )}
    </>
  );

  const renderMentorDashboard = () => (
    <>
      {/* Pending Approvals */}
      {dashboardData.pendingApprovals?.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-medium text-red-800">
                {dashboardData.pendingApprovals.length} application(s) need your approval
              </span>
            </div>
            <button className="text-red-600 hover:text-red-800 font-medium">
              Review Now
            </button>
          </div>
        </div>
      )}
    </>
  );

  const renderStudentDashboard = () => (
    <>
      {/* Application Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          title="Applications"
          value={dashboardData.applications?.length || 0}
          color="blue"
        />
        <StatCard
          icon={<Clock className="h-6 w-6" />}
          title="In Review"
          value={dashboardData.applications?.filter(app => 
            ['pending_mentor_approval', 'under_review'].includes(app.status)
          ).length || 0}
          color="yellow"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6" />}
          title="Approved"
          value={dashboardData.applications?.filter(app => 
            ['approved', 'interview_scheduled', 'offered'].includes(app.status)
          ).length || 0}
          color="green"
        />
      </div>
    </>
  );

  const upcomingDeadlines = getUpcomingDeadlines();

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role-specific dashboard content */}
      {userRole === 'admin' && renderAdminDashboard()}
      {userRole === 'mentor' && renderMentorDashboard()}
      {userRole === 'student' && renderStudentDashboard()}

      {/* Upcoming Deadlines - Common for all roles */}
      {upcomingDeadlines.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-600" />
            Upcoming Deadlines
          </h2>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                deadline.urgent ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-secondary-900">
                      {deadline.title} - {deadline.company}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {deadline.type === 'interview' ? 'Interview' : 'Application Deadline'} • 
                      {deadline.deadline.toLocaleDateString()}
                      {deadline.mode && ` • ${deadline.mode}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    deadline.urgent ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {deadline.daysUntil === 0 ? 'Today' : 
                     deadline.daysUntil === 1 ? 'Tomorrow' : 
                     `${deadline.daysUntil} days`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {dashboardData.recentActivities?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {dashboardData.recentActivities.map((activity, index) => (
              <div key={activity.id || index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">
                    {activity.student?.name || 'Student'} applied for {activity.internship?.title || 'Position'}
                  </p>
                  <p className="text-sm text-secondary-600">
                    {activity.internship?.company} • {new Date(activity.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {formatStatus(activity.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-xs text-secondary-500 text-center">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm text-secondary-600">{title}</p>
          <div className="flex items-center">
            <p className="text-2xl font-bold text-secondary-900">{value}</p>
            {trend && (
              <span className="ml-2 text-xs text-green-600 font-medium">{trend}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const statusColors = {
    'applied': 'bg-blue-100 text-blue-800',
    'pending_mentor_approval': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'interview_scheduled': 'bg-purple-100 text-purple-800',
    'offered': 'bg-emerald-100 text-emerald-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default RealTimeDashboard;