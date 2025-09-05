export const PERFORMANCE_CONFIG = {
  high: { maxNotes: 8000, maxParticles: 400, particleRate: 8, noteRenderDistance: 3, maxActiveNotes: 64 },
  medium: { maxNotes: 4000, maxParticles: 200, particleRate: 5, noteRenderDistance: 2.5, maxActiveNotes: 48 },
  low: { maxNotes: 2000, maxParticles: 100, particleRate: 2, noteRenderDistance: 2, maxActiveNotes: 32 }
};

// Enhanced pieces with unique seeds and style variations
export const PIECES = {
  'clair_de_lune': {
    title: 'Clair de Lune (Opening)', 
    composer: 'Claude Debussy',
    seed: 'debussy_moon_1875',
    styles: ['flowing', 'atmospheric', 'ethereal', 'crystalline'], // 4 different visual styles
    data: [
      ['Db4', 0.5, 2, 0.4], ['Ab4', 1.0, 2, 0.4], ['Db5', 1.5, 2, 0.4], 
      ['F5', 2.0, 2, 0.5], ['Ab5', 2.5, 2, 0.5],
      ['Db4', 4.5, 2, 0.4], ['Ab4', 5.0, 2, 0.4], ['Db5', 5.5, 2, 0.4], 
      ['E5', 6.0, 2, 0.5], ['Ab5', 6.5, 2, 0.5],
      // Extended with hypnotic undertones
      ['Gb4', 8.5, 1.5, 0.3], ['Db5', 9.0, 1.5, 0.3], ['Ab5', 9.5, 1.5, 0.4],
      ['F5', 10.0, 3, 0.5], ['Db5', 11.0, 2, 0.4], ['Ab4', 12.0, 2, 0.3],
    ],
    pedal: [[0.5, 8.5], [8.5, 13.0]]
  },
  
  'fur_elise': {
    title: 'Für Elise (Opening)', 
    composer: 'Ludwig van Beethoven',
    seed: 'beethoven_elise_1810',
    styles: ['classical', 'geometric', 'flowing', 'electric'],
    data: [
      ['E5', 0.0, 0.25, 0.8], ['D#5', 0.25, 0.25, 0.7], ['E5', 0.5, 0.25, 0.8], 
      ['D#5', 0.75, 0.25, 0.7], ['E5', 1.0, 0.25, 0.8], ['B4', 1.25, 0.25, 0.7], 
      ['D5', 1.5, 0.25, 0.8], ['C5', 1.75, 0.25, 0.7], ['A4', 2.0, 0.5, 0.8],
      // Extended pattern with harmonic variations
      ['C4', 2.5, 0.25, 0.6], ['E4', 2.75, 0.25, 0.6], ['A4', 3.0, 0.5, 0.7],
      ['E5', 3.5, 0.25, 0.8], ['D#5', 3.75, 0.25, 0.7], ['E5', 4.0, 0.25, 0.8],
    ],
    pedal: [[2.0, 4.5]]
  },

  'moonlight_sonata': {
    title: 'Moonlight Sonata (Adagio)',
    composer: 'Ludwig van Beethoven',
    seed: 'beethoven_moonlight_1801',
    styles: ['atmospheric', 'flowing', 'ethereal', 'hypnotic'],
    data: [
      ['C#4', 0.0, 2.0, 0.5], ['E4', 0.5, 1.5, 0.4], ['G#4', 1.0, 1.0, 0.6],
      ['C#5', 1.5, 1.5, 0.7], ['E5', 2.0, 1.0, 0.5], ['G#5', 2.5, 1.5, 0.6],
      ['C#4', 3.0, 2.0, 0.5], ['F#4', 3.5, 1.5, 0.4], ['A#4', 4.0, 1.0, 0.6],
      ['C#5', 4.5, 1.5, 0.7], ['F#5', 5.0, 1.0, 0.5], ['A#5', 5.5, 1.5, 0.6],
    ],
    pedal: [[0.0, 6.0]]
  },

  'canon_in_d': {
    title: 'Canon in D (Pachelbel)',
    composer: 'Johann Pachelbel', 
    seed: 'pachelbel_canon_1680',
    styles: ['baroque', 'geometric', 'crystalline', 'flowing'],
    data: [
      ['D4', 0.0, 1.0, 0.7], ['A3', 1.0, 1.0, 0.6], ['B3', 2.0, 1.0, 0.6],
      ['F#3', 3.0, 1.0, 0.5], ['G3', 4.0, 1.0, 0.6], ['D3', 5.0, 1.0, 0.5],
      ['G3', 6.0, 1.0, 0.6], ['A3', 7.0, 1.0, 0.7],
      // Canonical melody entry
      ['D5', 2.0, 0.5, 0.8], ['E5', 2.5, 0.5, 0.7], ['F#5', 3.0, 1.0, 0.8],
      ['G5', 4.0, 0.5, 0.7], ['A5', 4.5, 0.5, 0.8], ['B5', 5.0, 1.0, 0.9],
    ],
    pedal: [[0.0, 8.0]]
  }
};

