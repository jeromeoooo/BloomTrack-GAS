import React from 'react';
import { PREGNANCY_WEEKS, PregnancyWeekInfo } from '../data/pregnancyMilestones';
import { Heart, Sparkles, Activity, CalendarCheck, ArrowRight } from 'lucide-react';

interface CurrentWeekHeroProps {
  currentWeekNum: number;
  totalDays: number;
  onScrollToWeek: (week: number) => void;
  onOpenSyncModal: () => void;
  selectedCount: number;
}

export const CurrentWeekHero: React.FC<CurrentWeekHeroProps> = ({
  currentWeekNum,
  totalDays,
  onScrollToWeek,
  onOpenSyncModal,
  selectedCount,
}) => {
  const boundedWeek = Math.max(1, Math.min(40, currentWeekNum));
  const weekData: PregnancyWeekInfo =
    PREGNANCY_WEEKS.find((w) => w.week === boundedWeek) || PREGNANCY_WEEKS[0];

  const progressPercent = Math.min(100, Math.max(0, Math.round((boundedWeek / 40) * 100)));

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 text-white shadow-xl p-6 sm:p-10 mb-8">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Current week status */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold tracking-wide border border-white/20">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            Currently in Week {boundedWeek} • Trimester {weekData.trimester}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Baby is the size of a <span className="text-amber-200">{weekData.sizeFruit}</span>!
          </h2>

          <p className="text-rose-100 text-sm sm:text-base leading-relaxed max-w-xl">
            {weekData.babyDevelopment}
          </p>

          {/* Quick stats chips */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium flex items-center gap-1.5">
              <span>📏 Length:</span>
              <span className="font-bold text-white">{weekData.approxLength}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium flex items-center gap-1.5">
              <span>⚖️ Weight:</span>
              <span className="font-bold text-white">{weekData.approxWeight}</span>
            </div>
            {weekData.medicalMilestone && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-400/20 backdrop-blur-md border border-amber-300/30 text-xs font-medium text-amber-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{weekData.medicalMilestone}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-xs font-semibold text-rose-100 mb-1.5">
              <span>Pregnancy Progress</span>
              <span>{progressPercent}% (Week {boundedWeek} of 40)</span>
            </div>
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
              <div
                className="h-full bg-gradient-to-r from-amber-300 to-white rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Trimester markers */}
            <div className="flex justify-between text-[10px] text-rose-200/80 mt-1 font-medium px-1">
              <span>1st Trimester (W1-13)</span>
              <span>2nd Trimester (W14-27)</span>
              <span>3rd Trimester (W28-40)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Fruit graphic card & calendar sync trigger */}
        <div className="lg:col-span-5 flex flex-col items-center sm:items-end justify-center">
          <div className="w-full sm:max-w-xs bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center shadow-lg space-y-4">
            <div className="relative inline-block mx-auto">
              <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl shadow-inner border border-white/30 transform hover:scale-105 transition-transform">
                {weekData.sizeEmoji}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-rose-950 text-xs font-extrabold px-2 py-0.5 rounded-full shadow-md">
                Wk {boundedWeek}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-rose-200">
                Weekly Milestone
              </div>
              <div className="text-lg font-bold text-white mt-0.5">
                {weekData.headline}
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={onOpenSyncModal}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-rose-600 font-bold text-sm shadow-md hover:bg-rose-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 text-rose-600" />
                Sync {selectedCount} Weeks to Calendar
              </button>

              <button
                type="button"
                onClick={() => onScrollToWeek(boundedWeek)}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View Week {boundedWeek} Details in Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
