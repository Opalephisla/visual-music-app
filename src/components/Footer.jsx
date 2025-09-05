import React from 'react';
import PlaybackControls from './PlaybackControls';
import SoundFXControls from './SoundFXControls';
import VisualFXControls from './VisualFXControls';

export default function Footer({
  onPlayPause,
  onRestart,
  onDownloadMidi,
  isPedalActive,
  visualSettings,
  audioSettings,
  updateVisualSettings,
  updateAudioSettings,
}) {
  return (
    <footer className="w-full p-2 sm:p-4 flex flex-col items-center gap-4 bg-black bg-opacity-60 z-20">
      <PlaybackControls
        onPlayPause={onPlayPause}
        onRestart={onRestart}
        onSpeedChange={(rate) => updateAudioSettings({ playbackRate: rate })}
        onDownloadMidi={onDownloadMidi}
        isPedalActive={isPedalActive}
        playbackState={visualSettings.playbackState}
        audioSettings={audioSettings}
      />

      <div className="flex justify-center items-start gap-4 md:gap-6 flex-wrap max-w-7xl">
        <SoundFXControls
          onVolumeChange={(val) => updateAudioSettings({ volume: val })}
          onReverbChange={(val) => updateAudioSettings({ reverb: val })}
          onChorusChange={(val) => updateAudioSettings({ chorus: val })}
          audioSettings={audioSettings}
        />

        <VisualFXControls
          settings={visualSettings}
          onSettingChange={updateVisualSettings}
        />
      </div>
    </footer>
  );
}