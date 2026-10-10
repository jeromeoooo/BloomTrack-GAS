import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setCachedAccessToken,
} from './services/firebase';
import {
  formatDateISO,
  addDays,
  getWeekStartDate,
  buildEventDescription,
  createGoogleCalendarEvent,
  fetchExistingPregnancyEvents,
  deleteGoogleCalendarEvent,
  generateICSContent,
  CalendarEventPayload,
  ExistingCalendarEvent,
} from './services/calendarService';
import {
  PREGNANCY_WEEKS,
  PregnancyWeekInfo,
  getMilestoneWeeks,
} from './data/pregnancyMilestones';
import { Header } from './components/Header';
import { DueDateCalculator } from './components/DueDateCalculator';
import { CurrentWeekHero } from './components/CurrentWeekHero';
import { MilestoneList } from './components/MilestoneList';
import { CalendarSyncModal } from './components/CalendarSyncModal';
import { ExistingEventsModal } from './components/ExistingEventsModal';
import { DailySymptomTracker } from './components/DailySymptomTracker';
import { FetalGrowthChart } from './components/FetalGrowthChart';
import {
  SymptomLog,
  subscribeUserSymptomLogs,
} from './services/symptomService';
import { testFirestoreConnection } from './services/firebase';
import { Sparkles, Calendar, Heart, ShieldCheck, FileText } from 'lucide-react';

