import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AdModal from '../components/AdModal';

/**
 * DataContext - Manages ad system, data sessions, and points
 * Provides global state for:
 * - Current data session (25 minutes)
 * - Points accumulation
 * - Ad history & randomization
 * - Access control
 */

const DataContext = createContext();

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider');
  }
  return context;
};

// Sponsor pool with metadata
const SPONSORS = [
  {
    id: 'vodacom',
    name: 'Vodacom',
    tagline: 'Connecting South Africa',
    color: '#E60000',
    logo: '📡',
    adDuration: 15,
    category: 'telecom',
    adText: "Stay connected with Vodacom's best data deals. Unlimited social media from R29/month.",
    cta: 'Get a Deal',
    youtubeVideoIds: [
      'dQw4w9WgXcQ', // Example video IDs - replace with real Vodacom ads
      'jNQXAC9IVRw',
    ],
  },
  {
    id: 'capitec',
    name: 'Capitec Bank',
    tagline: 'Banking made simple',
    color: '#004A96',
    logo: '🏦',
    adDuration: 20,
    category: 'finance',
    adText: 'Open a Capitec account in minutes. Zero monthly fees.',
    cta: 'Open Account',
    youtubeVideoIds: [
      'dQw4w9WgXcQ',
      'jNQXAC9IVRw',
    ],
  },
  {
    id: 'nsfas',
    name: 'NSFAS',
    tagline: 'Funding your future',
    color: '#2d8a4e',
    logo: '🎓',
    adDuration: 12,
    category: 'education',
    adText: 'Apply for NSFAS bursary funding. Covers tuition & accommodation.',
    cta: 'Apply Now',
    youtubeVideoIds: [
      'dQw4w9WgXcQ',
    ],
  },
  {
    id: 'doh',
    name: 'Dept of Health',
    tagline: 'Your health, our priority',
    color: '#8B2020',
    logo: '❤️',
    adDuration: 10,
    category: 'health',
    adText: 'Free HIV testing & treatment at all public clinics.',
    cta: 'Find a Clinic',
    youtubeVideoIds: [
      'dQw4w9WgXcQ',
    ],
  },
  {
    id: 'mtn',
    name: 'MTN',
    tagline: 'Everywhere you go',
    color: '#cc9900',
    logo: '📶',
    adDuration: 15,
    category: 'telecom',
    adText: 'MTN Pulse: 1GB night data for just R10. Stream all night.',
    cta: 'Get Pulse',
    youtubeVideoIds: [
      'dQw4w9WgXcQ',
    ],
  },
];

/**
 * Get weighted random sponsor
 * Ensures no repeats within 24 hours
 */
const getRandomSponsor = (lastAdIds = []) => {
  const available = SPONSORS.filter(s => !lastAdIds.includes(s.id));
  if (available.length === 0) return SPONSORS[Math.floor(Math.random() * SPONSORS.length)];
  
  return available[Math.floor(Math.random() * available.length)];
};

/**
 * Get random video from sponsor
 */
const getRandomVideo = (sponsor) => {
  return sponsor.youtubeVideoIds[
    Math.floor(Math.random() * sponsor.youtubeVideoIds.length)
  ];
};

