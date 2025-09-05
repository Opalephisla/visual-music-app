const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
};

const VERSE_PROGRESSION_MAJOR = [0, 3, 4, 5]; // I - IV - V - vi
const CHORUS_PROGRESSION_MAJOR = [4, 0, 5, 3]; // V - I - vi - IV
const VERSE_PROGRESSION_MINOR = [0, 3, 6, 4]; // i - iv - VII - V
const CHORUS_PROGRESSION_MINOR = [5, 3, 0, 6]; // VI - iv - i - VII

// --- Helper Functions ---
function getNoteFromIndex(index, octave = 4) {
  // THIS IS THE FIX:
  // The old `index % 12` didn't handle negative numbers correctly.
  // This new formula is a robust way to calculate the modulus for any integer.
  const noteName = NOTES[((index % 12) + 12) % 12];
  const currentOctave = octave + Math.floor(index / 12);
  return `${noteName}${currentOctave}`;
}

function getScaleNotes(rootNote, scaleName, numOctaves = 3) {
  const rootIndex = NOTES.indexOf(rootNote);
  const scaleIntervals = SCALES[scaleName];
  let notes = [];
  for (let o = 0; o < numOctaves; o++) {
    for (const interval of scaleIntervals) {
      notes.push(getNoteFromIndex(rootIndex + interval + (o * 12) - 12));
    }
  }
  return notes;
}

// --- Generator Logic for Different Styles (Now safe due to the fix above) ---
function addArpeggios(notes, currentTime, duration, scaleNotes, chordRootIndex, secondsPerBeat) {
  let time = currentTime;
  const beatDuration = secondsPerBeat / 2;
  const chordNotes = [
    scaleNotes[chordRootIndex % scaleNotes.length],
    scaleNotes[(chordRootIndex + 2) % scaleNotes.length],
    scaleNotes[(chordRootIndex + 4) % scaleNotes.length],
    scaleNotes[(chordRootIndex + 2) % scaleNotes.length]
  ];
  while (time < currentTime + duration) {
    for (let i = 0; i < 4; i++) {
      if (time >= currentTime + duration) break;
      notes.push({ pitch: chordNotes[i], time, duration: beatDuration * 0.9, velocity: 0.6 + Math.random() * 0.1 });
      time += beatDuration;
    }
  }
  return time - currentTime;
}

function addChords(notes, currentTime, duration, scaleNotes, chordRootIndex, secondsPerBeat) {
  let time = currentTime;
  const beatDuration = secondsPerBeat * 2;
  const chordNotes = [
    scaleNotes[chordRootIndex % scaleNotes.length],
    scaleNotes[(chordRootIndex + 2) % scaleNotes.length],
    scaleNotes[(chordRootIndex + 4) % scaleNotes.length]
  ];
  while (time < currentTime + duration) {
    chordNotes.forEach(pitch => notes.push({ pitch, time, duration: beatDuration * 0.9, velocity: 0.7 }));
    time += beatDuration;
  }
  return time - currentTime;
}

function addMelody(notes, currentTime, duration, scaleNotes, chordRootIndex, secondsPerBeat) {
  let time = currentTime;
  const chordToneIndexes = [chordRootIndex, chordRootIndex + 2, chordRootIndex + 4, chordRootIndex + 7];
  while (time < currentTime + duration) {
    const beatDuration = (secondsPerBeat / 2) * (Math.random() > 0.7 ? 2 : 1);
    const useChordTone = Math.random() > 0.4;
    
    let pitch;
    if (useChordTone) {
      const index = chordToneIndexes[Math.floor(Math.random() * chordToneIndexes.length)];
      pitch = scaleNotes[(index + 7) % scaleNotes.length];
    } else {
      pitch = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
    }

    notes.push({ pitch, time, duration: beatDuration * 0.85, velocity: 0.8 + Math.random() * 0.2 });
    time += beatDuration;
  }
  return time - currentTime;
}

// --- Main Generator Function ---
export function generateMidi(options) {
  const { key, scale, duration, bpm, style } = options;
  const notes = [];
  let currentTime = 0;

  const secondsPerBeat = 60 / bpm;
  const isMinor = scale.includes('minor');
  const scaleNotes = getScaleNotes(key, scale);

  if (style === 'structured') {
    const verseProgression = isMinor ? VERSE_PROGRESSION_MINOR : VERSE_PROGRESSION_MAJOR;
    const chorusProgression = isMinor ? CHORUS_PROGRESSION_MINOR : CHORUS_PROGRESSION_MAJOR;
    const barsPerSection = 4;
    
    const structure = [
      { style: 'arpeggios', progression: verseProgression }, { style: 'melody', progression: verseProgression },
      { style: 'chords', progression: chorusProgression }, { style: 'melody', progression: verseProgression },
      { style: 'chords', progression: chorusProgression },
    ];
    
    for (const section of structure) {
      if (currentTime >= duration) break;
      const progression = section.progression;
      for (let bar = 0; bar < barsPerSection; bar++) {
          const chordRootIndex = progression[bar % progression.length];
          const barDuration = 4 * secondsPerBeat;
          switch(section.style) {
              case 'arpeggios': addArpeggios(notes, currentTime, barDuration, scaleNotes, chordRootIndex, secondsPerBeat); break;
              case 'chords': addChords(notes, currentTime, barDuration, scaleNotes, chordRootIndex, secondsPerBeat); break;
              case 'melody': addMelody(notes, currentTime, barDuration, scaleNotes, chordRootIndex, secondsPerBeat); break;
          }
          currentTime += barDuration;
      }
    }
  } else {
    const progression = isMinor ? VERSE_PROGRESSION_MINOR : VERSE_PROGRESSION_MAJOR;
    while (currentTime < duration) {
      const chordRootIndex = progression[Math.floor(currentTime / (secondsPerBeat * 4)) % progression.length];
      const timeAdvanced = {
        'arpeggios': () => addArpeggios(notes, currentTime, 4 * secondsPerBeat, scaleNotes, chordRootIndex, secondsPerBeat),
        'chords': () => addChords(notes, currentTime, 4 * secondsPerBeat, scaleNotes, chordRootIndex, secondsPerBeat),
        'melody': () => addMelody(notes, currentTime, 4 * secondsPerBeat, scaleNotes, chordRootIndex, secondsPerBeat),
      }[style]();
      currentTime += timeAdvanced;
    }
  }

  const finalDuration = Math.max(...notes.map(n => n.time + n.duration), 0);
  return {
    notes,
    title: `Random ${style}`,
    composer: `In ${key} ${scale.replace('pentatonicMajor', 'Pent. Major').replace('pentatonicMinor', 'Pent. Minor')}`,
    pedalEvents: [],
    songDuration: finalDuration,
  };
}