export default function App() {
  // Authentication & token state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active view tab: 'calendar' or 'symptoms'
  const [activeTab, setActiveTab] = useState<'calendar' | 'symptoms'>('calendar');

  // Firestore symptom logs
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);

  // Configured LMP: Week 1 begins July 18, 2026
  const [lmpDate, setLmpDate] = useState<Date>(() => new Date(2026, 6, 18)); // July 18, 2026

  // Week range configurations (Default: 36 weekly events starting from Week 1: Weeks 1 through 36)
  const [startWeek, setStartWeek] = useState<number>(1);
  const [weeksCount, setWeeksCount] = useState<number>(36);

  // Selected weeks set (Default: Weeks 1 to 36)
  const [selectedWeeks, setSelectedWeeks] = useState<Set<number>>(() => {
    const set = new Set<number>();
    for (let i = 1; i <= 36; i++) {
      set.add(i);
    }
    return set;
  });

  // Custom event summaries edited by the user
  const [customSummaries, setCustomSummaries] = useState<Record<number, string>>({});

  // Existing events loaded from user's Google Calendar
  const [existingEvents, setExistingEvents] = useState<ExistingCalendarEvent[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  // Modals
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isExistingModalOpen, setIsExistingModalOpen] = useState(false);

  // In-flight calendar sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{
    current: number;
    total: number;
    currentEventName: string;
  } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        if (currentToken) {
          setToken(currentToken);
        }
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Validate Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Subscribe to Firestore symptom logs when user is authenticated
  useEffect(() => {
    if (!user) {
      setSymptomLogs([]);
      return;
    }
    const unsubscribe = subscribeUserSymptomLogs(user.uid, (data) => {
      setSymptomLogs(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Update selected weeks when startWeek or weeksCount changes
  const updateRangeSelection = (newStart: number, newCount: number) => {
    const set = new Set<number>();
    for (let i = newStart; i < newStart + newCount && i <= 40; i++) {
      set.add(i);
    }
    setSelectedWeeks(set);
  };

  const handleStartWeekChange = (newStart: number) => {
    setStartWeek(newStart);
    updateRangeSelection(newStart, weeksCount);
  };

  const handleWeeksCountChange = (newCount: number) => {
    setWeeksCount(newCount);
    updateRangeSelection(startWeek, newCount);
  };

  const handleApplyPreset = (newStart: number, newCount: number) => {
    setStartWeek(newStart);
    setWeeksCount(newCount);
    updateRangeSelection(newStart, newCount);
  };

  // Google Sign-in handler
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        // Automatically check for existing events
        loadExistingEvents(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setExistingEvents([]);
  };

  // Load existing events from Google Calendar
  const loadExistingEvents = useCallback(async (activeToken?: string) => {
    const currentToken = activeToken || token;
    if (!currentToken) return;

    try {
      setIsLoadingExisting(true);
      const items = await fetchExistingPregnancyEvents(currentToken);
      setExistingEvents(items);
    } catch (err) {
      console.warn('Could not fetch existing events:', err);
    } finally {
      setIsLoadingExisting(false);
    }
  }, [token]);

  // Load events once token is available
  useEffect(() => {
    if (token) {
      loadExistingEvents(token);
    }
  }, [token, loadExistingEvents]);

  // Compute date for any given week
  const getWeekDateStr = useCallback(
    (weekNumber: number) => {
      const d = getWeekStartDate(lmpDate, weekNumber);
      return formatDateISO(d);
    },
    [lmpDate]
  );

  // Compute pregnancy progress today
  const today = new Date();
  const diffTime = today.getTime() - lmpDate.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentWeekNum = Math.max(1, Math.min(42, Math.floor(totalDays / 7) + 1));

  // Build the list of active milestone weeks to display
  const milestoneWeeks = useMemo(() => {
    return PREGNANCY_WEEKS;
  }, []);

  // Prepare events to sync
  const eventsToSync: CalendarEventPayload[] = useMemo(() => {
    return PREGNANCY_WEEKS.filter((w) => selectedWeeks.has(w.week)).map((w) => {
      const dateStr = getWeekDateStr(w.week);
      const summary =
        customSummaries[w.week] ||
        `🌸 Pregnancy Week ${w.week}: Baby is size of a ${w.sizeFruit}! ${w.sizeEmoji}`;
      const description = buildEventDescription(w, dateStr);

      return {
        week: w.week,
        date: dateStr,
        summary,
        description,
        sizeFruit: w.sizeFruit,
        sizeEmoji: w.sizeEmoji,
        selected: true,
      };
    });
  }, [selectedWeeks, customSummaries, getWeekDateStr]);

  // Toggle individual week selection
  const handleToggleWeek = (week: number) => {
    setSelectedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) {
        next.delete(week);
      } else {
        next.add(week);
      }
      return next;
    });
  };

  // Select/Deselect all
  const handleSelectAll = () => {
    const all = new Set<number>();
    PREGNANCY_WEEKS.forEach((w) => all.add(w.week));
    setSelectedWeeks(all);
  };

  const handleDeselectAll = () => {
    setSelectedWeeks(new Set());
  };

  // Update summary note for an individual week
  const handleUpdateSummary = (week: number, summary: string) => {
    setCustomSummaries((prev) => ({
      ...prev,
      [week]: summary,
    }));
  };

  // Scroll to week card smoothly
  const handleScrollToWeek = (week: number) => {
    const el = document.getElementById(`week-card-${week}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Trigger Open Sync Modal (checks auth first)
  const handleOpenSyncModal = async () => {
    if (!token) {
      // Prompt sign in
      try {
        setIsLoggingIn(true);
        const res = await googleSignIn();
        if (res) {
          setUser(res.user);
          setToken(res.accessToken);
          setIsSyncModalOpen(true);
          loadExistingEvents(res.accessToken);
        }
      } catch (err: any) {
        console.error('Failed to sign in:', err);
      } finally {
        setIsLoggingIn(false);
      }
      return;
    }
    setSyncSuccess(false);
    setSyncError(null);
    setSyncProgress(null);
    setIsSyncModalOpen(true);
  };

  // Batch create calendar events after user confirmation
  const handleConfirmSync = async () => {
    let activeToken = token || (await getAccessToken());
    if (!activeToken) {
      // Interactive login fallback if token expired
      const res = await googleSignIn();
      if (!res) {
        setSyncError('Authentication is required to add events to Google Calendar.');
        return;
      }
      activeToken = res.accessToken;
      setToken(activeToken);
      setUser(res.user);
    }

    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);

    const total = eventsToSync.length;
    let createdCount = 0;

    try {
      for (const ev of eventsToSync) {
        setSyncProgress({
          current: createdCount + 1,
          total,
          currentEventName: ev.summary,
        });

        await createGoogleCalendarEvent(activeToken, {
          summary: ev.summary,
          description: ev.description,
          date: ev.date,
          week: ev.week,
        });

        createdCount++;
        // Polite delay between API calls to prevent rate limits
        await new Promise((r) => setTimeout(r, 120));
      }

      setSyncSuccess(true);
      // Refresh existing events list
      loadExistingEvents(activeToken);
    } catch (err: any) {
      console.error('Error batch syncing:', err);
      setSyncError(
        err.message ||
          'Failed to sync all events. Please check your internet connection and try again.'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle deleting events from existing events modal
  const handleDeleteEvents = async (eventIds: string[]) => {
    const activeToken = token || (await getAccessToken());
    if (!activeToken) throw new Error('Not authenticated');

    for (const id of eventIds) {
      await deleteGoogleCalendarEvent(activeToken, id);
      await new Promise((r) => setTimeout(r, 80));
    }

    // Refresh existing list
    await loadExistingEvents(activeToken);
  };

  // Download .ics file
  const handleDownloadIcs = () => {
    const icsString = generateICSContent(eventsToSync);
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pregnancy_Milestones_36_Weeks.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-amber-50/20 text-gray-900 font-sans">
      {/* Top Navigation */}
      <Header
        user={user}
        hasToken={Boolean(token)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        onOpenExistingEvents={() => setIsExistingModalOpen(true)}
        existingCount={existingEvents.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Week 1 starts July 18, 2026 • 36 Weekly Events for Google Calendar
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Never wonder which week you're on.
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Schedule 36 weekly milestone events directly onto your Google Calendar with adorable fruit size comparisons, fetal developmental updates, and mom health tips for each week.
          </p>
        </div>

        {/* Current Week Hero Spotlight */}
        <CurrentWeekHero
          currentWeekNum={currentWeekNum}
          totalDays={totalDays}
          onScrollToWeek={handleScrollToWeek}
          onOpenSyncModal={handleOpenSyncModal}
          selectedCount={eventsToSync.length}
        />

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-xs border border-rose-100 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>36-Week Calendar Sync</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('symptoms')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'symptoms'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Heart className="w-4 h-4 fill-rose-300" />
              <span>Daily Symptom & Cravings Log</span>
              {symptomLogs.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-xs font-black ${
                    activeTab === 'symptoms'
                      ? 'bg-white text-rose-600'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {symptomLogs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'calendar' ? (
          <>
            {/* Due Date & Milestone Calculator */}
            <DueDateCalculator
              lmpDate={lmpDate}
              onLmpChange={setLmpDate}
              startWeek={startWeek}
              onStartWeekChange={handleStartWeekChange}
              weeksCount={weeksCount}
              onWeeksCountChange={handleWeeksCountChange}
              onApplyPreset={handleApplyPreset}
            />

            {/* Fetal Size & Weight Gain Projections Chart (Recharts) */}
            <FetalGrowthChart
              currentWeekNum={currentWeekNum}
              startWeek={startWeek}
              weeksCount={weeksCount}
              lmpDate={lmpDate}
              onSelectWeek={handleScrollToWeek}
            />

            {/* Milestone Timeline List */}
            <MilestoneList
              weeks={milestoneWeeks}
              lmpDate={lmpDate}
              selectedWeeks={selectedWeeks}
              onToggleWeek={handleToggleWeek}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              currentWeekNum={currentWeekNum}
              onOpenSyncModal={handleOpenSyncModal}
              onDownloadIcs={handleDownloadIcs}
              customSummaries={customSummaries}
              onUpdateSummary={handleUpdateSummary}
              getWeekDateStr={getWeekDateStr}
            />
          </>
        ) : (
          <DailySymptomTracker
            user={user}
            onLogin={handleLogin}
            isLoggingIn={isLoggingIn}
            lmpDate={lmpDate}
            logs={symptomLogs}
          />
        )}

        {/* Floating Quick Action for Mobile */}
        <div className="fixed bottom-5 right-5 sm:hidden z-40">
          <button
            type="button"
            onClick={handleOpenSyncModal}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-rose-600 text-white font-bold text-sm shadow-xl hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Sync {eventsToSync.length} Weeks</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-rose-100 bg-white/70 py-8 text-center text-xs text-gray-500 space-y-2">
        <div className="flex items-center justify-center gap-1.5 font-medium text-gray-700">
          <span>BloomTrack • 36 Weekly Pregnancy Events</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-600">
            <ShieldCheck className="w-3.5 h-3.5" /> Google Calendar API
          </span>
        </div>
        <p className="max-w-md mx-auto text-gray-400 text-[11px]">
          Fetal size comparisons and milestones are based on medical guidelines from the American College of Obstetricians and Gynecologists (ACOG). Always consult your OB-GYN or midwife for medical advice.
        </p>
      </footer>

      {/* Confirmation & Sync Modal */}
      <CalendarSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onConfirm={handleConfirmSync}
        eventsToCreate={eventsToSync}
        isSyncing={isSyncing}
        syncProgress={syncProgress}
        syncError={syncError}
        syncSuccess={syncSuccess}
        userEmail={user?.email}
      />

      {/* Existing Events View & Delete Modal */}
      <ExistingEventsModal
        isOpen={isExistingModalOpen}
        onClose={() => setIsExistingModalOpen(false)}
        events={existingEvents}
        isLoading={isLoadingExisting}
        onRefresh={() => loadExistingEvents()}
        onDeleteEvents={handleDeleteEvents}
      />
    </div>
  );
}
