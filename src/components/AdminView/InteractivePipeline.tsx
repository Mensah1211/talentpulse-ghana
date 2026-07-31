import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Award,
  XCircle
} from 'lucide-react';
import { Application } from '../../types';

interface InteractivePipelineProps {
  applications: Application[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export const InteractivePipeline: React.FC<InteractivePipelineProps> = ({ 
  applications, 
  selectedStatus, 
  onSelectStatus 
}) => {
  const underReviewCount = applications.filter(a => a.status === 'Under Review').length;
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
  const interviewScheduledCount = applications.filter(a => a.status === 'Interview Scheduled').length;
  const hiredCount = applications.filter(a => a.status === 'Hired').length;
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length;
  const total = applications.length || 1;

  const stages = [
    {
      id: 'Under Review',
      title: 'Under Review',
      count: underReviewCount,
      icon: Clock,
      color: 'amber',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-600',
      progressColor: 'bg-amber-500',
      textColor: 'text-amber-900',
    },
    {
      id: 'Shortlisted',
      title: 'Shortlisted',
      count: shortlistedCount,
      icon: CheckCircle2,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      iconColor: 'text-indigo-600',
      progressColor: 'bg-indigo-500',
      textColor: 'text-indigo-900',
    },
    {
      id: 'Interview Scheduled',
      title: 'Interviews',
      count: interviewScheduledCount,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      progressColor: 'bg-blue-500',
      textColor: 'text-blue-900',
    },
    {
      id: 'Hired',
      title: 'Hired',
      count: hiredCount,
      icon: Award,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-600',
      progressColor: 'bg-emerald-500',
      textColor: 'text-emerald-900',
    },
    {
      id: 'Rejected',
      title: 'Not Selected',
      count: rejectedCount,
      icon: XCircle,
      color: 'rose',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      iconColor: 'text-rose-600',
      progressColor: 'bg-rose-500',
      textColor: 'text-rose-900',
    }
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-6 flex flex-col relative">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Interactive Recruitment Pipeline Filter</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click any stage to filter the candidates below.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-slate-950 text-indigo-400 font-bold text-xs rounded-lg border border-slate-800 shrink-0">
          Total Candidates: {applications.length}
        </div>
      </div>

      {/* Funnel Layout */}
      <div className="p-5">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const percentage = Math.round((stage.count / total) * 100);
            const isActive = selectedStatus === stage.id;

            return (
              <motion.button
                key={stage.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectStatus(isActive ? 'all' : stage.id)}
                className={`p-4 rounded-xl border-2 transition-all relative overflow-hidden text-left group ${
                  isActive 
                    ? `bg-slate-800 border-${stage.color}-500 shadow-md ring-2 ring-${stage.color}-500/20` 
                    : `bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-md`
                }`}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-${stage.color}-500 animate-pulse`} />
                )}

                <div className="flex items-center justify-between font-bold text-xs mb-3 relative z-10">
                  <span className={isActive ? `text-${stage.color}-400` : 'text-slate-400'}>{idx + 1}. {stage.title}</span>
                  <div className={`p-1 rounded-md ${isActive ? `bg-${stage.color}-500/20` : 'bg-slate-800'} ${isActive ? `text-${stage.color}-400` : 'text-slate-500'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className={`text-3xl font-black mb-3 relative z-10 ${isActive ? 'text-white' : 'text-slate-200'}`}>
                  {stage.count}
                </div>

                <div className="space-y-1.5 relative z-10">
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${stage.progressColor}`}
                      initial={{ width: '0%' }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                    />
                  </div>
                  <div className={`text-[9px] font-bold text-right ${isActive ? `text-${stage.color}-400` : 'text-slate-500'}`}>
                    {percentage}% of Pipeline
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
