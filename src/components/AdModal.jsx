import React, { useState, useEffect, useCallback } from 'react';
import YouTube from 'react-youtube';

/**
 * AdModal Component - Unskippable advertisement display
 * Shows randomized YouTube ads with timer
 * Rewards: First ad = 25 min data, Recurring ads = 50 points
 */
const AdModal = ({ 
  adData, 
  onComplete, 
  type = 'recurring' // 'first' or 'recurring'
}) => {
  const [timeRemaining, setTimeRemaining] = useState(adData?.duration || 30);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSkipButton, setShowSkipButton] = useState(false);

  useEffect(() => {
    if (!isPlaying || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeRemaining]);

  // After 80% of ad, show skip button for first ad only
  useEffect(() => {
    if (type === 'first' && timeRemaining <= Math.ceil(adData.duration * 0.2)) {
      setShowSkipButton(true);
    }
  }, [timeRemaining, adData.duration, type]);

  const handleAdComplete = useCallback(() => {
    onComplete({
      adId: adData.id,
      sponsorId: adData.sponsorId,
      watchedDuration: adData.duration,
      timestamp: new Date(),
      reward: type === 'first' ? '25_min_data' : '50_points'
    });
  }, [adData, onComplete, type]);

  useEffect(() => {
    if (timeRemaining === 0 && !isPlaying) {
      handleAdComplete();
    }
  }, [timeRemaining, isPlaying, handleAdComplete]);

  const youtubeOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      fs: 0,
      iv_load_policy: 3,
    },
  };

  const progressPercent = ((adData.duration - timeRemaining) / adData.duration) * 100;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold">
            {type === 'first' ? '🎁 Claim Your Free Data' : '⭐ Earn Points'}
          </h2>
          {type === 'first' && (
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              CAN'T SKIP
            </div>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="w-full h-full max-w-3xl max-h-96 rounded-lg overflow-hidden bg-black">
        <YouTube
          videoId={adData.youtubeVideoId}
          opts={youtubeOpts}
          onReady={(event) => {
            event.target.playVideo();
          }}
          onStateChange={(event) => {
            // When video ends
            if (event.data === 0) {
              handleAdComplete();
            }
          }}
        />
      </div>

      {/* Timer & Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Info Row */}
        <div className="flex justify-between items-center text-white">
          <div>
            <p className="text-sm font-semibold">{adData.sponsorName}</p>
            <p className="text-xs text-gray-300">{adData.tagline}</p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">
              {timeRemaining}s
            </div>
            <p className="text-xs text-gray-300">
              {type === 'first' ? '+25 min data' : '+50 points'}
            </p>
          </div>
        </div>

        {/* Skip Button (First ad only, near end) */}
        {type === 'first' && showSkipButton && (
          <button
            onClick={() => {
              setIsPlaying(false);
              handleAdComplete();
            }}
            className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Skip (can watch again for more data)
          </button>
        )}
      </div>

      {/* Sponsor Info Card (Top Right) */}
      <div className="absolute top-20 right-6 bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-xs border border-white/20">
        <p className="text-white text-sm">
          <span className="text-2xl">{adData.sponsorLogo}</span>
          {' '}{adData.adText}
        </p>
        <button className="mt-2 w-full bg-white text-black py-1 px-3 rounded font-semibold text-sm hover:bg-gray-100 transition">
          {adData.cta}
        </button>
      </div>
    </div>
  );
};

export default AdModal;
