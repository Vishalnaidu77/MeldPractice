import { useState, useMemo } from 'react';
import { useSandboxStore } from '../stores/sandboxStore';
import { readFile } from '../services/api';
import {
  ChevronRight,
  ChevronDown,
  File,
  FolderOpen,
  Folder,
  FileCode,
  FileJson,
  FileText,
  Image,
} from 'lucide-react';

const FILE_ICONS = {
  jsx: FileCode,
  js: FileCode,
  ts: FileCode,
  tsx: FileCode,
  css: FileCode,
  html: FileCode,
  json: FileJson,
  md: FileText,
  txt: FileText,
  svg: Image,
  png: Image,
  jpg: Image,
  gif: Image,
};

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  return FILE_ICONS[ext] || File;
}

function getFileColor(name) {
  const ext = name.split('.').pop().toLowerCase();
  const colors = {
    jsx: 'text-blue-400',
    js: 'text-yellow-400',
    ts: 'text-blue-400',
    tsx: 'text-blue-400',
    css: 'text-purple-400',
    html: 'text-orange-400',
    json: 'text-yellow-300',
    md: 'text-gray-400',
    svg: 'text-green-400',
    png: 'text-green-400',
  };
  return colors[ext] || 'text-gray-400';
}

// Build a tree structure from flat file paths
function buildFileTree(files) {
  const root = {};
  for (const filePath of files) {
    const parts = filePath.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = { __isFile: true, __path: filePath };
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    }
  }
  return root;
}

function TreeNode({ name, node, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const activeFile = useSandboxStore((s) => s.activeFile);

  if (node.__isFile) {
    const Icon = getFileIcon(name);
    const isActive = activeFile === node.__path;
    return (
      <button
        onClick={() => readFile(node.__path)}
        className={`w-full flex items-center gap-2 py-1 px-2 text-sm hover:bg-[#1c2128] rounded cursor-pointer transition-colors ${
          isActive ? 'bg-[#1c2128] text-white' : 'text-gray-400'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <Icon size={14} className={getFileColor(name)} />
        <span className="truncate">{name}</span>
      </button>
    );
  }

  const entries = Object.entries(node).sort(([, a], [, b]) => {
    const aIsFile = a.__isFile;
    const bIsFile = b.__isFile;
    if (aIsFile === bIsFile) return 0;
    return aIsFile ? 1 : -1;
  });

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-1.5 py-1 px-2 text-sm text-gray-300 hover:bg-[#1c2128] rounded cursor-pointer transition-colors"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {isOpen ? (
          <FolderOpen size={14} className="text-blue-400" />
        ) : (
          <Folder size={14} className="text-blue-400" />
        )}
        <span>{name}</span>
      </button>
      {isOpen && (
        <div>
          {entries.map(([key, val]) => (
            <TreeNode key={key} name={key} node={val} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer() {
  const files = useSandboxStore((s) => s.files);

  const tree = useMemo(() => buildFileTree(files), [files]);
  const entries = Object.entries(tree).sort(([, a], [, b]) => {
    const aIsFile = a.__isFile;
    const bIsFile = b.__isFile;
    if (aIsFile === bIsFile) return 0;
    return aIsFile ? 1 : -1;
  });

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      <div className="px-4 py-3 border-b border-[#21262d]">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Explorer
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
            No sandbox active
          </div>
        ) : (
          entries.map(([key, val]) => (
            <TreeNode key={key} name={key} node={val} depth={0} />
          ))
        )}
      </div>
    </div>
  );
}
