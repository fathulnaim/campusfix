import React from 'react';
import { BellRing } from 'lucide-react';

export default function NoticeBanner({ notice }) {
  if (!notice) return null;

  return (
    <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs transition-all animate-fadeIn">
      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
        <BellRing className="w-4 h-4 animate-pulse" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-black text-amber-900 uppercase tracking-wider">
            Campus Facility Notice
          </p>
          <span className="text-[10px] bg-amber-200/80 text-amber-800 font-bold px-2 py-0.2 rounded-full">
            Live Announcement
          </span>
        </div>
        <p className="text-xs text-amber-950 mt-1 leading-relaxed font-medium whitespace-pre-line">
          {notice}
        </p>
      </div>
    </div>
  );
}
