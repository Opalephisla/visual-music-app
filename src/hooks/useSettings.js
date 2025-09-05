import { useState, useCallback } from 'react';
import { DEFAULT_VISUAL_SETTINGS, DEFAULT_AUDIO_SETTINGS } from '../constants';

// Settings Management Hook
export function useSettings() {
  const [visualSettings, setVisualSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('visualMusicInterpreter_visualSettings');
      return saved ? { ...DEFAULT_VISUAL_SETTINGS, ...JSON.parse(saved) } : DEFAULT_VISUAL_SETTINGS;
    } catch {
      return DEFAULT_VISUAL_SETTINGS;
    }
  });

  const [audioSettings, setAudioSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('visualMusicInterpreter_audioSettings');
      return saved ? { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) } : DEFAULT_AUDIO_SETTINGS;
    } catch {
      return DEFAULT_AUDIO_SETTINGS;
    }
  });

  const updateVisualSettings = useCallback((newSettings) => {
    const updated = { ...visualSettings, ...newSettings };
    setVisualSettings(updated);
    try {
      localStorage.setItem('visualMusicInterpreter_visualSettings', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save visual settings:', error);
    }
  }, [visualSettings]);

  const updateAudioSettings = useCallback((newSettings) => {
    const updated = { ...audioSettings, ...newSettings };
    setAudioSettings(updated);
    try {
      localStorage.setItem('visualMusicInterpreter_audioSettings', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
    }
  }, [audioSettings]);

  return {
    visualSettings,
    audioSettings,
    updateVisualSettings,
    updateAudioSettings
  };
}