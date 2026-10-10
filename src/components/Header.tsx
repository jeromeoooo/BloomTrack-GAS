import React from 'react';
import { User } from 'firebase/auth';
import { Calendar, CheckCircle2, LogOut, Sparkles, RefreshCw } from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';

interface HeaderProps {
  user: User | null;
  hasToken: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onOpenExistingEvents: () => void;
  existingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  hasToken,
  onLogin,
  onLogout,
  isLoggingIn,
  onOpenExistingEvents,
  existingCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-400 via-pink-400 to-amber-300 flex items-center justify-center shadow-sm text-white text-xl">
              🌸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  Bloom<span className="text-rose-500">Track</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                  <Sparkles className="w-3 h-3 mr-1" /> 36-Week Calendar
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Weekly pregnancy milestones & Google Calendar sync
              </p>
            </div>
          </div>

          {/* Right actions: Google connection & user status */}
          <div className="flex items-center gap-3">
            {user && hasToken ? (
              <div className="flex items-center gap-2">
                {/* Synced Events Manager Button */}
                <button
                  onClick={onOpenExistingEvents}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                  title="View already synced events in Google Calendar"
                >
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span className="hidden md:inline">Synced Events</span>
                  {existingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-xs font-semibold rounded-full">
                      {existingCount}
                    </span>
                  )}
                </button>

                {/* Profile Pill */}
                <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-gray-50 rounded-full border border-gray-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full object-cover border border-white"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">
                      {user.email ? user.email[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-medium text-gray-800 leading-tight">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Calendar linked
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Sign out"
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors ml-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : user && !hasToken ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-600 hidden sm:inline">
                  Authorize Google Calendar:
                </span>
                <GoogleSignInButton
                  onClick={onLogin}
                  isLoading={isLoggingIn}
                  label="Authorize Calendar"
                />
              </div>
            ) : (
              <GoogleSignInButton
                onClick={onLogin}
                isLoading={isLoggingIn}
                label="Sign in with Google"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
