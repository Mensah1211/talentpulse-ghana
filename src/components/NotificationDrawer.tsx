import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCheck, X, Calendar, Award, Info, AlertTriangle } from 'lucide-react';
import { Notification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl relative z-10"
          >
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Notifications & Alerts</h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
                  title="Mark all read"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark all read</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No notifications yet.
                </div>
              ) : (
                notifications.map(n => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => !n.read_status && onMarkRead(n.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1 ${
                      n.read_status
                        ? 'bg-slate-900/50 border-slate-800 text-slate-400'
                        : 'bg-indigo-950/40 border-indigo-500/40 text-slate-200 shadow-md shadow-indigo-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {n.type === 'interview' && <Calendar className="w-4 h-4 text-amber-400 shrink-0" />}
                        {n.type === 'success' && <Award className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                        {n.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
                        <span className="font-bold text-xs text-white">{n.title}</span>
                      </div>

                      <span className="text-[10px] text-slate-500">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed">{n.message}</p>
                  </motion.div>
                ))
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
