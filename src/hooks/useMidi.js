import { useState, useCallback, useEffect } from 'react';
import { Midi } from '@tonejs/midi';

// Default test piece
const DEFAULT_PIECES = {
  'test_piece': {
    title: 'Test Melody',
    composer: 'Demo',
    data: [
      { pitch: 'C4', time: 0, duration: 0.5, velocity: 0.8 },
      { pitch: 'E4', time: 0.5, duration: 0.5, velocity: 0.8 },
      { pitch: 'G4', time: 1, duration: 0.5, velocity: 0.8 },
      { pitch: 'C5', time: 1.5, duration: 1, velocity: 0.8 },
      { pitch: 'G4', time: 2.5, duration: 0.5, velocity: 0.7 },
      { pitch: 'E4', time: 3, duration: 0.5, velocity: 0.7 },
      { pitch: 'C4', time: 3.5, duration: 1, velocity: 0.7 },
    ],
    pedal: [[0, 4.5]]
  },
  'clair_de_lune': {
    title: 'Clair de Lune (Opening)',
    composer: 'Claude Debussy',
    data: [
      { pitch: 'Db4', time: 0.5, duration: 2, velocity: 0.4 },
      { pitch: 'Ab4', time: 1.0, duration: 2, velocity: 0.4 },
      { pitch: 'Db5', time: 1.5, duration: 2, velocity: 0.4 },
      { pitch: 'F5', time: 2.0, duration: 2, velocity: 0.5 },
      { pitch: 'Ab5', time: 2.5, duration: 2, velocity: 0.5 },
      { pitch: 'Db4', time: 4.5, duration: 2, velocity: 0.4 },
      { pitch: 'Ab4', time: 5.0, duration: 2, velocity: 0.4 },
      { pitch: 'Db5', time: 5.5, duration: 2, velocity: 0.4 },
      { pitch: 'E5', time: 6.0, duration: 2, velocity: 0.5 },
      { pitch: 'Ab5', time: 6.5, duration: 2, velocity: 0.5 },
    ],
    pedal: [[0.5, 8.5]]
  },
  'fur_elise': {
    title: 'Für Elise (Opening)',
    composer: 'Ludwig van Beethoven',
    data: [
      { pitch: 'E5', time: 0.0, duration: 0.25, velocity: 0.8 },
      { pitch: 'D#5', time: 0.25, duration: 0.25, velocity: 0.7 },
      { pitch: 'E5', time: 0.5, duration: 0.25, velocity: 0.8 },
      { pitch: 'D#5', time: 0.75, duration: 0.25, velocity: 0.7 },
      { pitch: 'E5', time: 1.0, duration: 0.25, velocity: 0.8 },
      { pitch: 'B4', time: 1.25, duration: 0.25, velocity: 0.7 },
      { pitch: 'D5', time: 1.5, duration: 0.25, velocity: 0.8 },
      { pitch: 'C5', time: 1.75, duration: 0.25, velocity: 0.7 },
      { pitch: 'A4', time: 2.0, duration: 0.5, velocity: 0.8 },
    ],
    pedal: [[0, 2.5]]
  }
};