// Default visual settings with more granular control
export const DEFAULT_VISUAL_SETTINGS = {
  // Core effects
  particlesEnabled: true,
  lightBeamsEnabled: true,
  noteFlow: 'anticipation', // or 'reaction'
  background: 'starfield', // 'solid', 'starfield', 'gradient', 'nebula'
  showStats: false,
  
  // Piano display
  pianoVisible: true,
  pianoPosition: 'bottom', // 'bottom', 'top', 'left', 'right', 'floating'
  pianoSize: 'normal', // 'small', 'normal', 'large', 'xlarge'
  notePreview: true, // Show note names on keys
  
  // Intensity controls (0.0 - 3.0)
  particleIntensity: 1.0,
  beamIntensity: 1.0,
  glowIntensity: 1.0,
  trailLength: 1.0,
  
  // Color and style
  colorMode: 'rainbow', // 'rainbow', 'monochrome', 'warm', 'cool', 'neon'
  backgroundIntensity: 0.5,
  
  // Special effects
  hypnoticMode: false,
  pulseRate: 1.0, // For hypnotic mode
  shimmerEffect: true,
  
  // Advanced options
  noteRipples: true,
  keyGlow: true,
  particleTrails: true
};

// Default audio settings
export const DEFAULT_AUDIO_SETTINGS = {
  volume: 1.0,
  reverb: 0.4,
  chorus: 0.3,
  playbackRate: 1.0,
  masterGain: 1.0,
  
  // EQ settings
  bassGain: 0,
  midGain: 0,
  trebleGain: 0,
  
  // Advanced audio
  compression: 0.5,
  stereoWidth: 1.0
};

// Color palettes for different modes
export const COLOR_PALETTES = {
  rainbow: ['#ff0080', '#ff8000', '#80ff00', '#00ff80', '#0080ff', '#8000ff'],
  warm: ['#ff4500', '#ff6347', '#ffa500', '#ffb347', '#ffd700', '#ffff00'],
  cool: ['#00ffff', '#00bfff', '#0080ff', '#4169e1', '#8a2be2', '#9400d3'],
  neon: ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff0040'],
  monochrome: ['#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0'],
  ethereal: ['#e6e6fa', '#dda0dd', '#da70d6', '#ba55d3', '#9370db', '#8a2be2']
};

// Note to color mapping
export const NOTE_COLORS = [
  '#a855f7', '#d946ef', '#ec4899', '#f472b6', 
  '#818cf8', '#60a5fa', '#38bdf8', '#22d3ee', 
  '#67e8f9', '#c084fc', '#e879f9', '#f0abfc'
];

// Quality presets for different devices
export const QUALITY_PRESETS = {
  potato: { maxNotes: 500, maxParticles: 50, particleRate: 1, noteRenderDistance: 1.5, maxActiveNotes: 16 },
  low: { maxNotes: 2000, maxParticles: 100, particleRate: 2, noteRenderDistance: 2, maxActiveNotes: 32 },
  medium: { maxNotes: 4000, maxParticles: 200, particleRate: 5, noteRenderDistance: 2.5, maxActiveNotes: 48 },
  high: { maxNotes: 8000, maxParticles: 400, particleRate: 8, noteRenderDistance: 3, maxActiveNotes: 64 },
  ultra: { maxNotes: 16000, maxParticles: 800, particleRate: 12, noteRenderDistance: 4, maxActiveNotes: 96 }
};

// Browser capability detection
export const detectBrowserCapabilities = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  return {
    webgl: !!gl,
    hardwareConcurrency: navigator.hardwareConcurrency || 2,
    deviceMemory: navigator.deviceMemory || 4,
    pixelRatio: window.devicePixelRatio || 1,
    webAudio: !!(window.AudioContext || window.webkitAudioContext)
  };
};

// Auto-detect optimal quality based on device
export const getOptimalQuality = () => {
  const caps = detectBrowserCapabilities();
  
  if (caps.hardwareConcurrency >= 8 && caps.deviceMemory >= 8) return 'ultra';
  if (caps.hardwareConcurrency >= 4 && caps.deviceMemory >= 4) return 'high';
  if (caps.hardwareConcurrency >= 2 && caps.deviceMemory >= 2) return 'medium';
  return 'low';
};