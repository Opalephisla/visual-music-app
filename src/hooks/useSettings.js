import { useState, useCallback } from 'react';

// Default visual settings
const DEFAULT_VISUAL_SETTINGS = {
  particlesEnabled: true,
  lightBeamsEnabled: false,
  noteFlow: 'anticipation',
  background: 'gradient',
  showStats: false,
  pianoVisible: true,
  pianoPosition: 'bottom',
  pianoSize: 'normal',
  notePreview: true,
  particleIntensity: 1.0,
  beamIntensity: 1.0,
  glowIntensity: 1.0,
  trailLength: 1.0,
  colorMode: 'rainbow',
  backgroundIntensity: 0.5,
  hypnoticMode: false,
  pulseRate: 1.0,
  shimmerEffect: false,
  noteRipples: false,
  keyGlow: true,
  particleTrails: false,
  playbackState: 'stopped'
};

// Default audio settings
const DEFAULT_AUDIO_SETTINGS = {
  volume: 1.0,
  reverb: 0.4,
  chorus: 0.3,
  playbackRate: 1.0,
  masterGain: 1.0,
  bassGain: 0,
  midGain: 0,
  trebleGain: 0,
  compression: 0.5,
  stereoWidth: 1.0
};

export function useSettings() {
  // Visual settings with localStorage
  const [visualSettings, setVisualSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('visualMusicInterpreter_visualSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_VISUAL_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load saved visual settings:', error);
    }
    return DEFAULT_VISUAL_SETTINGS;
  });

  // Audio settings with localStorage
  const [audioSettings, setAudioSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('visualMusicInterpreter_audioSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_AUDIO_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load saved audio settings:', error);
    }
    return DEFAULT_AUDIO_SETTINGS;
  });

  // Update visual settings
  const updateVisualSettings = useCallback((newSettings) => {
    setVisualSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Save to localStorage
      try {
        localStorage.setItem(
          'visualMusicInterpreter_visualSettings', 
          JSON.stringify(updated)
        );
      } catch (error) {
        console.warn('Failed to save visual settings:', error);
      }
      
      return updated;
    });
  }, []);

  // Update audio settings
  const updateAudioSettings = useCallback((newSettings) => {
    setAudioSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Save to localStorage
      try {
        localStorage.setItem(
          'visualMusicInterpreter_audioSettings', 
          JSON.stringify(updated)
        );
      } catch (error) {
        console.warn('Failed to save audio settings:', error);
      }
      
      return updated;
    });
  }, []);

  // Reset to defaults
  const resetVisualSettings = useCallback(() => {
    setVisualSettings(DEFAULT_VISUAL_SETTINGS);
    try {
      localStorage.removeItem('visualMusicInterpreter_visualSettings');
    } catch (error) {
      console.warn('Failed to clear visual settings:', error);
    }
  }, []);

  const resetAudioSettings = useCallback(() => {
    setAudioSettings(DEFAULT_AUDIO_SETTINGS);
    try {
      localStorage.removeItem('visualMusicInterpreter_audioSettings');
    } catch (error) {
      console.warn('Failed to clear audio settings:', error);
    }
  }, []);

  return {
    visualSettings,
    audioSettings,
    updateVisualSettings,
    updateAudioSettings,
    resetVisualSettings,
    resetAudioSettings
  };
}