export const DataProvider = ({ children, userId }) => {
  // Session state
  const [dataSession, setDataSession] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds

  // Points & bucks
  const [points, setPoints] = useState(0);
  const [threvBucks, setThrevBucks] = useState(0);

  // Ad state
  const [currentAd, setCurrentAd] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [adHistory, setAdHistory] = useState([]);
  const [nextAdTime, setNextAdTime] = useState(0); // seconds until next ad

  // First ad tracking
  const [firstAdWatched, setFirstAdWatched] = useState(false);
  const [isFirstAdPending, setIsFirstAdPending] = useState(false);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/session`);
        const data = await response.json();
        
        setFirstAdWatched(data.firstAdWatched);
        setPoints(data.points);
        setThrevBucks(data.threvBucks);

        if (data.activeSession) {
          setDataSession(data.activeSession);
          setIsSessionActive(true);
          const remaining = new Date(data.activeSession.expiresAt) - new Date();
          setTimeRemaining(Math.max(0, Math.floor(remaining / 1000)));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId]);

  // Check if first ad should be shown
  useEffect(() => {
    if (!firstAdWatched && !isFirstAdPending) {
      setIsFirstAdPending(true);
      triggerFirstAd();
    }
  }, [firstAdWatched]);

  // Timer for data session (counts down every second)
  useEffect(() => {
    if (!isSessionActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsSessionActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionActive, timeRemaining]);

  // Timer for recurring ads (every 5 minutes)
  useEffect(() => {
    if (!isSessionActive || firstAdWatched === false) return;

    const timer = setInterval(() => {
      setNextAdTime(prev => {
        if (prev <= 1) {
          triggerRecurringAd();
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionActive, firstAdWatched]);

  /**
   * Trigger first ad immediately after login
   */
  const triggerFirstAd = useCallback(() => {
    const sponsor = getRandomSponsor();
    const videoId = getRandomVideo(sponsor);

    const ad = {
      id: `${sponsor.id}-${Date.now()}`,
      sponsorId: sponsor.id,
      sponsorName: sponsor.name,
      sponsorLogo: sponsor.logo,
      tagline: sponsor.tagline,
      adText: sponsor.adText,
      cta: sponsor.cta,
      youtubeVideoId: videoId,
      duration: sponsor.adDuration,
      type: 'first',
      timestamp: new Date(),
    };

    setCurrentAd(ad);
    setShowAd(true);
  }, []);

  /**
   * Trigger recurring ad every 5 minutes
   */
  const triggerRecurringAd = useCallback(() => {
    const lastAdIds = adHistory.slice(-3).map(ad => ad.sponsorId);
    const sponsor = getRandomSponsor(lastAdIds);
    const videoId = getRandomVideo(sponsor);

    const ad = {
      id: `${sponsor.id}-${Date.now()}`,
      sponsorId: sponsor.id,
      sponsorName: sponsor.name,
      sponsorLogo: sponsor.logo,
      tagline: sponsor.tagline,
      adText: sponsor.adText,
      cta: sponsor.cta,
      youtubeVideoId: videoId,
      duration: 30, // Recurring ads are always 30 seconds
      type: 'recurring',
      timestamp: new Date(),
    };

    setCurrentAd(ad);
    setShowAd(true);
  }, [adHistory]);

  /**
   * Handle ad completion
   */
  const handleAdComplete = useCallback(async (adMetadata) => {
    setShowAd(false);
    setAdHistory([...adHistory, adMetadata]);

    try {
      if (adMetadata.reward === '25_min_data') {
        // First ad - create session
        const response = await fetch(`/api/users/${userId}/session/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adId: adMetadata.adId,
            durationMinutes: 25,
          }),
        });

        const sessionData = await response.json();
        setDataSession(sessionData.session);
        setIsSessionActive(true);
        setTimeRemaining(25 * 60);
        setFirstAdWatched(true);
        setNextAdTime(5 * 60); // First recurring ad in 5 minutes

      } else if (adMetadata.reward === '50_points') {
        // Recurring ad - add points
        const newPoints = points + 50;
        setPoints(newPoints);

        // Update backend
        await fetch(`/api/users/${userId}/points/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            points: 50,
            adId: adMetadata.adId,
          }),
        });

        // Check for points → bucks conversion
        if (newPoints % 100 === 0) {
          convertPointsToBucks(newPoints / 100);
        }
      }
    } catch (error) {
      console.error('Failed to process ad completion:', error);
    }
  }, [points, userId, adHistory]);

  /**
   * Convert 100 points → 1 THREV token
   */
  const convertPointsToBucks = useCallback(async (buckAmount) => {
    try {
      const response = await fetch(`/api/users/${userId}/points/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threvAmount: buckAmount,
        }),
      });

      const data = await response.json();
      setThrevBucks(data.newBalance);
    } catch (error) {
      console.error('Failed to convert points to bucks:', error);
    }
  }, [userId]);

  /**
   * Skip first ad (can watch again for more data)
   */
  const skipFirstAd = useCallback(() => {
    setShowAd(false);
    // User can watch again later - first ad should trigger again in home screen
  }, []);

  const value = {
    // Session
    dataSession,
    isSessionActive,
    timeRemaining,
    percentRemaining: (timeRemaining / (25 * 60)) * 100,

    // Points & bucks
    points,
    threvBucks,

    // Ad state
    currentAd,
    showAd,
    adHistory,
    nextAdTime,
    firstAdWatched,

    // Actions
    triggerFirstAd,
    handleAdComplete,
    skipFirstAd,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
      {showAd && currentAd && (
        <AdModal
          adData={currentAd}
          onComplete={handleAdComplete}
          type={currentAd.type}
        />
      )}
    </DataContext.Provider>
  );
};

export default DataContext;
