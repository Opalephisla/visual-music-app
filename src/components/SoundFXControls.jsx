
export default function SoundFXControls({ onVolumeChange, onReverbChange, onChorusChange }) {
    return (
      <div className="flex flex-col gap-2 items-center p-2 rounded-lg bg-gray-900/50">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sound FX</h3>
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <label htmlFor="volume-slider" className="text-xs mb-1">Volume</label>
            <input type="range" id="volume-slider" min="0" max="1.5" step="0.05" defaultValue="1" onChange={(e) => onVolumeChange(parseFloat(e.target.value))} />
          </div>
          <div className="flex flex-col items-center">
            <label htmlFor="reverb-slider" className="text-xs mb-1">Reverb</label>
            <input type="range" id="reverb-slider" min="0" max="1" step="0.05" defaultValue="0.4" onChange={(e) => onReverbChange(parseFloat(e.target.value))} />
          </div>
          <div className="flex flex-col items-center">
            <label htmlFor="chorus-slider" className="text-xs mb-1">Chorus</label>
            <input type="range" id="chorus-slider" min="0" max="1" step="0.05" defaultValue="0.3" onChange={(e) => onChorusChange(parseFloat(e.target.value))} />
          </div>
        </div>
      </div>
    );
  }