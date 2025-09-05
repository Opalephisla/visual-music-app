import React from 'react';

const VisualFXControls = ({ settings, onSettingChange }) => {
  const { particlesEnabled, lightBeamsEnabled, noteFlow, showStats, background } = settings;

  const handleToggle = (key) => {
    onSettingChange({ ...settings, [key]: !settings[key] });
  };
  
  const handleSelect = (key, value) => {
    onSettingChange({ ...settings, [key]: value });
  };

  const handleSliderChange = (key, value) => {
    onSettingChange({ ...settings, [key]: parseFloat(value) });
  };

  return (
    <div className="flex flex-col gap-2 items-center p-2 rounded-lg bg-gray-900/50">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Visual FX</h3>
      
      {/* Intensity Controls */}
      <div className="w-full space-y-3 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Particle Intensity</label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={settings.particleIntensity || 1.0}
            onChange={(e) => handleSliderChange('particleIntensity', e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500">{(settings.particleIntensity || 1.0).toFixed(1)}</span>
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Beam Intensity</label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={settings.beamIntensity || 1.0}
            onChange={(e) => handleSliderChange('beamIntensity', e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500">{(settings.beamIntensity || 1.0).toFixed(1)}</span>
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Glow Intensity</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={settings.glowIntensity || 1.0}
            onChange={(e) => handleSliderChange('glowIntensity', e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500">{(settings.glowIntensity || 1.0).toFixed(1)}</span>
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Trail Length</label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={settings.trailLength || 1.0}
            onChange={(e) => handleSliderChange('trailLength', e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500">{(settings.trailLength || 1.0).toFixed(1)}</span>
        </div>
      </div>

      {/* Main Effect Toggles */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={() => handleToggle('particlesEnabled')} 
            className={`px-3 py-1 text-xs rounded-md transition-colors w-full ${
              particlesEnabled ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Particles {particlesEnabled ? 'On' : 'Off'}
          </button>
          
          <button 
            onClick={() => handleToggle('lightBeamsEnabled')} 
            className={`px-3 py-1 text-xs rounded-md transition-colors w-full ${
              lightBeamsEnabled ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Beams {lightBeamsEnabled ? 'On' : 'Off'}
          </button>
          
          <button 
            onClick={() => handleToggle('shimmerEffect')} 
            className={`px-3 py-1 text-xs rounded-md transition-colors w-full ${
              settings.shimmerEffect ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Shimmer {settings.shimmerEffect ? 'On' : 'Off'}
          </button>
          
          <button 
            onClick={() => handleToggle('hypnoticMode')} 
            className={`px-3 py-1 text-xs rounded-md transition-colors w-full ${
              settings.hypnoticMode ? 'bg-pink-600 hover:bg-pink-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Hypnotic {settings.hypnoticMode ? 'On' : 'Off'}
          </button>
          
          <button 
            onClick={() => handleSelect('noteFlow', noteFlow === 'anticipation' ? 'reaction' : 'anticipation')} 
            className={`px-3 py-1 text-xs rounded-md transition-colors w-full ${
              noteFlow === 'anticipation' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            Flow: {noteFlow === 'anticipation' ? 'Anticipation' : 'Reaction'}
          </button>
          
          <button 
            onClick={() => handleToggle('showStats')} 
            className="px-3 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-700 transition-colors w-full"
          >
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <div>
            <label htmlFor="background-select" className="block text-xs text-gray-400 mb-1">Background</label>
            <select 
              id="background-select" 
              value={background} 
              onChange={(e) => handleSelect('background', e.target.value)} 
              className="bg-white/10 border border-white/20 text-white rounded-md text-sm p-1"
            >
              <option value="solid" className="bg-gray-900">Solid Black</option>
              <option value="starfield" className="bg-gray-900">Starfield</option>
              <option value="gradient" className="bg-gray-900">Gradient</option>
              <option value="nebula" className="bg-gray-900">Nebula</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="color-mode-select" className="block text-xs text-gray-400 mb-1">Color Mode</label>
            <select 
              id="color-mode-select" 
              value={settings.colorMode || 'rainbow'} 
              onChange={(e) => handleSelect('colorMode', e.target.value)} 
              className="bg-white/10 border border-white/20 text-white rounded-md text-sm p-1"
            >
              <option value="rainbow" className="bg-gray-900">🌈 Rainbow</option>
              <option value="monochrome" className="bg-gray-900">⚪ Monochrome</option>
              <option value="warm" className="bg-gray-900">🔥 Warm</option>
              <option value="cool" className="bg-gray-900">❄️ Cool</option>
              <option value="neon" className="bg-gray-900">⚡ Neon</option>
              <option value="ethereal" className="bg-gray-900">✨ Ethereal</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Background Intensity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.backgroundIntensity || 0.5}
              onChange={(e) => handleSliderChange('backgroundIntensity', e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-500">{((settings.backgroundIntensity || 0.5) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Hypnotic Mode Settings */}
      {settings.hypnoticMode && (
        <div className="mt-4 p-3 bg-pink-900/20 rounded-lg border border-pink-700/50 w-full">
          <h4 className="text-xs font-semibold text-pink-400 mb-3 uppercase tracking-wider">
            🌀 Hypnotic Effects
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Pulse Rate</label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={settings.pulseRate || 1.0}
                onChange={(e) => handleSliderChange('pulseRate', e.target.value)}
                className="w-full h-2 bg-pink-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-pink-400">{(settings.pulseRate || 1.0).toFixed(1)}x</span>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Spiral Intensity</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={settings.spiralIntensity || 1.0}
                onChange={(e) => handleSliderChange('spiralIntensity', e.target.value)}
                className="w-full h-2 bg-pink-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-pink-400">{(settings.spiralIntensity || 1.0).toFixed(1)}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleToggle('kaleidoscope')}
                className={`flex-1 px-3 py-2 text-xs rounded-md transition-all ${
                  settings.kaleidoscope 
                    ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                🔮 Kaleidoscope {settings.kaleidoscope ? 'On' : 'Off'}
              </button>
              
              <button
                onClick={() => handleToggle('psychedelic')}
                className={`flex-1 px-3 py-2 text-xs rounded-md transition-all ${
                  settings.psychedelic 
                    ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                🎨 Psychedelic {settings.psychedelic ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Effects */}
      <div className="mt-4 pt-3 border-t border-gray-700 w-full">
        <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          🔧 Advanced Effects
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleToggle('noteRipples')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              settings.noteRipples 
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            💧 Ripples {settings.noteRipples ? 'On' : 'Off'}
          </button>
          
          <button
            onClick={() => handleToggle('keyGlow')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              settings.keyGlow !== false
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            ✨ Key Glow {settings.keyGlow !== false ? 'On' : 'Off'}
          </button>
          
          <button
            onClick={() => handleToggle('particleTrails')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              settings.particleTrails 
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            🌟 Trails {settings.particleTrails ? 'On' : 'Off'}
          </button>
          
          <button
            onClick={() => handleToggle('pianoVisible')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              settings.pianoVisible !== false
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            🎹 Piano {settings.pianoVisible !== false ? 'On' : 'Off'}
          </button>
        </div>
        
        {/* Piano Controls */}
        {settings.pianoVisible !== false && (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Piano Position</label>
                <select 
                  value={settings.pianoPosition || 'bottom'} 
                  onChange={(e) => handleSelect('pianoPosition', e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-600 rounded-md text-xs p-1 text-white"
                >
                  <option value="bottom">⬇️ Bottom</option>
                  <option value="top">⬆️ Top</option>
                  <option value="left">⬅️ Left</option>
                  <option value="right">➡️ Right</option>
                  <option value="floating">🎈 Floating</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Piano Size</label>
                <select 
                  value={settings.pianoSize || 'normal'} 
                  onChange={(e) => handleSelect('pianoSize', e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-600 rounded-md text-xs p-1 text-white"
                >
                  <option value="small">🔸 Small</option>
                  <option value="normal">🔹 Normal</option>
                  <option value="large">🔶 Large</option>
                  <option value="xlarge">🔷 XLarge</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Piano Opacity</label>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={settings.pianoOpacity || 0.9}
                onChange={(e) => handleSliderChange('pianoOpacity', e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-500">{((settings.pianoOpacity || 0.9) * 100).toFixed(0)}%</span>
            </div>
            
            <button
              onClick={() => handleToggle('notePreview')}
              className={`w-full px-3 py-1 text-xs rounded-md transition-all ${
                settings.notePreview !== false
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              🏷️ Note Labels {settings.notePreview !== false ? 'On' : 'Off'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualFXControls;