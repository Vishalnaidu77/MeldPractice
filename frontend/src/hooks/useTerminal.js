import { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { connectTerminal } from '../services/terminalService'

export function useTerminal({ active, socketHost }) {
  const hostRef = useRef(null)
  const termRef = useRef(null)
  const [connection, setConnection] = useState(socketHost ? 'connecting' : 'offline')

  useEffect(() => {
    if (!hostRef.current) return undefined

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
      theme: {
        background: '#101211', foreground: '#d4d9d5', cursor: '#c5f36b',
        selectionBackground: '#384232', black: '#101211', green: '#b9e77b',
        yellow: '#e3c985', blue: '#8da9f4', cyan: '#8ecac0',
      },
    })
    const fit = new FitAddon()
    terminal.loadAddon(fit)
    terminal.open(hostRef.current)
    terminal.writeln('\x1b[1;32mSandbox terminal\x1b[0m')

    let terminalConnection
    if (socketHost) {
      setConnection('connecting')
      terminalConnection = connectTerminal(socketHost, {
        onConnect: () => {
          setConnection('connected')
          terminal.writeln('\x1b[90mConnected to sandbox.\x1b[0m\r\n')
        },
        onDisconnect: () => setConnection('disconnected'),
        onOutput: (data) => terminal.write(data),
      })
      terminal.onData(terminalConnection.sendInput)
    } else {
      setConnection('offline')
      terminal.writeln('\x1b[90mStart a sandbox to connect to its terminal.\x1b[0m')
    }

    termRef.current = { terminal, fit }
    return () => {
      terminalConnection?.disconnect()
      terminal.dispose()
      termRef.current = null
    }
  }, [socketHost])

  useEffect(() => {
    if (active && termRef.current) setTimeout(() => termRef.current?.fit.fit(), 30)
  }, [active])

  return { hostRef, connection }
}
