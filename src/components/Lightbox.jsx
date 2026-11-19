import React from 'react';
import { X, ExternalLink } from 'lucide-react';

export default function Lightbox({ src, title, onClose }) {
  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/85 z-60 flex flex-col items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex justify-between items-center text-white mb-2 px-1">
          <span className="text-xs font-bold truncate max-w-md">{title || "Photo Preview"}</span>
          <div className="flex items-center gap-2">
            <a 
              href={src} 
              target="_blank" 
              rel="noreferrer"
              title="Open full size image in new tab"
              className="text-slate-300 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img
            src={src}
            alt={title || "Inspection photo"}
            className="max-h-[80vh] max-w-full object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
