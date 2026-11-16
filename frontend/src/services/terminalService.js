import { io } from 'socket.io-client'

export function connectTerminal(sandboxHost, handlers = {}) {
  const socket = io(`${window.location.protocol}//${sandboxHost}`)
  socket.on('connect', handlers.onConnect)
  socket.on('disconnect', handlers.onDisconnect)
  socket.on('connect_error', handlers.onDisconnect)
  socket.on('terminal-output', handlers.onOutput)
  return {
    sendInput: (input) => socket.emit('terminal-input', input),
    disconnect: () => socket.disconnect(),
  }
}
