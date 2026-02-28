/**
 * @fileoverview Refactored Lecturer Dashboard Component
 * This is a clean orchestration component using the repository pattern
 * Reduced from 710 lines to ~120 lines
 * 
 * Architecture:
 * - useLecturerDashboard hook handles all data fetching AND real-time subscriptions
 * - Sub-components handle rendering specific UI sections
 * - Single responsibility: coordinate child components
 */

import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLecturerDashboard } from '../../hooks/useDashboardRepository';
import { LecturerStatsGrid, RecentSessionsList, SessionPerformanceCard } from '../../components/dashboard/LecturerDashboardComponents';
import ErrorBoundary from '../../components/ErrorBoundary';
import repos from '../../services/repositories/index.js';
import CourseRoomsList from './CourseRoomsList';
import useRealtimeClasses from '../../hooks/useRealtimeClasses';
import SessionCreator from '../sessions/SessionCreator';
import AttendanceList from '../attendance/AttendanceList';

// Debug helper: log imported components to catch any undefined imports causing render errors
/* istanbul ignore next */
try {
  // eslint-disable-next-line no-console
  console.log('DBG Imported dashboard components', {
    LecturerStatsGrid,
    RecentSessionsList,
    SessionPerformanceCard,
    CourseRoomsList,
    SessionCreator,
    AttendanceList,
  });
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('DBG dashboard import check failed', e);
}

/**
 * @returns {React.ReactElement}
 */
export default function LecturerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [autoSelectedCourseId, setAutoSelectedCourseId] = useState(
    location.state?.newestCourseId || location.state?.newCourseId || null
  );

  // Fetch all dashboard data using repository pattern (hook handles real-time subscriptions)
  const { stats, recentSessions, sessionPerformance, loading, error, refresh } = useLecturerDashboard(
    user?.id
  );

  // Clear auto-selection after processing
  useEffect(() => {
    if (autoSelectedCourseId && location.state) {
      // Clear the navigation state
      window.history.replaceState({}, document.title, window.location.pathname);
      setAutoSelectedCourseId(null);
    }
  }, [autoSelectedCourseId, location.state]);

  // Use useRealtimeClasses hook which will subscribe or fallback to polling on error
  const { courses, loading: coursesLoading, subscriptionFailed } = useRealtimeClasses(user?.id);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-zinc-400">Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 p-6 rounded-lg">
        <h3 className="text-red-400 font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-red-300 text-sm mb-4">{error.message}</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="space-y-6 md:space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {/* <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            Welcome back, {user.email?.split('@')[0]}
          </h1> */}
          <p className="text-zinc-500 text-sm">
            Here's your attendance management overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Realtime / Polling status */}
          {!user?.id ? null : (
            subscriptionFailed ? (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-amber-400">🟡</span>
                <span>Synced (Polling)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-emerald-400">🟢</span>
                <span>Live</span>
              </div>
            )
          )}

          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <LecturerStatsGrid stats={stats} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-zinc-800">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sessions', label: 'Create Session' },
              { id: 'attendance', label: 'Attendance' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <SessionPerformanceCard performance={sessionPerformance} loading={loading} />
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <h3 className="font-mono text-xs uppercase tracking-widest mb-4">
                    📋 Recent Sessions
                  </h3>
                  <RecentSessionsList sessions={recentSessions} loading={loading} />
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <SessionCreator autoSelectedCourseId={autoSelectedCourseId} />
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                <AttendanceList />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-blue-500">ℹ️</span>
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-400 uppercase font-semibold mb-1">Active Sessions</p>
                <p className="text-2xl font-bold text-orange-500">
                  {recentSessions.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 uppercase font-semibold mb-1">Average Attendance</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {stats?.overallRate || 0}%
                </p>
              </div>
              <hr className="border-zinc-700 my-4" />
              <p className="text-xs text-zinc-500">
                💡 Tip: Create sessions and track attendance in real-time. Use the attendance tab to
                manage student check-ins.
              </p>
            </div>
            {/* Course rooms (only show occupied rooms) */}
            <div className="mt-6">
              <CourseRoomsList courses={courses} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
