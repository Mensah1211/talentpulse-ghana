import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Briefcase, 
  Users, 
  FileText, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Calendar,
  XCircle,
  Clock,
  Building2,
  Printer,
  Download
} from 'lucide-react';
import { AnalyticsSummary } from '../../types';

interface AnalyticsProps {
  analytics: AnalyticsSummary | null;
  onRefresh: () => void;
}

export const AdminAnalytics: React.FC<AnalyticsProps> = ({ analytics, onRefresh }) => {
  if (!analytics) {
    return (
      <div className="text-center py-20 text-slate-400">
        Loading analytics dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 print-container">
      
      {/* Dynamic PDF Print CSS injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide non-printable items */
          header, nav, aside, footer, button, .no-print, [role="dialog"], .chat-trigger, #chat-trigger, .fixed {
            display: none !important;
          }
          body, main, .print-container {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .print-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          /* Grid adjustments for printable template */
          .grid {
            display: grid !important;
          }
          .grid-cols-4 {
            grid-template-cols: repeat(4, minmax(0, 1fr)) !important;
          }
          .grid-cols-2 {
            grid-template-cols: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}} />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-8 rounded-3xl shadow-lg shadow-blue-500/10 border border-blue-500/20 relative overflow-hidden print-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold flex items-center space-x-2.5 text-white">
            <BarChart3 className="w-7 h-7 text-blue-200" />
            <span>HR Recruitment Analytics Dashboard</span>
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Real-time metric breakdown across job openings, candidate pipeline, shortlisting rate, and hires.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 z-10 no-print">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Export Report (PDF)</span>
          </button>

          <button
            onClick={onRefresh}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 shadow-md transition-all cursor-pointer"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          whileHover={{ y: -3 }}
          className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Job Postings</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{analytics.totalJobs}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{analytics.activeJobs} active / published open roles</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          whileHover={{ y: -3 }}
          className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Applications</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{analytics.totalApplications}</div>
          <div className="text-[11px] text-slate-500 font-medium">
            Received across all departments
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          whileHover={{ y: -3 }}
          className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Shortlisting Rate</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{analytics.shortlistRate}%</div>
          <div className="text-[11px] text-purple-700 font-semibold">
            Candidates advancing past review
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          whileHover={{ y: -3 }}
          className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Successful Hires</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{analytics.hiredCount}</div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            Offers accepted & candidates hired
          </div>
        </motion.div>

      </div>

      {/* Recruitment Pipeline Funnel Breakdown */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Recruitment Lifecycle Pipeline Funnel</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Live conversion volume across recruitment stages</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200/80">
            Total Pipeline Volume: {analytics.totalApplications} Candidates
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-700 text-xs font-bold">
              <span>1. Under Review</span>
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            </div>
            <div className="text-3xl font-black text-slate-900">{analytics.underReviewCount}</div>
            <div className="space-y-1">
              <div className="w-full bg-amber-200/80 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-amber-500 h-full rounded-full" 
                  initial={{ width: '0%' }}
                  animate={{ width: `${analytics.totalApplications > 0 ? (analytics.underReviewCount / analytics.totalApplications) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div className="text-[10px] text-amber-800 font-semibold text-right">
                {analytics.totalApplications > 0 ? Math.round((analytics.underReviewCount / analytics.totalApplications) * 100) : 0}% of applicants
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-700 text-xs font-bold">
              <span>2. Shortlisted</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{analytics.shortlistedCount}</div>
            <div className="space-y-1">
              <div className="w-full bg-indigo-200/80 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-indigo-600 h-full rounded-full" 
                  initial={{ width: '0%' }}
                  animate={{ width: `${analytics.totalApplications > 0 ? (analytics.shortlistedCount / analytics.totalApplications) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                />
              </div>
              <div className="text-[10px] text-indigo-800 font-semibold text-right">
                {analytics.totalApplications > 0 ? Math.round((analytics.shortlistedCount / analytics.totalApplications) * 100) : 0}% of applicants
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70 space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-700 text-xs font-bold">
              <span>3. Interviews</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{analytics.interviewScheduledCount}</div>
            <div className="space-y-1">
              <div className="w-full bg-blue-200/80 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-blue-600 h-full rounded-full" 
                  initial={{ width: '0%' }}
                  animate={{ width: `${analytics.totalApplications > 0 ? (analytics.interviewScheduledCount / analytics.totalApplications) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <div className="text-[10px] text-blue-800 font-semibold text-right">
                {analytics.totalApplications > 0 ? Math.round((analytics.interviewScheduledCount / analytics.totalApplications) * 100) : 0}% of applicants
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-700 text-xs font-bold">
              <span>4. Hired</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{analytics.hiredCount}</div>
            <div className="space-y-1">
              <div className="w-full bg-emerald-200/80 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-emerald-600 h-full rounded-full" 
                  initial={{ width: '0%' }}
                  animate={{ width: `${analytics.totalApplications > 0 ? (analytics.hiredCount / analytics.totalApplications) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                />
              </div>
              <div className="text-[10px] text-emerald-800 font-semibold text-right">
                {analytics.totalApplications > 0 ? Math.round((analytics.hiredCount / analytics.totalApplications) * 100) : 0}% success rate
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70 space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-700 text-xs font-bold">
              <span>5. Not Selected</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{analytics.rejectedCount}</div>
            <div className="space-y-1">
              <div className="w-full bg-rose-200/80 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-rose-500 h-full rounded-full" 
                  initial={{ width: '0%' }}
                  animate={{ width: `${analytics.totalApplications > 0 ? (analytics.rejectedCount / analytics.totalApplications) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                />
              </div>
              <div className="text-[10px] text-rose-800 font-semibold text-right">
                {analytics.totalApplications > 0 ? Math.round((analytics.rejectedCount / analytics.totalApplications) * 100) : 0}% non-selected
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Department Breakdown & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Distribution */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Jobs by Department</span>
          </h3>

          <div className="space-y-3">
            {analytics.departmentStats.map((dept, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{dept.department}</span>
                  <span className="text-blue-600">{dept.count} open role(s)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full" 
                    style={{ width: `${analytics.totalJobs > 0 ? (dept.count / analytics.totalJobs) * 100 : 20}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Hiring Velocity & SVG Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs print-card">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Monthly Hiring Velocity</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Custom SVG Line/Bar Chart */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Hiring Funnel Trend (Applications vs Hires)</div>
              
              <svg viewBox="0 0 400 180" className="w-full h-auto overflow-visible">
                {/* Y-Axis Grids */}
                <line x1="40" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="60" x2="380" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="100" x2="380" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="140" x2="380" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />
                
                {/* Monthly lines / bars */}
                {analytics.monthlyHires.map((item, idx) => {
                  const maxApps = Math.max(...analytics.monthlyHires.map(h => h.applications), 1);
                  const maxHires = Math.max(...analytics.monthlyHires.map(h => h.hires), 1);
                  const x = 50 + idx * 75;
                  const yApps = 140 - (item.applications / maxApps) * 100;
                  const yHires = 140 - (item.hires / maxHires) * 100;
                  
                  return (
                    <g key={idx}>
                      {/* Apps bar */}
                      <rect x={x - 12} y={yApps} width="10" height={140 - yApps} fill="#3b82f6" rx="2" className="opacity-80 hover:opacity-100 transition-opacity" />
                      {/* Hires bar */}
                      <rect x={x + 2} y={yHires} width="10" height={140 - yHires} fill="#10b981" rx="2" className="opacity-80 hover:opacity-100 transition-opacity" />
                      
                      {/* Labels */}
                      <text x={x} y="160" textAnchor="middle" className="text-[9px] fill-slate-500 font-bold">{item.month}</text>
                      
                      {/* Tooltip values above bars */}
                      <text x={x - 7} y={yApps - 5} textAnchor="middle" className="text-[8px] fill-blue-650 font-bold">{item.applications}</text>
                      <text x={x + 7} y={yHires - 5} textAnchor="middle" className="text-[8px] fill-emerald-650 font-bold">{item.hires}</text>
                    </g>
                  );
                })}
              </svg>
              
              <div className="flex items-center justify-center space-x-4 text-[10px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded" />
                  <span className="text-slate-600 font-semibold">Applications</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded" />
                  <span className="text-slate-600 font-semibold">Hires</span>
                </span>
              </div>
            </div>

            {/* List details */}
            <div className="space-y-2.5">
              {analytics.monthlyHires.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="font-bold text-slate-900">{item.month} 2026</div>
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-500 font-medium">{item.applications} Apps</span>
                    <span className="text-emerald-700 font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                      {item.hires} Hired
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
