import React, { useState } from 'react';
import { X, CheckCircle, Shield, UserCheck } from 'lucide-react';
import { updateReportInFirestore } from '../services/reportService';

function AdminActionForm({ report, currentUser, onClose, onReportUpdated }) {
  const [status, setStatus] = useState(report.status || 'Pending');
  const [technician, setTechnician] = useState(
    report.technician && report.technician !== 'Pending Assignment' ? report.technician : 'Campus Tech Team'
  );
  const [estimatedTime, setEstimatedTime] = useState(report.estimatedTime || 'Within 24 Hours');
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const now = new Date();
      const timeStr = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const logEntry = `${timeStr}: Status updated to "${status}" by Admin (${currentUser?.email || 'admin@campus.edu'})`;

      const existingTimeline = Array.isArray(report.timeline) ? report.timeline : [];
      const updatedTimeline = [...existingTimeline, logEntry];

      await updateReportInFirestore(report.id, {
        status,
        technician: technician.trim() || 'Assigned Technician',
        estimatedTime,
        adminNotes: adminNotes.trim(),
        timeline: updatedTimeline,
        updatedAt: now.toISOString()
      });

      onClose();
      if (onReportUpdated) onReportUpdated();
    } catch (err) {
      console.error('[CampusFix] Admin update error:', err);
      setErrorMsg(err.message || 'Failed to update report status in Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Status Selection (Pending, In Progress, Resolved) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Report Status <span className="text-rose-500">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-bold text-slate-800"
          >
            <option value="Pending">🟡 Pending</option>
            <option value="In Progress">🔵 In Progress</option>
            <option value="Resolved">🟢 Resolved (Completed)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
            Estimated Resolution
          </label>
          <select
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-medium text-slate-800"
          >
            <option value="Within 24 Hours">Within 24 Hours</option>
            <option value="1 - 2 Business Days">1 - 2 Business Days</option>
            <option value="3 - 5 Days (Spare Parts Needed)">3 - 5 Days (Spare Parts)</option>
            <option value="Same Day Urgent">Same Day Urgent</option>
            <option value="Resolved">Resolved / Complete</option>
          </select>
        </div>
      </div>

      {/* Assigned Technician Name */}
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
          Assigned Staff / Technician
        </label>
        <div className="relative">
          <UserCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            placeholder="e.g. Technician Ali (Electrical Team)"
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Staff Repair Notes to Student */}
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
          Staff Notes / Work Done (Visible to Student)
        </label>
        <textarea
          rows={3}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="e.g. Inspected valve leak at 2:00 PM; replaced rubber washer and verified water pressure. Defect resolved."
          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-medium leading-relaxed"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-2/3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Updating Firestore...</span>
            </span>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function AdminActionModal({ isOpen, onClose, report, currentUser, onReportUpdated }) {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 my-auto animate-scaleUp">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-0.5">
              <Shield className="w-4 h-4" /> Maintenance Dispatch
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Manage Ticket: {report.title}
            </h3>
            <p className="text-xs text-slate-400">
              Location: <span className="font-semibold text-slate-700">{report.location}</span> • Student: <span className="font-semibold text-slate-700">{report.userEmail}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AdminActionForm
          key={report.id}
          report={report}
          currentUser={currentUser}
          onClose={onClose}
          onReportUpdated={onReportUpdated}
        />
      </div>
    </div>
  );
}
