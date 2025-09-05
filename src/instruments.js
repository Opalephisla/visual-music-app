import * as Tone from 'tone';

// Enhanced instrument definitions with reliability testing
export const INSTRUMENTS = {
  // === RELIABLE INSTRUMENTS (ToneJS Built-in) ===
  'synth-piano': {
    name: 'Synthesized Piano',
    category: 'Piano',
    loader: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle', partials: [1, 0.5, 0.3, 0.25, 0.2] },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.4, release: 1.2 }
    }),
    visualColor: '#4F46E5',
    visualType: 'flowing',
    reliable: true,
    seed: 'synth_piano_001'
  },
  
  'electric-piano-synth': {
    name: 'Electric Piano (FM)',
    category: 'Piano',
    loader: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.01, modulationIndex: 14,
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.8 }
    }),
    visualColor: '#DC2626',
    visualType: 'electric',
    reliable: true,
    seed: 'electric_fm_002'
  },

  'warm-pad': {
    name: 'Warm Pad',
    category: 'Synthesizer',
    loader: () => new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 2.5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.8, decay: 0.2, sustain: 0.9, release: 2.0 }
    }),
    visualColor: '#059669',
    visualType: 'atmospheric',
    reliable: true,
    seed: 'warm_pad_003'
  },

  'bell-synth': {
    name: 'Bell Synthesizer',
    category: 'Synthesizer',
    loader: () => new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.01, modulationIndex: 14,
      envelope: { attack: 0.01, decay: 2.0, sustain: 0.1, release: 2.0 }
    }),
    visualColor: '#F59E0B',
    visualType: 'crystalline',
    reliable: true,
    seed: 'bell_fm_004'
  },

  // === EXTERNAL SAMPLE-BASED INSTRUMENTS (Test Required) ===
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
    visualColor: '#10B981',
    visualType: 'studio',
    reliable: false,
    seed: 'salamander_grand_005'
  },

  'electric-piano': {
    name: 'Electric Piano (Casio)',
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
    visualType: 'electric',
    reliable: false,
    seed: 'casio_electric_006'
  },

  // Local instruments (check if files exist)
  'local-salamander': {
    name: 'Local Salamander Piano',
    category: 'Piano',
    loader: () => new Tone.Sampler({
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
      baseUrl: "/voices/48khz24bit/", 
    }),
    visualColor: '#10B981',
    visualType: 'studio',
    reliable: false,
    seed: 'local_salamander_007'
  }
};

// Enhanced visual configurations with more variety
export const VISUAL_CONFIGS = {
  flowing: { 
    particleCount: 6, 
    particleSpeed: 'medium', 
    beamStyle: 'flowing', 
    noteTrail: 'smooth',
    hypnoticMultiplier: 1.0
  },
  electric: { 
    particleCount: 8, 
    particleSpeed: 'fast', 
    beamStyle: 'jagged', 
    noteTrail: 'electric',
    hypnoticMultiplier: 1.5
  },
  atmospheric: { 
    particleCount: 12, 
    particleSpeed: 'slow', 
    beamStyle: 'wide', 
    noteTrail: 'diffuse',
    hypnoticMultiplier: 2.0
  },
  crystalline: { 
    particleCount: 4, 
    particleSpeed: 'medium', 
    beamStyle: 'sharp', 
    noteTrail: 'prismatic',
    hypnoticMultiplier: 1.2
  },
  studio: { 
    particleCount: 7, 
    particleSpeed: 'medium', 
    beamStyle: 'clean', 
    noteTrail: 'focused',
    hypnoticMultiplier: 1.0
  }
};

// Instrument testing utility
export const testInstrument = async (instrumentKey, definition) => {
  try {
    console.log(`Testing instrument: ${instrumentKey}`);
    const testInstrument = definition.loader();
    
    // For Samplers, wait for loading
    if (testInstrument.loaded) {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Load timeout')), 8000)
      );
      
      await Promise.race([testInstrument.loaded, timeoutPromise]);
    }
    
    // Test a note
    await new Promise((resolve) => {
      try {
        testInstrument.triggerAttackRelease('C4', '8n', Tone.now());
        setTimeout(() => {
          testInstrument.dispose();
          resolve();
        }, 200);
      } catch (error) {
        testInstrument.dispose();
        throw error;
      }
    });
    
    return { success: true, error: null };
  } catch (error) {
    console.warn(`Instrument ${instrumentKey} test failed:`, error.message);
    return { success: false, error: error.message };
  }
};

// Get instruments by category
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

// Get visual configuration for instrument
export const getVisualConfig = (instrumentKey) => {
  const instrument = INSTRUMENTS[instrumentKey];
  return (instrument && VISUAL_CONFIGS[instrument.visualType]) 
    ? VISUAL_CONFIGS[instrument.visualType] 
    : VISUAL_CONFIGS.flowing;
};

function groupInstruments() {
  const categories = {};
  Object.entries(INSTRUMENTS).forEach(([key, instrument]) => {
    if (!categories[instrument.category]) {
      categories[instrument.category] = [];
    }
    categories[instrument.category].push({ key, ...instrument });
  });
  return categories;
}

export const INSTRUMENTS_BY_CATEGORY = groupInstruments();