import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';

// 1. ADD isPedalActive back to props
export default function PlaybackControls({ onPlayPause, onRestart, onSpeedChange, onDownloadMidi, isPedalActive }) {
    const { playbackState } = useAudio();
    const [speed, setSpeed] = useState(1);

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  const getPlayButtonText = () => {
    if (playbackState === 'stopped') return 'Play';
    if (playbackState === 'paused') return 'Resume';
    return 'Pause';
  };

  return (
    <div className="flex justify-center items-center gap-4">
      <button onClick={onPlayPause} className="px-6 py-2 bg-fuchsia-600 text-white font-semibold rounded-lg shadow-lg hover:bg-fuchsia-700 transition-transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed">{getPlayButtonText()}</button>
      <button onClick={onRestart} className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-800 transition-transform hover:scale-105">Restart</button>
      <div className="flex items-center gap-2">
      <button onClick={onDownloadMidi} className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-800 transition-transform hover:scale-105">
        Download MIDI
      </button>
        <label htmlFor="speed-slider" className="text-sm">Speed:</label>
        <input type="range" id="speed-slider" min="0.5" max="1.5" step="0.1" value={speed} onChange={handleSpeedChange} />
        <span className="text-sm w-10 text-center">{speed.toFixed(1)}x</span>
      </div>
      {/* 3. This now correctly uses the prop */}
      <div className={`px-4 py-2 rounded-lg text-sm font-semibold border border-gray-600 transition-all duration-100 ease-in-out ${isPedalActive ? 'bg-fuchsia-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
        SUSTAIN
      </div>
    </div>
  );
}