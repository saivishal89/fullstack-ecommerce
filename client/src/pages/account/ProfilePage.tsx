import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { authApi } from '../../api/services';
import { User, Lock, MapPin, Plus, Trash2, Phone, Mail } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useToastStore();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const updated = await authApi.updateProfile({ name, phone });
      updateUser(updated);
      addToast({ type: 'success', message: 'Profile details saved successfully' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingPassword(true);
      await authApi.changePassword(currentPassword, newPassword);
      addToast({ type: 'success', message: 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to change password' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">My Account</h1>
        <p className="text-xs text-slate-500 mt-1">Manage personal info, security, and addresses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" /> Personal Info
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Email (Cannot be changed)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-100 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl text-slate-500 cursor-not-allowed"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold transition-colors"
            >
              {updatingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Security & Password */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-600" /> Security & Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">New Password</label>
              <input
                type="password"
                required
                placeholder="At least 6 chars with uppercase & number"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold transition-colors"
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
