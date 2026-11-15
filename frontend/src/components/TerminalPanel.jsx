import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io } from 'socket.io-client';
import { useSandboxStore } from '../stores/sandboxStore';
import '@xterm/xterm/css/xterm.css';

export default function TerminalPanel() {
  const sandboxId = useSandboxStore((s) => s.sandboxId);
  const terminalRef = useRef(null);
  const termInstanceRef = useRef(null);
  const socketRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create terminal instance
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#c9d1d9',
        selectionBackground: '#264f78',
        black: '#0d1117',
        red: '#ff7b72',
        green: '#7ee787',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#76e3ea',
        white: '#c9d1d9',
        brightBlack: '#484f58',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#b3f0ff',
        brightWhite: '#f0f6fc',
      },
      scrollback: 1000,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      fitAddon.fit();
    }, 100);

    termInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln('\x1b[1;35m  ╔═══════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;35m  ║     🚀 Meld Sandbox Terminal          ║\x1b[0m');
    term.writeln('\x1b[1;35m  ╚═══════════════════════════════════════╝\x1b[0m');
    term.writeln('');

    if (!sandboxId) {
      term.writeln('\x1b[33m  ⚡ Create a sandbox to connect terminal.\x1b[0m');
      term.writeln('');
    }

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        // ignore fit errors during resize
      }
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  // Connect socket when sandboxId changes
  useEffect(() => {
    if (!sandboxId || !termInstanceRef.current) return;
    const term = termInstanceRef.current;

    term.writeln(`\x1b[32m  ✓ Connecting to sandbox: ${sandboxId.slice(0, 8)}...\x1b[0m`);

    const socketUrl = `http://${sandboxId}.agent.localhost`;
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      term.writeln('\x1b[32m  ✓ Connected to sandbox terminal.\x1b[0m');
      term.writeln('');
    });

    socket.on('terminal:output', (data) => {
      term.write(data);
    });

    socket.on('disconnect', () => {
      term.writeln('\r\n\x1b[31m  ✗ Disconnected from sandbox.\x1b[0m');
    });

    socket.on('connect_error', (err) => {
      term.writeln(`\r\n\x1b[31m  ✗ Connection error: ${err.message}\x1b[0m`);
    });

    // Send user input to the socket
    term.onData((data) => {
      socket.emit('terminal:input', data);
    });

    return () => {
      socket.disconnect();
    };
  }, [sandboxId]);

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      <div
        ref={terminalRef}
        className="flex-1 p-1"
        style={{ minHeight: 0 }}
      />
    </div>
  );
}
