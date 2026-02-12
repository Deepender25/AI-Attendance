import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart } from 'lucide-react';
import { OverallStats } from '../types';
import { GlassCard } from './ui/GlassCard';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface AttendanceStatsProps {
  stats: OverallStats;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = [
    { name: 'Present', value: stats.attendedClasses, color: '#10B981' },
    { name: 'Absent', value: stats.missedClasses, color: '#EF4444' },
    { name: 'Cancelled', value: stats.cancelledClasses, color: '#F97316' }
  ];

  const hasData = stats.totalClasses > 0 || stats.cancelledClasses > 0;

  const getMotivationalMessage = (percentage: number) => {
    if (percentage >= 90) return "Excellent! Keep it up!";
    if (percentage >= 75) return "Good job, you're on track.";
    if (percentage >= 60) return "Attendance is slipping.";
    return "You need to attend more classes.";
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Mobile: Horizontal stat strip */}
      <div className="flex md:hidden gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <GlassCard className="flex-none w-28 bg-surface border-border p-3 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-text"
          >
            {hasData ? Math.round(stats.percentage) : 0}
          </motion.span>
          <span className="text-lg text-zinc-500">%</span>
          <span className="text-[10px] text-zinc-500 font-semibold mt-1">ATTENDANCE</span>
        </GlassCard>
        {data.map((item) => (
          <GlassCard key={item.name} className="flex-none w-24 bg-surface border-border p-3 flex flex-col items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: item.color }} />
            <span className="text-xl font-bold text-text">{item.value}</span>
            <span className="text-[10px] text-zinc-500 font-semibold mt-0.5">{item.name.toUpperCase()}</span>
          </GlassCard>
        ))}
      </div>

      {/* Desktop: Full percentage card */}
      <GlassCard className="hidden md:flex relative overflow-hidden flex-none md:flex-1 flex-col justify-center bg-surface border-border min-h-[140px]">
        <h3 className="text-zinc-500 font-medium uppercase tracking-wide text-xs mb-2 text-center">Overall Attendance</h3>

        <div className="flex items-baseline justify-center">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="text-5xl lg:text-6xl font-bold text-text"
          >
            {hasData ? Math.round(stats.percentage) : 0}
          </motion.span>
          <span className="text-2xl text-zinc-500 ml-1">%</span>
        </div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`mt-4 text-xs font-medium px-4 py-1.5 rounded-full text-center max-w-xs mx-auto border ${stats.percentage >= 75
            ? 'bg-transparent text-text border-border'
            : 'bg-transparent text-zinc-400 border-border'
            }`}>
          {hasData ? getMotivationalMessage(stats.percentage) : "No data yet"}
        </motion.p>
      </GlassCard>

      {/* Desktop: Chart Card */}
      <GlassCard className="hidden md:flex flex-1 flex-col bg-surface border-border min-h-[280px]">
        <h3 className="text-zinc-500 font-medium uppercase tracking-wide text-xs mb-4 text-center">Attendance Breakdown</h3>
        <div className="flex-1 w-full min-h-0">
          {hasData ? (
            <div className="flex flex-col md:flex-row items-center h-full gap-6 px-2">
              {/* Donut Chart */}
              <div className="w-full md:w-1/2 h-[180px] relative">
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
                      cornerRadius={6}
                      stroke="none"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                        borderRadius: '12px',
                        border: isDark ? '1px solid #27272A' : '1px solid #E4E4E7',
                        color: isDark ? '#fff' : '#000',
                        fontSize: '12px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ color: isDark ? '#fff' : '#000' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Stats */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-text">{stats.totalClasses}</span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Total</span>
                </div>
              </div>

              {/* Custom Legend */}
              <div className="w-full md:w-1/2 flex flex-col gap-3 pb-4 md:pb-0">
                {data.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (index * 0.1) }}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-text text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-text">{item.value}</span>
                      <span className="text-xs text-zinc-400 font-medium">
                        ({stats.totalClasses > 0 ? Math.round((item.value / stats.totalClasses) * 100) : 0}%)
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm">
              <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 mb-3 flex items-center justify-center">
                <BarChart className="w-6 h-6 opacity-20" />
              </div>
              <p className="text-xs font-medium opacity-70">Mark attendance to see stats</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};