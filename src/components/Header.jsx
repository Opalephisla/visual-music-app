import React, { useRef } from 'react';

export default function Header({
  title,
  composer,
  availablePieces = {},
  currentPieceKey,
  onPieceChange,
  onFileChange,
  instrumentList = {},
  instrument,
  onInstrumentChange,
  onQualityChange,
  quality,
  onOpenGenerator
}) {
  const fileInputRef = useRef(null);

  const handleSelectChange = (e) => {
    if (e.target.value === 'upload') {
      fileInputRef.current?.click();
      // Prevents the select from getting stuck on the "Upload MIDI..." option
      if (currentPieceKey in availablePieces) {
        onPieceChange(currentPieceKey);
      } else {
        onPieceChange('clair_de_lune');
      }
    } else {
      onPieceChange(e.target.value);
    }
  };

  return (
    <header className="w-full p-4 text-center bg-black bg-opacity-30 z-20 space-y-2">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-lg text-gray-300">{composer}</p>
      </div>
      <div className="flex gap-2 justify-center items-center">
        <select value={currentPieceKey} onChange={handleSelectChange} className="bg-white/10 border border-white/20 text-white rounded-md text-sm p-1">
          {Object.entries(availablePieces).map(([key, { title }]) => (
            <option key={key} value={key} className="bg-gray-900">{title}</option>
          ))}
          <option value="upload" className="bg-gray-900">Upload MIDI...</option>
        </select>
        
        <select onChange={(e) => onInstrumentChange(e.target.value)} value={instrument} className="bg-white/10 border border-white/20 text-white rounded-md text-sm p-1">
          {Object.entries(instrumentList).map(([key, { name }]) => (
            <option key={key} value={key} className="bg-gray-900">{name}</option>
          ))}
        </select>

        <input type="file" accept=".mid,.midi" ref={fileInputRef} onChange={(e) => onFileChange(e.target.files[0])} className="hidden" />

        <button onClick={onOpenGenerator} className="bg-white/10 border border-white/20 text-white rounded-md text-sm p-1 px-3 hover:bg-white/20">
          Generate...
        </button>

        <label className="text-xs text-gray-400">
          Quality:
          <select value={quality} onChange={(e) => onQualityChange(e.target.value)} className="ml-1 bg-white/10 border border-white/20 text-white rounded-md text-sm p-1">
            <option value="high" className="bg-gray-900">High</option>
            <option value="medium" className="bg-gray-900">Medium</option>
            <option value="low" className="bg-gray-900">Low</option>
          </select>
        </label>
      </div>
    </header>
  );
}