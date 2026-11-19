import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Wrench, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  XCircle, 
  Eye, 
  Flame
} from 'lucide-react';
import { deleteReportFromFirestore, updateReportInFirestore } from '../services/reportService';

export default function ReportCard({
  report,
  isAdmin,
  currentUser,
  onOpenManage,
  onViewPhoto
}) {
  const isResolved = report.status === 'Resolved';
  const isInProgress = report.status === 'In Progress';
  const isP1 = report.priority && report.priority.includes('P1');
  const isP2 = report.priority && report.priority.includes('P2');
  const isReopened = report.isReopened || (report.timeline && report.timeline.some(t => t.includes('Re-opened')));

  // Card Border styling
  let borderStyle = 'border-slate-200/80 hover:border-slate-300';
  if (isReopened) {
    borderStyle = 'border-purple-300 bg-purple-50/15 ring-2 ring-purple-200 shadow-purple-50 shadow-md';
  } else if (isP1 && !isResolved) {
    borderStyle = 'border-rose-300 ring-1 ring-rose-200 shadow-rose-50 shadow-sm';
  }

  // Handle Cancel Report (Student)
  const handleCancelReport = async () => {
    if (confirm("Are you sure you want to cancel and delete this report?")) {
      try {
        await deleteReportFromFirestore(report.id);
      } catch (err) {
        alert("Failed to cancel report: " + err.message);
      }
    }
  };

  // Handle Delete (Admin)
  const handleDeleteTicket = async () => {
    if (confirm(`Maintenance Admin Action:\nAre you sure you want to permanently delete report "${report.title}"?`)) {
      try {
        await deleteReportFromFirestore(report.id);
      } catch (err) {
        alert("Failed to delete report: " + err.message);
      }
    }
  };

  // Handle Re-open Report (Student)
  const handleReopenTicket = async () => {
    if (confirm("Is the defect still defective or reoccurring? This will move the ticket back to In Progress and alert the technician team.")) {
      try {
        const now = new Date();
        const timeStr = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const log = `${timeStr}: Re-opened by Student (${currentUser?.email}) - defect still persists.`;
        
        await updateReportInFirestore(report.id, {
          status: 'In Progress',
          isReopened: true,
          timeline: [...(report.timeline || []), log]
        });
      } catch (err) {
        alert("Failed to re-open ticket: " + err.message);
      }
    }
  };

  return (
    <div className={`bg-white rounded-3xl border ${borderStyle} p-5 flex flex-col justify-between space-y-4 shadow-xs transition-all hover:shadow-md`}>
      <div>
        {/* Top Header */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Location Badge */}
            <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white tracking-tight">
              {report.location}
            </span>

            {/* Priority Badge */}
            {isP1 ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                <Flame className="w-3 h-3" /> P1 - Critical
              </span>
            ) : isP2 ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                🟡 P2 - Medium
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                🟢 P3 - Low
              </span>
            )}

            {/* Re-opened indicator */}
            {isReopened && (
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200 animate-pulse">
                🟣 Re-opened
              </span>
            )}
          </div>

          <span className="text-[11px] font-bold text-slate-400 shrink-0">
            {report.createdAt ? new Date(report.createdAt).toLocaleDateString('en-GB') : ''}
          </span>
        </div>

        {/* Photo Thumbnail */}
        {report.file_url ? (
          <div 
            onClick={() => onViewPhoto(report.file_url, report.title)}
            className="relative h-40 sm:h-44 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 cursor-pointer group border border-slate-200/80"
          >
            <img 
              src={report.file_url} 
              alt={report.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 backdrop-blur-xs">
                <Eye className="w-3.5 h-3.5" /> View Photo
              </span>
            </div>
            <span className="absolute top-2 left-2 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
              Defect Photo
            </span>
          </div>
        ) : (
          <div className="h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-medium mb-3">
            No photo attached
          </div>
        )}

        {/* Category & Status Badges */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wider truncate">
            {report.category || 'General'}
          </span>

          {/* Status Badge */}
          {isResolved ? (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
            </span>
          ) : isInProgress ? (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1 shrink-0">
              <Wrench className="w-3.5 h-3.5" /> In Progress
            </span>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5" /> Pending
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="font-extrabold text-sm text-slate-900 mt-1 leading-snug">
          {report.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
          {report.description}
        </p>

        {/* Operational Details Box */}
        <div className="mt-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
          <div className="flex items-center justify-between">
            <span>🚪 <b>Room Access:</b></span>
            <span className="font-semibold text-slate-700">{report.roomAccess || 'Yes, staff may enter'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span>🛠️ <b>Assigned Technician:</b></span>
            <span className="font-bold text-indigo-700">
              {report.technician && report.technician !== 'Pending Assignment' ? report.technician : 'Pending Assignment'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>⏱️ <b>Estimated:</b></span>
            <span className="font-medium text-slate-700">{report.estimatedTime || 'Evaluating'}</span>
          </div>

          {report.adminNotes && (
            <div className="pt-1.5 mt-1 border-t border-slate-200/80 text-emerald-800 bg-emerald-50/50 p-2 rounded-xl">
              <span className="font-bold text-[10px] uppercase tracking-wider block text-emerald-900">
                💬 Staff Note to Student:
              </span>
              <p className="italic text-[11px] mt-0.5 font-medium leading-relaxed">
                "{report.adminNotes}"
              </p>
            </div>
          )}
        </div>

        {/* Audit Timeline */}
        {report.timeline && report.timeline.length > 0 && (
          <div className="mt-2 text-[10px] text-slate-400 bg-slate-50/60 p-2 rounded-xl border border-slate-100/80 truncate">
            <span className="font-bold text-slate-500">Latest Activity: </span>
            {report.timeline[report.timeline.length - 1]}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
        {isAdmin ? (
          <>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeleteTicket}
                title="Delete ticket"
                className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[130px] sm:max-w-[170px]">
                {report.userEmail}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onOpenManage(report)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Manage Ticket</span>
            </button>
          </>
        ) : (
          <>
            <div>
              {isResolved ? (
                <button
                  type="button"
                  onClick={handleReopenTicket}
                  className="text-purple-700 hover:text-purple-900 font-bold text-[11px] flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-xl border border-purple-200 transition-colors cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Still Broken? Re-open</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelReport}
                  className="text-rose-500 hover:text-rose-700 font-bold text-[11px] flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-xl transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Report</span>
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-400 italic font-medium">
              Firestore Synced
            </span>
          </>
        )}
      </div>
    </div>
  );
}
