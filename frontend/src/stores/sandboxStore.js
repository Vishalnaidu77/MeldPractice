// Simple state management for sandbox
let state = {
  sandboxId: null,
  agentUrl: null,
  previewUrl: null,
  files: [],
  activeFile: null,
  activeFileContent: '',
  isConnected: false,
  isCreating: false,
  chatMessages: [],
  isAiResponding: false,
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(partial) {
  state = { ...state, ...partial };
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// React hook
import { useSyncExternalStore, useCallback } from 'react';

export function useSandboxStore(selector) {
  const getSnapshot = useCallback(() => selector(getState()), [selector]);
  return useSyncExternalStore(subscribe, getSnapshot);
}
