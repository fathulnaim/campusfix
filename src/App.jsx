import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import NoticeBanner from './components/NoticeBanner';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import ReportCard from './components/ReportCard';
import ReportModal from './components/ReportModal';
import AdminActionModal from './components/AdminActionModal';
import NoticeModal from './components/NoticeModal';
import Lightbox from './components/Lightbox';
import AuthScreen from './components/AuthScreen';

import { subscribeToAuth, logoutUser, isMaintenanceAdmin } from './services/authService';
import { subscribeToReports, subscribeToNotice } from './services/reportService';
import { exportReportsToCSV } from './utils/exportCsv';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from './firebase';
import { 
  ClipboardList, 
  Info, 
  Loader2, 
  Plus
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firestore Real-time Data
  const [allReports, setAllReports] = useState([]);
  const [publicNotice, setPublicNotice] = useState('');
  const [reportsLoading, setReportsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [selectedReportToManage, setSelectedReportToManage] = useState(null);

  // Lightbox State
  const [lightboxData, setLightboxData] = useState({ isOpen: false, src: '', title: '' });

  // 1. Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Subscribe to Firestore Reports & Notice when authenticated
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeReports = subscribeToReports((reports) => {
      setAllReports(reports);
      setReportsLoading(false);
    });

    const unsubscribeNotice = subscribeToNotice((notice) => {
      setPublicNotice(notice);
    });

    return () => {
      unsubscribeReports();
      unsubscribeNotice();
    };
  }, [currentUser]);

  // Derived Admin Role (Requirement #1: admin@campus.edu is Maintenance Admin)
  const isAdmin = useMemo(() => isMaintenanceAdmin(currentUser), [currentUser]);

  // Filter & Sort Reports
  const displayedReports = useMemo(() => {
    if (!currentUser) return [];

    // Base scope: Students only see their own reports (Requirement #5)
    // Admin sees all campus reports
    let scoped = isAdmin
      ? [...allReports]
      : allReports.filter(
          (r) => r.userEmail?.toLowerCase() === currentUser.email?.toLowerCase()
        );

    // Apply Status Filter
    if (statusFilter !== 'ALL') {
      scoped = scoped.filter((r) => r.status === statusFilter);
    }

    // Apply Location Filter
    if (locationFilter !== 'ALL') {
      scoped = scoped.filter((r) => r.location === locationFilter);
    }

    // Apply Priority Filter
    if (priorityFilter !== 'ALL') {
      scoped = scoped.filter((r) => r.priority && r.priority.includes(priorityFilter));
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      scoped = scoped.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.userEmail?.toLowerCase().includes(q) ||
          r.category?.toLowerCase().includes(q)
      );
    }

    // Smart Sorting:
    // 1. Re-opened issues on top
    // 2. Active issues (Pending / In Progress) above Resolved
    // 3. P1 Critical issues prioritized
    // 4. Newest createdAt first
    scoped.sort((a, b) => {
      const isReopenedA = a.isReopened || (a.timeline && a.timeline.some(t => t.includes('Re-opened')));
      const isReopenedB = b.isReopened || (b.timeline && b.timeline.some(t => t.includes('Re-opened')));
      if (isReopenedA && !isReopenedB) return -1;
      if (!isReopenedA && isReopenedB) return 1;

      const isResolvedA = a.status === 'Resolved';
      const isResolvedB = b.status === 'Resolved';
      if (!isResolvedA && isResolvedB) return -1;
      if (isResolvedA && !isResolvedB) return 1;

      const isP1A = a.priority && a.priority.includes('P1');
      const isP1B = b.priority && b.priority.includes('P1');
      if (isP1A && !isP1B) return -1;
      if (!isP1A && isP1B) return 1;

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return scoped;
  }, [allReports, currentUser, isAdmin, statusFilter, locationFilter, priorityFilter, searchQuery]);

  // Handlers
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleOpenManageReport = (report) => {
    setSelectedReportToManage(report);
    setIsAdminModalOpen(true);
  };

  const handleViewPhoto = (src, title) => {
    setLightboxData({ isOpen: true, src, title });
  };

  const isCloudinaryPlaceholder = 
    !CLOUDINARY_CLOUD_NAME || 
    CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME' || 
    !CLOUDINARY_UPLOAD_PRESET || 
    CLOUDINARY_UPLOAD_PRESET === 'YOUR_UPLOAD_PRESET';

  // Loading Screen while Firebase Auth initializes
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-extrabold text-slate-800">CampusFix</h2>
        <p className="text-xs text-slate-400 mt-1">Connecting to Firebase Services...</p>
      </div>
    );
  }

  // Not Logged In: Show Auth Screen (Requirement #1)
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        isAdmin={isAdmin}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenNoticeModal={() => setIsNoticeModalOpen(true)}
        onExportCSV={() => exportReportsToCSV(allReports)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-6 flex-1">
        {/* Cloudinary Placeholder Info Pill (if not configured yet) */}
        {isCloudinaryPlaceholder && (
          <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-indigo-900 shadow-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <b>Setup Notice:</b> Cloudinary constants are set to placeholders in <code className="bg-indigo-100/80 px-1.5 py-0.5 rounded text-indigo-800 font-mono text-[11px]">src/firebase.js</code>. The app includes full direct Cloudinary POST logic and an automatic local image fallback for smooth instant preview!
              </span>
            </div>
          </div>
        )}

        {/* Public Notice Banner */}
        <NoticeBanner notice={publicNotice} />

        {/* High-level Stats Overview */}
        <StatsCards
          reports={
            isAdmin
              ? allReports
              : allReports.filter((r) => r.userEmail?.toLowerCase() === currentUser.email?.toLowerCase())
          }
          isAdmin={isAdmin}
        />

        {/* Search & Filter Toolbar */}
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          isAdmin={isAdmin}
        />

        {/* Reports Grid Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <div>
              <h2 className="text-base font-black text-slate-900">
                {isAdmin ? 'Campus Maintenance Tickets' : 'My Submitted Reports'}
              </h2>
              <p className="text-xs text-slate-400">
                Showing {displayedReports.length} {displayedReports.length === 1 ? 'record' : 'records'}
                {statusFilter !== 'ALL' && ` • Filtered by ${statusFilter}`}
              </p>
            </div>

            {!isAdmin && (
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Defect</span>
              </button>
            )}
          </div>

          {/* Loading or Empty State or Reports Grid */}
          {reportsLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">Syncing tickets from Cloud Firestore...</p>
            </div>
          ) : displayedReports.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 sm:p-16 text-center shadow-xs">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                {searchQuery || statusFilter !== 'ALL' || locationFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? 'No matching tickets found'
                  : isAdmin
                  ? 'No maintenance tickets recorded yet'
                  : 'You have not submitted any damage reports yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
                {isAdmin
                  ? 'Tickets submitted by students from hostels and campus facilities will appear here in real time.'
                  : 'Notice a broken tap, sparking switch, or damaged furniture? Snap a photo and submit a report to alert the facility maintenance team.'}
              </p>
              {!isAdmin && (
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Your First Report</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  isAdmin={isAdmin}
                  currentUser={currentUser}
                  onOpenManage={handleOpenManageReport}
                  onViewPhoto={handleViewPhoto}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 px-4 text-center text-xs text-slate-400">
        <p>
          <b>CampusFix</b>: Campus Facility Reporting System • Powered by Firebase Auth & Cloud Firestore
        </p>
      </footer>

      {/* Student New Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentUser={currentUser}
        onReportCreated={() => {}}
      />

      {/* Admin Action / Ticket Status Modal */}
      <AdminActionModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setSelectedReportToManage(null);
        }}
        report={selectedReportToManage}
        currentUser={currentUser}
        onReportUpdated={() => {}}
      />

      {/* Notice Broadcast Modal */}
      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        currentNotice={publicNotice}
        onNoticeUpdated={(newNotice) => setPublicNotice(newNotice)}
      />

      {/* Photo Lightbox */}
      {lightboxData.isOpen && (
        <Lightbox
          src={lightboxData.src}
          title={lightboxData.title}
          onClose={() => setLightboxData({ isOpen: false, src: '', title: '' })}
        />
      )}
    </div>
  );
}
