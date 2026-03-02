/**
 * @fileoverview Refactored Student Dashboard Component
 * This is a clean orchestration component using the repository pattern
 * Reduced from 307 lines to ~100 lines
 * 
 * Architecture:
 * - useStudentDashboard hook handles all data fetching AND real-time subscriptions
 * - Sub-components handle rendering specific UI sections
 * - Single responsibility: coordinate child components
 */

import React from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useStudentDashboard } from '../../hooks/useDashboardRepository';
import { LayoutDashboard } from 'lucide-react';
import AttendanceVerification from '../attendance/AttendanceVerification';
import RecentCheckIns from './RecentCheckIns';

/**
 * @returns {React.ReactElement}
 */
export default function StudentDashboard() {
  const { user } = useAuthContext();
  
  // Hook handles data fetching AND real-time subscriptions
  const { attendance, loading, error, refresh } = useStudentDashboard(user?.id);

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
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="mb-1 flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
              <LayoutDashboard size={24} className="text-orange-600" />
              <span>My Terminal</span>
          </h4>
          <p className="text-zinc-500 font-mono text-sm">
            Track your attendance and manage your courses
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {/* Attendance Portal Section */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4 text-white">Mark Attendance</h2>
        <AttendanceVerification />
      </div>

      <RecentCheckIns attendance={attendance} loading={loading} />

      {/* Bottom Information Section */}
      <div className="bg-linear-to-r from-orange-900/20 to-orange-900/10 border border-orange-800/30 p-4 sm:p-6 rounded-2xl">
        <h3 className="font-semibold text-white mb-2">📌 Important Notes</h3>
        <ul className="text-sm text-orange-200 space-y-2">
          <li>✓ Real-time sync enabled - changes appear instantly</li>
          <li>✓ Attendance is recorded using geolocation</li>
          <li>✓ You must be within the specified radius to check in</li>
          <li>✓ Your data syncs automatically across all devices</li>
        </ul>
      </div>
    </div>
  );
}
