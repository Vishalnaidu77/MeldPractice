import Icon from './Icon'

export default function TopBar({ sandbox, starting, onStart, onToggleChat, chatOpen }) {
  return <header className="topbar">
    <a className="brand" href="#" aria-label="Patchwork home"><span className="brand-mark"><Icon name="spark" size={19}/></span><span>patchwork</span><span className="brand-beta">BETA</span></a>
    <div className="project-title"><span className="project-badge"><Icon name="code" size={15}/></span><span>{sandbox ? 'Untitled project' : 'New project'}</span><Icon name="chevron" size={14}/></div>
    <div className="top-actions">
      <span className={`sandbox-status ${sandbox ? 'is-live' : ''}`}><span className="status-light"/>{sandbox ? 'Sandbox running' : 'No sandbox'}</span>
      <button className="chat-open-button" onClick={onToggleChat} aria-expanded={chatOpen}><Icon name="message" size={15}/>Agent</button>
      <button className="start-button" onClick={onStart} disabled={starting}>{starting ? <span className="spinner"/> : <Icon name="plus" size={16}/>}<span>{starting ? 'Starting…' : sandbox ? 'New sandbox' : 'Start sandbox'}</span></button>
      <button className="avatar" aria-label="Account">A</button>
    </div>
  </header>
}
