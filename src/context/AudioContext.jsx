import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { INSTRUMENTS } from '../instruments';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const instrumentsRef = useRef({});
  const effectsRef = useRef({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInstrumentLoading, setIsInstrumentLoading] = useState(false);
  const [instrument, setInstrument] = useState('salamander-piano');
  
  const [playbackState, setPlaybackState] = useState('stopped');
  const [currentTime, setCurrentTime] = useState(0);

  const loadInstrument = useCallback(async (instrumentKey) => {
    setIsInstrumentLoading(true);
    if (instrumentsRef.current[instrumentKey]) {
      setInstrument(instrumentKey);
      setIsInstrumentLoading(false);
      return;
    }
    try {
      const definition = INSTRUMENTS[instrumentKey];
      const newInstrument = definition.loader();
      if (effectsRef.current.eq) {
        newInstrument.connect(effectsRef.current.eq);
      }
      await newInstrument.loaded;
      instrumentsRef.current[instrumentKey] = newInstrument;
      setInstrument(instrumentKey);
    } catch (error) {
      console.error(`Failed to load instrument: ${instrumentKey}`, error);
    } finally {
      setIsInstrumentLoading(false);
    }
  }, []);

  const initializeAudio = useCallback(async () => {
    if (isInitialized) return;
    await Tone.start();
    console.log("AudioContext started successfully.");

    const volume = new Tone.Volume(-3).toDestination();
    const limiter = new Tone.Limiter(-1).connect(volume);
    const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.4 }).connect(limiter);
    const chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7, feedback: 0.1, wet: 0.3 }).connect(reverb).start();
    effectsRef.current = { volume, reverb, chorus, eq: new Tone.EQ3({ low: -1, mid: 0, high: 2 }).connect(chorus) };

    await loadInstrument('salamander-piano');

    Tone.Transport.scheduleRepeat((time) => {
      Tone.Draw.schedule(() => {
        setCurrentTime(Tone.Transport.seconds);
      }, time);
    }, '16n');

    setIsInitialized(true);
  }, [isInitialized, loadInstrument]);

  const scheduleNotes = useCallback((notes, songDuration, noteEmitter) => {
    Tone.Transport.cancel(0);
    const currentInstrument = instrumentsRef.current[instrument];
    if (!currentInstrument || !notes || !Array.isArray(notes)) return;

    notes.forEach(originalNote => {
      const note = {
        pitch: String(originalNote.pitch || ''),
        time: Number(originalNote.time || 0),
        duration: Number(originalNote.duration || 0.1),
        velocity: Number(originalNote.velocity || 0.8),
      };

      if (!note.pitch || isNaN(note.time) || isNaN(note.duration) || isNaN(note.velocity)) {
        console.error("SANITIZER: Discarding a completely malformed note object:", originalNote);
        return;
      }

      if (note.velocity < 0.1 || note.duration < 0.05) return;

      Tone.Transport.schedule(time => {
        try {
          currentInstrument.triggerAttackRelease(note.pitch, note.duration, time, note.velocity);
          Tone.Draw.schedule(() => noteEmitter(originalNote), time);
        } catch (e) {
          console.error("ERROR during triggerAttackRelease:", e, "for sanitized note:", note);
        }
      }, note.time);
    });

    Tone.Transport.scheduleOnce(() => setPlaybackState('stopped'), songDuration + 2);
  }, [instrument]);

  const play = useCallback((notes, songDuration, noteEmitter, startTime = 0) => {
    if (!isInitialized) return;
    scheduleNotes(notes, songDuration, noteEmitter);
    Tone.Transport.start(Tone.now(), startTime);
    setPlaybackState('started');
  }, [isInitialized, scheduleNotes]);

  const pause = useCallback(() => {
    if (!isInitialized) return;
    Tone.Transport.pause();
    setPlaybackState('paused');
  }, [isInitialized]);

  const stop = useCallback(() => {
    if (!isInitialized) return;
    Tone.Transport.stop();
    Tone.Transport.cancel();
    instrumentsRef.current[instrument]?.releaseAll();
    setCurrentTime(0);
    setPlaybackState('stopped');
  }, [isInitialized, instrument]);
  
  const setPlaybackRate = useCallback((rate) => { if(isInitialized) Tone.Transport.playbackRate = rate; }, [isInitialized]);
  const setVolume = useCallback((val) => { if(effectsRef.current.volume) effectsRef.current.volume.volume.value = Tone.gainToDb(val); }, []);
  const setReverb = useCallback((val) => { if(effectsRef.current.reverb) effectsRef.current.reverb.wet.value = val; }, []);
  const setChorus = useCallback((val) => { if(effectsRef.current.chorus) effectsRef.current.chorus.wet.value = val; }, []);
  
  const value = {
    isInitialized, initializeAudio,
    isInstrumentLoading,
    loadInstrument,
    instrument,
    playbackState,
    currentTime,
    play, pause, stop,
    setPlaybackRate, setVolume, setReverb, setChorus,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};