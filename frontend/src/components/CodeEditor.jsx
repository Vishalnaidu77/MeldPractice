import { useMemo, useCallback } from 'react';
import { useSandboxStore } from '../stores/sandboxStore';
import { setState } from '../stores/sandboxStore';
import { updateFiles } from '../services/api';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { FileCode, Save } from 'lucide-react';

function getLanguageExtension(fileName) {
  if (!fileName) return [];
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return [javascript({ jsx: true })];
    case 'ts':
    case 'tsx':
      return [javascript({ jsx: true, typescript: true })];
    case 'css':
      return [css()];
    case 'html':
      return [html()];
    case 'json':
      return [json()];
    default:
      return [];
  }
}

export default function CodeEditor() {
  const activeFile = useSandboxStore((s) => s.activeFile);
  const activeFileContent = useSandboxStore((s) => s.activeFileContent);

  const extensions = useMemo(() => getLanguageExtension(activeFile), [activeFile]);

  const onChange = useCallback((value) => {
    setState({ activeFileContent: value });
  }, []);

  const handleSave = async () => {
    if (!activeFile) return;
    await updateFiles([{ path: activeFile, content: activeFileContent }]);
  };

  if (!activeFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] text-gray-500 gap-3">
        <FileCode size={48} className="text-gray-600" />
        <p className="text-sm">Select a file to edit</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* File tab bar */}
      <div className="flex items-center justify-between border-b border-[#21262d] px-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#161b22] border-b-2 border-purple-500 text-sm text-gray-200">
          <FileCode size={14} className="text-blue-400" />
          <span>{activeFile}</span>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors mr-2 cursor-pointer"
        >
          <Save size={12} />
          Save
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={activeFileContent}
          onChange={onChange}
          theme={oneDark}
          extensions={extensions}
          height="100%"
          style={{ height: '100%' }}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>
    </div>
  );
}
