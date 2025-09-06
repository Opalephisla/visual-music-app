import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { INSTRUMENTS } from '../instruments';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const instrumentRef = useRef(null);
  const effectsRef = useRef({});

  const [isInitialized, setIsInitialized] = useState(false);
  const [isInstrumentLoading, setIsInstrumentLoading] = useState(false);
  const [instrument, setInstrument] = useState('synth-piano');
  const [availableInstruments, setAvailableInstruments] = useState({});
  const [playbackState, setPlaybackState] = useState('stopped');
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const instrumentData = Object.keys(INSTRUMENTS).reduce((acc, key) => {
      const { name, category, visualColor, visualType } = INSTRUMENTS[key];
      acc[key] = { name, category, visualColor, visualType };
      return acc;
    }, {});
    setAvailableInstruments(instrumentData);
  }, []);

  const loadInstrument = useCallback(async (instrumentKey) => {
    if (!INSTRUMENTS[instrumentKey]) {
      console.error(`Instrument '${instrumentKey}' not found.`);
      return;
    }

    setIsInstrumentLoading(true);
    console.log(`⏳ Loading instrument: ${instrumentKey}`);

    try {
      if (instrumentRef.current) {
        instrumentRef.current.releaseAll();
        instrumentRef.current.dispose();
      }

      const instrumentDefinition = INSTRUMENTS[instrumentKey];
      const newInstrument = await instrumentDefinition.loader();

      if (effectsRef.current.chorus) {
        newInstrument.connect(effectsRef.current.chorus);
      } else {
        newInstrument.toDestination();
      }

      instrumentRef.current = newInstrument;
      setInstrument(instrumentKey);
      console.log(`✅ Instrument '${instrumentKey}' is fully loaded and ready.`);

    } catch (error) {
      console.error(`❌ Failed to load instrument '${instrumentKey}':`, error);
      if (instrumentKey !== 'synth-piano') {
        await loadInstrument('synth-piano');
      }
    } finally {
      setIsInstrumentLoading(false);
    }
  }, []);

  const initializeAudio = useCallback(async () => {
    if (isInitialized) return;
    try {
      console.log('🎵 Initializing audio context...');
      await Tone.start();

      const volume = new Tone.Volume(-3).toDestination();
      const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.3 }).connect(volume);
      const chorus = new Tone.Chorus(4, 2.5, 0.5).connect(reverb).start();
      effectsRef.current = { volume, reverb, chorus };

      Tone.Transport.scheduleRepeat((time) => {
        Tone.Draw.schedule(() => setCurrentTime(Tone.Transport.seconds), time);
      }, '16n');

      await loadInstrument('synth-piano');
      setIsInitialized(true);
      console.log('✅ Audio system initialized.');
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
    }
  }, [isInitialized, loadInstrument]);

  const play = useCallback((notes, songDuration, noteEmitter, startTime = 0) => {
    if (!isInitialized || !instrumentRef.current || !notes) return;
    try {
      Tone.Transport.cancel();
      notes.forEach(note => {
        if (!note.pitch || typeof note.time !== 'number' || typeof note.duration !== 'number') return;
        Tone.Transport.schedule(time => {
          if (instrumentRef.current && !instrumentRef.current.disposed) {
            instrumentRef.current.triggerAttackRelease(note.pitch, note.duration, time, note.velocity || 0.8);
            if (noteEmitter) Tone.Draw.schedule(() => noteEmitter(note), time);
          }
        }, note.time);
      });
      Tone.Transport.start(Tone.now(), startTime);
      setPlaybackState('started');
      Tone.Transport.scheduleOnce(() => setPlaybackState('stopped'), songDuration + 1);
    } catch (error) {
      console.error('Failed to start playback:', error);
    }
  }, [isInitialized]);

  const pause = useCallback(() => {
    if (!isInitialized) return;
    Tone.Transport.pause();
    setPlaybackState('paused');
  }, [isInitialized]);

  const stop = useCallback(() => {
    if (!isInitialized) return;
    try {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      if (instrumentRef.current && instrumentRef.current.releaseAll) {
        instrumentRef.current.releaseAll();
      }
      setCurrentTime(0);
      setPlaybackState('stopped');
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  }, [isInitialized]);
  
  const testNote = useCallback((noteName, duration = '8n') => {
    if (instrumentRef.current && isInitialized) {
        instrumentRef.current.triggerAttackRelease(noteName, duration, Tone.now());
    }
  }, [isInitialized]);

  useEffect(() => {
    return () => {
      if (instrumentRef.current) instrumentRef.current.dispose();
      Object.values(effectsRef.current).forEach(e => e.dispose());
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  const value = {
    isInitialized, isInstrumentLoading, instrument, availableInstruments,
    playbackState, currentTime, initializeAudio, loadInstrument,
    play, pause, stop, testNote
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};