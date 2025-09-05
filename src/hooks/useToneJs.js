import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { PERFORMANCE_CONFIG } from '../constants';

export function useToneJs(notes, songDuration, pedalEvents) {
  const instrumentsRef = useRef({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [playbackState, setPlaybackState] = useState('stopped');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPedalActive, setIsPedalActive] = useState(false);
  const [instrument, setInstrument] = useState('piano');
  
  // This function now holds all the audio setup logic.
  // It will only be called once, after the first user click.
  const initializeAudio = useCallback(() => {
    const volume = new Tone.Volume(-3).toDestination();
    const limiter = new Tone.Limiter(-1).connect(volume);
    const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.4 }).connect(limiter);
    const chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7, feedback: 0.1, wet: 0.3 }).connect(reverb).start();
    const eq = new Tone.EQ3({ low: -1, mid: 0, high: 2 }).connect(chorus);
    
    const maxPolyphony = PERFORMANCE_CONFIG['high'].maxActiveNotes;
    
    instrumentsRef.current = {
        piano: new Tone.PolySynth(Tone.Synth, { maxPolyphony, oscillator: { type: 'triangle', partials: [1, 0.5, 0.3, 0.25, 0.2] }, envelope: { attack: 0.005, decay: 0.3, sustain: 0.4, release: 1.2 } }).connect(eq),
        'electric-piano': new Tone.PolySynth(Tone.FMSynth, { maxPolyphony, harmonicity: 3.01, modulationIndex: 14, envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.8 }, modulation: { type: 'sine' } }).connect(eq),
        'synth-pad': new Tone.PolySynth(Tone.AMSynth, { maxPolyphony, harmonicity: 2.5, envelope: { attack: 0.2, decay: 0.3, sustain: 0.8, release: 1.8 }, modulation: { type: 'sine', frequency: 0.5 } }).connect(eq),
        effects: { volume, reverb, chorus }
    };

    setIsInitialized(true);
  }, []);

  // This effect now depends on `isInitialized`.
  // It won't run until the audio engine is ready.
  useEffect(() => {
    if (!isInitialized) return;

    const loopId = Tone.Transport.scheduleRepeat((time) => {
      Tone.Draw.schedule(() => {
        setCurrentTime(Tone.Transport.seconds);
        const active = pedalEvents.some(p => Tone.Transport.seconds >= p[0] && Tone.Transport.seconds < p[1]);
        setIsPedalActive(active);
      }, time);
    }, '16n');

    return () => Tone.Transport.clear(loopId);
  }, [isInitialized, pedalEvents]);

  const scheduleNotes = useCallback((noteEmitter) => {
    Tone.Transport.cancel(0);
    const currentInstrument = instrumentsRef.current[instrument];
    if (!currentInstrument || !notes) return;
    
    notes.forEach(note => {
      if (note.velocity < 0.1 || note.duration < 0.05) return;
      Tone.Transport.schedule(time => {
        currentInstrument.triggerAttackRelease(note.pitch, note.duration, time, note.velocity || 0.8);
        Tone.Draw.schedule(() => {
          noteEmitter(note);
        }, time);
      }, note.time);
    });

    Tone.Transport.scheduleOnce(() => setPlaybackState('stopped'), songDuration + 2);
  }, [notes, songDuration, instrument]);
  
  // The `playPause` function is now responsible for initialization.
  const playPause = async (noteEmitter) => {
    if (!isInitialized) {
      await Tone.start();
      initializeAudio();
      // Wait a tick for the audio context to be fully ready before starting transport
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    if (playbackState === 'stopped') {
      scheduleNotes(noteEmitter);
      Tone.Transport.start();
      setPlaybackState('started');
    } else if (playbackState === 'started') {
      Tone.Transport.pause();
      setPlaybackState('paused');
    } else { // 'paused'
      Tone.Transport.start();
      setPlaybackState('started');
    }
  };

  const stop = useCallback(() => {
    if (!isInitialized) return;
    Tone.Transport.stop();
    Tone.Transport.cancel();
    instrumentsRef.current[instrument]?.releaseAll();
    setCurrentTime(0);
    setPlaybackState('stopped');
  }, [isInitialized, instrument]);

  const restart = useCallback((noteEmitter) => {
    stop();
    setTimeout(() => {
      playPause(noteEmitter);
    }, 100);
  }, [stop, playPause]);
  
  const setPlaybackRate = useCallback((rate) => { Tone.Transport.playbackRate = rate; }, []);
  const setVolume = useCallback((val) => { if(instrumentsRef.current.effects) instrumentsRef.current.effects.volume.volume.value = Tone.gainToDb(val); }, []);
  const setReverb = useCallback((val) => { if(instrumentsRef.current.effects) instrumentsRef.current.effects.reverb.wet.value = val; }, []);
  const setChorus = useCallback((val) => { if(instrumentsRef.current.effects) instrumentsRef.current.effects.chorus.wet.value = val; }, []);

  return {
    playPause, stop, restart,
    setPlaybackRate, setVolume, setReverb, setChorus,
    playbackState, currentTime, isPedalActive,
    instrument, setInstrument
  };
}