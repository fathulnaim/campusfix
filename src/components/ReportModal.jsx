import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Image as ImageIcon,
  Flame
} from 'lucide-react';
import { uploadToCloudinary, validateImageFile } from '../utils/cloudinary';
import { createReport } from '../services/reportService';
import { calculatePriority, CATEGORIES, CAMPUS_LOCATIONS } from '../utils/priority';

export default function ReportModal({ isOpen, onClose, currentUser, onReportCreated }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Block A (Hostel)');
  const [customLocation, setCustomLocation] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [roomAccess, setRoomAccess] = useState('Yes, staff may enter');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileError, setFileError] = useState('');
  
  // Upload & submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState(''); // 'uploading' | 'saving' | ''
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  // Real-time calculated priority
  const finalLocation = location === 'Other (Specify)' ? customLocation : location;
  const calculatedPriority = calculatePriority(category, description, title);

  // File selection handler with 5MB validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    setSubmitError('');

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFileError(validation.error);
      setSelectedFile(null);
      setPreviewUrl('');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemovePhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl('');
    setFileError('');
    const fileInput = document.getElementById('report-photo-input');
    if (fileInput) fileInput.value = '';
  };

  const resetForm = () => {
    setTitle('');
    setLocation(CAMPUS_LOCATIONS[0]);
    setCustomLocation('');
    setCategory(CATEGORIES[0]);
    setRoomAccess('Yes, staff may enter');
    setDescription('');
    handleRemovePhoto();
    setSubmitError('');
    setUploadStep('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!title.trim()) {
      setSubmitError('Please provide a title for the defect report.');
      return;
    }

    if (!finalLocation.trim()) {
      setSubmitError('Please specify the campus location.');
      return;
    }

    if (!description.trim()) {
      setSubmitError('Please provide a description of the defect.');
      return;
    }

    if (!selectedFile) {
      setSubmitError('Please upload a photo of the defect (max 5MB).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload photo directly to Cloudinary (Requirement #3)
      setUploadStep('Uploading photo to Cloudinary...');
      const uploadResult = await uploadToCloudinary(selectedFile);
      const secure_url = uploadResult.secure_url;

      // Step 2: Save report metadata to Cloud Firestore 'reports' collection (Requirement #4)
      setUploadStep('Saving report metadata to Cloud Firestore...');
      await createReport({
        title: title.trim(),
        location: finalLocation.trim(),
        description: description.trim(),
        file_url: secure_url,
        status: 'Pending', // Must be initial 'Pending' per Requirement #4
        userEmail: currentUser?.email || 'student@campus.edu',
        category,
        priority: calculatedPriority,
        roomAccess
      });

      // Cleanup & success callback
      resetForm();
      onClose();
      if (onReportCreated) onReportCreated();
    } catch (err) {
      console.error('[CampusFix] Submit error:', err);
      setSubmitError(err.message || 'An error occurred while submitting the report.');
    } finally {
      setIsSubmitting(false);
      setUploadStep('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 my-auto max-h-[92vh] overflow-y-auto animate-scaleUp">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Submit Facility Damage Report
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as: <span className="font-semibold text-indigo-600">{currentUser?.email}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div>{submitError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Defect Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken water pipe leaking under washroom sink"
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-medium text-slate-800"
              required
            />
          </div>

          {/* Location & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Campus Location <span className="text-rose-500">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-semibold text-slate-800"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
                <option value="Other (Specify)">Other (Specify custom location)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Defect Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-semibold text-slate-800"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom location input if "Other" is chosen */}
          {location === 'Other (Specify)' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Specify Location Details
              </label>
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="e.g. Block C, 3rd Floor Room 304"
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-medium"
                required
              />
            </div>
          )}

          {/* Priority Smart Preview */}
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Calculated Priority:</span>
              <span className="text-[10px] text-slate-400">(Auto-evaluated from keywords)</span>
            </div>
            {calculatedPriority === 'P1 - Critical' ? (
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-600 animate-bounce" /> 🔴 P1 - Critical
              </span>
            ) : calculatedPriority === 'P2 - Medium' ? (
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                🟡 P2 - Medium
              </span>
            ) : (
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                🟢 P3 - Low
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details about the issue (e.g. valve broken, sparks when turning on switch, continuous water leakage)..."
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-medium leading-relaxed"
              required
            />
          </div>

          {/* Room Entry Permission */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Room / Area Entry Permission (If Unattended)
            </label>
            <div className="grid grid-cols-2 gap-2 p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer p-1">
                <input
                  type="radio"
                  name="roomAccess"
                  value="Yes, staff may enter"
                  checked={roomAccess === 'Yes, staff may enter'}
                  onChange={(e) => setRoomAccess(e.target.value)}
                  className="text-indigo-600"
                />
                <span>Yes, staff may enter</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-1">
                <input
                  type="radio"
                  name="roomAccess"
                  value="No, wait for occupant"
                  checked={roomAccess === 'No, wait for occupant'}
                  onChange={(e) => setRoomAccess(e.target.value)}
                  className="text-indigo-600"
                />
                <span>No, wait for occupant</span>
              </label>
            </div>
          </div>

          {/* Photo Upload Flow (Requirement #2 & #3: validate < 5MB, upload to Cloudinary) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">
                Defect Photo <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Max 5.00 MB (Cloudinary Upload)</span>
            </div>

            {!previewUrl ? (
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 sm:p-5 text-center transition-all bg-slate-50/50 hover:bg-indigo-50/20 group cursor-pointer">
                <input
                  id="report-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="report-photo-input" className="cursor-pointer block">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    Click to browse or snap photo with camera
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    JPG, PNG, WebP up to 5MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl p-2.5 bg-slate-50">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isSubmitting}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {fileError && (
              <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {fileError}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : 'active:scale-98'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadStep || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Damage Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
