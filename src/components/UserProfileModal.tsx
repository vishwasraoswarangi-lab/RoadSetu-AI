import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  ShieldCheck,
  LogOut,
  Edit2,
  Check,
  Key,
  Building2,
  Briefcase,
  MapPin,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintsContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMyComplaints: () => void;
  onNavigateToAuthority?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToMyComplaints,
  onNavigateToAuthority,
}) => {
  const { user, logout, updateUserProfileData, resendVerificationEmail } = useAuth();
  const { userComplaints, complaints } = useComplaints();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || '');

  if (!isOpen || !user) return null;

  const isAuthority =
    user.role === 'authority' ||
    user.role === 'municipal_officer' ||
    user.role === 'admin';

  const verifiedCount = userComplaints.filter((c) => c.status === 'verified').length;
  const reportsCount = userComplaints.length;
  const totalJurisdictionCount = complaints.length;
  const auditedCount = complaints.filter(
    (c) => c.status === 'verified' || c.status === 'closed' || c.escrowStatus === 'disbursed'
  ).length;

  const handleSaveName = async () => {
    if (editedName.trim()) {
      await updateUserProfileData(editedName.trim());
      setIsEditing(false);
    }
  };

  const formattedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-[#0B0F17] p-6 shadow-2xl">
        {/* Subtle decorative glow */}
        <div
          className={`pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full blur-2xl ${
            isAuthority ? 'bg-amber-500/10' : 'bg-cyan-500/10'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Profile Card Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div
            className={`relative flex h-14 w-14 items-center justify-center rounded-2xl text-slate-950 text-xl font-black shadow-lg ${
              isAuthority
                ? 'bg-gradient-to-tr from-amber-500 to-orange-400 shadow-amber-900/30'
                : 'bg-gradient-to-tr from-cyan-600 to-teal-400 shadow-cyan-900/30'
            }`}
          >
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="rounded-lg border border-cyan-500 bg-slate-900 px-2.5 py-1 text-sm text-white focus:outline-none"
                />
                <button
                  onClick={handleSaveName}
                  className="rounded-lg bg-cyan-500 p-1 text-slate-950 hover:bg-cyan-400"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-100 truncate">
                  {user.displayName}
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-slate-400 hover:text-cyan-400"
                  title="Edit display name"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xs text-slate-400 truncate">{user.email}</span>
            </div>
            <div className="mt-1 flex items-center space-x-2">
              {isAuthority ? (
                <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  <Building2 className="h-3 w-3" />
                  <span>Municipal Officer (Level 3 Clearance)</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified Citizen Account</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {isAuthority ? (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Jurisdiction Reports</span>
                <Building2 className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white">{totalJurisdictionCount}</div>
              <span className="text-[10px] text-slate-500">Zone 2 (Thane / GB Road)</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Audited / Disbursed</span>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white">{auditedCount}</div>
              <span className="text-[10px] text-slate-500">Escrow released</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Reports</span>
                <FileText className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white">{reportsCount}</div>
              <span className="text-[10px] text-slate-500">Filed by your account</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Verified Repairs</span>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white">{verifiedCount}</div>
              <span className="text-[10px] text-slate-500">Closed & audited</span>
            </div>
          </div>
        )}

        {/* Role-Specific Identity & Clearance Details */}
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 text-xs mb-5">
          {isAuthority ? (
            <>
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-slate-400">Designation</span>
                </div>
                <span className="text-slate-200 font-semibold">{user.designation || 'Executive Engineer (Pothole Triage)'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-slate-400">Department</span>
                </div>
                <span className="text-slate-200 truncate max-w-[200px] text-right">{user.department || 'Thane Municipal Corporation (Road Works)'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-slate-400">Jurisdiction</span>
                </div>
                <span className="text-slate-200">{user.jurisdiction || 'Zone 2 (Wards 4, 7)'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2">
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-slate-400">Official Badge ID</span>
                </div>
                <span className="font-mono text-[11px] text-amber-300">{user.employeeId || 'ENG-MH-TMC-0482'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2">
                  <Key className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-slate-400">Citizen UID</span>
                </div>
                <span className="font-mono text-[11px] text-cyan-400">{user.uid}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-slate-400">Registered On</span>
                </div>
                <span className="text-slate-200">{formattedDate}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center space-x-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-slate-400">Account Status</span>
                </div>
                <span className="text-emerald-400 font-medium">Active & Verified</span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {isAuthority ? (
            <button
              onClick={() => {
                onClose();
                onNavigateToAuthority?.();
              }}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-amber-500/20 py-2.5 px-4 text-xs font-bold text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
            >
              <Building2 className="h-4 w-4" />
              <span>Open Municipal Authority Hub</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onNavigateToMyComplaints();
              }}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-cyan-500/20 py-2.5 px-4 text-xs font-bold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>View All My Reports</span>
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex w-full items-center justify-center space-x-2 rounded-xl border border-rose-500/30 bg-rose-950/20 py-2.5 px-4 text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
