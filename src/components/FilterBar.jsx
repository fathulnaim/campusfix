import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CAMPUS_LOCATIONS } from '../utils/priority';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  locationFilter,
  setLocationFilter,
  priorityFilter,
  setPriorityFilter,
  isAdmin
}) {
  const hasActiveFilters = searchQuery || statusFilter !== 'ALL' || locationFilter !== 'ALL' || priorityFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setLocationFilter('ALL');
    setPriorityFilter('ALL');
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
      {/* Search Input & Status Tabs */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAdmin ? "Search by title, location, description, or student email..." : "Search your reports..."}
            className="w-full border border-slate-200 rounded-2xl pl-10 pr-9 py-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-500 font-medium text-slate-800 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
          {[
            { label: 'All Status', value: 'ALL' },
            { label: 'Pending', value: 'Pending' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Resolved', value: 'Resolved' }
          ].map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st.value
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Filters: Location & Priority */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Location Dropdown */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-slate-50 font-semibold text-slate-700 focus:outline-indigo-500"
          >
            <option value="ALL">All Campus Locations</option>
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-slate-50 font-semibold text-slate-700 focus:outline-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="P1">🔴 Critical (P1)</option>
            <option value="P2">🟡 Medium (P2)</option>
            <option value="P3">🟢 Low (P3)</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <X className="w-3 h-3" /> Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
