import React, { useState, useEffect, useRef } from 'react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { useMidi } from './hooks/useMidi';
import { useCanvas } from './hooks/useCanvas';
import { useAudio } from './context/AudioContext';
import { INSTRUMENTS } from './instruments';

import Header from './components/Header';
import LoadingOverlay from './components/LoadingOverlay';
import PlaybackControls from './components/PlaybackControls';
import SoundFXControls from './components/SoundFXControls';
import VisualFXControls from './components/VisualFXControls';
import StatsDisplay from './components/StatsDisplay';
import MidiGeneratorUI from './components/MidiGeneratorUI';

// A more polished, animated introduction screen component
function StartScreen({ onStart }) {
  const canvasRef = useRef(null);

  // This useEffect creates the animated starfield background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    class Star {
      constructor() { this.reset(); this.y = Math.random(); }
      reset() { this.x = Math.random(); this.y = 0; this.z = Math.random() * 0.8 + 0.2; }
      update(width, height) { this.y += (this.z * 0.7) / height; if (this.y > 1) this.reset(); }
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
      if(!ctx || !canvas) return;
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
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-50"></canvas>
      <div className="text-center z-10 animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">Visual Music Interpreter</h1>
        <p className="text-lg text-gray-400 mb-10">Generate, upload, and experience music visually.</p>
        <button 
          onClick={onStart} 
          className="px-8 py-4 bg-fuchsia-600 text-white font-semibold rounded-lg shadow-lg hover:bg-fuchsia-700 transition-all duration-300 hover:scale-110 transform active:scale-100 animate-pulse"
        >
          Start
        </button>
      </div>
    </div>
  );
}


export default function App() {
  const canvasRef = useRef(null);
  
  const { isInitialized, initializeAudio, play, pause, stop, currentTime, playbackState, instrument, loadInstrument, ...audioControls } = useAudio();
  
  const [quality, setQuality] = useState('high');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [visualSettings, setVisualSettings] = useState({
    particlesEnabled: true, lightBeamsEnabled: true, noteFlow: 'anticipation',
    background: 'solid', showStats: false,
  });
  const [isPedalActive, setIsPedalActive] = useState(false);

  const { notes, pedalEvents, songDuration, title, composer, availablePieces, currentPieceKey, octaveRange, totalWhiteKeys, isLoading: isMidiLoading, loadingText, loadPiece, loadMidiFile, generateRandomPiece } = useMidi();
  const { noteEmitter, stats } = useCanvas(canvasRef, {
    notes, currentTime, visualSettings: { ...visualSettings, playbackState },
    midiData: { octaveRange, totalWhiteKeys }, quality,
  });

  const isAppLoading = isMidiLoading || audioControls.isInstrumentLoading;
  const appLoadingText = isMidiLoading ? loadingText : 'Loading Instrument...';

  useEffect(() => {
    loadPiece('clair_de_lune', quality);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality]);

  useEffect(() => {
    const active = pedalEvents.some(p => currentTime >= p[0] && currentTime < p[1]);
    setIsPedalActive(active);
  }, [currentTime, pedalEvents]);
  
  // --- Event Handlers ---
  const handlePlayPause = () => {
    if (playbackState === 'started') {
      pause();
    } else {
      play(notes, songDuration, noteEmitter, currentTime);
    }
  };

  const handleRestart = () => {
    stop();
    setTimeout(() => play(notes, songDuration, noteEmitter, 0), 50);
  };
  
  const handlePieceChange = (pieceKey) => { stop(); loadPiece(pieceKey, quality); };
  const handleFileChange = (file) => { stop(); loadMidiFile(file, quality); };
  
  const handleInstrumentChange = async (instrumentKey) => {
    const wasPlaying = playbackState === 'started';
    const currentTrackTime = currentTime;
    
    stop();
    await loadInstrument(instrumentKey);

    if (wasPlaying) {
      play(notes, songDuration, noteEmitter, currentTrackTime);
    }
  };

  const handleGenerate = (options) => {
    stop();
    generateRandomPiece({ ...options, quality });
    setIsGeneratorOpen(false);
  };

  const handleDownloadMidi = () => {
    if (notes.length === 0) {
      console.warn("No notes to save!");
      return;
    }
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
  };

  if (!isInitialized) {
    return <StartScreen onStart={initializeAudio} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-black font-sans text-gray-200">
      {isGeneratorOpen && <MidiGeneratorUI onGenerate={handleGenerate} onCancel={() => setIsGeneratorOpen(false)} />}
      {isAppLoading && <LoadingOverlay text={appLoadingText} />}
      {visualSettings.showStats && <StatsDisplay stats={stats} noteCount={notes.length} />}
      
      <Header 
        title={title} 
        composer={composer}
        availablePieces={availablePieces}
        currentPieceKey={currentPieceKey}
        instrumentList={INSTRUMENTS}
        instrument={instrument}
        onPieceChange={handlePieceChange}
        onFileChange={handleFileChange}
        onInstrumentChange={handleInstrumentChange}
        onQualityChange={setQuality}
        quality={quality}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
      />

      <div className="flex-grow relative">
        <canvas id="visualizer-canvas" ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
      </div>

      <footer className="w-full p-4 flex flex-col items-center gap-4 bg-black bg-opacity-50 z-20">
        <PlaybackControls 
          onPlayPause={handlePlayPause} 
          onRestart={handleRestart} 
          onSpeedChange={audioControls.setPlaybackRate}
          onDownloadMidi={handleDownloadMidi}
          isPedalActive={isPedalActive}
        />
        <div className="flex justify-center items-start gap-6 flex-wrap">
          <SoundFXControls 
            onVolumeChange={audioControls.setVolume} 
            onReverbChange={audioControls.setReverb} 
            onChorusChange={audioControls.setChorus} 
          />
          <VisualFXControls settings={visualSettings} onSettingChange={setVisualSettings} />
        </div>
      </footer>
    </div>
  );
}

