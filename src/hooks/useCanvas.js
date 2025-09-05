import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { getNoteColor, hexToRgb } from '../utils';
import { Particle } from '../visualizers/effects';
import { PERFORMANCE_CONFIG } from '../constants';
import { getVisualConfig, INSTRUMENTS } from '../instruments';

const KEYBOARD_HEIGHT = 100; // unscaled

export function useCanvas(canvasRef, { notes, visualSettings, midiData, quality, currentInstrument }) {
  const ctxRef = useRef(null);
  const particlesRef = useRef([]);
  const lightBeamsRef = useRef([]);
  const starsRef = useRef([]);
  const lastFrameTimeRef = useRef(performance.now());
  const statsRef = useRef({ fps: 0, active: 0 });
  const animationFrameIdRef = useRef();

  const performanceConfig = PERFORMANCE_CONFIG[quality];
  
  // Get current instrument's visual configuration
  const instrumentData = INSTRUMENTS[currentInstrument] || INSTRUMENTS['salamander-piano'];
  const visualConfig = getVisualConfig(currentInstrument);

  const getNotePosition = useCallback((noteName) => {
    const canvas = canvasRef.current;
    if (!canvas || !midiData.totalWhiteKeys) return { x: 0, isBlack: false, width: 0 };
    const clientWidth = canvas.width / window.devicePixelRatio;
    
    const flatToSharpMap = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    const map = { 'C': 0, 'C#': 0.5, 'D': 1, 'D#': 1.5, 'E': 2, 'F': 3, 'F#': 3.5, 'G': 4, 'G#': 4.5, 'A': 5, 'A#': 5.5, 'B': 6 };
    
    let pitchName = noteName.replace(/[0-9]/g, '');
    const octave = parseInt(noteName.slice(-1), 10);
    if (flatToSharpMap[pitchName]) pitchName = flatToSharpMap[pitchName];
    
    const isBlack = pitchName.includes('#');
    const whiteKeyWidth = clientWidth / midiData.totalWhiteKeys;
    const posInWhiteKeys = (octave - midiData.octaveRange.min) * 7 + Math.floor(map[pitchName] || 0);
    let x = posInWhiteKeys * whiteKeyWidth + whiteKeyWidth / 2;
    if (isBlack) x += whiteKeyWidth * 0.25;

    return { x, isBlack, width: whiteKeyWidth };
  }, [canvasRef, midiData]);

  const draw = useCallback((time) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const clientWidth = canvas.width / dpr;
    const clientHeight = canvas.height / dpr;
    const pianoHeight = KEYBOARD_HEIGHT;
    const hitLineY = clientHeight - pianoHeight;
    let activeNoteCount = 0;

    // 1. Clear and Draw Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, clientWidth, clientHeight);
    
    // Enhanced background based on instrument type
    if (visualSettings.background === 'starfield') {
      starsRef.current.forEach(star => { star.update(canvas); star.draw(ctx); });
    } else if (instrumentData.visualType === 'monumental') {
      // Cathedral-like gradient background for organ
      const grad = ctx.createLinearGradient(0, 0, 0, clientHeight);
      grad.addColorStop(0, 'rgba(20, 15, 10, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, clientWidth, clientHeight);
    }

    // 2. Draw Effects (Beams)
    if (visualSettings.lightBeamsEnabled) {
      lightBeamsRef.current = lightBeamsRef.current.filter(beam => beam.life > 0);
      lightBeamsRef.current.forEach(beam => { 
        beam.update(canvas); 
        beam.draw(ctx, pianoHeight); 
      });
    }

    // 3. Draw Falling/Rising Notes with instrument-specific styling
    ctx.shadowBlur = instrumentData.visualType === 'crystalline' ? 15 : 
                     instrumentData.visualType === 'electric' ? 20 : 12;
    let notesDrawn = 0;
    const maxVisibleNotes = performanceConfig.maxActiveNotes * 3;

    if (visualSettings.noteFlow === 'anticipation') {
        const pixelsPerSecond = (clientHeight - pianoHeight) / performanceConfig.noteRenderDistance;
        notes.forEach(note => {
            const timeUntilStart = note.time - time;
            if (timeUntilStart < performanceConfig.noteRenderDistance && note.time + note.duration > time) {
                if (notesDrawn++ > maxVisibleNotes) return;
                const { x, isBlack, width } = getNotePosition(note.pitch);
                const noteWidth = isBlack ? width * 0.5 : width * 0.8;
                const h = note.duration * pixelsPerSecond;
                const y = hitLineY - (timeUntilStart * pixelsPerSecond);
                
                // Use instrument's visual color or note color
                const color = instrumentData.visualColor || getNoteColor(note.pitch);
                
                // Create instrument-specific note appearance
                drawInstrumentNote(ctx, x, y, noteWidth, h, color, instrumentData.visualType, note.velocity);
            }
        });
    } else { // 'reaction' flow
        const pixelsPerSecond = 180;
        notes.forEach(note => {
            if (time >= note.time && time < note.time + note.duration) {
                if (notesDrawn++ > maxVisibleNotes) return;
                const { x, isBlack, width } = getNotePosition(note.pitch);
                const noteWidth = isBlack ? width * 0.5 : width * 0.8;
                const color = instrumentData.visualColor || getNoteColor(note.pitch);
                const timeSinceStart = time - note.time;
                const startY = hitLineY - (timeSinceStart * pixelsPerSecond);
                const totalHeight = note.duration * pixelsPerSecond;
                const opacity = Math.min(1.0, (note.time + note.duration - time) / 0.5);

                ctx.globalAlpha = opacity;
                drawInstrumentNote(ctx, x, startY, noteWidth, totalHeight, color, instrumentData.visualType, note.velocity);
                ctx.globalAlpha = 1.0;
            }
        });
    }
    
    // 4. Draw Piano with instrument-specific styling
    ctx.save();
    ctx.translate(0, hitLineY);
    
    // Piano background with subtle instrument theming
    const pianoGrad = ctx.createLinearGradient(0, 0, 0, pianoHeight);
    if (instrumentData.visualType === 'monumental') {
      pianoGrad.addColorStop(0, '#2a2a2a');
      pianoGrad.addColorStop(1, '#1a1a1a');
    } else {
      pianoGrad.addColorStop(0, '#ffffff');
      pianoGrad.addColorStop(1, '#f0f0f0');
    }
    ctx.fillStyle = pianoGrad;
    ctx.fillRect(0, 0, clientWidth, pianoHeight);
    
    // White key separators
    ctx.strokeStyle = instrumentData.visualType === 'monumental' ? '#444' : '#cccccc';
    ctx.lineWidth = 1;
    const whiteKeyWidth = midiData.totalWhiteKeys > 0 ? clientWidth / midiData.totalWhiteKeys : 0;
    for (let i = 1; i < midiData.totalWhiteKeys; i++) { 
      ctx.beginPath(); 
      ctx.moveTo(i * whiteKeyWidth, 0); 
      ctx.lineTo(i * whiteKeyWidth, pianoHeight); 
      ctx.stroke(); 
    }
    
    // Black keys
    ctx.fillStyle = instrumentData.visualType === 'monumental' ? '#0a0a0a' : '#000000';
    for (let oct = midiData.octaveRange.min; oct <= midiData.octaveRange.max; oct++) {
      for (const p of ['C#', 'D#', 'F#', 'G#', 'A#']) {
        const { x } = getNotePosition(p + oct);
        ctx.fillRect(x - whiteKeyWidth * 0.3, 0, whiteKeyWidth * 0.6, pianoHeight * 0.6);
      }
    }
    
    // Active keys with instrument-specific effects
    notes.forEach(note => {
      if (time >= note.time && time < note.time + note.duration) {
        activeNoteCount++;
        const { x, isBlack, width } = getNotePosition(note.pitch);
        const color = instrumentData.visualColor || getNoteColor(note.pitch);
        
        drawActiveKey(ctx, x, width, isBlack, color, pianoHeight, instrumentData.visualType, note.velocity);
      }
    });
    ctx.restore();

    // 5. Draw Hit Line with instrument theming
    ctx.save();
    ctx.shadowColor = instrumentData.visualColor || '#a855f7';
    ctx.shadowBlur = instrumentData.visualType === 'electric' ? 20 : 15;
    ctx.strokeStyle = instrumentData.visualType === 'monumental' ? '#8B5A2B' : '#e9d5ff';
    ctx.lineWidth = instrumentData.visualType === 'bass' ? 5 : 3;
    ctx.beginPath(); 
    ctx.moveTo(0, hitLineY); 
    ctx.lineTo(clientWidth, hitLineY); 
    ctx.stroke();
    ctx.restore();
    
    // 6. Draw Particles with instrument-specific behavior
    if (visualSettings.particlesEnabled) {
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => { 
        p.update(16.67); 
        p.draw(ctx); 
      });
    }

    // Update stats
    const now = performance.now();
    statsRef.current.fps = Math.round(1000 / (now - lastFrameTimeRef.current));
    statsRef.current.active = activeNoteCount;
    lastFrameTimeRef.current = now;
  }, [notes, visualSettings, midiData, getNotePosition, performanceConfig, instrumentData]);

  // Helper function to draw instrument-specific notes
  const drawInstrumentNote = (ctx, x, y, width, height, color, visualType, velocity) => {
    const intensity = velocity || 0.8;
    
    switch(visualType) {
      case 'electric':
        drawElectricNote(ctx, x, y, width, height, color, intensity);
        break;
      case 'crystalline':
        drawCrystallineNote(ctx, x, y, width, height, color, intensity);
        break;
      case 'atmospheric':
        drawAtmosphericNote(ctx, x, y, width, height, color, intensity);
        break;
      case 'bass':
        drawBassNote(ctx, x, y, width, height, color, intensity);
        break;
      case 'strings':
        drawStringsNote(ctx, x, y, width, height, color, intensity);
        break;
      case 'brass':
        drawBrassNote(ctx, x, y, width, height, color, intensity);
        break;
      case 'wind':
        drawWindNote(ctx, x, y, width, height, color, intensity);
        break;
      case 'monumental':
        drawMonumentalNote(ctx, x, y, width, height, color, intensity);
        break;
      case 'ethereal':
        drawEtherealNote(ctx, x, y, width, height, color, intensity);
        break;
      default:
        drawDefaultNote(ctx, x, y, width, height, color, intensity);
        break;
    }
  };

  // Individual note drawing functions
  const drawElectricNote = (ctx, x, y, width, height, color, intensity) => {
    const segments = Math.floor(height / 10) + 1;
    const segmentHeight = height / segments;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = width * 0.3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15 * intensity;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    for(let i = 1; i <= segments; i++) {
      const jitter = (Math.random() - 0.5) * width * 0.2;
      ctx.lineTo(x + jitter, y - segmentHeight * i);
    }
    ctx.stroke();
  };

  const drawCrystallineNote = (ctx, x, y, width, height, color, intensity) => {
    const facets = 6;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12 * intensity;
    
    for(let i = 0; i < facets; i++) {
      const facetHeight = height / facets;
      const facetY = y - (facetHeight * (i + 1));
      const facetWidth = width * (0.5 + Math.sin(i) * 0.3);
      
      ctx.beginPath();
      ctx.moveTo(x - facetWidth/2, facetY);
      ctx.lineTo(x, facetY - facetHeight * 0.2);
      ctx.lineTo(x + facetWidth/2, facetY);
      ctx.lineTo(x, facetY + facetHeight * 0.8);
      ctx.closePath();
      ctx.fill();
    }
  };

  const drawAtmosphericNote = (ctx, x, y, width, height, color, intensity) => {
    const grad = ctx.createLinearGradient(x, y - height, x, y);
    grad.addColorStop(0, `${color}00`); // Transparent
    grad.addColorStop(0.3, `${color}66`); // Semi-transparent
    grad.addColorStop(1, color);
    
    ctx.fillStyle = grad;
    ctx.shadowColor = color;
    ctx.shadowBlur = 25 * intensity;
    
    // Draw soft, wide beam
    ctx.fillRect(x - width, y - height, width * 2, height);
  };

  const drawBassNote = (ctx, x, y, width, height, color, intensity) => {
    const thickWidth = width * 1.5;
    const grad = ctx.createLinearGradient(x, y - height, x, y);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, color);
    
    ctx.fillStyle = grad;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20 * intensity;
    
    // Draw thick, powerful note
    ctx.fillRect(x - thickWidth/2, y - height, thickWidth, height);
    
    // Add pulse effect
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x - thickWidth/2 - 2, y - height, thickWidth + 4, height);
  };

  const drawStringsNote = (ctx, x, y, width, height, color, intensity) => {
    const grad = ctx.createLinearGradient(x, y - height, x, y);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, color);
    
    ctx.fillStyle = grad;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10 * intensity;
    
    // Draw main note
    ctx.fillRect(x - width/2, y - height, width, height);
    
    // Add vibration lines
    for(let i = 0; i < 3; i++) {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - width/2 - 2 - i, y - height);
      ctx.lineTo(x - width/2 - 2 - i, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + width/2 + 2 + i, y - height);
      ctx.lineTo(x + width/2 + 2 + i, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const drawBrassNote = (ctx, x, y, width, height, color, intensity) => {
    // Golden gradient for brass
    const grad = ctx.createLinearGradient(x, y - height, x, y);
    grad.addColorStop(0, '#FFD700');
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, '#B8860B');
    
    ctx.fillStyle = grad;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15 * intensity;
    
    ctx.fillRect(x - width/2, y - height, width, height);
  };

  const drawWindNote = (ctx, x, y, width, height, color, intensity) => {
    ctx.shadowColor = color;
    ctx.shadowBlur = 8 * intensity;
    
    // Draw flowing, undulating note
    ctx.beginPath();
    ctx.moveTo(x - width/2, y);
    
    const segments = Math.floor(height / 5);
    for(let i = 0; i <= segments; i++) {
      const segmentY = y - (height / segments) * i;
      const flow = Math.sin(i * 0.5) * width * 0.2;
      ctx.lineTo(x + flow, segmentY);
    }
    
    for(let i = segments; i >= 0; i--) {
      const segmentY = y - (height / segments) * i;
      const flow = Math.sin(i * 0.5) * width * 0.2;
      ctx.lineTo(x + flow - width, segmentY);
    }
    
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawMonumentalNote = (ctx, x, y, width, height, color, intensity) => {
    const monumentalWidth = width * 1.8;
    const grad = ctx.createLinearGradient(x, y - height, x, y);
    grad.addColorStop(0, '#8B4513'); // Saddle brown
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, '#654321'); // Dark brown
    
    ctx.fillStyle = grad;
    ctx.shadowColor = color;
    ctx.shadowBlur = 30 * intensity;
    
    // Draw cathedral-like pillar
    ctx.fillRect(x - monumentalWidth/2, y - height, monumentalWidth, height);
    
    // Add architectural details
    ctx.strokeStyle = '#D2B48C'; // Tan
    ctx.lineWidth = 2;
    ctx.strokeRect(x - monumentalWidth/2, y - height, monumentalWidth, height);
  };

  const drawEtherealNote = (ctx, x, y, width, height, color, intensity) => {
    // Multiple overlapping translucent layers
    for(let layer = 0; layer < 3; layer++) {
      ctx.globalAlpha = 0.3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 20 * intensity;
      
      const layerWidth = width * (1 + layer * 0.3);
      const grad = ctx.createRadialGradient(x, y - height/2, 0, x, y - height/2, layerWidth);
      grad.addColorStop(0, color);
      grad.addColorStop(1, `${color}00`);
      
      ctx.fillStyle = grad;
      ctx.fillRect(x - layerWidth/2, y - height, layerWidth, height);
    }
    ctx.globalAlpha = 1;
  };

  const drawDefaultNote = (ctx, x, y, width, height, color, intensity) => {
    const grad = ctx.createLinearGradient(x, y - height, x, y);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12 * intensity;
    ctx.fillRect(x - width / 2, y - height, width, height);
  };

  // Helper function to draw active keys
  const drawActiveKey = (ctx, x, width, isBlack, color, pianoHeight, visualType, velocity) => {
    const intensity = velocity || 0.8;
    const keyWidth = isBlack ? width * 0.6 : width * 0.9;
    const keyHeight = isBlack ? pianoHeight * 0.6 : pianoHeight;
    
    switch(visualType) {
      case 'electric':
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 25 * intensity;
        // Add electric sparks effect
        for(let i = 0; i < 3; i++) {
          const sparkX = x + (Math.random() - 0.5) * keyWidth;
          const sparkY = Math.random() * keyHeight;
          ctx.fillRect(sparkX - 1, sparkY - 1, 2, 2);
        }
        break;
        
      case 'monumental':
        const monumentalGrad = ctx.createLinearGradient(x, 0, x, keyHeight);
        monumentalGrad.addColorStop(0, '#8B4513');
        monumentalGrad.addColorStop(1, color);
        ctx.fillStyle = monumentalGrad;
        ctx.shadowColor = color;
        ctx.shadowBlur = 30 * intensity;
        break;
        
      default:
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15 * intensity;
        break;
    }
    
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x - keyWidth / 2, 0, keyWidth, keyHeight);
    ctx.globalAlpha = 1;
  };
  
  // Animation loop
  useEffect(() => {
    const loop = () => {
      const time = Tone.Transport.seconds;
      draw(time);
      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    if (visualSettings.playbackState === 'started') {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    return () => cancelAnimationFrame(animationFrameIdRef.current);
  }, [visualSettings.playbackState, draw]);

  // Handle resizing and context initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctxRef.current = ctx;

      if (visualSettings.background === 'starfield') {
        starsRef.current = Array.from({ length: 200 }, () => new Particle());
      }
      draw(Tone.Transport.seconds); // Redraw on resize with current time
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [canvasRef, visualSettings.background, draw]);
  
  const noteEmitter = useCallback((note) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, width } = getNotePosition(note.pitch);
    const color = instrumentData.visualColor || getNoteColor(note.pitch);
    const emissionY = canvas.height / window.devicePixelRatio - KEYBOARD_HEIGHT;
    const visualType = instrumentData.visualType;

    // Adjust particle count based on visual config
    const particleMultiplier = visualConfig.particleCount / 6; // Base 6 particles
    const adjustedParticleRate = Math.floor(performanceConfig.particleRate * particleMultiplier);

    if (visualSettings.particlesEnabled && particlesRef.current.length < performanceConfig.maxParticles) {
        for (let i = 0; i < adjustedParticleRate; i++) {
            particlesRef.current.push(new Particle(x, emissionY, color, visualType));
        }
    }
    
    if (visualSettings.lightBeamsEnabled && lightBeamsRef.current.length < 30) {
        lightBeamsRef.current.push(new Particle(x, width, hexToRgb(color), visualType));
    }
  }, [visualSettings, performanceConfig, getNotePosition, canvasRef, instrumentData, visualConfig]);

  return { noteEmitter, stats: statsRef.current };
}