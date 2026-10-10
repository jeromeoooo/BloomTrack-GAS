import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { CalendarEventPayload } from '../services/calendarService';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventsToCreate: CalendarEventPayload[];
  isSyncing: boolean;
  syncProgress: { current: number; total: number; currentEventName: string } | null;
  syncError: string | null;
  syncSuccess: boolean;
  userEmail?: string | null;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  eventsToCreate,
  isSyncing,
  syncProgress,
  syncError,
  syncSuccess,
  userEmail,
}) => {
  if (!isOpen) return null;

  const totalEvents = eventsToCreate.length;
  const firstEvent = eventsToCreate[0];
  const lastEvent = eventsToCreate[eventsToCreate.length - 1];

  const percent =
    syncProgress && syncProgress.total > 0
      ? Math.round((syncProgress.current / syncProgress.total) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Sync with Google Calendar</h3>
                <p className="text-xs text-rose-100">
                  Target: Primary Calendar {userEmail ? `(${userEmail})` : ''}
                </p>
              </div>
            </div>
            {!isSyncing && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          {syncSuccess ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">
                Milestones Successfully Added!
              </h4>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                All <strong>{totalEvents}</strong> weekly pregnancy milestones have been added to your Google Calendar. You can check them directly on your phone or Google Calendar app!
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : isSyncing ? (
            <div className="py-6 space-y-4 text-center">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Adding Events to Google Calendar...
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Creating {syncProgress?.current || 0} of {syncProgress?.total || totalEvents}
                </p>
                {syncProgress?.currentEventName && (
                  <p className="text-xs font-semibold text-rose-600 truncate max-w-xs mx-auto mt-0.5">
                    {syncProgress.currentEventName}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rose-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Please keep this window open while the events are being scheduled.
              </p>
            </div>
          ) : (
            <>
              {/* Clarification prompt as required by workspace skill */}
              <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-900 space-y-1">
                    <p className="font-bold text-sm">
                      Confirm creation of {totalEvents} events
                    </p>
                    <p className="text-rose-700 leading-relaxed">
                      With your permission, this app will create <strong>{totalEvents} weekly events</strong> on your primary Google Calendar from{' '}
                      <strong>{firstEvent?.date}</strong> to <strong>{lastEvent?.date}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick preview list of events to be created */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
                  Events to be added ({totalEvents})
                </div>
                <div className="divide-y divide-gray-100 text-xs">
                  {eventsToCreate.slice(0, 8).map((ev) => (
                    <div key={ev.week} className="px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span>{ev.sizeEmoji}</span>
                        <span className="font-semibold text-gray-800 truncate">
                          Week {ev.week}: {ev.sizeFruit}
                        </span>
                      </div>
                      <span className="text-gray-500 shrink-0 ml-2 font-mono text-[11px]">
                        {ev.date}
                      </span>
                    </div>
                  ))}
                  {totalEvents > 8 && (
                    <div className="px-3 py-2 text-center text-gray-400 italic bg-gray-50/50">
                      + {totalEvents - 8} more weekly milestone events up to Week {lastEvent?.week} ({lastEvent?.date})
                    </div>
                  )}
                </div>
              </div>

              {syncError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Sync failed: </span>
                    <span>{syncError}</span>
                  </div>
                </div>
              )}

              {/* Explicit confirmation actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Add {totalEvents} Events</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
