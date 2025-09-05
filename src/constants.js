export const PERFORMANCE_CONFIG = {
  high: { maxNotes: 8000, maxParticles: 400, particleRate: 8, noteRenderDistance: 3, maxActiveNotes: 64 },
  medium: { maxNotes: 4000, maxParticles: 200, particleRate: 5, noteRenderDistance: 2.5, maxActiveNotes: 48 },
  low: { maxNotes: 2000, maxParticles: 100, particleRate: 2, noteRenderDistance: 2, maxActiveNotes: 32 }
};

export const PIECES = {
  'clair_de_lune': {
    title: 'Clair de Lune (Opening)', composer: 'Claude Debussy',
    data: [
      ['Db4', 0.5, 2, 0.4], ['Ab4', 1.0, 2, 0.4], ['Db5', 1.5, 2, 0.4], 
      ['F5', 2.0, 2, 0.5], ['Ab5', 2.5, 2, 0.5],
      ['Db4', 4.5, 2, 0.4], ['Ab4', 5.0, 2, 0.4], ['Db5', 5.5, 2, 0.4], 
      ['E5', 6.0, 2, 0.5], ['Ab5', 6.5, 2, 0.5],
    ],
    pedal: [[0.5, 8.5]]
  },
  'fur_elise': {
    title: 'Für Elise (Opening)', composer: 'Ludwig van Beethoven',
    data: [
      ['E5', 0.0, 0.25, 0.8], ['D#5', 0.25, 0.25, 0.7], ['E5', 0.5, 0.25, 0.8], ['D#5', 0.75, 0.25, 0.7],
      ['E5', 1.0, 0.25, 0.8], ['B4', 1.25, 0.25, 0.7], ['D5', 1.5, 0.25, 0.8], ['C5', 1.75, 0.25, 0.7],
      ['A4', 2.0, 0.5, 0.8]
    ],
    pedal: []
  }
};

export const INSTRUMENT_OPTIONS = {
  'piano': 'Piano',
  'electric-piano': 'Electric Piano',
  'synth-pad': 'Synth Pad'
};

export const NOTE_COLORS = ['#a855f7', '#d946ef', '#ec4899', '#f472b6', '#818cf8', '#60a5fa', '#38bdf8', '#22d3ee', '#67e8f9', '#c084fc', '#e879f9', '#f0abfc'];