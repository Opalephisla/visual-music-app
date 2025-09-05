import { useState, useCallback } from 'react';
import { Midi } from '@tonejs/midi';
import { PIECES, PERFORMANCE_CONFIG } from '../constants';
import { generateMidi } from '../utils/midiGenerator';

export function useMidi() {
  const [availablePieces, setAvailablePieces] = useState(PIECES);
  const [midiData, setMidiData] = useState({
    notes: [],
    pedalEvents: [],
    songDuration: 0,
    title: '',
    composer: '',
    octaveRange: { min: 2, max: 6 },
    totalWhiteKeys: 35,
  });
  const [currentPieceKey, setCurrentPieceKey] = useState('clair_de_lune');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Loading...');

  const processMidiData = useCallback((midiNotes, pedalData = [], title, composer, quality = 'high') => {
    const config = PERFORMANCE_CONFIG[quality];
    let processedNotes = midiNotes.sort((a, b) => a.time - b.time);

    if (processedNotes.length > config.maxNotes) {
      processedNotes = processedNotes
        .sort((a, b) => (b.velocity * b.duration) - (a.velocity * a.duration))
        .slice(0, config.maxNotes)
        .sort((a, b) => a.time - b.time);
    }

    let newData = { notes: processedNotes, pedalEvents: pedalData, title, composer };

    if (processedNotes.length > 0) {
      newData.songDuration = Math.max(...processedNotes.map(n => n.time + n.duration), 0);
      const pitches = processedNotes.map(n => parseInt(n.pitch.slice(-1), 10));
      const minOct = Math.max(Math.min(...pitches, 2), 0);
      const maxOct = Math.min(Math.max(...pitches, 6), 8);
      newData.octaveRange = { min: minOct, max: maxOct };
      newData.totalWhiteKeys = (maxOct - minOct + 1) * 7;
    }
    
    setMidiData(newData);
    setIsLoading(false);
  }, []);
  
  const loadPiece = useCallback((pieceKey, quality) => {
    setCurrentPieceKey(pieceKey);
    const piece = availablePieces[pieceKey];
    if (!piece || !piece.data) {
        setIsLoading(false);
        return;
    };

    let notesToProcess = [];
    if (piece.data.length > 0) {
      if (Array.isArray(piece.data[0])) {
        // It's the original format [pitch, time, dur, vel]
        notesToProcess = piece.data.map(([pitch, time, dur, vel]) => ({ pitch, time, duration: dur, velocity: vel }));
      } else {
        // It's already in the correct note object format
        notesToProcess = piece.data;
      }
    }
    
    processMidiData(notesToProcess, piece.pedal, piece.title, piece.composer, quality);
  }, [processMidiData, availablePieces]);

  const loadMidiFile = useCallback(async (file, quality) => {
    if (!file) return;
    setCurrentPieceKey('upload');
    setIsLoading(true);
    setLoadingText('Processing MIDI...');
    try {
      const buffer = await file.arrayBuffer();
      const midi = new Midi(buffer);
      const newNotes = [];
      midi.tracks.forEach(track => {
        if (track.channel !== 9) {
          track.notes.forEach(note => newNotes.push({ pitch: note.name, time: note.time, duration: note.duration, velocity: note.velocity }));
        }
      });
      const title = midi.name || file.name.replace(/\.(mid|midi)$/i, '');
      processMidiData(newNotes, [], title, "Uploaded File", quality);
    } catch (error) {
      console.error("Error parsing MIDI:", error);
      setLoadingText('Error loading file!');
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [processMidiData]);
  
  const generateRandomPiece = useCallback((options) => {
    setIsLoading(true);
    setLoadingText('Generating Music...');
    try {
      const { notes, title, composer, pedalEvents } = generateMidi(options);
      
      const newKey = `generated_${Date.now()}`;
      const newPiece = { title, composer, data: notes, pedal: pedalEvents };
      setAvailablePieces(prev => ({ ...prev, [newKey]: newPiece }));

      setCurrentPieceKey(newKey);
      processMidiData(notes, pedalEvents, title, composer, options.quality);
    } catch (error) {
      console.error("Error generating MIDI:", error);
      setLoadingText('Generation Failed!');
    } finally {
      setTimeout(() => setIsLoading(false), 100);
    }
  }, [processMidiData]);

  return { ...midiData, availablePieces, currentPieceKey, isLoading, loadingText, loadPiece, loadMidiFile, generateRandomPiece };
}