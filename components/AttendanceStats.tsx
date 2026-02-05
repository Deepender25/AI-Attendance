import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { OverallStats } from '../types';

interface AttendanceStatsProps {
  stats: OverallStats;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b']; // Green, Red, Amber

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  const data = [
    { name: 'Attended', value: stats.attendedClasses },
    { name: 'Missed', value: stats.missedClasses },
  ];

  // If no data, show a placeholder
  const hasData = stats.totalClasses > 0;
  
  const getMotivationalMessage = (percentage: number) => {
    if (percentage >= 90) return "Excellent! Keep it up! 🌟";
    if (percentage >= 75) return "Good job, you're on track. 👍";
    if (percentage >= 60) return "Warning: Attendance is slipping. ⚠️";
    return "Critical: You need to attend more classes! 🚨";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Percentage Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden min-h-[200px]">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        <h3 className="text-gray-500 font-medium uppercase tracking-wide text-xs mb-2">Overall Attendance</h3>
        <div className="flex items-baseline">
          <span className="text-5xl sm:text-6xl font-bold text-gray-900">
              {hasData ? Math.round(stats.percentage) : 0}
          </span>
          <span className="text-2xl sm:text-3xl text-gray-400 ml-1">%</span>
        </div>
        <p className={`mt-4 text-xs sm:text-sm font-medium px-3 py-1 rounded-full text-center ${
           stats.percentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {hasData ? getMotivationalMessage(stats.percentage) : "No data yet"}
        </p>
      </div>

      {/* Chart Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 h-64">
        <h3 className="text-gray-900 font-semibold mb-2 sm:mb-4 text-center sm:text-left">Attendance Breakdown</h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill={COLORS[0]} /> {/* Attended */}
                <Cell fill={COLORS[1]} /> {/* Missed */}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Mark attendance to see stats
          </div>
        )}
      </div>
    </div>
  );
};