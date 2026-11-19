import React from 'react';
import { 
  Wrench, 
  PlusCircle, 
  Download, 
  Megaphone, 
  LogOut, 
  ShieldCheck, 
  GraduationCap 
} from 'lucide-react';

export default function Navbar({ 
  currentUser, 
  isAdmin, 
  onOpenReportModal, 
  onOpenNoticeModal, 
  onExportCSV, 
  onLogout 
}) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-slate-900 tracking-tight">CampusFix</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Cloud
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 font-bold text-indigo-700">
                  <ShieldCheck className="w-3.5 h-3.5" /> Maintenance Admin Panel
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> 
                  <span className="truncate max-w-[180px] sm:max-w-xs">{currentUser?.email}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button 
                onClick={onExportCSV}
                title="Export all reports to CSV spreadsheet"
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button 
                onClick={onOpenNoticeModal}
                title="Broadcast campus-wide notice"
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Megaphone className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Notice</span>
              </button>
            </>
          )}

          {/* New Report Button: Shown for students and available to admin too */}
          <button 
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Report</span>
          </button>

          {/* Logout Button */}
          <button 
            onClick={onLogout} 
            title="Sign Out" 
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
