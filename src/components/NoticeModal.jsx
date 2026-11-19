import React, { useState } from 'react';
import { X, Megaphone, Trash2, Send } from 'lucide-react';
import { updateNoticeInFirestore } from '../services/reportService';

function NoticeForm({ currentNotice, onClose, onNoticeUpdated }) {
  const [noticeText, setNoticeText] = useState(currentNotice || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateNoticeInFirestore(noticeText.trim());
      onClose();
      if (onNoticeUpdated) onNoticeUpdated(noticeText.trim());
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (confirm("Are you sure you want to remove the current campus notice?")) {
      setSaving(true);
      try {
        await updateNoticeInFirestore('');
        setNoticeText('');
        onClose();
        if (onNoticeUpdated) onNoticeUpdated('');
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <textarea
          rows={4}
          value={noticeText}
          onChange={(e) => setNoticeText(e.target.value)}
          placeholder="e.g. Water disruption in Block B until 5:00 PM for main valve replacement. Drinking water stations available at Student Center."
          className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-medium leading-relaxed"
          required
        />
      </div>

      <div className="flex gap-2 pt-2">
        {currentNotice && (
          <button
            type="button"
            onClick={handleClear}
            disabled={saving}
            className="w-1/3 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{saving ? 'Publishing...' : 'Publish Announcement'}</span>
        </button>
      </div>
    </form>
  );
}

export default function NoticeModal({ isOpen, onClose, currentNotice, onNoticeUpdated }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 animate-scaleUp">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Broadcast Campus Notice</h3>
              <p className="text-[11px] text-slate-400">Displayed as a banner to all students.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <NoticeForm
          key={currentNotice || 'new'}
          currentNotice={currentNotice}
          onClose={onClose}
          onNoticeUpdated={onNoticeUpdated}
        />
      </div>
    </div>
  );
}
