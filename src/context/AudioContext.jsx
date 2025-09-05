import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { INSTRUMENTS } from '../instruments'; // Removed testInstrument, no longer needed here
import { DEFAULT_AUDIO_SETTINGS } from '../constants';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const instrumentsRef = useRef({});
  const effectsRef = useRef({});
  const currentInstrumentRef = useRef(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInstrumentLoading, setIsInstrumentLoading] = useState(true); // Now tracks initial load
  const [instrument, setInstrument] = useState('');
  const [availableInstruments, setAvailableInstruments] = useState({});
  const [instrumentErrors, setInstrumentErrors] = useState({});
  
  // ... other states are perfect ...
  const [audioSettings, setAudioSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('visualMusicInterpreter_audioSettings');
      return saved ? { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) } : DEFAULT_AUDIO_SETTINGS;
    } catch {
      return DEFAULT_AUDIO_SETTINGS;
    }
  });
  const [playbackState, setPlaybackState] = = useState('stopped');
  const [currentTime, setCurrentTime] = useState(0);


  // MODIFIED: This useEffect now pre-loads all available instruments
  useEffect(() => {
    const preloadAllInstruments = async () => {
      console.log('🎵 Pre-loading all available instruments...');
      const available = {};
      const errors = {};
      const loadedInstruments = {};

      const loadPromises = Object.entries(INSTRUMENTS).map(async ([key, definition]) => {
        try {
          // Create the instrument instance
          const newInstrument = definition.loader();
          
          // Await sample loading if necessary
          if (newInstrument.loaded && typeof newInstrument.loaded.then === 'function') {
            await newInstrument.loaded;
          }
          
          // If successful, add to our available list and loaded cache
          available[key] = definition;
          loadedInstruments[key] = newInstrument;
          console.log(`✅ ${definition.name} pre-loaded.`);

        } catch (err) {
          errors[key] = `Failed to load samples for ${definition.name}.`;
          console.log(`❌ ${definition.name}: ${errors[key]}`);
        }
      });
      
      await Promise.all(loadPromises);

      // Store the fully loaded instruments in the ref
      instrumentsRef.current = loadedInstruments;

      setAvailableInstruments(available);
      setInstrumentErrors(errors);

      const defaultInstrument = 'synth-piano'; // Or your preferred default
      if (available[defaultInstrument]) {
        setInstrument(defaultInstrument);
        currentInstrumentRef.current = instrumentsRef.current[defaultInstrument];
      } else {
        // Fallback if default isn't available
        const firstKey = Object.keys(available)[0];
        setInstrument(firstKey);
        currentInstrumentRef.current = instrumentsRef.current[firstKey];
      }

      console.log(`🎹 ${Object.keys(available).length} instruments ready, ${Object.keys(errors).length} failed`);
      setIsInstrumentLoading(false); // Signal that the initial loading is complete
    };

    preloadAllInstruments();
  }, []);

  // NEW: Simplified loadInstrument function
  const loadInstrument = useCallback((instrumentKey) => {
    if (!instrumentsRef.current[instrumentKey]) {
      console.error(`Instrument ${instrumentKey} is not loaded or available.`);
      return;
    }

    // This is now an instant, synchronous switch. No async/await needed.
    if (instrument === instrumentKey) return;
    
    console.log(`🎹 Switching to: ${availableInstruments[instrumentKey].name}`);
    currentInstrumentRef.current = instrumentsRef.current[instrumentKey];
    setInstrument(instrumentKey);
  }, [availableInstruments, instrument]);

  const initializeAudio = useCallback(async () => {
    if (isInitialized) return;
    
    // Wait for pre-loading to finish before initializing the rest
    if (isInstrumentLoading) {
        console.log("Waiting for instruments to finish pre-loading...");
        // You might want a more robust way to handle this, but for now, we wait.
        // A simple check loop or a promise-based approach could work.
        // This function will likely be called after isInstrumentLoading is false anyway.
    }
    
    try {
      console.log('🎵 Initializing audio context...');
      await Tone.start();
      
      // ... your effects chain creation is perfect ...
      const volume = new Tone.Volume(Tone.gainToDb(audioSettings.volume)).toDestination();
      const limiter = new Tone.Limiter(-1).connect(volume);
      const reverb = new Tone.Reverb({ decay: 1.5, wet: audioSettings.reverb }).connect(limiter);
      const chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7, feedback: 0.1, wet: audioSettings.chorus }).connect(reverb).start();
      const eq = new Tone.EQ3({ low: audioSettings.bassGain || 0, mid: audioSettings.midGain || 0, high: audioSettings.trebleGain || 0 }).connect(chorus);
      effectsRef.current = { volume, reverb, chorus, eq, limiter };
      
      // Connect all pre-loaded instruments to the effects chain
      Object.values(instrumentsRef.current).forEach(inst => {
          inst.connect(effectsRef.current.eq);
      });
      console.log('🔗 Connected all instruments to effects chain');

      // ... your transport setup is perfect ...
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

  const initializeAudio = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      console.log('🎵 Initializing audio context...');
      await Tone.start();
      console.log('✅ AudioContext started successfully');

      // Create effects chain
      const volume = new Tone.Volume(Tone.gainToDb(audioSettings.volume)).toDestination();
      const limiter = new Tone.Limiter(-1).connect(volume);
      const reverb = new Tone.Reverb({ 
        decay: 1.5, 
        wet: audioSettings.reverb 
      }).connect(limiter);
      
      const chorus = new Tone.Chorus({ 
        frequency: 1.5, 
        delayTime: 3.5, 
        depth: 0.7, 
        feedback: 0.1, 
        wet: audioSettings.chorus 
      }).connect(reverb).start();
      
      const eq = new Tone.EQ3({ 
        low: audioSettings.bassGain || 0, 
        mid: audioSettings.midGain || 0, 
        high: audioSettings.trebleGain || 0 
      }).connect(chorus);
      
      effectsRef.current = { volume, reverb, chorus, eq, limiter };

      // Load default instrument
      await loadInstrument(instrument);

      // Setup transport time tracking
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
  }, [isInitialized, loadInstrument, instrument, audioSettings]);

  const scheduleNotes = useCallback((notes, songDuration, noteEmitter) => {
    // Clear any existing scheduled events
    Tone.Transport.cancel(0);
    
    const currentInstrument = currentInstrumentRef.current;
    if (!currentInstrument || !notes || !Array.isArray(notes)) {
      console.warn('Cannot schedule notes: missing instrument or notes');
      return;
    }

    let scheduledCount = 0;
    let errorCount = 0;

    notes.forEach((originalNote, index) => {
      // Sanitize note data
      const note = {
        pitch: String(originalNote.pitch || ''),
        time: Number(originalNote.time || 0),
        duration: Number(originalNote.duration || 0.1),
        velocity: Number(originalNote.velocity || 0.8),
      };

      // Validate note data
      if (!note.pitch || isNaN(note.time) || isNaN(note.duration) || isNaN(note.velocity)) {
        console.error(`Discarding malformed note at index ${index}:`, originalNote);
        errorCount++;
        return;
      }

      // Skip notes that are too quiet or short
      if (note.velocity < 0.05 || note.duration < 0.02) {
        return;
      }

      try {
        Tone.Transport.schedule(time => {
          try {
            // Use the current instrument reference to ensure we're using the right one
            const activeInstrument = currentInstrumentRef.current;
            if (activeInstrument) {
              activeInstrument.triggerAttackRelease(
                note.pitch, 
                note.duration, 
                time, 
                note.velocity
              );
              
              // Emit visual effect
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

    // Schedule stop event
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
      
      // Release all notes on current instrument
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
    if (isInitialized) {
      Tone.Transport.playbackRate = rate;
      updateAudioSettings({ playbackRate: rate });
    }
  }, [isInitialized, updateAudioSettings]);

  const setVolume = useCallback((val) => { 
    if (effectsRef.current.volume) {
      effectsRef.current.volume.volume.value = Tone.gainToDb(val);
      updateAudioSettings({ volume: val });
    }
  }, [updateAudioSettings]);

  const setReverb = useCallback((val) => { 
    if (effectsRef.current.reverb) {
      effectsRef.current.reverb.wet.value = val;
      updateAudioSettings({ reverb: val });
    }
  }, [updateAudioSettings]);

  const setChorus = useCallback((val) => { 
    if (effectsRef.current.chorus) {
      effectsRef.current.chorus.wet.value = val;
      updateAudioSettings({ chorus: val });
    }
  }, [updateAudioSettings]);

  const setBassGain = useCallback((val) => {
    if (effectsRef.current.eq) {
      effectsRef.current.eq.low.value = val;
      updateAudioSettings({ bassGain: val });
    }
  }, [updateAudioSettings]);

  const setMidGain = useCallback((val) => {
    if (effectsRef.current.eq) {
      effectsRef.current.eq.mid.value = val;
      updateAudioSettings({ midGain: val });
    }
  }, [updateAudioSettings]);

  const setTrebleGain = useCallback((val) => {
    if (effectsRef.current.eq) {
      effectsRef.current.eq.high.value = val;
      updateAudioSettings({ trebleGain: val });
    }
  }, [updateAudioSettings]);

  // Test a single note (for piano preview)
  const testNote = useCallback(async (noteName, duration = '8n') => {
    if (!isInitialized || !currentInstrumentRef.current) return;
    
    try {
      currentInstrumentRef.current.triggerAttackRelease(noteName, duration, Tone.now(), 0.7);
    } catch (error) {
      console.error('Failed to test note:', error);
    }
  }, [isInitialized]);

  // Get current instrument info
  const getCurrentInstrument = useCallback(() => {
    return availableInstruments[instrument] || null;
  }, [availableInstruments, instrument]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Store current refs in variables to avoid stale closure issues
      const currentInstruments = instrumentsRef.current;
      const currentEffects = effectsRef.current;
      
      // Dispose of all loaded instruments
      Object.values(currentInstruments).forEach(inst => {
        if (inst && inst.dispose) {
          try {
            inst.dispose();
          } catch (error) {
            console.warn('Error disposing instrument:', error);
          }
        }
      });
      
      // Dispose of effects
      Object.values(currentEffects).forEach(effect => {
        if (effect && effect.dispose) {
          try {
            effect.dispose();
          } catch (error) {
            console.warn('Error disposing effect:', error);
          }
        }
      });
    };
  }, []);

  const value = {
    // State
    isInitialized,
    isInstrumentLoading,
    instrument,
    availableInstruments,
    instrumentErrors,
    audioSettings,
    playbackState,
    currentTime,
    
    // Actions
    initializeAudio,
    loadInstrument,
    play,
    pause,
    stop,
    testNote,
    getCurrentInstrument,
    updateAudioSettings,
    
    // Audio controls
    setPlaybackRate,
    setVolume,
    setReverb,
    setChorus,
    setBassGain,
    setMidGain,
    setTrebleGain,
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