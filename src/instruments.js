import * as Tone from 'tone';

// This function creates a promise that resolves when the sampler is loaded.
const createSampler = (options) => {
  return new Promise((resolve, reject) => {
    const sampler = new Tone.Sampler({
      ...options,
      onload: () => resolve(sampler),
      onerror: (error) => reject(error),
    }).toDestination();
  });
};

export const INSTRUMENTS = {
  // === RELIABLE INSTRUMENTS (ToneJS Built-in) ===
  'synth-piano': {
    name: 'Synthesized Piano',
    category: 'Piano',
    loader: () => Promise.resolve(new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle', partials: [1, 0.5, 0.3, 0.25, 0.2] },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.4, release: 1.2 }
    })),
    visualColor: '#4F46E5',
    visualType: 'flowing',
  },
  'electric-piano-synth': {
    name: 'Electric Piano (FM)',
    category: 'Piano',
    loader: () => Promise.resolve(new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.01, modulationIndex: 14,
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.8 }
    })),
    visualColor: '#DC2626',
    visualType: 'electric',
  },

  // === SAMPLE-BASED INSTRUMENTS (Now reliable with Promise-based loader) ===
  'salamander-piano': {
    name: 'Grand Piano (Salamander)',
    category: 'Piano',
    loader: () => createSampler({
      urls: {
        A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3", A1: "A1.mp3",
        C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3", A2: "A2.mp3", C3: "C3.mp3",
        "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3", A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
        A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3", A6: "A6.mp3",
        C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3", A7: "A7.mp3", C8: "C8.mp3"
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }),
    visualColor: '#10B981',
    visualType: 'studio',
  },

  'local-salamander': {
    name: 'Local Salamander Piano',
    category: 'Piano',
    loader: () => createSampler({
      urls: {
        A0: "021_A0v01.mp3", C1: "024_C1v01.mp3", "D#1": "027_D#1v01.mp3", "F#1": "030_F#1v01.mp3",
        A1: "033_A1v01.mp3", C2: "036_C2v01.mp3", "D#2": "039_D#2v01.mp3", "F#2": "042_F#2v01.mp3",
        A2: "045_A2v01.mp3", C3: "048_C3v01.mp3", "D#3": "051_D#3v01.mp3", "F#3": "054_F#3v01.mp3",
        A3: "057_A3v01.mp3", C4: "060_C4v01.mp3", "D#4": "063_D#4v01.mp3", "F#4": "066_F#4v01.mp3",
        A4: "069_A4v01.mp3", C5: "072_C5v01.mp3", "D#5": "075_D#5v01.mp3", "F#5": "078_F#5v01.mp3",
        A5: "081_A5v01.mp3", C6: "084_C6v01.mp3", "D#6": "087_D#6v01.mp3", "F#6": "090_F#6v01.mp3",
        A6: "093_A6v01.mp3", C7: "096_C7v01.mp3", "D#7": "099_D#7v01.mp3", "F#7": "102_F#7v01.mp3",
        A7: "105_A7v01.mp3", C8: "108_C8v01.mp3"
      },
      release: 1,
      baseUrl: "/voices/48khz24bit/",
    }),
    visualColor: '#10B981',
    visualType: 'studio',
  },
};

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