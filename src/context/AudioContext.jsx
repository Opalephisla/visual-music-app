import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

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

  // Initialize basic instruments
  useEffect(() => {
    const instruments = {
      'synth-piano': {
        name: 'Synthesized Piano',
        category: 'Piano',
        visualColor: '#4F46E5',
        visualType: 'flowing'
      },
      'electric-piano': {
        name: 'Electric Piano',
        category: 'Piano',
        visualColor: '#DC2626',
        visualType: 'electric'
      },
      'synth-pad': {
        name: 'Synth Pad',
        category: 'Synthesizer',
        visualColor: '#059669',
        visualType: 'atmospheric'
      }
    };
    
    setAvailableInstruments(instruments);
  }, []);

  const initializeAudio = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      console.log('🎵 Initializing audio context...');
      
      // Start Tone.js
      await Tone.start();
      
      // Create effects chain
      const volume = new Tone.Volume(-3).toDestination();
      const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.3 }).connect(volume);
      const chorus = new Tone.Chorus(4, 2.5, 0.5).connect(reverb).start();
      
      effectsRef.current = { volume, reverb, chorus };
      
      // Create default instrument
      instrumentRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { 
          attack: 0.005, 
          decay: 0.3, 
          sustain: 0.4, 
          release: 1.2 
        }
      }).connect(chorus);
      
      // Setup transport time updates
      Tone.Transport.scheduleRepeat((time) => {
        Tone.Draw.schedule(() => {
          setCurrentTime(Tone.Transport.seconds);
        }, time);
      }, '16n');

      setIsInitialized(true);
      console.log('✅ Audio system initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
      // Try a simpler setup if the complex one fails
      try {
        await Tone.start();
        instrumentRef.current = new Tone.Synth().toDestination();
        setIsInitialized(true);
        console.log('✅ Audio initialized with fallback');
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
    }
  }, [isInitialized]);

  const loadInstrument = useCallback(async (instrumentKey) => {
    if (!isInitialized) return;
    
    setIsInstrumentLoading(true);
    
    try {
      // Dispose old instrument
      if (instrumentRef.current) {
        instrumentRef.current.dispose();
      }
      
      // Create new instrument based on key
      let newInstrument;
      
      switch(instrumentKey) {
        case 'electric-piano':
          newInstrument = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 3,
            modulationIndex: 14,
            envelope: { 
              attack: 0.01, 
              decay: 0.2, 
              sustain: 0.2, 
              release: 0.8 
            }
          });
          break;
          
        case 'synth-pad':
          newInstrument = new Tone.PolySynth(Tone.AMSynth, {
            harmonicity: 2.5,
            envelope: { 
              attack: 0.8, 
              decay: 0.2, 
              sustain: 0.9, 
              release: 2.0 
            }
          });
          break;
          
        default:
          newInstrument = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { 
              attack: 0.005, 
              decay: 0.3, 
              sustain: 0.4, 
              release: 1.2 
            }
          });
      }
      
      // Connect to effects chain
      if (effectsRef.current.chorus) {
        newInstrument.connect(effectsRef.current.chorus);
      } else {
        newInstrument.toDestination();
      }
      
      instrumentRef.current = newInstrument;
      setInstrument(instrumentKey);
      
    } catch (error) {
      console.error('Failed to load instrument:', error);
    } finally {
      setIsInstrumentLoading(false);
    }
  }, [isInitialized]);

  const play = useCallback((notes, songDuration, noteEmitter, startTime = 0) => {
    if (!isInitialized || !instrumentRef.current || !notes) {
      console.warn('Cannot play: system not ready');
      return;
    }
    
    try {
      // Clear any scheduled events
      Tone.Transport.cancel();
      
      // Schedule notes
      let scheduledCount = 0;
      notes.forEach(note => {
        if (!note.pitch || !note.time || !note.duration) return;
        
        Tone.Transport.schedule(time => {
          try {
            instrumentRef.current.triggerAttackRelease(
              note.pitch, 
              note.duration, 
              time, 
              note.velocity || 0.8
            );
            
            if (noteEmitter) {
              Tone.Draw.schedule(() => noteEmitter(note), time);
            }
          } catch (err) {
            console.error('Error playing note:', err);
          }
        }, note.time);
        
        scheduledCount++;
      });
      
      console.log(`Scheduled ${scheduledCount} notes`);
      
      // Start transport
      Tone.Transport.start(Tone.now(), startTime);
      setPlaybackState('started');
      
      // Schedule stop
      Tone.Transport.scheduleOnce(() => {
        setPlaybackState('stopped');
      }, songDuration + 2);
      
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
    if (!isInitialized || !instrumentRef.current) return;
    
    try {
      instrumentRef.current.triggerAttackRelease(noteName, duration, Tone.now(), 0.7);
    } catch (error) {
      console.error('Failed to test note:', error);
    }
  }, [isInitialized]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (instrumentRef.current) {
        instrumentRef.current.dispose();
      }
      Object.values(effectsRef.current).forEach(effect => {
        if (effect && effect.dispose) {
          effect.dispose();
        }
      });
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  const value = {
    isInitialized,
    isInstrumentLoading,
    instrument,
    availableInstruments,
    instrumentErrors: {},
    playbackState,
    currentTime,
    initializeAudio,
    loadInstrument,
    play,
    pause,
    stop,
    testNote
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};