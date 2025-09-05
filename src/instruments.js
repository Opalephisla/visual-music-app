import * as Tone from 'tone';

// --- INSTRUMENT DEFINITIONS ---
// Each instrument has a loader function that returns a new Tone.js instrument instance.
// This keeps the main object clean and ensures a fresh instance is created when needed.

export const INSTRUMENTS = {
  // === LOCAL INSTRUMENTS (NEW) ===
  'local-salamander-piano': {
    name: 'Accurate Grand Piano (Local)',
    category: 'Piano',
    loader: () => new Tone.Sampler({
        // IMPORTANT: Update these filenames to match the files in your /public/voices/48khz24bit/ folder
        urls: {
            A0: "A0.wav", C1: "C1.wav", "D#1": "Ds1.wav", "F#1": "Fs1.wav", 
            A1: "A1.wav", C2: "C2.wav", "D#2": "Ds2.wav", "F#2": "Fs2.wav", 
            A2: "A2.wav", C3: "C3.wav", "D#3": "Ds3.wav", "F#3": "Fs3.wav", 
            A3: "A3.wav", C4: "C4.wav", "D#4": "Ds4.wav", "F#4": "Fs4.wav", 
            A4: "A4.wav", C5: "C5.wav", "D#5": "Ds5.wav", "F#5": "Fs5.wav", 
            A5: "A5.wav", C6: "C6.wav", "D#6": "Ds6.wav", "F#6": "Fs6.wav", 
            A6: "A6.wav", C7: "C7.wav", "D#7": "Ds7.wav", "F#7": "Fs7.wav", 
            A7: "A7.wav", C8: "C8.wav"
        },
        release: 1,
        // This path is now relative to the 'public' folder
        baseUrl: "/voices/48khz24bit/", 
    }),
    visualColor: '#10B981',
    visualType: 'studio'
  },

  // === PIANO FAMILY ===
  'salamander-piano': {
    name: 'Grand Piano (Salamander)',
    category: 'Piano',
    loader: () => new Tone.Sampler({
      urls: {
        A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3", 
        A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3", 
        A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", 
        A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", 
        A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3", 
        A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3", 
        A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3", 
        A7: "A7.mp3", C8: "C8.mp3"
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }),
    visualColor: '#4F46E5',
    visualType: 'flowing'
  },
  'estate-grand-piano': {
    name: 'Estate Grand Piano',
    category: 'Piano',
    loader: () => new Tone.Sampler({
        urls: {
            'A0': 'A0.wav', 'A1': 'A1.wav', 'A2': 'A2.wav', 'A3': 'A3.wav',
            'A4': 'A4.wav', 'A5': 'A5.wav', 'A6': 'A6.wav', 'A7': 'A7.wav',
            'C1': 'C1.wav', 'C2': 'C2.wav', 'C3': 'C3.wav', 'C4': 'C4.wav',
            'C5': 'C5.wav', 'C6': 'C6.wav', 'C7': 'C7.wav',
        },
        baseUrl: 'https://sfzinstruments.github.io/pianos/estate_grand/samples/',
        release: 1.5,
    }),
    visualColor: '#1E40AF',
    visualType: 'majestic'
  },
   'mslp-piano': {
    name: 'MSLP Grand (Intimate)',
    category: 'Piano',
    loader: () => new Tone.Sampler({
        urls: {
            'A1': 'A1.wav', 'A2': 'A2.wav', 'A3': 'A3.wav', 'A4': 'A4.wav',
            'A5': 'A5.wav', 'A6': 'A6.wav', 'A7': 'A7.wav',
        },
        baseUrl: 'https://sfzinstruments.github.io/pianos/mslp_grand/samples/',
        release: 1.2,
    }),
    visualColor: '#60A5FA',
    visualType: 'flowing'
  },
  'electric-piano': {
    name: 'Electric Piano',
    category: 'Piano',
    loader: () => new Tone.Sampler({
      urls: {
        'A1': 'A1.mp3', 'A2': 'A2.mp3', 'C2': 'C2.mp3', 'C3': 'C3.mp3', 
        'C4': 'C4.mp3', 'Ds1': 'Ds1.mp3', 'Ds2': 'Ds2.mp3', 'Ds3': 'Ds3.mp3', 
        'Ds4': 'Ds4.mp3', 'Fs1': 'Fs1.mp3', 'Fs2': 'Fs2.mp3', 'Fs3': 'Fs3.mp3', 
        'Fs4': 'Fs4.mp3'
      },
      baseUrl: 'https://tonejs.github.io/audio/casio/',
    }),
    visualColor: '#DC2626',
    visualType: 'electric'
  },
  'harpsichord': {
    name: 'Harpsichord',
    category: 'Piano',
    loader: () => new Tone.Sampler({
        urls: {
            'C2': 'C2.wav', 'C3': 'C3.wav', 'C4': 'C4.wav', 'C5': 'C5.wav',
        },
        baseUrl: 'https://sfzinstruments.github.io/keyboards/harpsichord/samples/',
    }),
    visualColor: '#CA8A04',
    visualType: 'baroque'
  },

  // === SYNTHESIZERS ===
  'analog-synth': {
    name: 'Analog Synth',
    category: 'Synthesizer',
    loader: () => new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth', count: 3, spread: 30 },
        envelope: { attack: 0.02, decay: 0.2, sustain: 0.3, release: 0.8 },
        filter: { Q: 6, type: 'lowpass', rolloff: -24 },
        filterEnvelope: { attack: 0.01, decay: 0.32, sustain: 0.4, release: 1.2, baseFrequency: 200, octaves: 7, exponent: 2 }
    }),
    visualColor: '#7C3AED',
    visualType: 'geometric'
  },
  'warm-pad': {
    name: 'Warm Pad',
    category: 'Synthesizer',
    loader: () => new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 2.5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.8, decay: 0.2, sustain: 0.9, release: 2.0 },
        modulation: { type: 'triangle', frequency: 0.3 },
        modulationEnvelope: { attack: 0.5, decay: 0.0, sustain: 1.0, release: 0.5 }
    }),
    visualColor: '#059669',
    visualType: 'atmospheric'
  },
  'fm-bell': {
    name: 'FM Bell',
    category: 'Synthesizer',
    loader: () => new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3.01, modulationIndex: 14,
        envelope: { attack: 0.01, decay: 2.0, sustain: 0.1, release: 2.0 },
    }),
    visualColor: '#F59E0B',
    visualType: 'bell'
  },

  // === ORCHESTRAL STRINGS ===
  'vsco2-violin': {
    name: 'Violin (VSCO2)',
    category: 'Strings',
    loader: () => new Tone.Sampler({
        urls: { 'A3': 'A3.wav', 'A4': 'A4.wav', 'A5': 'A5.wav', 'C4': 'C4.wav' },
        baseUrl: 'https://sfzinstruments.github.io/strings/vsco2-violin-sus/samples/',
    }),
    visualColor: '#EC4899',
    visualType: 'orchestral'
  },
  'vsco2-viola': {
    name: 'Viola (VSCO2)',
    category: 'Strings',
    loader: () => new Tone.Sampler({
        urls: { 'A2': 'A2.wav', 'A3': 'A3.wav', 'A4': 'A4.wav', 'C3': 'C3.wav', 'C4': 'C4.wav', 'C5': 'C5.wav'},
        baseUrl: 'https://sfzinstruments.github.io/strings/vsco2-viola-sus/samples/',
    }),
    visualColor: '#D946EF',
    visualType: 'orchestral'
  },
  'vsco2-cello': {
    name: 'Cello (VSCO2)',
    category: 'Strings',
    loader: () => new Tone.Sampler({
        urls: { 'A2': 'A2.wav', 'A3': 'A3.wav', 'C2': 'C2.wav', 'C3': 'C3.wav', 'C4': 'C4.wav'},
        baseUrl: 'https://sfzinstruments.github.io/strings/vsco2-cello-sus/samples/',
    }),
    visualColor: '#8B5CF6',
    visualType: 'orchestral'
  },
   'vsco2-bass': {
    name: 'Contrabass (VSCO2)',
    category: 'Strings',
    loader: () => new Tone.Sampler({
        urls: { 'A1': 'A1.wav', 'C1': 'C1.wav', 'E1': 'E1.wav', 'E2': 'E2.wav', 'G0': 'G0.wav' },
        baseUrl: 'https://sfzinstruments.github.io/strings/vsco2-bass-sus/samples/',
    }),
    visualColor: '#6366F1',
    visualType: 'orchestral_deep'
  },
  'orchestral-harp': {
    name: 'Orchestral Harp',
    category: 'Strings',
    loader: () => new Tone.Sampler({
        urls: {
            'C2': 'C2.wav', 'C3': 'C3.wav', 'C4': 'C4.wav', 'C5': 'C5.wav', 'C6': 'C6.wav', 'C7': 'C7.wav'
        },
        baseUrl: 'https://sfzinstruments.github.io/strings/harp/samples/'
    }),
    visualColor: '#2DD4BF',
    visualType: 'ethereal'
  },

  // === GUITAR & BASS ===
  'guitar-acoustic': {
    name: 'Acoustic Guitar',
    category: 'Guitar',
    loader: () => new Tone.Sampler({
        urls: { 'A2': 'A2.mp3', 'A3': 'A3.mp3', 'A4': 'A4.mp3', 'C3': 'C3.mp3', 'C4': 'C4.mp3', 'C5': 'C5.mp3' },
        baseUrl: 'https://tonejs.github.io/audio/guitar-acoustic/',
    }),
    visualColor: '#D97706',
    visualType: 'plucked'
  },
  'guitar-electric': {
    name: 'Electric Guitar',
    category: 'Guitar',
    loader: () => new Tone.Sampler({
        urls: { 'A2': 'A2.mp3', 'A3': 'A3.mp3', 'A4': 'A4.mp3', 'C3': 'C3.mp3', 'C4': 'C4.mp3', 'C5': 'C5.mp3' },
        baseUrl: 'https://tonejs.github.io/audio/guitar-electric/',
    }),
    visualColor: '#DC2626',
    visualType: 'electric'
  },
  'upright-bass': {
    name: 'Upright Bass',
    category: 'Bass',
    loader: () => new Tone.Sampler({
        urls: { 'A#1': 'As1.mp3', 'A#2': 'As2.mp3', 'D2': 'D2.mp3', 'F#1': 'Fs1.mp3' },
        baseUrl: 'https://tonejs.github.io/audio/upright-bass/',
    }),
    visualColor: '#92400E',
    visualType: 'bass'
  },

  // === BRASS ===
  'vsco2-trumpet': {
    name: 'Trumpet (VSCO2)',
    category: 'Brass',
    loader: () => new Tone.Sampler({
        urls: { 'A3': 'A3.wav', 'A4': 'A4.wav', 'A5': 'A5.wav', 'C4': 'C4.wav', 'C5': 'C5.wav', 'C6': 'C6.wav', 'D4': 'D4.wav'},
        baseUrl: 'https://sfzinstruments.github.io/brass/vsco2-trumpet-sus/samples/',
    }),
    visualColor: '#F59E0B',
    visualType: 'brass'
  },
  'vsco2-trombone': {
    name: 'Trombone (VSCO2)',
    category: 'Brass',
    loader: () => new Tone.Sampler({
        urls: { 'A#1': 'As1.wav', 'A#2': 'As2.wav', 'A#3': 'As3.wav', 'C2': 'C2.wav', 'C3': 'C3.wav', 'C4': 'C4.wav' },
        baseUrl: 'https://sfzinstruments.github.io/brass/vsco2-trombone-sus/samples/',
    }),
    visualColor: '#FBBF24',
    visualType: 'brass'
  },
  'vsco2-french-horn': {
    name: 'French Horn (VSCO2)',
    category: 'Brass',
    loader: () => new Tone.Sampler({
        urls: { 'A2': 'A2.wav', 'A3': 'A3.wav', 'A4': 'A4.wav', 'C3': 'C3.wav', 'C4': 'C4.wav', 'C5': 'C5.wav'},
        baseUrl: 'https://sfzinstruments.github.io/brass/vsco2-horn-sus/samples/',
    }),
    visualColor: '#FACC15',
    visualType: 'brass'
  },

  // === WOODWINDS ===
  'vsco2-flute': {
    name: 'Flute (VSCO2)',
    category: 'Woodwind',
    loader: () => new Tone.Sampler({
        urls: { 'A4': 'A4.wav', 'A5': 'A5.wav', 'A6': 'A6.wav', 'C4': 'C4.wav', 'C5': 'C5.wav', 'C6': 'C6.wav', 'C7': 'C7.wav' },
        baseUrl: 'https://sfzinstruments.github.io/winds/vsco2-flute/samples/',
    }),
    visualColor: '#0EA5E9',
    visualType: 'wind'
  },
  'vsco2-clarinet': {
    name: 'Clarinet (VSCO2)',
    category: 'Woodwind',
    loader: () => new Tone.Sampler({
        urls: { 'A3': 'A3.wav', 'A4': 'A4.wav', 'A5': 'A5.wav', 'C4': 'C4.wav', 'C5': 'C5.wav', 'C6': 'C6.wav' },
        baseUrl: 'https://sfzinstruments.github.io/winds/vsco2-clarinet-sus/samples/',
    }),
    visualColor: '#0284C7',
    visualType: 'wind'
  },
  'vsco2-oboe': {
    name: 'Oboe (VSCO2)',
    category: 'Woodwind',
    loader: () => new Tone.Sampler({
        urls: { 'A3': 'A3.wav', 'A4': 'A4.wav', 'A5': 'A5.wav', 'C4': 'C4.wav', 'C5': 'C5.wav', 'C6': 'C6.wav'},
        baseUrl: 'https://sfzinstruments.github.io/winds/vsco2-oboe-sus/samples/',
    }),
    visualColor: '#0369A1',
    visualType: 'wind'
  },

  // === PERCUSSION ===
   'timpani': {
    name: 'Timpani',
    category: 'Percussion',
    loader: () => new Tone.Sampler({
        urls: { 'C2': 'C2.wav', 'C3': 'C3.wav', 'E2': 'E2.wav', 'E3': 'E3.wav', 'G2': 'G2.wav' },
        baseUrl: 'https://sfzinstruments.github.io/percussion/timpani/samples/',
    }),
    visualColor: '#BE123C',
    visualType: 'percussive'
  },
};

