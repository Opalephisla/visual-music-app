import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';

const VirtualPiano = ({ 
  midiData, 
  activeNotes = [], 
  settings = {},
  className = "",
  onKeyPress,
  style = {}
}) => {
  const canvasRef = useRef(null);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const { testNote } = useAudio();

  const getNotePosition = useCallback((noteName) => {
    if (!midiData.totalWhiteKeys) return { x: 0, isBlack: false, width: 0 };
    
    const flatToSharpMap = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    const noteMap = { 
      'C': 0, 'C#': 0.5, 'D': 1, 'D#': 1.5, 'E': 2, 'F': 3, 
      'F#': 3.5, 'G': 4, 'G#': 4.5, 'A': 5, 'A#': 5.5, 'B': 6 
    };
    
    let pitchName = noteName.replace(/[0-9]/g, '');
    const octave = parseInt(noteName.slice(-1), 10);
    if (flatToSharpMap[pitchName]) pitchName = flatToSharpMap[pitchName];
    
    const isBlack = pitchName.includes('#');
    const whiteKeyWidth = 800 / midiData.totalWhiteKeys; // Fixed reference width
    const posInWhiteKeys = (octave - midiData.octaveRange.min) * 7 + Math.floor(noteMap[pitchName] || 0);
    let x = posInWhiteKeys * whiteKeyWidth;
    
    return { x, isBlack, width: whiteKeyWidth };
  }, [midiData]);

  const getColorForNote = useCallback((noteName, isActive, isHovered, isPressed) => {
    const { x, width } = getNotePosition(noteName);
    const normalizedPosition = x / (800); // Normalize to 0-1
    
    if (isPressed) {
      return settings.colorMode === 'rainbow' ? 
        `hsl(${normalizedPosition * 360}, 80%, 50%)` : '#7c3aed';
    }
    
    if (isActive) {
      return settings.colorMode === 'rainbow' ? 
        `hsl(${normalizedPosition * 360}, 70%, 60%)` : '#a855f7';
    }
    
    if (isHovered) {
      return settings.colorMode === 'rainbow' ? 
        `hsl(${normalizedPosition * 360}, 50%, 80%)` : '#e5e7eb';
    }
    
    return null; // Default color
  }, [getNotePosition, settings.colorMode]);

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

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!midiData.totalWhiteKeys) return;

    const whiteKeyWidth = width / midiData.totalWhiteKeys;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = height * 0.65;

    // Draw white keys background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw white keys with effects
    for (let oct = midiData.octaveRange.min; oct <= midiData.octaveRange.max; oct++) {
      for (const note of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
        const noteName = `${note}${oct}`;
        const { x } = getNotePosition(noteName);
        const keyX = (x / 800) * width; // Scale to actual width
        
        const isActive = activeNotes.some(n => n.pitch === noteName);
        const isHovered = hoveredKey === noteName;
        const isPressed = pressedKeys.has(noteName);
        
        const keyColor = getColorForNote(noteName, isActive, isHovered, isPressed);
        
        // Draw key background
        if (keyColor) {
          ctx.fillStyle = keyColor;
          if (settings.keyGlow && (isActive || isPressed)) {
            ctx.shadowColor = keyColor;
            ctx.shadowBlur = 15 * (settings.glowIntensity || 1);
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fillRect(keyX, 0, whiteKeyWidth - 1, height);
        }
        
        // Draw key border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isHovered ? '#9ca3af' : '#d1d5db';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.strokeRect(keyX, 0, whiteKeyWidth - 1, height);
        
        // Draw note label if enabled
        if (settings.notePreview) {
          ctx.fillStyle = (isActive || isPressed) ? '#ffffff' : '#6b7280';
          ctx.font = `${Math.min(whiteKeyWidth * 0.2, 12)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(note, keyX + whiteKeyWidth / 2, height - 8);
        }
      }
    }

    // Draw black keys
    for (let oct = midiData.octaveRange.min; oct <= midiData.octaveRange.max; oct++) {
      for (const note of ['C#', 'D#', 'F#', 'G#', 'A#']) {
        const noteName = `${note}${oct}`;
        const { x } = getNotePosition(noteName);
        const keyX = (x / 800) * width; // Scale to actual width
        
        const isActive = activeNotes.some(n => n.pitch === noteName);
        const isHovered = hoveredKey === noteName;
        const isPressed = pressedKeys.has(noteName);
        
        const keyColor = getColorForNote(noteName, isActive, isHovered, isPressed);
        
        if (keyColor) {
          ctx.fillStyle = keyColor;
          if (settings.keyGlow && (isActive || isPressed)) {
            ctx.shadowColor = keyColor;
            ctx.shadowBlur = 15 * (settings.glowIntensity || 1);
          } else {
            ctx.shadowBlur = 0;
          }
        } else if (isHovered) {
          ctx.fillStyle = '#374151';
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#1f2937';
          ctx.shadowBlur = 0;
        }
        
        // Draw black key
        ctx.fillRect(keyX - blackKeyWidth / 2, 0, blackKeyWidth, blackKeyHeight);
        
        // Draw subtle border for black keys
        if (isHovered) {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#6b7280';
          ctx.lineWidth = 1;
          ctx.strokeRect(keyX - blackKeyWidth / 2, 0, blackKeyWidth, blackKeyHeight);
        }
      }
    }
  }, [midiData, activeNotes, hoveredKey, pressedKeys, settings, getNotePosition, getColorForNote]);

  // Redraw when dependencies change
  useEffect(() => {
    drawPiano();
  }, [drawPiano]);

  // Handle mouse interactions
  const getKeyFromPosition = useCallback((clientX, clientY, rect) => {
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    // Check black keys first (they're on top)
    for (let oct = midiData.octaveRange.min; oct <= midiData.octaveRange.max; oct++) {
      for (const note of ['C#', 'D#', 'F#', 'G#', 'A#']) {
        const noteName = `${note}${oct}`;
        const { x: keyX } = getNotePosition(noteName);
        const scaledKeyX = (keyX / 800) * width;
        const blackKeyWidth = (width / midiData.totalWhiteKeys) * 0.6;
        const blackKeyHeight = height * 0.65;
        
        if (x >= scaledKeyX - blackKeyWidth / 2 && 
            x <= scaledKeyX + blackKeyWidth / 2 && 
            y <= blackKeyHeight) {
          return noteName;
        }
      }
    }

    // Check white keys
    const whiteKeyWidth = width / midiData.totalWhiteKeys;
    const keyIndex = Math.floor(x / whiteKeyWidth);
    const oct = midiData.octaveRange.min + Math.floor(keyIndex / 7);
    const noteInOctave = keyIndex % 7;
    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    if (oct <= midiData.octaveRange.max && noteInOctave < whiteNotes.length) {
      return `${whiteNotes[noteInOctave]}${oct}`;
    }
    
    return null;
  }, [midiData, getNotePosition]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const key = getKeyFromPosition(e.clientX, e.clientY, rect);
    setHoveredKey(key);
  }, [getKeyFromPosition]);

  const handleMouseLeave = useCallback(() => {
    setHoveredKey(null);
  }, []);

  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const key = getKeyFromPosition(e.clientX, e.clientY, rect);
    
    if (key) {
      setPressedKeys(prev => new Set([...prev, key]));
      
      // Play the note
      if (testNote) {
        testNote(key, '8n');
      }
      
      // Call external handler if provided
      if (onKeyPress) {
        onKeyPress(key);
      }
    }
  }, [getKeyFromPosition, testNote, onKeyPress]);

  const handleMouseUp = useCallback(() => {
    setPressedKeys(new Set());
  }, []);

  // Keyboard support
  useEffect(() => {
    const keyMap = {
      'KeyA': 'C4', 'KeyW': 'C#4', 'KeyS': 'D4', 'KeyE': 'D#4', 'KeyD': 'E4',
      'KeyF': 'F4', 'KeyT': 'F#4', 'KeyG': 'G4', 'KeyY': 'G#4', 'KeyH': 'A4',
      'KeyU': 'A#4', 'KeyJ': 'B4', 'KeyK': 'C5', 'KeyO': 'C#5', 'KeyL': 'D5',
      'KeyP': 'D#5', 'Semicolon': 'E5'
    };

    const handleKeyDown = (e) => {
      const note = keyMap[e.code];
      if (note && !pressedKeys.has(note)) {
        setPressedKeys(prev => new Set([...prev, note]));
        if (testNote) {
          testNote(note, '8n');
        }
        if (onKeyPress) {
          onKeyPress(note);
        }
      }
    };

    const handleKeyUp = (e) => {
      const note = keyMap[e.code];
      if (note) {
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(note);
          return newSet;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKeys, testNote, onKeyPress]);

  const getSizeClass = () => {
    switch (settings.pianoSize) {
      case 'small': return 'h-12';
      case 'large': return 'h-28';
      case 'xlarge': return 'h-36';
      default: return 'h-20';
    }
  };

  return (
    <div className={`bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-2xl border border-gray-700 ${className}`} style={style}>
      {settings.showPianoTitle !== false && (
        <div className="text-center mb-2">
          <h3 className="text-white text-sm font-semibold">Virtual Piano</h3>
          <p className="text-xs text-gray-400">Click keys or use keyboard (A-L row)</p>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className={`w-full ${getSizeClass()} cursor-pointer rounded border border-gray-600 hover:border-gray-500 transition-colors`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />
      
      {(hoveredKey || pressedKeys.size > 0) && (
        <div className="text-center mt-2">
          <p className="text-xs text-gray-400">
            {pressedKeys.size > 0 ? 
              `Playing: ${Array.from(pressedKeys).join(', ')}` : 
              `Hover: ${hoveredKey}`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default VirtualPiano;