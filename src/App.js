import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';

// Import context and hooks
import { useAudio } from './context/AudioContext';
import { useMidi } from './hooks/useMidi';
import { useCanvas } from './hooks/useCanvas';
import { useSettings } from './hooks/useSettings'; // <-- NEW

// Import components
import Header from './components/Header';
import LoadingOverlay from './components/LoadingOverlay';
import StatsDisplay from './components/StatsDisplay';
import MidiGeneratorUI from './components/MidiGeneratorUI';
import VirtualPiano from './components/VirtualPiano';
import Footer from './components/Footer';

// Enhanced Start Screen Component (can be moved to its own file later)
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

// Error Modal Component (can be moved to its own file later)
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

// Main App Component
export default function App() {
  const canvasRef = useRef(null);
  
  const { 
    isInitialized, initializeAudio, play, pause, stop, currentTime, playbackState, 
    instrument, loadInstrument, availableInstruments, instrumentErrors, isInstrumentLoading,
    testNote
  } = useAudio();
  
  const { visualSettings, audioSettings, updateVisualSettings, updateAudioSettings } = useSettings();
  
  const [quality, setQuality] = useState('high');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  const { 
    notes, pedalEvents, songDuration, title, composer, availablePieces, 
    currentPieceKey, octaveRange, totalWhiteKeys, isLoading: isMidiLoading, 
    loadingText, midiErrors, seed, loadPiece, loadMidiFile, generateRandomPiece 
  } = useMidi();

  const { noteEmitter, stats } = useCanvas(canvasRef, {
    notes, 
    visualSettings: { ...visualSettings, playbackState },
    midiData: { octaveRange, totalWhiteKeys }, 
    quality,
    currentInstrument: instrument
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
    if (loadPiece && !currentPieceKey) {
      loadPiece('clair_de_lune', quality);
    }
  }, [quality, loadPiece, currentPieceKey]);

  // Update pedal and active notes
  useEffect(() => {
    const active = pedalEvents.some(p => currentTime >= p[0] && currentTime < p[1]);
    setIsPedalActive(active);
    const activeN = notes.filter(note => currentTime >= note.time && currentTime < note.time + note.duration);
    setActiveNotes(activeN);
  }, [currentTime, pedalEvents, notes]);

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
  
  const handleInstrumentChange = async (instrumentKey) => {
    if (!instrumentKey || instrument === instrumentKey) return;
    const wasPlaying = playbackState === 'started';
    const currentTrackTime = currentTime;
    if (wasPlaying) stop();
    await loadInstrument(instrumentKey);
    if (wasPlaying) {
      setTimeout(() => play(notes, songDuration, noteEmitter, currentTrackTime), 150);
    }
  };

  const handleGenerate = (options) => {
    stop && stop();
    generateRandomPiece && generateRandomPiece({ ...options, quality });
    setIsGeneratorOpen(false);
  };

  const handleDownloadMidi = () => {
    if (!notes || notes.length === 0) return;
    const midi = new Midi();
    const track = midi.addTrack();
    track.name = title;
    notes.forEach(note => {
      track.addNote({ name: note.pitch, time: note.time, duration: note.duration, velocity: note.velocity });
    });
    const blob = new Blob([midi.toArray()], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/ /g, '_')}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePianoKeyPress = useCallback((noteName) => {
    if (testNote && isInitialized) {
      testNote(noteName, '8n');
    }
  }, [testNote, isInitialized]);
  
  if (!isInitialized) {
    return <StartScreen onStart={initializeAudio} hasErrors={hasInstrumentErrors} errorCount={Object.keys(instrumentErrors).length} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-black font-sans text-gray-200">
      {isGeneratorOpen && <MidiGeneratorUI onGenerate={handleGenerate} onCancel={() => setIsGeneratorOpen(false)} />}
      {isAppLoading && <LoadingOverlay text={appLoadingText} />}
      {showErrorModal && allErrors.length > 0 && <ErrorModal errors={allErrors} onClose={() => setShowErrorModal(false)} />}

      <Header 
        title={title} composer={composer} availablePieces={availablePieces} currentPieceKey={currentPieceKey}
        instrumentList={availableInstruments} instrument={instrument} onPieceChange={handlePieceChange}
        onFileChange={handleFileChange} onInstrumentChange={handleInstrumentChange} onQualityChange={setQuality}
        quality={quality} onOpenGenerator={() => setIsGeneratorOpen(true)} hasErrors={hasAnyErrors}
        onShowErrors={() => setShowErrorModal(true)} seed={seed}
      />
      
      {/* ** NEW LAYOUT STRUCTURE ** */}
      <main className="flex-grow flex flex-col min-h-0">
        {/* Visualizer Canvas */}
        <div className="flex-grow relative w-full">
            <canvas id="visualizer-canvas" ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
            {visualSettings.showStats && <StatsDisplay stats={stats} noteCount={notes.length} />}
        </div>
        
        {/* Virtual Piano */}
        {visualSettings.pianoVisible && (
            <div className="w-full px-2 sm:px-4 py-2">
                <VirtualPiano
                    midiData={{ octaveRange, totalWhiteKeys }}
                    activeNotes={activeNotes}
                    onKeyPress={handlePianoKeyPress}
                    settings={visualSettings}
                />
            </div>
        )}
      </main>

      <Footer
        onPlayPause={handlePlayPause}
        onRestart={handleRestart}
        onDownloadMidi={handleDownloadMidi}
        isPedalActive={isPedalActive}
        visualSettings={visualSettings}
        audioSettings={audioSettings}
        updateVisualSettings={updateVisualSettings}
        updateAudioSettings={updateAudioSettings}
      />
    </div>
  );
}