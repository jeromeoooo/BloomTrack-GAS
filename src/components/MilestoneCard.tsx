import React, { useState } from 'react';
import { PregnancyWeekInfo } from '../data/pregnancyMilestones';
import { Calendar, ChevronDown, ChevronUp, Sparkles, Check, Edit2 } from 'lucide-react';

interface MilestoneCardProps {
  info: PregnancyWeekInfo;
  dateStr: string;
  isSelected: boolean;
  onToggleSelect: (week: number) => void;
  isCurrentWeek: boolean;
  customSummary?: string;
  onUpdateSummary?: (week: number, summary: string) => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  info,
  dateStr,
  isSelected,
  onToggleSelect,
  isCurrentWeek,
  customSummary,
  onUpdateSummary,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(
    customSummary || `🌸 Week ${info.week}: Baby is the size of a ${info.sizeFruit}!`
  );

  const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const trimesterStyles = {
    1: 'bg-amber-50 text-amber-800 border-amber-200',
    2: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    3: 'bg-purple-50 text-purple-800 border-purple-200',
  }[info.trimester];

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (onUpdateSummary && titleInput.trim()) {
      onUpdateSummary(info.week, titleInput.trim());
    }
  };

  return (
    <div
      id={`week-card-${info.week}`}
      className={`rounded-2xl transition-all border ${
        isCurrentWeek
          ? 'bg-rose-50/70 border-rose-300 shadow-md ring-2 ring-rose-400/40'
          : isSelected
          ? 'bg-white border-gray-200 shadow-xs hover:border-rose-200 hover:shadow-sm'
          : 'bg-gray-50/60 border-gray-200/80 opacity-70'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Checkbox */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onToggleSelect(info.week)}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white border border-gray-300 text-transparent hover:border-rose-300'
              }`}
              title={isSelected ? 'Include in sync' : 'Excluded from sync'}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Fruit icon avatar */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${
              info.trimester === 1
                ? 'bg-amber-100/70'
                : info.trimester === 2
                ? 'bg-emerald-100/70'
                : 'bg-purple-100/70'
            }`}
          >
            {info.sizeEmoji}
          </div>

          {/* Core Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-extrabold text-base text-gray-900">
                Week {info.week}
              </span>

              {isCurrentWeek && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs animate-pulse">
                  Current Week
                </span>
              )}

              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${trimesterStyles}`}
              >
                Trimester {info.trimester}
              </span>

              <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {formattedDate}
              </span>
            </div>

            {/* Editable or static summary */}
            {isEditingTitle ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs border border-rose-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-rose-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="px-2.5 py-1 text-xs font-semibold bg-rose-500 text-white rounded-lg cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-1.5 mt-0.5">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {customSummary || `Size: ${info.sizeFruit} • ${info.headline}`}
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-500 rounded transition-opacity cursor-pointer"
                  title="Customize calendar title"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Baby stats pills */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                📏 {info.approxLength}
              </span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                ⚖️ {info.approxWeight}
              </span>
              {info.medicalMilestone && (
                <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-500" />
                  {info.medicalMilestone}
                </span>
              )}
            </div>
          </div>

          {/* Expand/Collapse toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            title={isExpanded ? 'Show less' : 'Show weekly details'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Expanded body with developmental insights and maternal tips */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-xs sm:text-sm pl-10 sm:pl-16">
            <div>
              <span className="font-bold text-gray-900 block mb-0.5">
                👶 Baby's Development this week:
              </span>
              <p className="text-gray-600 leading-relaxed">
                {info.babyDevelopment}
              </p>
            </div>
            <div>
              <span className="font-bold text-rose-800 block mb-0.5">
                💡 Mom's Body & Wellness Tip:
              </span>
              <p className="text-gray-600 leading-relaxed">{info.momBodyTips}</p>
            </div>
            <div className="pt-1 text-[11px] text-gray-400 italic">
              * This text will be included in your Google Calendar event notes for easy reference on your phone.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
