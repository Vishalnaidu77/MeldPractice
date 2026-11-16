import '@xterm/xterm/css/xterm.css'
import { useTerminal } from '../hooks/useTerminal'
import Icon from './Icon'

export default function TerminalPanel({ active, socketHost }) {
  const { hostRef, connection } = useTerminal({ active, socketHost })
  return <div className="terminal-wrap">
    <div className="terminal-head"><div className="terminal-label"><span className="terminal-dot"/>Terminal <span className="terminal-sub">{socketHost || 'sandbox not started'}</span></div><span className="terminal-ready">{connection}</span></div>
    <div className="terminal-screen" ref={hostRef}/>
  </div>
}

export function TerminalToggle({ expanded, onToggle }) {
  return <button className={expanded ? 'terminal-collapse' : 'terminal-toggle'} onClick={onToggle}>
    {!expanded && <><Icon name="terminal" size={15}/>Terminal</>}
    {expanded ? <>Hide terminal <span>⌄</span></> : <span>⌄</span>}
  </button>
}
