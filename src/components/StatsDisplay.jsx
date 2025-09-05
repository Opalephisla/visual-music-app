export default function StatsDisplay({ stats, noteCount }) {
    return (
      <div className="fixed top-2.5 right-2.5 bg-black bg-opacity-80 p-2.5 rounded font-mono text-xs text-green-400 z-30">
        <div>FPS: <span className="font-bold">{stats.fps}</span></div>
        <div>Notes: <span className="font-bold">{noteCount}</span></div>
        <div>Active: <span className="font-bold">{stats.active}</span></div>
      </div>
    );
  }