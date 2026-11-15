import { useSandboxStore } from '../stores/sandboxStore';
import { RefreshCw, ExternalLink, Globe } from 'lucide-react';
import { useState, useRef } from 'react';

export default function PreviewPanel() {
  const previewUrl = useSandboxStore((s) => s.previewUrl);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef(null);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleOpenExternal = () => {
    if (previewUrl) window.open(previewUrl, '_blank');
  };

  if (!previewUrl) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] text-gray-500 gap-3">
        <Globe size={48} className="text-gray-600" />
        <p className="text-sm">Start a sandbox to see the preview</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#21262d]">
        <button
          onClick={handleRefresh}
          className="p-1.5 hover:bg-[#21262d] rounded transition-colors text-gray-400 hover:text-gray-200 cursor-pointer"
        >
          <RefreshCw size={14} />
        </button>
        <div className="flex-1 bg-[#161b22] rounded px-3 py-1.5 text-xs text-gray-400 font-mono truncate border border-[#21262d]">
          {previewUrl}
        </div>
        <button
          onClick={handleOpenExternal}
          className="p-1.5 hover:bg-[#21262d] rounded transition-colors text-gray-400 hover:text-gray-200 cursor-pointer"
        >
          <ExternalLink size={14} />
        </button>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 bg-white">
        <iframe
          ref={iframeRef}
          key={refreshKey}
          src={previewUrl}
          title="Preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
