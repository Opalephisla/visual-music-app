import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

const KEYBOARD_HEIGHT = 100;

export function useCanvas(canvasRef, { notes, visualSettings, midiData, quality }) {
  const animationFrameRef = useRef();
  const particlesRef = useRef([]);
  const statsRef = useRef({ fps: 60, active: 0 });
  const lastTimeRef = useRef(performance.now());

  // Color function for notes
  const getNoteColor = (pitch) => {
    const colors = [
      '#a855f7', '#d946ef', '#ec4899', '#f472b6', 
      '#818cf8', '#60a5fa', '#38bdf8', '#22d3ee',
      '#67e8f9', '#c084fc', '#e879f9', '#f0abfc'
    ];
    const noteIndex = pitch.charCodeAt(0) % colors.length;
    return colors[noteIndex];
  };

  // Calculate note position on piano
  const getNotePosition = useCallback((noteName) => {
    const canvas = canvasRef.current;
    if (!canvas || !midiData.totalWhiteKeys) return { x: 50, width: 20, isBlack: false };
    
    const width = canvas.width;
    const whiteKeyWidth = width / Math.max(midiData.totalWhiteKeys, 1);
    
    // Parse note name
    const noteBase = noteName.slice(0, -1).replace('#', '');
    const isSharp = noteName.includes('#');
    const octave = parseInt(noteName.slice(-1)) || 4;
    
    // Map note names to positions
    const noteMap = { 
      'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 
    };
    
    // Calculate position
    const notePosition = noteMap[noteBase] || 0;
    const octaveOffset = (octave - (midiData.octaveRange.min || 3)) * 7;
    const position = octaveOffset + notePosition;
    
    let x = position * whiteKeyWidth + whiteKeyWidth / 2;
    
    // Adjust for black keys
    if (isSharp) {
      // Black keys are between white keys
      const blackKeyOffsets = {
        'C#': 0.5, 'D#': 1.5, 'F#': 3.5, 'G#': 4.5, 'A#': 5.5
      };
      const blackNoteBase = noteBase + '#';
      const offset = blackKeyOffsets[blackNoteBase] || 0;
      x = (octaveOffset + offset) * whiteKeyWidth + whiteKeyWidth / 2;
    }
    
    return { 
      x, 
      width: whiteKeyWidth,
      isBlack: isSharp
    };
  }, [midiData, canvasRef]);

  // Main draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const time = Tone.Transport.seconds;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw background gradient
    if (visualSettings.background === 'gradient' || visualSettings.background === 'starfield') {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.05)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    const pianoY = height - KEYBOARD_HEIGHT;
    
    // ============= DRAW PIANO KEYS =============
    
    // Draw piano background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, pianoY, width, KEYBOARD_HEIGHT);
    
    // Calculate key dimensions
    const totalWhiteKeys = midiData.totalWhiteKeys || 35;
    const whiteKeyWidth = width / totalWhiteKeys;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = KEYBOARD_HEIGHT * 0.65;
    
    // Draw white keys
    for (let i = 0; i < totalWhiteKeys; i++) {
      const x = i * whiteKeyWidth;
      
      // White key background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, pianoY, whiteKeyWidth - 1, KEYBOARD_HEIGHT);
      
      // Key border
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + whiteKeyWidth - 1, pianoY);
      ctx.lineTo(x + whiteKeyWidth - 1, height);
      ctx.stroke();
    }
    
    // Draw black keys
    const minOctave = midiData.octaveRange?.min || 2;
    const maxOctave = midiData.octaveRange?.max || 6;
    
    for (let oct = minOctave; oct <= maxOctave; oct++) {
      // Black key pattern: C#, D#, (skip E#), F#, G#, A#, (skip B#)
      const blackKeys = [
        { note: 'C#', position: 0.5 },
        { note: 'D#', position: 1.5 },
        { note: 'F#', position: 3.5 },
        { note: 'G#', position: 4.5 },
        { note: 'A#', position: 5.5 }
      ];
      
      blackKeys.forEach(({ note, position }) => {
        const octaveOffset = (oct - minOctave) * 7;
        const keyPosition = octaveOffset + position;
        
        if (keyPosition < totalWhiteKeys) {
          const x = keyPosition * whiteKeyWidth;
          
          ctx.fillStyle = '#000000';
          ctx.fillRect(
            x - blackKeyWidth / 2, 
            pianoY, 
            blackKeyWidth, 
            blackKeyHeight
          );
          
          // Add slight gradient to black keys
          const blackGradient = ctx.createLinearGradient(
            x - blackKeyWidth / 2, pianoY,
            x - blackKeyWidth / 2, pianoY + blackKeyHeight
          );
          blackGradient.addColorStop(0, '#333333');
          blackGradient.addColorStop(1, '#000000');
          ctx.fillStyle = blackGradient;
          ctx.fillRect(
            x - blackKeyWidth / 2 + 1, 
            pianoY + 1, 
            blackKeyWidth - 2, 
            blackKeyHeight - 1
          );
        }
      });
    }
    
    // Highlight active keys
    if (notes && notes.length > 0) {
      notes.forEach(note => {
        if (!note.pitch || typeof note.time !== 'number') return;
        
        // Check if note is currently active
        if (time >= note.time && time < note.time + (note.duration || 0.5)) {
          const { x, width: keyWidth, isBlack } = getNotePosition(note.pitch);
          const color = getNoteColor(note.pitch);
          
          if (isBlack) {
            // Highlight black key
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.7;
            ctx.fillRect(
              x - blackKeyWidth / 2,
              pianoY,
              blackKeyWidth,
              blackKeyHeight
            );
            
            // Add glow
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.fillRect(
              x - blackKeyWidth / 2,
              pianoY,
              blackKeyWidth,
              blackKeyHeight
            );
            ctx.shadowBlur = 0;
          } else {
            // Highlight white key
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(
              x - keyWidth / 2,
              pianoY,
              keyWidth - 1,
              KEYBOARD_HEIGHT
            );
            
            // Add glow
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.fillRect(
              x - keyWidth / 2,
              pianoY,
              keyWidth - 1,
              KEYBOARD_HEIGHT
            );
            ctx.shadowBlur = 0;
          }
          
          ctx.globalAlpha = 1;
        }
      });
    }
    
    // Draw hit line
    ctx.strokeStyle = '#e9d5ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, pianoY);
    ctx.lineTo(width, pianoY);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // ============= DRAW FALLING NOTES =============
    
    if (notes && notes.length > 0) {
      const pixelsPerSecond = 100;
      let activeCount = 0;
      
      notes.forEach(note => {
        if (!note.pitch || typeof note.time !== 'number') return;
        
        const noteY = pianoY - ((time - note.time) * pixelsPerSecond);
        const noteHeight = (note.duration || 0.5) * pixelsPerSecond;
        
        // Only draw notes that are visible
        if (noteY + noteHeight > 0 && noteY < height) {
          const { x, width: keyWidth, isBlack } = getNotePosition(note.pitch);
          const color = getNoteColor(note.pitch);
          
          // Note width based on key type
          const noteWidth = isBlack ? keyWidth * 0.5 : keyWidth * 0.7;
          
          // Draw note with gradient
          const noteGradient = ctx.createLinearGradient(
            x - noteWidth / 2, noteY,
            x + noteWidth / 2, noteY + noteHeight
          );
          noteGradient.addColorStop(0, color);
          noteGradient.addColorStop(1, `${color}88`);
          
          ctx.fillStyle = noteGradient;
          ctx.fillRect(x - noteWidth / 2, noteY, noteWidth, noteHeight);
          
          // Add glow effect
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.fillRect(x - noteWidth / 2, noteY, noteWidth, Math.min(noteHeight, 20));
          ctx.shadowBlur = 0;
          
          // Count active notes
          if (time >= note.time && time < note.time + note.duration) {
            activeCount++;
          }
        }
      });
      
      statsRef.current.active = activeCount;
    }
    
    // ============= DRAW PARTICLES =============
    
    if (visualSettings.particlesEnabled && particlesRef.current.length > 0) {
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      
      particlesRef.current.forEach(particle => {
        particle.y -= particle.speed;
        particle.life -= 0.01;
        particle.x += Math.sin(particle.y * 0.01) * 0.5;
        
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.globalAlpha = 1;
    }
    
    // Update FPS
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    if (delta > 0) {
      statsRef.current.fps = Math.round(1000 / delta);
    }
    lastTimeRef.current = now;
  }, [notes, visualSettings, midiData, getNotePosition, canvasRef]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const animate = () => {
      draw();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw, canvasRef]);

  // Canvas resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw();
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [draw, canvasRef]);

  // Note emitter for particle effects
  const noteEmitter = useCallback((note) => {
    if (!visualSettings.particlesEnabled) return;
    
    const { x } = getNotePosition(note.pitch);
    const color = getNoteColor(note.pitch);
    
    // Add particles when note plays
    for (let i = 0; i < 5; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 20,
        y: canvasRef.current.height - KEYBOARD_HEIGHT,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 3 + 1,
        color: color,
        life: 1
      });
    }
    
    // Limit particles
    if (particlesRef.current.length > 100) {
      particlesRef.current = particlesRef.current.slice(-100);
    }
  }, [visualSettings, getNotePosition, canvasRef]);

  return {
    noteEmitter,
    stats: statsRef.current
  };
}