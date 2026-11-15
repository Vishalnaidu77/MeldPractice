import { useState, useCallback } from 'react';
import { useSandboxStore } from './stores/sandboxStore';
import { createSandbox } from './services/api';
import { useResizable } from './hooks/useResizable';
import ChatPanel from './components/ChatPanel';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import PreviewPanel from './components/PreviewPanel';
import TerminalPanel from './components/TerminalPanel';
import {
  Play,
  Loader2,
  Code2,
  Eye,
  Terminal,
  MessageSquare,
  FolderTree,
  Zap,
} from 'lucide-react';

function ResizeHandle({ direction = 'horizontal', onMouseDown }) {
  const isHorizontal = direction === 'horizontal';
  return (
    <div
      onMouseDown={onMouseDown}
      className={`${
        isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
      } bg-[#21262d] hover:bg-purple-500 transition-colors flex-shrink-0 relative group`}
    >
      <div
        className={`absolute ${
          isHorizontal ? 'inset-y-0 -inset-x-1' : 'inset-x-0 -inset-y-1'
        }`}
      />
    </div>
  );
}

function App() {
  const sandboxId = useSandboxStore((s) => s.sandboxId);
  const isCreating = useSandboxStore((s) => s.isCreating);
  const [rightTab, setRightTab] = useState('code');
  const [showTerminal, setShowTerminal] = useState(true);

  const chatResize = useResizable({
    direction: 'horizontal',
    initialSize: 320,
    minSize: 220,
    maxSize: 500,
  });

  const explorerResize = useResizable({
    direction: 'horizontal',
    initialSize: 220,
    minSize: 150,
    maxSize: 400,
  });

  const terminalResize = useResizable({
    direction: 'vertical',
    initialSize: 220,
    minSize: 100,
    maxSize: 500,
  });

  const handleCreateSandbox = useCallback(async () => {
    try {
      await createSandbox();
    } catch (err) {
      alert('Failed to create sandbox. Make sure the backend is running.');
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#010409] text-gray-200 overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 h-12 bg-[#0d1117] border-b border-[#21262d] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-purple-400" />
            <span className="font-bold text-base tracking-tight">Meld</span>
          </div>
          {sandboxId && (
            <div className="flex items-center gap-1.5 ml-4 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-mono">
                {sandboxId.slice(0, 8)}...
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!sandboxId && (
            <button
              onClick={handleCreateSandbox}
              disabled={isCreating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white text-sm font-medium rounded-lg transition-all cursor-pointer disabled:cursor-wait shadow-lg shadow-purple-500/20"
            >
              {isCreating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Create Sandbox
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Activity Bar */}
        <div className="w-12 bg-[#010409] border-r border-[#21262d] flex flex-col items-center py-3 gap-2 flex-shrink-0">
          <button
            title="Chat"
            className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 cursor-pointer"
          >
            <MessageSquare size={18} />
          </button>
          <button
            title="Files"
            className="p-2.5 rounded-lg hover:bg-[#21262d] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            <FolderTree size={18} />
          </button>
        </div>

        {/* Chat Panel */}
        <div className="flex-shrink-0" style={{ width: chatResize.size }}>
          <ChatPanel />
        </div>

        <ResizeHandle direction="horizontal" onMouseDown={chatResize.onMouseDown} />

        {/* File Explorer */}
        <div className="flex-shrink-0" style={{ width: explorerResize.size }}>
          <FileExplorer />
        </div>

        <ResizeHandle direction="horizontal" onMouseDown={explorerResize.onMouseDown} />

        {/* Right: Code/Preview + Terminal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab bar */}
          <div className="flex items-center border-b border-[#21262d] bg-[#0d1117] flex-shrink-0">
            <button
              onClick={() => setRightTab('code')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                rightTab === 'code'
                  ? 'text-white border-purple-500 bg-[#161b22]'
                  : 'text-gray-500 hover:text-gray-300 border-transparent'
              }`}
            >
              <Code2 size={15} />
              Code
            </button>
            <button
              onClick={() => setRightTab('preview')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                rightTab === 'preview'
                  ? 'text-white border-purple-500 bg-[#161b22]'
                  : 'text-gray-500 hover:text-gray-300 border-transparent'
              }`}
            >
              <Eye size={15} />
              Preview
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setShowTerminal(!showTerminal)}
              className={`flex items-center gap-1.5 px-3 py-1.5 mr-2 text-xs rounded transition-colors cursor-pointer ${
                showTerminal
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#21262d]'
              }`}
            >
              <Terminal size={13} />
              Terminal
            </button>
          </div>

          {/* Editor / Preview area */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div
              className="min-h-0 overflow-hidden"
              style={{ flex: showTerminal ? `1 1 0` : '1 1 auto', height: showTerminal ? `calc(100% - ${terminalResize.size}px - 4px)` : '100%' }}
            >
              {rightTab === 'code' ? <CodeEditor /> : <PreviewPanel />}
            </div>

            {showTerminal && (
              <>
                <ResizeHandle
                  direction="vertical"
                  onMouseDown={terminalResize.onMouseDown}
                />
                <div
                  className="flex-shrink-0 overflow-hidden"
                  style={{ height: terminalResize.size }}
                >
                  <TerminalPanel />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
