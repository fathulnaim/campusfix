import React from 'react';
import { Inbox, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function StatsCards({ reports = [], isAdmin = false }) {
  const total = reports.length;
  const pendingOrProgress = reports.filter(r => r.status !== 'Resolved').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;
  const critical = reports.filter(r => r.priority && r.priority.includes('P1') && r.status !== 'Resolved').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Total Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {isAdmin ? "Total Campus Reports" : "My Reports"}
          </p>
          <h3 className="text-2xl font-black text-slate-800 mt-1">{total}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isAdmin ? "Across all campus facilities" : "Submitted by your account"}
          </p>
        </div>
        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center shrink-0">
          <Inbox className="w-6 h-6" />
        </div>
      </div>

      {/* Pending / Active Card */}
      <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs flex items-center justify-between hover:border-amber-200 transition-all bg-gradient-to-br from-white to-amber-50/20">
        <div>
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            {isAdmin ? "Pending Action" : "Active / In Progress"}
          </p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingOrProgress}</h3>
          <p className="text-[10px] text-amber-600/80 mt-0.5">Awaiting or undergoing maintenance</p>
        </div>
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* Resolved Card */}
      <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between hover:border-emerald-200 transition-all bg-gradient-to-br from-white to-emerald-50/20">
        <div>
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Resolved Tickets
          </p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{resolved}</h3>
          <p className="text-[10px] text-emerald-600/80 mt-0.5">Repairs inspected & completed</p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Urgent Critical Card (Especially prominent for Admin) */}
      <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between hover:border-rose-200 transition-all bg-gradient-to-br from-white to-rose-50/20 col-span-1 sm:col-span-3 lg:col-span-1">
        <div>
          <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
            Critical (P1)
          </p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{critical}</h3>
          <p className="text-[10px] text-rose-600/80 mt-0.5">Sparks, locks, flooding or hazards</p>
        </div>
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100">
          <AlertOctagon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
