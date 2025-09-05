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

  // All other functions (play, pause, stop, setVolume, etc.) are perfect and do not need changes.
  // They correctly use `currentInstrumentRef.current`.
  
  // ... (paste the rest of your unchanged functions here) ...
  // scheduleNotes, play, pause, stop, setPlaybackRate, setVolume, etc.

  // ... (your value object and provider return are also perfect) ...
}