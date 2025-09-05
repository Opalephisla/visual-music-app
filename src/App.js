import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';

// Import context and hooks
import { useAudio } from './context/AudioContext';
import { useMidi } from './hooks/useMidi';
import { useCanvas } from './hooks/useCanvas';

// Import components
import Header from './components/Header';
import LoadingOverlay from './components/LoadingOverlay';
import PlaybackControls from './components/PlaybackControls';
import SoundFXControls from './components/SoundFXControls';
import VisualFXControls from './components/VisualFXControls';
import StatsDisplay from './components/StatsDisplay';
import MidiGeneratorUI from './components/MidiGeneratorUI';

// Import constants and utilities
import { DEFAULT_VISUAL_SETTINGS, DEFAULT_AUDIO_SETTINGS } from './constants';

// Enhanced Start Screen Component
function StartScreen({ onStart, hasErrors, errorCount }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    class Star {
      constructor() { 
        this.reset(); 
        this.y = Math.random(); 
      }
      reset() { 
        this.x = Math.random(); 
        this.y = 0; 
        this.z = Math.random() * 0.8 + 0.2; 
      }
      update(width, height) { 
        this.y += (this.z * 0.7) / height; 
        if (this.y > 1) this.reset(); 
      }
      draw(ctx, width, height) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.z * 0.7})`;
        ctx.beginPath();
        ctx.arc(this.x * width, this.y * height, this.z, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const stars = Array.from({ length: 300 }, () => new Star());
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    
    const loop = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => {
        star.update(canvas.width, canvas.height);
        star.draw(ctx, canvas.width, canvas.height);
      });
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black flex justify-center items-center text-white relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-60"></canvas>
      
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30"></div>
      
      <div className="text-center z-10 animate-fade-in-up max-w-2xl px-8">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Enhanced Visual Music Interpreter
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-4">
          Experience music through stunning visual representations
        </p>
        
        <p className="text-sm text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
          Robust instrument testing • Advanced visual effects • Persistent settings • Interactive piano • Hypnotic modes
        </p>
        
        {hasErrors && (
          <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ {errorCount} instrument{errorCount !== 1 ? 's' : ''} failed to load. Don't worry - reliable alternatives are available!
            </p>
          </div>
        )}
        
        <button 
          onClick={onStart} 
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 transform active:scale-100 hover:shadow-purple-500/25"
        >
          🎵 Start Experience
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          Click to begin your musical journey
        </p>
      </div>
    </div>
  );
}

// Error Modal Component
function ErrorModal({ errors, onClose }) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-red-700">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">⚠️</span>
          <h2 className="text-xl font-bold text-red-400">Loading Issues Detected</h2>
        </div>
        
        <div className="max-h-48 overflow-y-auto mb-4 bg-gray-800 rounded p-3">
          {errors.map((error, index) => (
            <div key={index} className="text-sm text-gray-300 mb-2 flex items-start">
              <span className="text-red-400 mr-2 mt-0.5">•</span>
              <span>{error}</span>
            </div>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            Continue Anyway
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
          >
            Reload App
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Virtual Piano Component
function VirtualPiano({ midiData, activeNotes, settings, onKeyPress }) {
  const canvasRef = useRef(null);
  const [hoveredKey, setHoveredKey] = useState(null);

  // Ensure all props have defaults
  const safeMidiData = {
    totalWhiteKeys: 35,
    octaveRange: { min: 2, max: 6 },
    ...midiData
  };
  const safeActiveNotes = activeNotes || [];
  const safeSettings = {
    notePreview: true,
    colorMode: 'rainbow',
    glowIntensity: 1.0,
    pianoSize: 'normal',
    pianoVisible: true,
    ...settings
  };

  const getNotePosition = useCallback((noteName) => {
    if (!safeMidiData.totalWhiteKeys) return { x: 0, isBlack: false, width: 0 };
    
    const flatToSharpMap = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    const noteMap = { 'C': 0, 'C#': 0.5, 'D': 1, 'D#': 1.5, 'E': 2, 'F': 3, 'F#': 3.5, 'G': 4, 'G#': 4.5, 'A': 5, 'A#': 5.5, 'B': 6 };
    
    let pitchName = noteName.replace(/[0-9]/g, '');
    const octave = parseInt(noteName.slice(-1), 10);
    if (flatToSharpMap[pitchName]) pitchName = flatToSharpMap[pitchName];
    
    const isBlack = pitchName.includes('#');
    const whiteKeyWidth = 800 / safeMidiData.totalWhiteKeys;
    const posInWhiteKeys = (octave - safeMidiData.octaveRange.min) * 7 + Math.floor(noteMap[pitchName] || 0);
    let x = posInWhiteKeys * whiteKeyWidth;
    
    return { x, isBlack, width: whiteKeyWidth };
  }, [safeMidiData]);

  const drawPiano = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    if (!safeMidiData.totalWhiteKeys) return;

    const whiteKeyWidth = width / safeMidiData.totalWhiteKeys;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = height * 0.65;

    // Draw white keys
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    for (let oct = safeMidiData.octaveRange.min; oct <= safeMidiData.octaveRange.max; oct++) {
      for (const note of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
        const noteName = `${note}${oct}`;
        const { x } = getNotePosition(noteName);
        const keyX = (x / 800) * width;
        
        const isActive = safeActiveNotes.some(n => n.pitch === noteName);
        const isHovered = hoveredKey === noteName;
        
        if (isActive) {
          const color = safeSettings.colorMode === 'rainbow' ? 
            `hsl(${(keyX / width) * 360}, 70%, 60%)` : '#a855f7';
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 15 * (safeSettings.glowIntensity || 1);
        } else if (isHovered) {
          ctx.fillStyle = '#f3f4f6';
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(keyX, 0, whiteKeyWidth - 1, height);
        
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isHovered ? '#9ca3af' : '#d1d5db';
        ctx.lineWidth = 1;
        ctx.strokeRect(keyX, 0, whiteKeyWidth - 1, height);
        
        if (safeSettings.notePreview) {
          ctx.fillStyle = isActive ? '#ffffff' : '#6b7280';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(note, keyX + whiteKeyWidth / 2, height - 10);
        }
      }
    }

    // Draw black keys
    for (let oct = safeMidiData.octaveRange.min; oct <= safeMidiData.octaveRange.max; oct++) {
      for (const note of ['C#', 'D#', 'F#', 'G#', 'A#']) {
        const noteName = `${note}${oct}`;
        const { x } = getNotePosition(noteName);
        const keyX = (x / 800) * width;
        
        const isActive = safeActiveNotes.some(n => n.pitch === noteName);
        const isHovered = hoveredKey === noteName;
        
        if (isActive) {
          const color = safeSettings.colorMode === 'rainbow' ? 
            `hsl(${(keyX / width) * 360}, 70%, 40%)` : '#7c3aed';
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 15 * (safeSettings.glowIntensity || 1);
        } else if (isHovered) {
          ctx.fillStyle = '#374151';
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#1f2937';
          ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(keyX - blackKeyWidth / 2, 0, blackKeyWidth, blackKeyHeight);
      }
    }
  }, [safeMidiData, safeActiveNotes, hoveredKey, safeSettings, getNotePosition]);

  useEffect(() => {
    drawPiano();
  }, [drawPiano]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check black keys first
    for (let oct = safeMidiData.octaveRange.min; oct <= safeMidiData.octaveRange.max; oct++) {
      for (const note of ['C#', 'D#', 'F#', 'G#', 'A#']) {
        const noteName = `${note}${oct}`;
        const { x: keyX } = getNotePosition(noteName);
        const scaledKeyX = (keyX / 800) * rect.width;
        const blackKeyWidth = (rect.width / safeMidiData.totalWhiteKeys) * 0.6;
        const blackKeyHeight = rect.height * 0.65;
        
        if (x >= scaledKeyX - blackKeyWidth / 2 && 
            x <= scaledKeyX + blackKeyWidth / 2 && 
            y <= blackKeyHeight) {
          setHoveredKey(noteName);
          return;
        }
      }
    }

    // Check white keys
    const whiteKeyWidth = rect.width / safeMidiData.totalWhiteKeys;
    const keyIndex = Math.floor(x / whiteKeyWidth);
    const oct = safeMidiData.octaveRange.min + Math.floor(keyIndex / 7);
    const noteInOctave = keyIndex % 7;
    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    if (oct <= safeMidiData.octaveRange.max && noteInOctave < whiteNotes.length) {
      setHoveredKey(`${whiteNotes[noteInOctave]}${oct}`);
    } else {
      setHoveredKey(null);
    }
  };

  const handleClick = (e) => {
    if (hoveredKey && onKeyPress) {
      onKeyPress(hoveredKey);
    }
  };

  const getSizeClass = () => {
    switch (safeSettings.pianoSize) {
      case 'small': return 'h-12';
      case 'large': return 'h-28';
      case 'xlarge': return 'h-36';
      default: return 'h-20';
    }
  };

  if (!safeSettings.pianoVisible) return null;

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-2xl border border-gray-700">
      <div className="text-center mb-2">
        <h3 className="text-white text-sm font-semibold">Virtual Piano</h3>
        <p className="text-xs text-gray-400">Click keys to play notes</p>
      </div>
      
      <canvas
        ref={canvasRef}
        className={`w-full ${getSizeClass()} cursor-pointer rounded border border-gray-600`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredKey(null)}
        onClick={handleClick}
      />
      
      {hoveredKey && (
        <p className="text-center text-xs text-gray-400 mt-1">
          Hover: {hoveredKey}
        </p>
      )}
    </div>
  );
}

// Settings Management Hook
function useSettings() {
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

// Main App Component
export default function App() {
  const canvasRef = useRef(null);
  
  const { 
    isInitialized = false, 
    initializeAudio, 
    play, 
    pause, 
    stop, 
    currentTime = 0, 
    playbackState = 'stopped', 
    instrument = '', 
    loadInstrument, 
    availableInstruments = {},
    instrumentErrors = {},
    isInstrumentLoading = false,
    setVolume,
    setReverb,
    setChorus,
    setPlaybackRate,
    testNote
  } = useAudio();
  
  const { visualSettings, audioSettings, updateVisualSettings, updateAudioSettings } = useSettings();
  
  const [quality, setQuality] = useState('high');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  const { 
    notes = [], // Default to empty array
    pedalEvents = [], // Default to empty array
    songDuration = 0, 
    title = '', 
    composer = '', 
    availablePieces = {}, 
    currentPieceKey = '', 
    octaveRange = { min: 2, max: 6 }, 
    totalWhiteKeys = 35, 
    isLoading: isMidiLoading = false, 
    loadingText = '',
    midiErrors = [],
    seed = '',
    loadPiece, 
    loadMidiFile, 
    generateRandomPiece 
  } = useMidi();

  const { noteEmitter, stats } = useCanvas(canvasRef, {
    notes, 
    currentTime, 
    visualSettings: { ...visualSettings, playbackState },
    midiData: { octaveRange, totalWhiteKeys }, 
    quality,
    playbackState
  });

  const [isPedalActive, setIsPedalActive] = useState(false);
  const [activeNotes, setActiveNotes] = useState([]);

  const isAppLoading = isMidiLoading || isInstrumentLoading;
  const appLoadingText = isMidiLoading ? loadingText : 'Loading Instrument...';
  const hasInstrumentErrors = Object.keys(instrumentErrors).length > 0;
  const hasMidiErrors = midiErrors.length > 0;
  const hasAnyErrors = hasInstrumentErrors || hasMidiErrors;
  const allErrors = [...Object.values(instrumentErrors), ...midiErrors];

  // Initialize with default piece
  useEffect(() => {
    if (loadPiece) {
      loadPiece('clair_de_lune', quality);
    }
  }, [quality, loadPiece]);

  // Update pedal state
  useEffect(() => {
    const active = pedalEvents.some(p => currentTime >= p[0] && currentTime < p[1]);
    setIsPedalActive(active);
  }, [currentTime, pedalEvents]);

  // Update active notes
  useEffect(() => {
    const active = notes.filter(note => 
      currentTime >= note.time && currentTime < note.time + note.duration
    );
    setActiveNotes(active);
  }, [currentTime, notes]);

  // Apply audio settings
  useEffect(() => {
    if (setVolume) setVolume(audioSettings.volume);
    if (setReverb) setReverb(audioSettings.reverb);
    if (setChorus) setChorus(audioSettings.chorus);
    if (setPlaybackRate) setPlaybackRate(audioSettings.playbackRate);
  }, [audioSettings, setVolume, setReverb, setChorus, setPlaybackRate]);

  // Event Handlers
  const handlePlayPause = () => {
    if (playbackState === 'started') {
      pause && pause();
    } else {
      play && play(notes, songDuration, noteEmitter, currentTime);
    }
  };

  const handleRestart = () => {
    stop && stop();
    setTimeout(() => play && play(notes, songDuration, noteEmitter, 0), 50);
  };
  
  const handlePieceChange = (pieceKey) => { 
    stop && stop(); 
    loadPiece && loadPiece(pieceKey, quality); 
  };
  
  const handleFileChange = (file) => { 
    stop && stop(); 
    loadMidiFile && loadMidiFile(file, quality); 
  };
  
  // FIXED: Robust instrument switching with proper error handling
  const handleInstrumentChange = async (instrumentKey) => {
    if (!instrumentKey || !availableInstruments[instrumentKey]) {
      console.error('Invalid instrument key:', instrumentKey);
      return;
    }

    // Don't do anything if we're already using this instrument
    if (instrument === instrumentKey && !isInstrumentLoading) {
      console.log('Already using instrument:', instrumentKey);
      return;
    }

    try {
      const wasPlaying = playbackState === 'started';
      const currentTrackTime = currentTime;
      
      console.log(`🎹 Switching to instrument: ${instrumentKey}`);
      
      // Stop playback first
      if (wasPlaying && stop) {
        stop();
      }
      
      // Load the new instrument
      if (loadInstrument) {
        await loadInstrument(instrumentKey);
        console.log(`✅ Successfully loaded: ${availableInstruments[instrumentKey]?.name}`);
        
        // Resume playback if it was playing before
        if (wasPlaying && play) {
          // Small delay to ensure instrument is fully connected
          setTimeout(() => {
            console.log(`▶️ Resuming playback with new instrument`);
            play(notes, songDuration, noteEmitter, currentTrackTime);
          }, 150);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to change instrument to ${instrumentKey}:`, error);
      
      // Try to fall back to a reliable instrument if the change failed
      const reliableInstruments = Object.keys(availableInstruments).filter(
        key => availableInstruments[key]?.reliable
      );
      
      if (reliableInstruments.length > 0 && reliableInstruments[0] !== instrumentKey) {
        console.log(`🔄 Falling back to reliable instrument: ${reliableInstruments[0]}`);
        try {
          await loadInstrument(reliableInstruments[0]);
        } catch (fallbackError) {
          console.error('Failed to load fallback instrument:', fallbackError);
        }
      }
    }
  };

  const handleGenerate = (options) => {
    stop && stop();
    generateRandomPiece && generateRandomPiece({ ...options, quality });
    setIsGeneratorOpen(false);
  };

  const handleDownloadMidi = () => {
    if (!notes || notes.length === 0) {
      console.warn("No notes to save!");
      return;
    }
    
    try {
      const midi = new Midi();
      const track = midi.addTrack();
      track.name = title;
      
      notes.forEach(note => {
        track.addNote({
          name: note.pitch,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity,
        });
      });
      
      const blob = new Blob([midi.toArray()], { type: "audio/midi" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/ /g, '_')}.mid`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download MIDI:', error);
    }
  };

  // FIXED: Use the proper testNote function from AudioContext instead of creating new instruments
  const handlePianoKeyPress = useCallback((noteName) => {
    if (testNote && isInitialized) {
      testNote(noteName, '8n');
    } else {
      console.warn('Piano key press failed - audio not initialized or testNote not available');
    }
  }, [testNote, isInitialized]);

  // Get piano positioning
  const getPianoContainerClass = () => {
    if (!visualSettings.pianoVisible) return 'hidden';
    
    const positionClasses = {
      bottom: 'fixed bottom-4 left-4 right-4',
      top: 'fixed top-24 left-4 right-4',
      left: 'fixed left-4 top-1/2 transform -translate-y-1/2 w-80',
      right: 'fixed right-4 top-1/2 transform -translate-y-1/2 w-80',
      floating: 'fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96'
    };
    
    return `${positionClasses[visualSettings.pianoPosition || 'bottom']} z-30`;
  };

  if (!isInitialized) {
    return (
      <StartScreen 
        onStart={initializeAudio} 
        hasErrors={hasInstrumentErrors}
        errorCount={Object.keys(instrumentErrors).length}
      />
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-black font-sans text-gray-200">
      {/* Modals */}
      {isGeneratorOpen && (
        <MidiGeneratorUI 
          onGenerate={handleGenerate} 
          onCancel={() => setIsGeneratorOpen(false)} 
        />
      )}
      
      {isAppLoading && <LoadingOverlay text={appLoadingText} />}
      
      {showErrorModal && allErrors.length > 0 && (
        <ErrorModal 
          errors={allErrors} 
          onClose={() => setShowErrorModal(false)} 
        />
      )}

      {/* Header */}
      <Header 
        title={title} 
        composer={composer}
        availablePieces={availablePieces}
        currentPieceKey={currentPieceKey}
        instrumentList={availableInstruments}
        instrument={instrument}
        onPieceChange={handlePieceChange}
        onFileChange={handleFileChange}
        onInstrumentChange={handleInstrumentChange}
        onQualityChange={setQuality}
        quality={quality}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        hasErrors={hasAnyErrors}
        onShowErrors={() => setShowErrorModal(true)}
        seed={seed}
      />

      {/* Main Canvas */}
      <div className="flex-grow relative">
        <canvas 
          id="visualizer-canvas" 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full"
        />
        
        {/* Virtual Piano */}
        <div className={getPianoContainerClass()}>
          <VirtualPiano
            midiData={{ octaveRange, totalWhiteKeys }}
            activeNotes={activeNotes}
            onKeyPress={handlePianoKeyPress}
            settings={visualSettings}
          />
        </div>
        
        {/* Stats */}
        {visualSettings.showStats && (
          <StatsDisplay 
            stats={stats} 
            noteCount={notes.length}
            activeNotes={activeNotes.length}
            instrument={availableInstruments[instrument]?.name}
            seed={seed}
          />
        )}
      </div>

      {/* Footer Controls */}
      <footer className="w-full p-4 flex flex-col items-center gap-4 bg-black bg-opacity-50 z-20">
        <PlaybackControls 
          onPlayPause={handlePlayPause} 
          onRestart={handleRestart} 
          onSpeedChange={(rate) => updateAudioSettings({ playbackRate: rate })}
          onDownloadMidi={handleDownloadMidi}
          isPedalActive={isPedalActive}
          playbackState={playbackState}
          audioSettings={audioSettings}
        />
        
        <div className="flex justify-center items-start gap-6 flex-wrap max-w-7xl">
          <SoundFXControls 
            onVolumeChange={(val) => updateAudioSettings({ volume: val })}
            onReverbChange={(val) => updateAudioSettings({ reverb: val })}
            onChorusChange={(val) => updateAudioSettings({ chorus: val })}
            audioSettings={audioSettings}
          />
          
          <VisualFXControls 
            settings={visualSettings} 
            onSettingChange={updateVisualSettings} 
          />
        </div>
      </footer>
    </div>
  );
}