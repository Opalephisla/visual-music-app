import React, { useRef, useState, memo } from 'react';
import { getInstrumentsByCategory } from '../instruments';

function Header({
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
  onOpenGenerator,
  instrumentMenuRef
}) {
  const fileInputRef = useRef(null);
  const [showInstrumentMenu, setShowInstrumentMenu] = useState(false);

  const instrumentCategories = getInstrumentsByCategory();
  const currentInstrument = instrumentList[instrument];

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

  const handleInstrumentSelect = (instrumentKey) => {
    onInstrumentChange(instrumentKey);
    setShowInstrumentMenu(false);
  };

  return (
    <header className="w-full p-4 text-center bg-black bg-opacity-30 z-20 space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-lg text-gray-300">{composer}</p>
      </div>

      <div className="flex gap-2 justify-center items-center flex-wrap">
        <select
          value={currentPieceKey}
          onChange={handleSelectChange}
          className="bg-white/10 border border-white/20 text-white rounded-md text-sm p-2 hover:bg-white/20 transition-colors"
        >
          {Object.entries(availablePieces).map(([key, { title }]) => (
            <option key={key} value={key} className="bg-gray-900">{title}</option>
          ))}
          <option value="upload" className="bg-gray-900">📁 Upload MIDI...</option>
        </select>

        {/* Enhanced Instrument Selector */}
        <div className="relative" ref={instrumentMenuRef}>
          <button
            onClick={() => setShowInstrumentMenu(!showInstrumentMenu)}
            className="bg-white/10 border border-white/20 text-white rounded-md text-sm p-2 px-4 hover:bg-white/20 transition-colors flex items-center gap-2 min-w-[200px] justify-between"
          >
            <span className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentInstrument?.visualColor || '#4F46E5' }}
              ></div>
              {currentInstrument?.name || 'Select Instrument'}
            </span>
            <span className={`transform transition-transform ${showInstrumentMenu ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showInstrumentMenu && (
            <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-xl z-50 min-w-[300px] max-h-80 overflow-y-auto">
              {Object.entries(instrumentCategories).map(([category, instruments]) => (
                <div key={category} className="border-b border-gray-700 last:border-b-0">
                  <div className="px-3 py-2 bg-gray-800 text-gray-300 text-xs font-semibold uppercase tracking-wider">
                    {category}
                  </div>
                  {instruments.map(({ key, name, visualColor }) => (
                    <button
                      key={key}
                      onClick={() => handleInstrumentSelect(key)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center gap-3 text-sm ${
                        key === instrument ? 'bg-gray-700 text-white' : 'text-gray-300'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: visualColor }}
                      ></div>
                      {name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          type="file"
          accept=".mid,.midi"
          ref={fileInputRef}
          onChange={(e) => onFileChange(e.target.files[0])}
          className="hidden"
        />

        <button
          onClick={onOpenGenerator}
          className="bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-500 text-white rounded-md text-sm p-2 px-4 hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
        >
          🎵 Generate...
        </button>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 flex items-center gap-2">
            Quality:
            <select
              value={quality}
              onChange={(e) => onQualityChange(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-md text-sm p-1 hover:bg-white/20 transition-colors"
            >
              <option value="high" className="bg-gray-900">🔥 High</option>
              <option value="medium" className="bg-gray-900">⚡ Medium</option>
              <option value="low" className="bg-gray-900">💨 Low</option>
            </select>
          </label>
        </div>
      </div>

      {/* Current Instrument Info Bar */}
      <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: currentInstrument?.visualColor || '#4F46E5' }}
          ></div>
          Current: {currentInstrument?.name}
        </span>
        <span>•</span>
        <span>Category: {currentInstrument?.category}</span>
        <span>•</span>
        <span>Visual Style: {currentInstrument?.visualType}</span>
      </div>
    </header>
  );
}

export default memo(Header);