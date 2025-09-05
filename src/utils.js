import { NOTE_COLORS } from './constants';

export const getNoteColor = (noteName) => {
    const map = { 'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11 };
    return NOTE_COLORS[map[noteName.replace(/[0-9]/g, '')] || 0];
};

export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)].join(',') : '255,255,255';
};
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
};

// Simple but effective chord progression
const MAJOR_PROGRESSION = [0, 4, 5, 3]; // I - V - vi - IV
const MINOR_PROGRESSION = [0, 5, 2, 6]; // i - VI - III - VII

// --- Helper Functions ---
function getNoteFromIndex(index, octave = 4) {
  const noteName = NOTES[index % 12];
  const currentOctave = octave + Math.floor(index / 12);
  return `${noteName}${currentOctave}`;
}

function getScaleNotes(rootNote, scaleName, numOctaves = 2) {
  const rootIndex = NOTES.indexOf(rootNote);
  const scaleIntervals = SCALES[scaleName];
  let notes = [];
  for (let o = 0; o < numOctaves; o++) {
    for (const interval of scaleIntervals) {
      notes.push(getNoteFromIndex(rootIndex + interval + (o * 12)));
    }
  }
  return notes;
}

// --- Generator Main Function ---
export function generateMidi(options) {
  const { key, scale, duration, bpm, style } = options;
  const notes = [];
  let currentTime = 0;

  const secondsPerBeat = 60 / bpm;
  const scaleNotes = getScaleNotes(key, scale, 3);
  const progression = scale.includes('minor') ? MINOR_PROGRESSION : MAJOR_PROGRESSION;

  while (currentTime < duration) {
    const chordRootIndex = progression[Math.floor(currentTime / (secondsPerBeat * 4)) % progression.length];
    
    switch (style) {
      case 'arpeggios': {
        const beatDuration = secondsPerBeat / 2; // Eighth notes
        const chordNotes = [
          scaleNotes[chordRootIndex],
          scaleNotes[chordRootIndex + 2],
          scaleNotes[chordRootIndex + 4],
          scaleNotes[chordRootIndex + 2],
        ];
        for (let i = 0; i < 4; i++) {
          if (currentTime >= duration) break;
          notes.push({
            pitch: chordNotes[i % chordNotes.length],
            time: currentTime,
            duration: beatDuration * 0.9,
            velocity: 0.6 + Math.random() * 0.2,
          });
          currentTime += beatDuration;
        }
        break;
      }
      case 'chords': {
        const beatDuration = secondsPerBeat; // Quarter notes
        const chordNotes = [
          scaleNotes[chordRootIndex],
          scaleNotes[chordRootIndex + 2],
          scaleNotes[chordRootIndex + 4],
        ];
        chordNotes.forEach(pitch => {
          notes.push({
            pitch,
            time: currentTime,
            duration: beatDuration * 1.8,
            velocity: 0.7,
          });
        });
        currentTime += beatDuration * 2;
        break;
      }
      case 'melody':
      default: {
        const beatDuration = [secondsPerBeat, secondsPerBeat / 2, secondsPerBeat * 1.5][Math.floor(Math.random() * 3)];
        const pitch = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
        notes.push({
          pitch,
          time: currentTime,
          duration: beatDuration * 0.85,
          velocity: 0.7 + Math.random() * 0.3,
        });
        currentTime += beatDuration;
        break;
      }
    }
  }

  return {
    notes,
    title: `Random ${style}`,
    composer: `In ${key} ${scale}`,
    pedalEvents: [],
  };
}