import React, { useState } from 'react';
import { ExistingCalendarEvent } from '../services/calendarService';
import { Calendar, Trash2, ExternalLink, X, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ExistingEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: ExistingCalendarEvent[];
  isLoading: boolean;
  onRefresh: () => void;
  onDeleteEvents: (eventIds: string[]) => Promise<void>;
}

export const ExistingEventsModal: React.FC<ExistingEventsModalProps> = ({
  isOpen,
  onClose,
  events,
  isLoading,
  onRefresh,
  onDeleteEvents,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true);
      const ids = events.map((e) => e.id);
      await onDeleteEvents(ids);
      setDeleteStatus(`Successfully removed ${ids.length} events.`);
      setShowConfirmDelete(false);
    } catch (err: any) {
      setDeleteStatus(`Failed to delete: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gray-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Synced Google Calendar Events
              </h3>
              <p className="text-xs text-gray-400">
                {events.length} pregnancy events detected in your calendar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              title="Refresh events list"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Banner (Mandatory destructive operation confirmation) */}
        {showConfirmDelete && (
          <div className="p-4 bg-red-50 border-b border-red-200 shrink-0">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-red-900">
                  Delete all {events.length} pregnancy events from Google Calendar?
                </h4>
                <p className="text-xs text-red-700 mt-0.5">
                  This will remove the selected pregnancy milestone events from your calendar. You can always re-sync them afterwards.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleDeleteAll}
                    disabled={isDeleting}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete Events'}
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    disabled={isDeleting}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteStatus && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{deleteStatus}</span>
          </div>
        )}

        {/* Events list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
              Loading events from Google Calendar...
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs space-y-2">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-700">No pregnancy events found yet</p>
              <p className="text-gray-400 max-w-xs mx-auto">
                Use the "Sync to Google Calendar" button on the main screen to create your 36 weekly milestone events.
              </p>
            </div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl border border-gray-200 hover:border-rose-200 hover:bg-rose-50/30 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="truncate flex-1">
                  <p className="font-bold text-gray-900 truncate">{ev.summary}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    Date:{' '}
                    <span className="font-mono text-gray-700">
                      {ev.start.date || ev.start.dateTime || 'All Day'}
                    </span>
                  </p>
                </div>
                {ev.htmlLink && (
                  <a
                    href={ev.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Open event in Google Calendar"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div>
            {events.length > 0 && !showConfirmDelete && (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All ({events.length})</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
