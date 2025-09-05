import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { getNoteColor, hexToRgb } from '../utils';
import { Particle, LightBeam, Star } from '../visualizers/effects';
import { PERFORMANCE_CONFIG } from '../constants';

const KEYBOARD_HEIGHT = 100; // unscaled

export function useCanvas(canvasRef, { notes, visualSettings, midiData, quality }) {
  const ctxRef = useRef(null);
  const particlesRef = useRef([]);
  const lightBeamsRef = useRef([]);
  const starsRef = useRef([]);
  const lastFrameTimeRef = useRef(performance.now());
  const statsRef = useRef({ fps: 0, active: 0 });
  const animationFrameIdRef = useRef();

  const performanceConfig = PERFORMANCE_CONFIG[quality];

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
    if (visualSettings.background === 'starfield') {
      starsRef.current.forEach(star => { star.update(canvas); star.draw(ctx); });
    }

    // 2. Draw Effects (Beams)
    if (visualSettings.lightBeamsEnabled) {
      lightBeamsRef.current = lightBeamsRef.current.filter(beam => beam.life > 0);
      lightBeamsRef.current.forEach(beam => { beam.update(canvas); beam.draw(ctx, pianoHeight); });
    }

    // 3. Draw Falling/Rising Notes
    ctx.shadowBlur = 12;
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
                const color = getNoteColor(note.pitch);
                const grad = ctx.createLinearGradient(x, y - h, x, y);
                grad.addColorStop(0, '#ffffff'); grad.addColorStop(1, color);
                ctx.fillStyle = grad; ctx.shadowColor = color;
                ctx.fillRect(x - noteWidth / 2, y - h, noteWidth, h);
            }
        });
    } else { // 'reaction' flow
        const pixelsPerSecond = 180;
        notes.forEach(note => {
            if (time >= note.time && time < note.time + note.duration) {
                if (notesDrawn++ > maxVisibleNotes) return;
                const { x, isBlack, width } = getNotePosition(note.pitch);
                const noteWidth = isBlack ? width * 0.5 : width * 0.8;
                const color = getNoteColor(note.pitch);
                const timeSinceStart = time - note.time;
                const startY = hitLineY - (timeSinceStart * pixelsPerSecond);
                const totalHeight = note.duration * pixelsPerSecond;
                const opacity = Math.min(1.0, (note.time + note.duration - time) / 0.5);

                const grad = ctx.createLinearGradient(x, startY, x, startY + totalHeight);
                grad.addColorStop(0, 'rgba(255,255,255,0.7)');
                grad.addColorStop(1, color);
                
                ctx.globalAlpha = opacity;
                ctx.fillStyle = grad;
                ctx.shadowColor = color;
                ctx.fillRect(x - noteWidth / 2, startY, noteWidth, totalHeight);
                ctx.globalAlpha = 1.0;
            }
        });
    }
    
    // 4. Draw Piano and Active Keys
    ctx.save();
    ctx.translate(0, hitLineY);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, clientWidth, pianoHeight);
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    const whiteKeyWidth = midiData.totalWhiteKeys > 0 ? clientWidth / midiData.totalWhiteKeys : 0;
    for (let i = 1; i < midiData.totalWhiteKeys; i++) { ctx.beginPath(); ctx.moveTo(i * whiteKeyWidth, 0); ctx.lineTo(i * whiteKeyWidth, pianoHeight); ctx.stroke(); }
    ctx.fillStyle = '#000000';
    for (let oct = midiData.octaveRange.min; oct <= midiData.octaveRange.max; oct++) {
      for (const p of ['C#', 'D#', 'F#', 'G#', 'A#']) {
        const { x } = getNotePosition(p + oct);
        ctx.fillRect(x - whiteKeyWidth * 0.3, 0, whiteKeyWidth * 0.6, pianoHeight * 0.6);
      }
    }
    notes.forEach(note => {
      if (time >= note.time && time < note.time + note.duration) {
        activeNoteCount++;
        const { x, isBlack, width } = getNotePosition(note.pitch);
        const color = getNoteColor(note.pitch);
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 15; ctx.globalAlpha = 0.8;
        const keyWidth = isBlack ? width * 0.6 : width * 0.9;
        const keyHeight = isBlack ? pianoHeight * 0.6 : pianoHeight;
        ctx.fillRect(x - keyWidth / 2, 0, keyWidth, keyHeight);
      }
    });
    ctx.restore();

    // 5. Draw Hit Line
    ctx.save();
    ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 15;
    ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, hitLineY); ctx.lineTo(clientWidth, hitLineY); ctx.stroke();
    ctx.restore();
    
    // 6. Draw Particles
    if (visualSettings.particlesEnabled) {
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => { p.update(16.67); p.draw(ctx); });
    }

    // Update stats
    const now = performance.now();
    statsRef.current.fps = Math.round(1000 / (now - lastFrameTimeRef.current));
    statsRef.current.active = activeNoteCount;
    lastFrameTimeRef.current = now;
  }, [notes, visualSettings, midiData, getNotePosition, performanceConfig]);
  
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
        starsRef.current = Array.from({ length: 200 }, () => new Star());
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
    const color = getNoteColor(note.pitch);
    const emissionY = canvas.height / window.devicePixelRatio - KEYBOARD_HEIGHT;

    if (visualSettings.particlesEnabled && particlesRef.current.length < performanceConfig.maxParticles) {
        for (let i = 0; i < performanceConfig.particleRate; i++) {
            particlesRef.current.push(new Particle(x, emissionY, color));
        }
    }
    if (visualSettings.lightBeamsEnabled && lightBeamsRef.current.length < 30) {
        lightBeamsRef.current.push(new LightBeam(x, width, hexToRgb(color)));
    }
  }, [visualSettings, performanceConfig, getNotePosition, canvasRef]);

  return { noteEmitter, stats: statsRef.current };
}