// --- VISUAL CONFIGURATIONS ---
// Defines the visual style associated with each `visualType`.
export const VISUAL_CONFIGS = {
  // Original configs
  flowing: { particleCount: 6, particleSpeed: 'medium', beamStyle: 'flowing', noteTrail: 'smooth' },
  electric: { particleCount: 8, particleSpeed: 'fast', beamStyle: 'jagged', noteTrail: 'electric' },
  geometric: { particleCount: 4, particleSpeed: 'slow', beamStyle: 'geometric', noteTrail: 'angular' },
  atmospheric: { particleCount: 12, particleSpeed: 'very-slow', beamStyle: 'wide', noteTrail: 'diffuse' },
  bell: { particleCount: 3, particleSpeed: 'medium', beamStyle: 'radiating', noteTrail: 'ripple' },
  bass: { particleCount: 2, particleSpeed: 'slow', beamStyle: 'thick', noteTrail: 'heavy' },
  plucked: { particleCount: 4, particleSpeed: 'medium', beamStyle: 'burst', noteTrail: 'decay' },
  brass: { particleCount: 3, particleSpeed: 'medium', beamStyle: 'bold', noteTrail: 'bright' },
  wind: { particleCount: 6, particleSpeed: 'medium', beamStyle: 'flowing', noteTrail: 'gentle' },
  ethereal: { particleCount: 8, particleSpeed: 'slow', beamStyle: 'shimmer', noteTrail: 'ethereal' },
  
  // New configs for added instruments
  majestic: { particleCount: 8, particleSpeed: 'medium', beamStyle: 'grand', noteTrail: 'elegant' },
  baroque: { particleCount: 4, particleSpeed: 'fast', beamStyle: 'ornate', noteTrail: 'sharp' },
  orchestral: { particleCount: 7, particleSpeed: 'medium', beamStyle: 'vibrato', noteTrail: 'sustained' },
  orchestral_deep: { particleCount: 5, particleSpeed: 'slow', beamStyle: 'deep', noteTrail: 'heavy_sustained' },
  percussive: { particleCount: 10, particleSpeed: 'fast', beamStyle: 'impact', noteTrail: 'none' },
  studio: { particleCount: 7, particleSpeed: 'medium', beamStyle: 'clean', noteTrail: 'focused' },
};

// --- HELPER FUNCTIONS ---

/**
 * Groups instruments by their category for easier display.
 * @returns {Object} An object where keys are category names and values are arrays of instruments.
 */
export const getInstrumentsByCategory = () => {
  const categories = {};
  Object.entries(INSTRUMENTS).forEach(([key, instrument]) => {
    if (!categories[instrument.category]) {
      categories[instrument.category] = [];
    }
    categories[instrument.category].push({ key, ...instrument });
  });
  return categories;
};

/**
 * Retrieves the visual configuration for a given instrument key.
 * @param {string} instrumentKey - The key of the instrument (e.g., 'salamander-piano').
 * @returns {Object} The visual configuration object.
 */
export const getVisualConfig = (instrumentKey) => {
  const instrument = INSTRUMENTS[instrumentKey];
  // Fallback to a default 'flowing' visual style if the instrument or its visual type is not found.
  return (instrument && VISUAL_CONFIGS[instrument.visualType]) ? VISUAL_CONFIGS[instrument.visualType] : VISUAL_CONFIGS.flowing;
};