export function useMidi() {
  const [availablePieces] = useState(DEFAULT_PIECES);
  const [currentPieceKey, setCurrentPieceKey] = useState(null);
  const [notes, setNotes] = useState([]);
  const [pedalEvents, setPedalEvents] = useState([]);
  const [songDuration, setSongDuration] = useState(0);
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [octaveRange, setOctaveRange] = useState({ min: 3, max: 6 });
  const [totalWhiteKeys, setTotalWhiteKeys] = useState(28);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [midiErrors, setMidiErrors] = useState([]);

  // Process MIDI data
  const processMidiData = useCallback((midiNotes, pedalData = [], pieceTitle, pieceComposer) => {
    try {
      // Validate and clean notes
      const validNotes = midiNotes.filter(note => 
        note.pitch && 
        typeof note.time === 'number' && 
        typeof note.duration === 'number'
      );
      
      if (validNotes.length === 0) {
        console.warn('No valid notes found');
        setMidiErrors(['No valid notes in MIDI data']);
        return;
      }
      
      // Sort by time
      validNotes.sort((a, b) => a.time - b.time);
      
      // Calculate song duration
      const duration = Math.max(
        ...validNotes.map(n => (n.time || 0) + (n.duration || 0)),
        0
      );
      
      // Calculate octave range
      const octaves = validNotes.map(n => {
        const match = n.pitch.match(/(\d+)$/);
        return match ? parseInt(match[1]) : 4;
      });
      const minOct = Math.min(...octaves, 3);
      const maxOct = Math.max(...octaves, 6);
      
      // Update state
      setNotes(validNotes);
      setPedalEvents(pedalData);
      setSongDuration(duration);
      setTitle(pieceTitle);
      setComposer(pieceComposer);
      setOctaveRange({ min: minOct, max: maxOct });
      setTotalWhiteKeys((maxOct - minOct + 1) * 7);
      setMidiErrors([]);
      
      console.log(`Loaded ${validNotes.length} notes, duration: ${duration}s`);
    } catch (error) {
      console.error('Error processing MIDI data:', error);
      setMidiErrors([error.message]);
    }
  }, []);

  // Load a piece
  const loadPiece = useCallback((pieceKey, quality = 'high') => {
    setIsLoading(true);
    setLoadingText('Loading piece...');
    
    try {
      const piece = availablePieces[pieceKey];
      if (!piece) {
        throw new Error(`Piece ${pieceKey} not found`);
      }
      
      setCurrentPieceKey(pieceKey);
      processMidiData(piece.data, piece.pedal || [], piece.title, piece.composer);
      
    } catch (error) {
      console.error('Error loading piece:', error);
      setMidiErrors([error.message]);
    } finally {
      setIsLoading(false);
    }
  }, [availablePieces, processMidiData]);

  // Load MIDI file
  const loadMidiFile = useCallback(async (file, quality = 'high') => {
    if (!file) return;
    
    setIsLoading(true);
    setLoadingText('Processing MIDI file...');
    setCurrentPieceKey('uploaded');
    
    try {
      const buffer = await file.arrayBuffer();
      const midi = new Midi(buffer);
      
      const midiNotes = [];
      midi.tracks.forEach(track => {
        track.notes.forEach(note => {
          midiNotes.push({
            pitch: note.name,
            time: note.time,
            duration: note.duration,
            velocity: note.velocity
          });
        });
      });
      
      const fileName = file.name.replace(/\.(mid|midi)$/i, '');
      processMidiData(midiNotes, [], fileName, 'Uploaded File');
      
    } catch (error) {
      console.error('Error loading MIDI file:', error);
      setMidiErrors([error.message]);
    } finally {
      setIsLoading(false);
    }
  }, [processMidiData]);

  // Generate random piece
  const generateRandomPiece = useCallback((options = {}) => {
    setIsLoading(true);
    setLoadingText('Generating music...');
    
    try {
      // Simple random melody generator
      const notes = [];
      const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const octaves = [4, 5];
      const duration = options.duration || 10;
      
      let currentTime = 0;
      while (currentTime < duration) {
        const note = scale[Math.floor(Math.random() * scale.length)];
        const octave = octaves[Math.floor(Math.random() * octaves.length)];
        const noteDuration = Math.random() * 0.5 + 0.25;
        
        notes.push({
          pitch: `${note}${octave}`,
          time: currentTime,
          duration: noteDuration,
          velocity: 0.5 + Math.random() * 0.5
        });
        
        currentTime += noteDuration;
      }
      
      setCurrentPieceKey('generated');
      processMidiData(notes, [], 'Generated Melody', 'Random Generator');
      
    } catch (error) {
      console.error('Error generating piece:', error);
      setMidiErrors([error.message]);
    } finally {
      setIsLoading(false);
    }
  }, [processMidiData]);

  // Load default piece on mount
  useEffect(() => {
    if (!currentPieceKey && Object.keys(availablePieces).length > 0) {
      loadPiece('clair_de_lune');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    notes,
    pedalEvents,
    songDuration,
    title,
    composer,
    availablePieces,
    currentPieceKey,
    octaveRange,
    totalWhiteKeys,
    isLoading,
    loadingText,
    midiErrors,
    loadPiece,
    loadMidiFile,
    generateRandomPiece
  };
}