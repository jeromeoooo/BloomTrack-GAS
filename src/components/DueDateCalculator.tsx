import React, { useState } from 'react';
import { Calendar, Heart, Sparkles, SlidersHorizontal, Info } from 'lucide-react';
import { formatDateISO, addDays } from '../services/calendarService';

export type CalculationMode = 'lmp' | 'dueDate' | 'conception' | 'currentWeek';

interface DueDateCalculatorProps {
  lmpDate: Date;
  onLmpChange: (date: Date) => void;
  startWeek: number;
  onStartWeekChange: (week: number) => void;
  weeksCount: number;
  onWeeksCountChange: (count: number) => void;
  onApplyPreset?: (startWeek: number, count: number) => void;
}

export const DueDateCalculator: React.FC<DueDateCalculatorProps> = ({
  lmpDate,
  onLmpChange,
  startWeek,
  onStartWeekChange,
  weeksCount,
  onWeeksCountChange,
  onApplyPreset,
}) => {
  const [mode, setMode] = useState<CalculationMode>('lmp');

  // Derived dates
  const dueDate = addDays(lmpDate, 280);
  const conceptionDate = addDays(lmpDate, 14);

  // Today calculations
  const today = new Date();
  const diffTime = today.getTime() - lmpDate.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentWeekNum = Math.max(1, Math.min(42, Math.floor(totalDays / 7) + 1));
  const currentDayInWeek = Math.max(0, totalDays % 7);

  // Reset to the requested July 18, 2026
  const handleResetToJul18 = () => {
    onLmpChange(new Date(2026, 6, 18));
    setMode('lmp');
  };

  // Form input handlers
  const handleDueDateInput = (val: string) => {
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    const chosenDue = new Date(y, m - 1, d);
    // LMP is 280 days before Due Date
    const calculatedLmp = addDays(chosenDue, -280);
    onLmpChange(calculatedLmp);
  };

  const handleLmpInput = (val: string) => {
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    onLmpChange(new Date(y, m - 1, d));
  };

  const handleConceptionInput = (val: string) => {
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    const calculatedLmp = addDays(new Date(y, m - 1, d), -14);
    onLmpChange(calculatedLmp);
  };

  const handleCurrentWeekInput = (weekNumber: number) => {
    // If today is Week X: LMP was (weekNumber - 1) * 7 days ago
    const calculatedLmp = addDays(new Date(), -(weekNumber - 1) * 7);
    onLmpChange(calculatedLmp);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100/80 mb-8 transition-all">
      {/* Top Banner highlighting Week 1 = July 18, 2026 */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                Configured Timeline
              </span>
              <span className="px-2 py-0.5 bg-rose-200 text-rose-800 text-[11px] font-bold rounded-full">
                Week 1: July 18, 2026
              </span>
            </div>
            <p className="text-xs text-gray-700 mt-0.5">
              Week 1 begins <strong>Saturday, July 18, 2026</strong> • Estimated Due Date (Week 40) is <strong>Saturday, April 24, 2027</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetToJul18}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-100/60 rounded-xl border border-rose-200 shadow-xs transition-colors cursor-pointer"
        >
          Reset to July 18, 2026
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-rose-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500" />
            Personalize Your Milestone Timeline
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Pregnancy Calculator & Milestone Scheduler
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Generate your 36 weekly milestone events in Google Calendar starting from Week 1 (July 18, 2026).
          </p>
        </div>

        {/* Mode selector pills */}
        <div className="flex flex-wrap p-1 bg-gray-100/80 rounded-2xl gap-1 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setMode('lmp')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              mode === 'lmp'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Week 1 (LMP)
          </button>
          <button
            type="button"
            onClick={() => setMode('dueDate')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              mode === 'dueDate'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Due Date
          </button>
          <button
            type="button"
            onClick={() => setMode('conception')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              mode === 'conception'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Conception Date
          </button>
          <button
            type="button"
            onClick={() => setMode('currentWeek')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              mode === 'currentWeek'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Current Week
          </button>
        </div>
      </div>

      {/* Quick 1-Click Preset Schedule Buttons */}
      <div className="py-4 border-b border-rose-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-1">
          Quick Range Presets:
        </span>
        <button
          type="button"
          onClick={() => {
            if (onApplyPreset) onApplyPreset(1, 36);
            else {
              onStartWeekChange(1);
              onWeeksCountChange(36);
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            startWeek === 1 && weeksCount === 36
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
          }`}
        >
          ✨ 36 Weeks (W1 → W36: Jul 18 – Mar 20)
        </button>
        <button
          type="button"
          onClick={() => {
            if (onApplyPreset) onApplyPreset(5, 36);
            else {
              onStartWeekChange(5);
              onWeeksCountChange(36);
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            startWeek === 5 && weeksCount === 36
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
          }`}
        >
          🎯 36 Weeks to Due Date (W5 → W40: Aug 15 – Apr 24)
        </button>
        <button
          type="button"
          onClick={() => {
            if (onApplyPreset) onApplyPreset(1, 40);
            else {
              onStartWeekChange(1);
              onWeeksCountChange(40);
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            startWeek === 1 && weeksCount === 40
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
          }`}
        >
          🌸 All 40 Weeks (W1 → W40)
        </button>
        <button
          type="button"
          onClick={() => {
            const count = Math.max(1, 40 - currentWeekNum + 1);
            if (onApplyPreset) onApplyPreset(currentWeekNum, count);
            else {
              onStartWeekChange(currentWeekNum);
              onWeeksCountChange(count);
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            startWeek === currentWeekNum
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
          }`}
        >
          ⏱️ From Today (W{currentWeekNum} → W40)
        </button>
      </div>

      {/* Date inputs according to chosen mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="space-y-2">
          {mode === 'dueDate' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Estimated Due Date (EDD)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formatDateISO(dueDate)}
                  onChange={(e) => handleDueDateInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium text-sm focus:ring-2 focus:ring-rose-400 focus:border-rose-400 focus:bg-white transition-all cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                40-week benchmark provided by doctor/ultrasound
              </p>
            </div>
          )}

          {mode === 'lmp' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                First Day of Last Period (LMP)
              </label>
              <input
                type="date"
                value={formatDateISO(lmpDate)}
                onChange={(e) => handleLmpInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium text-sm focus:ring-2 focus:ring-rose-400 focus:border-rose-400 focus:bg-white transition-all cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Standard clinical formula starts at LMP Day 1
              </p>
            </div>
          )}

          {mode === 'conception' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Estimated Conception / Ovulation Date
              </label>
              <input
                type="date"
                value={formatDateISO(conceptionDate)}
                onChange={(e) => handleConceptionInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-medium text-sm focus:ring-2 focus:ring-rose-400 focus:border-rose-400 focus:bg-white transition-all cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Estimated 38 weeks (266 days) from conception
              </p>
            </div>
          )}

          {mode === 'currentWeek' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                What week are you in right now?
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={currentWeekNum}
                  onChange={(e) => handleCurrentWeekInput(Number(e.target.value))}
                  className="w-24 px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 font-bold text-base focus:ring-2 focus:ring-rose-400 focus:border-rose-400 focus:bg-white transition-all"
                />
                <span className="text-sm font-medium text-gray-600">
                  weeks pregnant today
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                We'll reverse-calculate your due date and milestones
              </p>
            </div>
          )}
        </div>

        {/* 36-week schedule options */}
        <div className="space-y-3 bg-rose-50/40 p-4 rounded-2xl border border-rose-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
              Calendar Event Range
            </label>
            <span className="text-xs font-bold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full">
              {weeksCount} Events
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-gray-600 font-medium mb-1">
                Start Week:
              </label>
              <select
                value={startWeek}
                onChange={(e) => {
                  const newStart = Number(e.target.value);
                  onStartWeekChange(newStart);
                }}
                className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-rose-400 cursor-pointer"
              >
                <option value={5}>Week 5 (Standard 36 Wk plan)</option>
                <option value={1}>Week 1 (Conception to W36)</option>
                <option value={currentWeekNum}>
                  Current Week ({currentWeekNum})
                </option>
                {[...Array(35)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Week {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-600 font-medium mb-1">
                Number of Weeks:
              </label>
              <select
                value={weeksCount}
                onChange={(e) => onWeeksCountChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-rose-400 cursor-pointer"
              >
                <option value={36}>36 weekly events (Requested)</option>
                <option value={40}>40 weekly events (Full Term)</option>
                <option value={20}>20 weekly events</option>
                <option value={12}>12 weekly events (1 Trimester)</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-rose-700/80 flex items-center gap-1 leading-relaxed">
            <Info className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            Scheduling Weeks {startWeek} through {Math.min(40, startWeek + weeksCount - 1)} will create {weeksCount} weekly events on your calendar.
          </p>
        </div>

        {/* Calculated summary card */}
        <div className="bg-gradient-to-br from-amber-50/60 to-rose-50/80 p-4 rounded-2xl border border-rose-100 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Calculated Milestones
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Estimated Due Date:</span>
                <span className="font-bold text-gray-900">
                  {dueDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Current Progress:</span>
                <span className="font-bold text-rose-600">
                  Week {currentWeekNum} ({currentDayInWeek}d)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Trimester:</span>
                <span className="font-semibold text-gray-800">
                  {currentWeekNum <= 13
                    ? '1st Trimester'
                    : currentWeekNum <= 27
                    ? '2nd Trimester'
                    : '3rd Trimester'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-rose-200/60 flex items-center justify-between text-xs text-rose-800">
            <span>Countdown to Due Date:</span>
            <span className="font-black text-rose-600 bg-white px-2 py-0.5 rounded-lg border border-rose-200">
              {Math.max(0, 280 - totalDays)} days left
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
