import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/services';
import { User, Role } from '@ecommerce/shared';
import { useToastStore } from '../../store/useToastStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  RefreshCw,
  Mail,
  Calendar,
  Lock,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const { addToast } = useToastStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({
        role: roleFilter || undefined,
        search: search || undefined,
        limit: 50,
      });
      setUsers(res.data);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to load user accounts from database' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleRoleToggle = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      addToast({ type: 'error', message: 'You cannot change your own role.' });
      return;
    }
    const newRole: Role = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Change ${targetUser.name}'s role to ${newRole}?`)) return;

    try {
      setUpdatingId(targetUser.id);
      await adminApi.updateUserRole(targetUser.id, newRole);
      addToast({ type: 'success', message: `${targetUser.name} is now ${newRole}` });
      await loadUsers();
    } catch (err: any) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to update user role' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      addToast({ type: 'error', message: 'You cannot deactivate your own account.' });
      return;
    }
    const newStatus = !targetUser.isActive;
    const actionWord = newStatus ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionWord} account for ${targetUser.name}?`)) return;

    try {
      setUpdatingId(targetUser.id);
      await adminApi.updateUserStatus(targetUser.id, newStatus);
      addToast({
        type: 'success',
        message: `Account for ${targetUser.name} has been ${newStatus ? 'activated' : 'suspended'}`,
      });
      await loadUsers();
    } catch (err: any) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to update account status' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950">User Accounts & Roles</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage authenticated platform users, grant administrative permissions, and toggle access
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 font-medium"
          >
            <option value="">All Account Roles</option>
            <option value="USER">Users Only</option>
            <option value="ADMIN">Admins Only</option>
          </select>
          <button
            onClick={loadUsers}
            title="Refresh database records"
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading users from database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No users found matching query
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  const isBusy = updatingId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {u.name}
                              {isCurrent && (
                                <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Shield className="w-3 h-3" /> {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <UserCheck className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                            <UserX className="w-3 h-3" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            disabled={isCurrent || isBusy}
                            onClick={() => handleRoleToggle(u)}
                            title="Toggle Admin / Customer role"
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition text-[11px] font-medium"
                          >
                            {u.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                          </button>
                          <button
                            disabled={isCurrent || isBusy}
                            onClick={() => handleStatusToggle(u)}
                            title="Toggle account active/suspended status"
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium disabled:opacity-30 disabled:pointer-events-none transition ${
                              u.isActive
                                ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
