import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  SymptomLog,
  MorningSicknessLevel,
  saveDailySymptomLog,
  deleteSymptomLog,
} from '../services/symptomService';
import { formatDateISO, addDays } from '../services/calendarService';
import {
  Heart,
  Sparkles,
  Zap,
  Coffee,
  CheckCircle2,
  Trash2,
  Calendar,
  AlertCircle,
  Plus,
  Loader2,
  Droplets,
  BookOpen,
  ChevronRight,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';

interface DailySymptomTrackerProps {
  user: User | null;
  onLogin: () => void;
  isLoggingIn: boolean;
  lmpDate: Date;
  logs: SymptomLog[];
}

const COMMON_SYMPTOMS = [
  'Nausea',
  'Fatigue',
  'Bloating',
  'Heartburn',
  'Food Aversions',
  'Headache',
  'Back Pain',
  'Tender Breasts',
  'Mood Swings',
  'Dizziness',
  'Cramping',
  'Insomnia',
];

const CRAVING_SUGGESTIONS = [
  'Pickles 🥒',
  'Ice Cream 🍦',
  'Citrus / Lemons 🍋',
  'Fresh Fruit 🍓',
  'Salty Chips 🥔',
  'Spicy Food 🌶️',
  'Cheese 🧀',
  'Chocolate 🍫',
  'Soup 🍲',
];

export const DailySymptomTracker: React.FC<DailySymptomTrackerProps> = ({
  user,
  onLogin,
  isLoggingIn,
  lmpDate,
  logs,
}) => {
  // Selected date (defaults to today)
  const todayStr = formatDateISO(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Form states
  const [morningSickness, setMorningSickness] = useState<MorningSicknessLevel>('mild');
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [cravings, setCravings] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Fatigue']);
  const [notes, setNotes] = useState<string>('');
  const [waterGlasses, setWaterGlasses] = useState<number>(6);

  // Statuses
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute pregnancy week for selected date
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const daysFromLmp = Math.floor(
    (selectedDateObj.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weekForDate = Math.max(1, Math.min(42, Math.floor(daysFromLmp / 7) + 1));
  const dayInWeekForDate = Math.max(0, daysFromLmp % 7);

  // Populate form if existing log exists for selected date
  useEffect(() => {
    const existing = logs.find((l) => l.date === selectedDate);
    if (existing) {
      setMorningSickness(existing.morningSickness);
      setEnergyLevel(existing.energyLevel);
      setCravings(existing.cravings || '');
      setSelectedSymptoms(existing.symptoms || []);
      setNotes(existing.notes || '');
      setWaterGlasses(existing.waterGlasses || 0);
    } else {
      // Defaults for a new entry
      setMorningSickness('none');
      setEnergyLevel(3);
      setCravings('');
      setSelectedSymptoms([]);
      setNotes('');
      setWaterGlasses(6);
    }
    setSaveSuccess(false);
    setErrorMessage(null);
  }, [selectedDate, logs]);

  const handleToggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleAddCravingTag = (item: string) => {
    const cleaned = item.split(' ')[0]; // Take main word
    setCravings((prev) => (prev ? `${prev}, ${cleaned}` : cleaned));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('Please sign in with Google to save your symptom logs to Firestore.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      await saveDailySymptomLog(user.uid, {
        date: selectedDate,
        pregnancyWeek: weekForDate,
        morningSickness,
        energyLevel,
        cravings,
        symptoms: selectedSymptoms,
        notes,
        waterGlasses,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save log failed:', err);
      setErrorMessage(
        err.message || 'Could not save log to Firestore. Please verify your connection.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (dateStr: string) => {
    if (!user) return;
    try {
      await deleteSymptomLog(user.uid, dateStr);
    } catch (err: any) {
      console.error('Delete log failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100/80 mb-8 transition-all">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-rose-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500" />
            Daily Wellbeing & Firestore Sync
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Daily Pregnancy Symptom & Cravings Log
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Track your morning sickness, food cravings, and energy levels for every day of your pregnancy.
          </p>
        </div>

        {/* Auth prompt if not logged in */}
        {!user && (
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center gap-3">
            <div className="text-xs text-rose-800">
              <span className="font-bold block">Sign in to save to Firestore</span>
              <span>Sync logs across all your devices</span>
            </div>
            <GoogleSignInButton
              onClick={onLogin}
              isLoading={isLoggingIn}
              label="Sign In"
              className="py-1.5 px-3 text-xs"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Left Column: Interactive Form (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Date Selection & Week indicator */}
            <div className="bg-gradient-to-r from-rose-50/60 to-pink-50/60 p-4 rounded-2xl border border-rose-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Log Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-rose-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-rose-400 cursor-pointer"
                  />
                  {selectedDate !== todayStr && (
                    <button
                      type="button"
                      onClick={() => setSelectedDate(todayStr)}
                      className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Jump to Today
                    </button>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-500 block">Pregnancy Milestone</span>
                <span className="text-sm font-extrabold text-rose-600 bg-white px-3 py-1 rounded-xl border border-rose-200 inline-block shadow-2xs">
                  Week {weekForDate} • Day {dayInWeekForDate}
                </span>
              </div>
            </div>

            {/* Morning Sickness Tracker */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Morning Sickness / Nausea Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'none', label: 'None', emoji: '😊', color: 'border-emerald-200 hover:bg-emerald-50' },
                    { id: 'mild', label: 'Mild', emoji: '🙂', color: 'border-amber-200 hover:bg-amber-50' },
                    { id: 'moderate', label: 'Moderate', emoji: '🤢', color: 'border-orange-200 hover:bg-orange-50' },
                    { id: 'severe', label: 'Severe', emoji: '🤮', color: 'border-rose-200 hover:bg-rose-50' },
                  ] as const
                ).map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setMorningSickness(lvl.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      morningSickness === lvl.id
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs font-bold scale-[1.02]'
                        : `bg-white text-gray-700 ${lvl.color}`
                    }`}
                  >
                    <div className="text-2xl mb-1">{lvl.emoji}</div>
                    <div className="text-xs">{lvl.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level Scale */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                  Energy Level: {energyLevel} / 5
                </label>
                <span className="text-xs font-medium text-gray-500">
                  {energyLevel === 1 && 'Exhausted 😴'}
                  {energyLevel === 2 && 'Low energy 🥱'}
                  {energyLevel === 3 && 'Moderate / Okay 🙂'}
                  {energyLevel === 4 && 'Good energy ✨'}
                  {energyLevel === 5 && 'High energy! ⚡'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergyLevel(lvl)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      energyLevel === lvl
                        ? 'bg-amber-400 text-amber-950 shadow-xs scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Cravings Tracker */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Food Cravings Today
              </label>
              <input
                type="text"
                placeholder="e.g. Salt & vinegar chips, cold watermelon, citrus juice..."
                value={cravings}
                onChange={(e) => setCravings(e.target.value)}
                maxLength={500}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-gray-400 self-center">Quick add:</span>
                {CRAVING_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAddCravingTag(item)}
                    className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-medium border border-rose-200 transition-colors cursor-pointer"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Common Symptoms Checklist */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Active Symptoms
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SYMPTOMS.map((sym) => {
                  const isChecked = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleToggleSymptom(sym)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                        isChecked
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-rose-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hydration / Water Glasses */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  Water Intake: {waterGlasses} Glasses
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterGlasses((prev) => Math.min(20, prev + 1))}
                    className="w-7 h-7 rounded-lg bg-sky-100 hover:bg-sky-200 flex items-center justify-center font-bold text-sky-700 text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex gap-1 overflow-x-auto py-1">
                {[...Array(10)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setWaterGlasses(i + 1)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                      i < waterGlasses
                        ? 'bg-sky-500 text-white shadow-2xs'
                        : 'bg-sky-50 text-sky-300 border border-sky-100 hover:bg-sky-100'
                    }`}
                    title={`${i + 1} glasses`}
                  >
                    💧
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Daily Journal & Health Notes
              </label>
              <textarea
                rows={3}
                placeholder="How did you feel overall today? Any memorable movements, thoughts, or questions for your doctor?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all resize-none"
              />
            </div>

            {/* Feedback messages */}
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Log successfully saved to Cloud Firestore for {selectedDate}!</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Error: </span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-6 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save {selectedDate} Log to Firestore</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Recent Log History & Trends (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-500" />
              Logged History ({logs.length})
            </h3>
            <span className="text-xs text-gray-400">Synced to Firestore</span>
          </div>

          {logs.length === 0 ? (
            <div className="bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-xs text-gray-500 space-y-2">
              <Calendar className="w-7 h-7 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-700">No logs saved yet</p>
              <p className="text-gray-400 max-w-xs mx-auto">
                Fill out today's morning sickness, cravings, or energy above and click Save to record your first entry.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {logs.map((item) => {
                const isSelected = item.date === selectedDate;
                return (
                  <div
                    key={item.date}
                    onClick={() => setSelectedDate(item.date)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50/80 border-rose-300 shadow-xs ring-1 ring-rose-400/30'
                        : 'bg-white border-gray-200/80 hover:border-rose-200 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          Wk {item.pregnancyWeek}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          ⚡ {item.energyLevel}/5
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.date);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Delete log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Sickness & Cravings tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                        Nausea:{' '}
                        <strong className="capitalize">{item.morningSickness}</strong>
                      </span>
                      {item.cravings && (
                        <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-100 truncate max-w-[180px]">
                          Craving: {item.cravings}
                        </span>
                      )}
                      {item.waterGlasses > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700">
                          💧 {item.waterGlasses}
                        </span>
                      )}
                    </div>

                    {/* Symptoms badges */}
                    {item.symptoms && item.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.symptoms.slice(0, 4).map((sym) => (
                          <span
                            key={sym}
                            className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded"
                          >
                            {sym}
                          </span>
                        ))}
                        {item.symptoms.length > 4 && (
                          <span className="text-[10px] text-gray-400">
                            +{item.symptoms.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Notes snippet */}
                    {item.notes && (
                      <p className="text-xs text-gray-600 italic line-clamp-2 bg-gray-50/60 p-2 rounded-xl">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
