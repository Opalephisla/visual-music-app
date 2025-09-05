import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { INSTRUMENTS } from '../instruments';
import { DEFAULT_AUDIO_SETTINGS } from '../constants';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const instrumentsRef = useRef({});
  const effectsRef = useRef({});
  const currentInstrumentRef = useRef(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isInstrumentLoading, setIsInstrumentLoading] = useState(true);
  const [instrument, setInstrument] = useState('');
  const [availableInstruments, setAvailableInstruments] = useState({});
  const [instrumentErrors, setInstrumentErrors] = useState({});
  
  const [audioSettings, setAudioSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('visualMusicInterpreter_audioSettings');
      return saved ? { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) } : DEFAULT_AUDIO_SETTINGS;
    } catch {
      return DEFAULT_AUDIO_SETTINGS;
    }
  });
  const [playbackState, setPlaybackState] = useState('stopped');
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const preloadAllInstruments = async () => {
      console.log('🎵 Pre-loading all available instruments...');
      const available = {};
      const errors = {};
      const loadedInstruments = {};

      const loadPromises = Object.entries(INSTRUMENTS).map(async ([key, definition]) => {
        try {
          const newInstrument = definition.loader();
          if (newInstrument.loaded && typeof newInstrument.loaded.then === 'function') {
            await newInstrument.loaded;
          }
          available[key] = definition;
          loadedInstruments[key] = newInstrument;
          console.log(`✅ ${definition.name} pre-loaded.`);
        } catch (err) {
          errors[key] = `Failed to load samples for ${definition.name}.`;
          console.log(`❌ ${definition.name}: ${errors[key]}`);
        }
      });
      
      await Promise.all(loadPromises);
      instrumentsRef.current = loadedInstruments;
      setAvailableInstruments(available);
      setInstrumentErrors(errors);

      const defaultInstrument = 'synth-piano';
      if (available[defaultInstrument]) {
        setInstrument(defaultInstrument);
        currentInstrumentRef.current = instrumentsRef.current[defaultInstrument];
      } else {
        const firstKey = Object.keys(available)[0];
        setInstrument(firstKey);
        currentInstrumentRef.current = instrumentsRef.current[firstKey];
      }

      console.log(`🎹 ${Object.keys(available).length} instruments ready, ${Object.keys(errors).length} failed`);
      setIsInstrumentLoading(false);
    };

    preloadAllInstruments();
  }, []);

  const loadInstrument = useCallback((instrumentKey) => {
    if (!instrumentsRef.current[instrumentKey]) {
      console.error(`Instrument ${instrumentKey} is not loaded or available.`);
      return;
    }
    if (instrument === instrumentKey) return;
    console.log(`🎹 Switching to: ${availableInstruments[instrumentKey].name}`);
    currentInstrumentRef.current = instrumentsRef.current[instrumentKey];
    setInstrument(instrumentKey);
  }, [availableInstruments, instrument]);

  const initializeAudio = useCallback(async () => {
    if (isInitialized) return;
    
    if (isInstrumentLoading) {
        console.log("Waiting for instruments to finish pre-loading...");
    }
    
    try {
      console.log('🎵 Initializing audio context...');
      await Tone.start();
      
      const volume = new Tone.Volume(Tone.gainToDb(audioSettings.volume)).toDestination();
      const limiter = new Tone.Limiter(-1).connect(volume);
      const reverb = new Tone.Reverb({ decay: 1.5, wet: audioSettings.reverb }).connect(limiter);
      const chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7, feedback: 0.1, wet: audioSettings.chorus }).connect(reverb).start();
      const eq = new Tone.EQ3({ low: audioSettings.bassGain || 0, mid: audioSettings.midGain || 0, high: audioSettings.trebleGain || 0 }).connect(chorus);
      effectsRef.current = { volume, reverb, chorus, eq, limiter };
      
      Object.values(instrumentsRef.current).forEach(inst => {
          inst.connect(effectsRef.current.eq);
      });
      console.log('🔗 Connected all instruments to effects chain');

      Tone.Transport.scheduleRepeat((time) => {
        Tone.Draw.schedule(() => {
          setCurrentTime(Tone.Transport.seconds);
        }, time);
      }, '16n');

      setIsInitialized(true);
      console.log('🎵 Audio system fully initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
      throw error;
    }
  }, [isInitialized, isInstrumentLoading, audioSettings]);

  const scheduleNotes = useCallback((notes, songDuration, noteEmitter) => {
    Tone.Transport.cancel(0);
    const currentInstrument = currentInstrumentRef.current;
    if (!currentInstrument || !notes || !Array.isArray(notes)) {
      console.warn('Cannot schedule notes: missing instrument or notes');
      return;
    }
    let scheduledCount = 0;
    let errorCount = 0;
    notes.forEach((originalNote, index) => {
      const note = {
        pitch: String(originalNote.pitch || ''),
        time: Number(originalNote.time || 0),
        duration: Number(originalNote.duration || 0.1),
        velocity: Number(originalNote.velocity || 0.8),
      };
      if (!note.pitch || isNaN(note.time) || isNaN(note.duration) || isNaN(note.velocity)) {
        console.error(`Discarding malformed note at index ${index}:`, originalNote);
        errorCount++;
        return;
      }
      if (note.velocity < 0.05 || note.duration < 0.02) {
        return;
      }
      try {
        Tone.Transport.schedule(time => {
          try {
            const activeInstrument = currentInstrumentRef.current;
            if (activeInstrument) {
              activeInstrument.triggerAttackRelease(
                note.pitch, note.duration, time, note.velocity
              );
              if (noteEmitter) {
                Tone.Draw.schedule(() => noteEmitter(originalNote), time);
              }
            }
          } catch (playError) {
            console.error(`Error playing note ${note.pitch}:`, playError);
          }
        }, note.time);
        scheduledCount++;
      } catch (scheduleError) {
        console.error(`Error scheduling note at time ${note.time}:`, scheduleError);
        errorCount++;
      }
    });
    Tone.Transport.scheduleOnce(() => {
      setPlaybackState('stopped');
      console.log('🎵 Playback completed');
    }, songDuration + 2);
    console.log(`🎵 Scheduled ${scheduledCount} notes, ${errorCount} errors`);
  }, []);

  const play = useCallback((notes, songDuration, noteEmitter, startTime = 0) => {
    if (!isInitialized) {
      console.warn('Audio not initialized');
      return;
    }
    try {
      scheduleNotes(notes, songDuration, noteEmitter);
      Tone.Transport.start(Tone.now(), startTime);
      setPlaybackState('started');
      console.log(`🎵 Started playback from ${startTime}s`);
    } catch (error) {
      console.error('❌ Failed to start playback:', error);
    }
  }, [isInitialized, scheduleNotes]);

  const pause = useCallback(() => {
    if (!isInitialized) return;
    try {
      Tone.Transport.pause();
      setPlaybackState('paused');
      console.log('⏸️ Playback paused');
    } catch (error) {
      console.error('❌ Failed to pause:', error);
    }
  }, [isInitialized]);

  const stop = useCallback(() => {
    if (!isInitialized) return;
    try {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      if (currentInstrumentRef.current && currentInstrumentRef.current.releaseAll) {
        currentInstrumentRef.current.releaseAll();
      }
      setCurrentTime(0);
      setPlaybackState('stopped');
      console.log('⏹️ Playback stopped');
    } catch (error) {
      console.error('❌ Failed to stop:', error);
    }
  }, [isInitialized]);

  // Audio control functions
  const setPlaybackRate = useCallback((rate) => { 
    if (isInitialized) Tone.Transport.playbackRate = rate;
  }, [isInitialized]);

  const setVolume = useCallback((val) => { 
    if (effectsRef.current.volume) {
      effectsRef.current.volume.volume.value = Tone.gainToDb(val);
    }
  }, []);

  const setReverb = useCallback((val) => { 
    if (effectsRef.current.reverb) {
      effectsRef.current.reverb.wet.value = val;
    }
  }, []);

  const setChorus = useCallback((val) => { 
    if (effectsRef.current.chorus) {
      effectsRef.current.chorus.wet.value = val;
    }
  }, []);

  const setBassGain = useCallback((val) => {
    if (effectsRef.current.eq) {
      effectsRef.current.eq.low.value = val;
    }
  }, []);

  const setMidGain = useCallback((val) => {
    if (effectsRef.current.eq) {
      effectsRef.current.eq.mid.value = val;
    }
  }, []);

  const setTrebleGain = useCallback((val) => {
    if (effectsRef.current.eq) {
      effectsRef.current.eq.high.value = val;
    }
  }, []);

  const testNote = useCallback(async (noteName, duration = '8n') => {
    if (!isInitialized || !currentInstrumentRef.current) return;
    try {
      currentInstrumentRef.current.triggerAttackRelease(noteName, duration, Tone.now(), 0.7);
    } catch (error) {
      console.error('Failed to test note:', error);
    }
  }, [isInitialized]);

  const getCurrentInstrument = useCallback(() => {
    return availableInstruments[instrument] || null;
  }, [availableInstruments, instrument]);

  useEffect(() => {
    return () => {
      const currentInstruments = instrumentsRef.current;
      const currentEffects = effectsRef.current;
      Object.values(currentInstruments).forEach(inst => {
        if (inst && inst.dispose) {
          try { inst.dispose(); } catch (e) { console.warn('Error disposing instrument:', e); }
        }
      });
      Object.values(currentEffects).forEach(effect => {
        if (effect && effect.dispose) {
          try { effect.dispose(); } catch (e) { console.warn('Error disposing effect:', e); }
        }
      });
    };
  }, []);

  const value = {
    isInitialized, isInstrumentLoading, instrument, availableInstruments,
    instrumentErrors, audioSettings, playbackState, currentTime,
    initializeAudio, loadInstrument, play, pause, stop, testNote,
    getCurrentInstrument, setPlaybackRate, setVolume, setReverb,
    setChorus, setBassGain, setMidGain, setTrebleGain,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};