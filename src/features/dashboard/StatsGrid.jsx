import React from "react";
import { Users, Clock, TrendingUp, CheckCircle } from "lucide-react";

const StatsGrid = ({ stats = {} }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-between mb-4">
          <Users className="text-orange-500" size={24} />
          <span className="text-xs font-mono text-zinc-600 uppercase">
            Total
          </span>
        </div>
        <p className="text-3xl font-bold">{stats.totalStudents}</p>
        <p className="text-xs text-zinc-500 mt-1">Students enrolled</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-between mb-4">
          <Clock className="text-blue-500" size={24} />
          <span className="text-xs font-mono text-zinc-600 uppercase">
            Active
          </span>
        </div>
        <p className="text-3xl font-bold">
          {String(stats.totalCourses).padStart(2, "0")}
        </p>
        <p className="text-xs text-zinc-500 mt-1">Courses this term</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="text-emerald-500" size={24} />
          <span className="text-xs font-mono text-zinc-600 uppercase">
            Rate
          </span>
        </div>
        <p className="text-3xl font-bold">{stats.overallRate}%</p>
        <p className="text-xs text-zinc-500 mt-1">Avg attendance</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-between mb-4">
          <CheckCircle className="text-purple-500" size={24} />
          <span className="text-xs font-mono text-zinc-600 uppercase">
            Sessions
          </span>
        </div>
        <p className="text-3xl font-bold">{stats.totalSessions}</p>
        <p className="text-xs text-zinc-500 mt-1">Total this term</p>
      </div>
    </div>
  );
};

export default StatsGrid;
