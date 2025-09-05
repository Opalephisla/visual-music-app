export default function VisualFXControls({ settings, onSettingChange }) {
    const { particlesEnabled, lightBeamsEnabled, noteFlow, showStats, background } = settings;
  
    const handleToggle = (key) => {
      onSettingChange({ ...settings, [key]: !settings[key] });
    };
    
    const handleSelect = (key, value) => {
      onSettingChange({ ...settings, [key]: value });
    };
  
    return (
      <div className="flex flex-col gap-2 items-center p-2 rounded-lg bg-gray-900/50">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Visual FX</h3>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => handleToggle('particlesEnabled')} className={`px-3 py-1 text-xs rounded-md transition-colors w-full ${particlesEnabled ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : 'bg-gray-700 hover:bg-gray-600'}`}>Particles {particlesEnabled ? 'On' : 'Off'}</button>
            <button onClick={() => handleToggle('lightBeamsEnabled')} className={`px-3 py-1 text-xs rounded-md transition-colors w-full ${lightBeamsEnabled ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : 'bg-gray-700 hover:bg-gray-600'}`}>Beams {lightBeamsEnabled ? 'On' : 'Off'}</button>
            <button onClick={() => handleSelect('noteFlow', noteFlow === 'anticipation' ? 'reaction' : 'anticipation')} className={`px-3 py-1 text-xs rounded-md transition-colors w-full ${noteFlow === 'anticipation' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-amber-600 hover:bg-amber-700'}`}>Flow: {noteFlow === 'anticipation' ? 'Anticipation' : 'Reaction'}</button>
            <button onClick={() => handleToggle('showStats')} className="px-3 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-700 transition-colors w-full">{showStats ? 'Hide' : 'Show'} Stats</button>
          </div>
          <div className="flex flex-col items-center">
            <label htmlFor="background-select" className="text-xs mb-1">Background</label>
            <select id="background-select" value={background} onChange={(e) => handleSelect('background', e.target.value)} className="bg-white/10 border border-white/20 text-white rounded-md text-sm p-1">
              <option value="solid" className="bg-gray-900">Solid Black</option>
              <option value="starfield" className="bg-gray-900">Starfield</option>
            </select>
          </div>
        </div>
      </div>
    );
  }