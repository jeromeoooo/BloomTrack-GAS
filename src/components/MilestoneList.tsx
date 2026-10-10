import React, { useState } from 'react';
import { PregnancyWeekInfo } from '../data/pregnancyMilestones';
import { MilestoneCard } from './MilestoneCard';
import { CalendarCheck, Download, CheckSquare, Square, Filter, Search } from 'lucide-react';

interface MilestoneListProps {
  weeks: PregnancyWeekInfo[];
  lmpDate: Date;
  selectedWeeks: Set<number>;
  onToggleWeek: (week: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  currentWeekNum: number;
  onOpenSyncModal: () => void;
  onDownloadIcs: () => void;
  customSummaries: Record<number, string>;
  onUpdateSummary: (week: number, summary: string) => void;
  getWeekDateStr: (weekNumber: number) => string;
}

export const MilestoneList: React.FC<MilestoneListProps> = ({
  weeks,
  selectedWeeks,
  onToggleWeek,
  onSelectAll,
  onDeselectAll,
  currentWeekNum,
  onOpenSyncModal,
  onDownloadIcs,
  customSummaries,
  onUpdateSummary,
  getWeekDateStr,
}) => {
  const [trimesterFilter, setTrimesterFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWeeks = weeks.filter((w) => {
    if (trimesterFilter !== 'all' && w.trimester !== trimesterFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchFruit = w.sizeFruit.toLowerCase().includes(q);
      const matchHead = w.headline.toLowerCase().includes(q);
      const matchWeek = `week ${w.week}`.includes(q) || String(w.week) === q;
      const matchMilestone = w.medicalMilestone?.toLowerCase().includes(q) || false;
      return matchFruit || matchHead || matchWeek || matchMilestone;
    }
    return true;
  });

  const selectedCount = weeks.filter((w) => selectedWeeks.has(w.week)).length;

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Filter and search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Trimester filter buttons */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setTrimesterFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                trimesterFilter === 'all'
                  ? 'bg-white text-gray-900 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Weeks ({weeks.length})
            </button>
            <button
              type="button"
              onClick={() => setTrimesterFilter(1)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                trimesterFilter === 1
                  ? 'bg-white text-amber-800 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              1st Trim
            </button>
            <button
              type="button"
              onClick={() => setTrimesterFilter(2)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                trimesterFilter === 2
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              2nd Trim
            </button>
            <button
              type="button"
              onClick={() => setTrimesterFilter(3)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                trimesterFilter === 3
                  ? 'bg-white text-purple-800 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              3rd Trim
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search fruit, scan, week..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-rose-400"
            />
          </div>
        </div>

        {/* Right: Quick select toggles & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
            Select All
          </button>
          <button
            type="button"
            onClick={onDeselectAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5" />
            Clear
          </button>

          <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />

          {/* Download ICS button */}
          <button
            type="button"
            onClick={onDownloadIcs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors cursor-pointer"
            title="Download .ics calendar file"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Export</span> .ICS
          </button>

          {/* Sync to Google Calendar CTA */}
          <button
            type="button"
            onClick={onOpenSyncModal}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Sync {selectedCount} to Google Calendar</span>
          </button>
        </div>
      </div>

      {/* List count indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          Showing {filteredWeeks.length} weekly milestones •{' '}
          <strong className="text-rose-600">{selectedCount}</strong> scheduled to sync
        </span>
        <span className="text-gray-400">Click any card arrow to view full week tips</span>
      </div>

      {/* Week Cards Stack */}
      <div className="space-y-3">
        {filteredWeeks.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-200">
            <p className="text-sm text-gray-500">No pregnancy weeks match your search filter.</p>
            <button
              onClick={() => {
                setTrimesterFilter('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredWeeks.map((weekInfo) => {
            const dateStr = getWeekDateStr(weekInfo.week);
            const isSelected = selectedWeeks.has(weekInfo.week);
            const isCurrent = weekInfo.week === currentWeekNum;

            return (
              <MilestoneCard
                key={weekInfo.week}
                info={weekInfo}
                dateStr={dateStr}
                isSelected={isSelected}
                onToggleSelect={onToggleWeek}
                isCurrentWeek={isCurrent}
                customSummary={customSummaries[weekInfo.week]}
                onUpdateSummary={onUpdateSummary}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
