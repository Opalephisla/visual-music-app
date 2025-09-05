import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';

// Import context and hooks
import { useAudio } from './context/AudioContext';
import { useMidi } from './hooks/useMidi';
import { useCanvas } from './hooks/useCanvas';
import { useSettings } from './hooks/useSettings';

// Import components
import Header from './components/Header';
import LoadingOverlay from './components/LoadingOverlay';
import StatsDisplay from './components/StatsDisplay';
import MidiGeneratorUI from './components/MidiGeneratorUI';
import VirtualPiano from './components/VirtualPiano';
import Footer from './components/Footer';

// Start Screen Component
function StartScreen({ onStart }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Simple star animation
    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      stars.forEach(star => {
        star.y = (star.y + star.speed) % 1;
        ctx.globalAlpha = star.size / 2;
        ctx.beginPath();
        ctx.arc(star.x * canvas.width, star.y * canvas.height, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="relative z-10 text-center px-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Visual Music Interpreter
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Experience music through stunning visual representations
        </p>
        <button
          onClick={onStart}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
        >
          Start Experience
        </button>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const canvasRef = useRef(null);
  
  // Audio context
  const { 
    isInitialized, 
    initializeAudio, 
    play, 
    pause, 
    stop, 
    currentTime, 
    playbackState, 
    instrument, 
    loadInstrument, 
    availableInstruments, 
    isInstrumentLoading,
    testNote
  } = useAudio();
  
  // Settings
  const { visualSettings, audioSettings, updateVisualSettings, updateAudioSettings } = useSettings();
  
  // State
  const [quality, setQuality] = useState('high');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  
  // MIDI data
  const { 
    notes, 
    pedalEvents, 
    songDuration, 
    title, 
    composer, 
    availablePieces, 
    currentPieceKey, 
    octaveRange, 
    totalWhiteKeys, 
    isLoading: isMidiLoading, 
    loadingText, 
    loadPiece, 
    loadMidiFile, 
    generateRandomPiece 
  } = useMidi();

  // Canvas hook
  const { noteEmitter, stats } = useCanvas(canvasRef, {
    notes, 
    visualSettings: { ...visualSettings, playbackState },
    midiData: { octaveRange, totalWhiteKeys }, 
    quality,
    currentInstrument: instrument
  });

  const [isPedalActive, setIsPedalActive] = useState(false);
  const [activeNotes, setActiveNotes] = useState([]);

  // Initialize default piece
  useEffect(() => {
    if (isInitialized && loadPiece && !currentPieceKey) {
      loadPiece('clair_de_lune', quality);
    }
  }, [isInitialized, quality, loadPiece, currentPieceKey]);

  // Update pedal and active notes
  useEffect(() => {
    if (pedalEvents && notes) {
      const active = pedalEvents.some(p => currentTime >= p[0] && currentTime < p[1]);
      setIsPedalActive(active);
      const activeN = notes.filter(note => 
        currentTime >= note.time && currentTime < note.time + note.duration
      );
      setActiveNotes(activeN);
    }
  }, [currentTime, pedalEvents, notes]);

  // Handlers
  const handlePlayPause = () => {
    if (!notes || notes.length === 0) return;
    
    if (playbackState === 'started') {
      pause && pause();
    } else {
      play && play(notes, songDuration, noteEmitter, currentTime);
    }
  };

  const handleRestart = () => {
    if (!notes || notes.length === 0) return;
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
    
    if (wasPlaying && notes) {
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
      track.addNote({ 
        name: note.pitch, 
        time: note.time, 
        duration: note.duration, 
        velocity: note.velocity 
      });
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
  
  // Show start screen if not initialized
  if (!isInitialized) {
    return <StartScreen onStart={initializeAudio} />;
  }

  // Main render
  return (
    <div className="w-screen h-screen flex flex-col bg-black text-gray-200 overflow-hidden">
      {isGeneratorOpen && (
        <MidiGeneratorUI 
          onGenerate={handleGenerate} 
          onCancel={() => setIsGeneratorOpen(false)} 
        />
      )}
      
      {(isMidiLoading || isInstrumentLoading) && (
        <LoadingOverlay text={isMidiLoading ? loadingText : 'Loading Instrument...'} />
      )}

      <Header 
        title={title || 'Visual Music Interpreter'} 
        composer={composer || 'Select a piece'} 
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
      />
      
      <main className="flex-grow flex flex-col relative">
        {/* Visualizer Canvas */}
        <div className="flex-grow relative">
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full" 
            style={{ display: 'block' }}
          />
          {visualSettings.showStats && (
            <StatsDisplay stats={stats} noteCount={notes ? notes.length : 0} />
          )}
        </div>
        
        {/* Virtual Piano */}
        {visualSettings.pianoVisible && (
          <div className="w-full px-4 py-2 bg-black/50">
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