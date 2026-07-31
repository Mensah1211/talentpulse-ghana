import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  Search, 
  X,
  Lock,
  UserCheck,
  CheckSquare,
  Square,
  Sparkles,
  Download,
  Mail,
  UserX
} from 'lucide-react';
import { User, AdminPermission, AdminProfile } from '../../types';
import { api } from '../../lib/api';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  adminProfile?: AdminProfile | null;
  onUpdateStatus: (id: string, status: 'active' | 'deactivated') => Promise<void>;
  onAssignRole?: (id: string, role: 'applicant' | 'admin', permission_level?: string, department?: string) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onCreateAdminStaff: (data: any) => Promise<void>;
  onRefresh?: () => Promise<void>;
  isLoading: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  adminProfile,
  onUpdateStatus,
  onAssignRole,
  onDeleteUser,
  onCreateAdminStaff,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  
  // Create Staff Modal
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('password123');
  const [staffPhone, setStaffPhone] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<AdminPermission>('hr_staff');
  const [department, setDepartment] = useState('Human Resources');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Bulk state & email broadcast modal state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('Important Account Notice');
  const [notifyMsg, setNotifyMsg] = useState('');

  const myPermission: AdminPermission = adminProfile?.permission_level || currentUser.adminProfile?.permission_level || 'hr_staff';
  const isSuperAdmin = myPermission === 'super_admin' || currentUser?.email === 'mensahsamuel3803@gmail.com';

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleSelectAll = () => {
    // Only allow selecting users that the current admin can manage (canDeactivate logic)
    const manageableUsers = filteredUsers.filter(u => {
      if (u.id === currentUser.id) return false;
      const targetAdminPerm = u.role === 'admin' ? (u.adminProfile?.permission_level || 'hr_staff') : null;
      const isTargetSuperAdmin = targetAdminPerm === 'super_admin' || u.email === 'mensahsamuel3803@gmail.com';
      if (myPermission === 'hr_staff' && !isSuperAdmin) {
        return u.role === 'applicant';
      }
      if (isSuperAdmin) {
        if (u.role === 'applicant') return true;
        if (u.role === 'admin') return !isTargetSuperAdmin;
      }
      return false;
    });

    if (selectedUserIds.length === manageableUsers.length && manageableUsers.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(manageableUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter(i => i !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleBulkStatusChange = async (targetStatus: 'active' | 'deactivated') => {
    if (selectedUserIds.length === 0) return;
    if (!confirm(`Are you sure you want to set account status to "${targetStatus}" for ${selectedUserIds.length} user(s)?`)) return;

    setBulkLoading(true);
    try {
      await api.bulkUpdateUserStatus(selectedUserIds, targetStatus);
      if (onRefresh) {
        await onRefresh();
      } else {
        for (const id of selectedUserIds) {
          if (id !== currentUser.id) {
            await onUpdateStatus(id, targetStatus);
          }
        }
      }
      setSelectedUserIds([]);
      setMsg(`Successfully set status to ${targetStatus} for selected accounts.`);
      setTimeout(() => setMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed bulk status update');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    if (!confirm(`Are you sure you want to PERMANENTLY delete ${selectedUserIds.length} user account(s)?`)) return;

    setBulkLoading(true);
    try {
      await api.bulkDeleteUsers(selectedUserIds);
      if (onRefresh) {
        await onRefresh();
      } else {
        for (const id of selectedUserIds) {
          if (id !== currentUser.id) {
            await onDeleteUser(id);
          }
        }
      }
      setSelectedUserIds([]);
      setMsg(`Successfully deleted ${selectedUserIds.length} user account(s).`);
      setTimeout(() => setMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed bulk user deletion');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkSendNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0 || !notifyTitle || !notifyMsg) return;

    setBulkLoading(true);
    try {
      await api.bulkSendNotifications(selectedUserIds, notifyTitle, notifyMsg);
      setShowNotifyModal(false);
      setNotifyTitle('Important Account Notice');
      setNotifyMsg('');
      setSelectedUserIds([]);
      setMsg(`Broadcast notification & email sent to ${selectedUserIds.length} user(s).`);
      setTimeout(() => setMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to send bulk notifications');
    } finally {
      setBulkLoading(false);
    }
  };

  const exportSelectedUsersCSV = () => {
    const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
    if (selectedUsers.length === 0) return;

    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Created At'];
    const rows = selectedUsers.map(u => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.phone || ''}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"${new Date(u.created_at).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TalentPulse_Selected_Users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onCreateAdminStaff({
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        phone: staffPhone,
        permission_level: permissionLevel,
        department,
      });

      setMsg('New HR Staff account created successfully!');
      setShowStaffModal(false);
      setStaffName('');
      setStaffEmail('');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to create staff account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Users className="w-6 h-6 text-indigo-400" />
              <span>User Accounts & HR Staff Management</span>
            </h1>
            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
              isSuperAdmin 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            }`}>
              {isSuperAdmin ? 'Logged as Super HR' : 'Logged as HR Staff'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isSuperAdmin 
              ? 'Super HR Privilege: Responsible for deactivating HR Staff and job applicant accounts.'
              : 'HR Staff Privilege: Responsible for deactivating job applicant accounts only.'}
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setShowStaffModal(true)}
            className="px-5 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision New HR Staff</span>
          </button>
        )}
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter & Bulk Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="applicant">Applicants (Job Seekers)</option>
            <option value="admin">HR Admins & Staff</option>
          </select>
        </div>

        {/* BULK USER ACTION BAR */}
        {selectedUserIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-indigo-950/80 border border-indigo-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-200 shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-white text-sm">{selectedUserIds.length} user account(s) selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={bulkLoading}
                onClick={() => handleBulkStatusChange('active')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Bulk Activate</span>
              </button>

              <button
                disabled={bulkLoading}
                onClick={() => handleBulkStatusChange('deactivated')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-all"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Bulk Deactivate</span>
              </button>

              <button
                disabled={bulkLoading}
                onClick={() => setShowNotifyModal(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Bulk Broadcast Email</span>
              </button>

              <button
                disabled={bulkLoading}
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bulk Delete</span>
              </button>

              <button
                onClick={exportSelectedUsersCSV}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg font-bold flex items-center space-x-1 border border-slate-700 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setSelectedUserIds([])}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                title="Deselect All"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-500 hover:text-white cursor-pointer">
                    {selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.filter(u => u.id !== currentUser.id && (true ? (u.role === 'applicant' || (u.role === 'admin' && (u.adminProfile?.permission_level || 'hr_staff') === 'hr_staff')) : u.role === 'applicant')).length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role & Level</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Access Controls</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No user accounts match your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const targetAdminPerm = u.role === 'admin' ? (u.adminProfile?.permission_level || 'hr_staff') : null;
                  const isSelf = u.id === currentUser.id;
                  const isSelected = selectedUserIds.includes(u.id);
                  
                  // Responsibilities check:
                  // HR staff: deactivating job applicant ONLY
                  // Super HR: deactivating HR staff and job applicant ONLY
                  const canDeactivate = (() => {
                    if (isSelf) return false;
                    if (myPermission === 'hr_staff') {
                      return u.role === 'applicant';
                    }
                    if (true) {
                      if (u.role === 'applicant') return true;
                      if (u.role === 'admin') return targetAdminPerm === 'hr_staff';
                    }
                    return false;
                  })();

                  return (
                    <tr key={u.id} className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-indigo-950/40' : ''}`}>
                      <td className="px-4 py-4">
                        {canDeactivate && (
                          <button onClick={() => toggleSelectUser(u.id)} className="text-slate-500 hover:text-indigo-400 cursor-pointer">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-white text-sm flex items-center space-x-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">You</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.email} • {u.phone || 'No phone'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {isSuperAdmin && !isSelf ? (
                          <div className="flex items-center space-x-1.5">
                            <select
                              value={u.role === 'admin' ? (targetAdminPerm === 'super_admin' ? 'super_admin' : 'hr_staff') : 'applicant'}
                              disabled={updatingRoleId === u.id}
                              onChange={async (e) => {
                                const val = e.target.value;
                                const newRole = val === 'applicant' ? 'applicant' : 'admin';
                                const newPerm = val === 'super_admin' ? 'super_admin' : 'hr_staff';
                                try {
                                  setUpdatingRoleId(u.id);
                                  if (onAssignRole) {
                                    await onAssignRole(u.id, newRole, newPerm);
                                    setMsg(`Assigned role of ${u.name} successfully.`);
                                    setTimeout(() => setMsg(''), 4000);
                                  }
                                } catch (err: any) {
                                  alert(err.message || 'Failed to update role');
                                } finally {
                                  setUpdatingRoleId(null);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg bg-slate-950 border font-bold text-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm disabled:opacity-50 ${u.role === 'admin' && targetAdminPerm === 'super_admin' ? 'border-purple-500/50 text-purple-300' : u.role === 'admin' ? 'border-indigo-500/50 text-indigo-300' : 'border-slate-700 text-white'}`}
                            >
                              <option value="applicant">Job Applicant</option>
                              <option value="hr_staff">HR Staff</option>
                              <option value="super_admin">Super Admin HR</option>
                            </select>
                          </div>
                        ) : u.role === 'admin' && (targetAdminPerm === 'super_admin' || u.email === 'mensahsamuel3803@gmail.com') ? (
                          <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-[10px] inline-flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                            <span>Super HR Admin</span>
                          </span>
                        ) : u.role === 'admin' ? (
                          <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 text-[10px] inline-flex items-center space-x-1">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                            <span>HR Staff</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 font-semibold border border-blue-500/20 text-[10px]">
                            Job Applicant
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {u.status === 'active' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[10px]">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold text-[10px]">
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        {isSelf ? (
                          <span className="text-[11px] text-slate-500 italic">Current User</span>
                        ) : canDeactivate ? (
                          <>
                            <button
                              onClick={() => onUpdateStatus(u.id, u.status === 'active' ? 'deactivated' : 'active')}
                              className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] border transition-colors cursor-pointer ${
                                u.status === 'active'
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {u.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>

                            {u.role === 'applicant' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete applicant "${u.name}"?`)) {
                                    onDeleteUser(u.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                title="Delete Account"
                              >
                                <Trash2 className="w-4 h-4 text-rose-400" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span 
                            className="inline-flex items-center space-x-1 text-[11px] text-slate-500 font-medium px-2 py-1 bg-slate-800/50 rounded-md border border-slate-700/50"
                            title={myPermission === 'hr_staff' ? 'HR Staff can deactivate job applicants only' : 'Super HR cannot deactivate another Super HR'}
                          >
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>
                              {myPermission === 'hr_staff' ? 'Applicants Only' : 'Protected'}
                            </span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROVISION STAFF MODAL */}
      <AnimatePresence>
        {showStaffModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs cursor-pointer"
              onClick={() => setShowStaffModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative z-10"
            >
            <button
              onClick={() => setShowStaffModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              <span>Provision HR Recruiter Account</span>
            </h3>

            <form onSubmit={handleCreateStaffSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex.m@company.hr"
                  value={staffEmail}
                  onChange={e => setStaffEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={staffPassword}
                    onChange={e => setStaffPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={staffPhone}
                    onChange={e => setStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role Level</label>
                  <select
                    value={permissionLevel}
                    onChange={e => setPermissionLevel(e.target.value as AdminPermission)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold"
                  >
                    <option value="hr_staff">HR Staff Recruiter</option>
                    <option value="super_admin">Super Admin HR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* BULK NOTIFICATION / EMAIL BROADCAST MODAL */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-white space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center space-x-2 text-indigo-400">
                <Mail className="w-5 h-5" />
                <span>Broadcast Email & Notification ({selectedUserIds.length} Recipient(s))</span>
              </h3>
              <button
                onClick={() => setShowNotifyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSendNotifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Header</label>
                <input
                  type="text"
                  required
                  value={notifyTitle}
                  onChange={e => setNotifyTitle(e.target.value)}
                  placeholder="e.g. Account Maintenance Notice"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Body</label>
                <textarea
                  required
                  rows={4}
                  value={notifyMsg}
                  onChange={e => setNotifyMsg(e.target.value)}
                  placeholder="Write message to broadcast to all selected user accounts..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {bulkLoading ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    </div>
  );
};
