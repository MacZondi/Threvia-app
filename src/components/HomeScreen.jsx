import React from 'react';
import { useDataContext } from '../contexts/DataContext';

/**
 * HomeScreen Component - Main dashboard after login
 * Shows:
 * - Data session remaining
 * - Points & Threvia Bucks
 * - Feature modules (Education, Health, Research, Maps, etc.)
 * - Next ad timer
 */
const HomeScreen = ({ user }) => {
  const {
    isSessionActive,
    timeRemaining,
    percentRemaining,
    points,
    threvBucks,
    nextAdTime,
    firstAdWatched,
  } = useDataContext();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const modules = [
    {
      id: 'education',
      icon: '📚',
      label: 'Education',
      description: 'Study guides, exams, learning resources',
      requiresData: true,
      comingSoon: false,
    },
    {
      id: 'health',
      icon: '🏥',
      label: 'Health',
      description: 'Health info, clinic finder, sexual health',
      requiresData: true,
      comingSoon: false,
    },
    {
      id: 'research',
      icon: '🔬',
      label: 'Research',
      description: 'Research tools, academic databases',
      requiresData: true,
      comingSoon: false,
    },
    {
      id: 'maps',
      icon: '📍',
      label: 'Maps & Clinics',
      description: 'Find clinics, hospitals, services near you',
      requiresData: true,
      comingSoon: false,
    },
    {
      id: 'chat',
      icon: '💬',
      label: 'Chat with Threvia',
      description: 'AI-powered health chatbot',
      requiresData: true,
      comingSoon: false,
    },
    {
      id: 'documents',
      icon: '📄',
      label: 'My Documents',
      description: 'Store & manage health records',
      requiresData: true,
      comingSoon: true,
    },
    {
      id: 'premium',
      icon: '⭐',
      label: 'Premium Features',
      description: 'Unlock with Threvia Bucks',
      requiresData: false,
      comingSoon: true,
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      description: 'Account, reminders, preferences',
      requiresData: false,
      comingSoon: false,
    },
  ];

  const handleModuleClick = (module) => {
    if (module.comingSoon) {
      alert('🚀 Coming Soon!');
      return;
    }

    if (module.requiresData && !isSessionActive) {
      alert('📺 Watch an ad to get free data access!');
      return;
    }

    // Navigate to module
    console.log('Navigate to:', module.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 text-white">
      {/* Header with Status Cards */}
      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Welcome */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-gray-400 text-sm">
              {!firstAdWatched && '👉 Watch an ad to unlock free data access'}
              {firstAdWatched && isSessionActive && '🎉 You have free data access!'}
              {firstAdWatched && !isSessionActive && '⏰ Your data session expired. Watch an ad for more!'}
            </p>
          </div>

          {/* Status Cards Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Data Session Card */}
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-300 text-sm font-semibold">Data Time</span>
                <span className="text-2xl">⏱️</span>
              </div>
              {isSessionActive ? (
                <>
                  <div className="text-3xl font-bold text-blue-400">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="w-full bg-blue-900/50 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300"
                      style={{ width: `${percentRemaining}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Active session</p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-500">No Data</div>
                  <p className="text-xs text-gray-400 mt-1">Watch an ad to activate</p>
                </>
              )}
            </div>

            {/* Points Card */}
            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-400/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-300 text-sm font-semibold">Points</span>
                <span className="text-2xl">⭐</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400">{points}</div>
              <p className="text-xs text-gray-400 mt-1">
                {Math.floor(points / 100)} THREV (next at {((points % 100) === 0 ? 100 : (100 - (points % 100)))})
              </p>
            </div>

            {/* Threvia Bucks Card */}
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-400/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 text-sm font-semibold">Threvia Bucks</span>
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">{threvBucks.toFixed(1)}</div>
              <p className="text-xs text-gray-400 mt-1">THREV tokens</p>
            </div>
          </div>

          {/* Next Ad Timer */}
          {firstAdWatched && isSessionActive && nextAdTime > 0 && (
            <div className="mt-3 bg-red-600/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-3">
              <span className="text-red-400 font-bold">🎬</span>
              <div>
                <p className="text-sm text-red-300">Next ad in: <span className="font-bold">{formatTime(nextAdTime)}</span></p>
                <p className="text-xs text-gray-400">Can't skip - earns you 50 points!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 pb-20">
        {/* First Ad CTA */}
        {!firstAdWatched && (
          <div className="mb-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 border-2 border-green-500/50 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">🎁 Get 25 Minutes Free Data</h2>
            <p className="text-gray-300 mb-4">
              Watch one quick ad and unlock free data to explore education, health, research & maps!
            </p>
            <button
              onClick={() => window.scrollTo(0, 0)}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105"
            >
              Watch Ad Now
            </button>
          </div>
        )}

        {/* Modules Grid */}
        <div>
          <h2 className="text-xl font-bold mb-4">Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map(module => (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module)}
                disabled={module.comingSoon}
                className={`relative group rounded-lg border transition-all duration-300 p-4 text-left ${
                  module.comingSoon
                    ? 'bg-gray-800/50 border-gray-700/50 opacity-60 cursor-not-allowed'
                    : module.requiresData && !isSessionActive
                    ? 'bg-yellow-900/30 border-yellow-700/50 hover:bg-yellow-900/50 hover:border-yellow-600'
                    : 'bg-gradient-to-br from-purple-700/40 to-blue-700/40 border-purple-500/30 hover:from-purple-700/60 hover:to-blue-700/60 hover:border-purple-500/60 cursor-pointer'
                }`}
              >
                {/* Coming Soon Badge */}
                {module.comingSoon && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-xs font-bold px-2 py-1 rounded">
                    Soon
                  </div>
                )}

                {/* Lock Icon */}
                {module.requiresData && !isSessionActive && (
                  <div className="absolute top-2 right-2 text-yellow-500 text-xl">🔒</div>
                )}

                <div className="text-4xl mb-2">{module.icon}</div>
                <h3 className="font-bold mb-1">{module.label}</h3>
                <p className="text-xs text-gray-400">{module.description}</p>

                {module.requiresData && !isSessionActive && (
                  <p className="text-xs text-yellow-400 mt-2 font-semibold">Watch ad to unlock</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Ads Watched</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Data Sessions</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Streak (Days)</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
