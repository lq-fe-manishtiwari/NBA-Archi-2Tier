import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  BookOpen,
  Bell,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { authenticationService } from '@/_services/api';
import { useUserProfile } from '../../contexts/UserProfileContext';
import Logo from '@/_assets/New_images/Login/LQ_LOGO_NEW.png';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profileData,userRole,loading, error, fetchProfile, fullName, designation, userType } = useUserProfile();

  useEffect(() => {
    const currentUser = authenticationService.currentUser();
    setUser(currentUser);
    
    // Fetch profile data using context only once on mount
    fetchProfile();
    console.log("userRole",userRole)
  }, []); // Empty dependency array to run only once on mount

  const handleLogout = () => {
    authenticationService.logout();
  };

  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Courses Active', value: '45', icon: BookOpen, color: 'from-green-500 to-green-600' },
    { title: 'Classes Today', value: '8', icon: Calendar, color: 'from-purple-500 to-purple-600' },
    { title: 'Notifications', value: '3', icon: Bell, color: 'from-orange-500 to-orange-600' },
  ];

  const classes = [
    { time: '09:00 AM', subject: 'Mathematics', students: 32, color: 'blue' },
    { time: '11:00 AM', subject: 'Science', students: 28, color: 'green' },
    { time: '02:00 PM', subject: 'English', students: 35, color: 'purple' },
  ];

  const announcements = [
    'New course "Advanced Physics" added!',
    'Parent-Teacher meeting on Friday',
    'System maintenance scheduled for Sunday',
  ];

  const quickLinks = [
    { name: 'Academics', icon: BookOpen, path: '/academics', color: 'blue' },
    { name: 'Student List', icon: Users, path: '/students', color: 'green' },
    { name: 'Reports', icon: BarChart3, path: '/reports', color: 'purple' },
    { name: 'Settings', icon: Settings, path: '/settings', color: 'gray' },
  ];

  return (
    <div className="min-h-screen to-indigo-100">


      {/* ==================== MAIN CONTENT ==================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* ---------- Welcome Card ---------- */}
        <section className="bg-white bg-primary-600 rounded-2xl shadow-lg p-6 border border-gray-200" style={{backgroundColor:"#2162C1"}}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-50 text-gray-900">
                Welcome Back, {fullName || user?.sub || 'Admin'}!
              </h2>
              <p className="text-gray-600 mt-1 text-primary-50">
                Here’s what’s happening with your classes today.
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-primary-50 sm:w-16 sm:h-16 text-blue-600" />
          </div>
        </section>

        {/* ---------- Stats Grid (2 on mobile, 4 on lg) ---------- */}
        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{stat.title}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ---------- Main Grid (Classes + Announcements) ---------- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Classes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Upcoming Classes
              </h3>
              <div className="space-y-3">
                {classes.map((cls, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <div
                        className={`w-10 h-10 rounded-full bg-${cls.color}-100 flex items-center justify-center flex-shrink-0`}
                      >
                        <Calendar className={`w-5 h-5 text-${cls.color}-600`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cls.subject}</p>
                        <p className="text-xs text-gray-600">{cls.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-3">
                      <span className="text-xs text-gray-600">{cls.students} students</span>
                      <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                        Start Class
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-orange-600" />
                Notification's
              </h3>
              <div className="space-y-3">
                {announcements.map((ann, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 p-2.5 bg-orange-50 rounded-lg border-l-4 border-orange-500"
                  >
                    <Bell className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-800">{ann}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
                View All
              </button>
            </div>
          </div>
        </section>

        {/* ---------- Quick Links ---------- */}
        <section className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Quick Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <a
                  key={idx}
                  href={link.path}
                  className={`flex items-center space-x-3 p-3 bg-gradient-to-r from-${link.color}-50 to-${link.color}-100 rounded-xl hover:shadow-md transition-all duration-200 border border-${link.color}-200`}
                >
                  <div className={`p-2.5 rounded-lg bg-${link.color}-100`}>
                    <Icon className={`w-5 h-5 text-${link.color}-600`} />
                  </div>
                  <span className="font-medium text-gray-900">{link.name}</span>
                </a>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;