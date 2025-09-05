import React, { useState } from 'react';

// A constant for the note names to avoid re-creating the array on every render
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function MidiGeneratorUI({ onGenerate, onCancel }) {
  const [options, setOptions] = useState({
    key: 'C',
    scale: 'major',
    duration: 30,
    bpm: 120,
    style: 'expressive',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOptions(prev => ({ ...prev, [name]: name === 'duration' || name === 'bpm' ? parseInt(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-gray-900 text-white p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center font-serif">Generate Random Arrangement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Key</label>
              <select name="key" value={options.key} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition">
                {NOTE_NAMES.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Scale</label>
              <select name="scale" value={options.scale} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition">
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="pentatonicMajor">Pentatonic Major</option>
                <option value="pentatonicMinor">Pentatonic Minor</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Style</label>
            <select name="style" value={options.style} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition">
              <option value="expressive">Expressive Piece</option>
              <option value="structured">Structured Mix</option>
              <option value="arpeggios">Arpeggios Only</option>
              <option value="chords">Chords Only</option>
              <option value="melody">Melody Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Duration: {options.duration}s</label>
            <input type="range" name="duration" min="10" max="120" value={options.duration} onChange={handleChange} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">BPM: {options.bpm}</label>
            <input type="range" name="bpm" min="60" max="180" value={options.bpm} onChange={handleChange} className="w-full" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-all transform hover:scale-105 active:scale-100">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-fuchsia-600 rounded-md hover:bg-fuchsia-500 transition-all transform hover:scale-105 active:scale-100">Generate</button>
          </div>
        </form>
      </div>
    </div>
  );
}

