import Icon from './Icon'
import TerminalPanel, { TerminalToggle } from './TerminalPanel'

function WorkspaceToolbar({ activeTab, onChangeTab, sandbox, selectedFile }) {
  return <div className="editor-toolbar">
    <div className="workspace-tabs">
      <button className={`workspace-tab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => onChangeTab('preview')}><Icon name="globe" size={15}/>Preview</button>
      <button className={`workspace-tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => onChangeTab('code')}><Icon name="code" size={15}/>Code</button>
      <button className={`workspace-tab ${activeTab === 'terminal' ? 'active' : ''}`} onClick={() => onChangeTab('terminal')}><Icon name="terminal" size={15}/>Terminal</button>
    </div>
    <div className="preview-tools">
      {activeTab === 'code' && <span className="current-file">{selectedFile || 'Select a file'}</span>}
      {activeTab === 'preview' && sandbox && <>
        <button className="icon-button" onClick={() => { const frame = document.querySelector('.preview-frame'); if (frame) frame.src = frame.src }} title="Refresh preview"><Icon name="refresh" size={15}/></button>
        <a className="icon-button" href={sandbox.url} target="_blank" rel="noreferrer" title="Open preview in new tab"><Icon name="external" size={15}/></a>
      </>}
    </div>
  </div>
}

function WelcomePanel({ onStart, starting }) {
  return <div className="welcome-panel">
    <div className="welcome-orbit orbit-one"/><div className="welcome-orbit orbit-two"/><div className="welcome-icon"><Icon name="spark" size={27}/></div>
    <div className="eyebrow"><span/>YOUR IDEA, IN MOTION</div><h1>A little space to<br/><em>make something</em></h1>
    <p>Spin up a sandbox, then build your idea with an AI agent that can work right alongside you.</p>
    <button className="welcome-cta" onClick={onStart} disabled={starting}>{starting ? <><span className="spinner dark"/>Preparing your space…</> : <><Icon name="plus" size={17}/>Create a sandbox</>}</button>
    <div className="welcome-note"><span className="note-shield">✳</span>Isolated environment <i/> Ready in seconds <i/> Yours to shape</div>
    <div className="welcome-decoration decoration-a">✳</div><div className="welcome-decoration decoration-b">✦</div>
  </div>
}

function PreviewPanel({ sandbox, onStart, starting }) {
  if (!sandbox) return <WelcomePanel onStart={onStart} starting={starting}/>
  return <div className="preview-area">
    <div className="browser-bar"><span className="browser-lights"><i/><i/><i/></span><span className="address-bar"><Icon name="globe" size={12}/>{sandbox.url}</span><span className="browser-lock">↗</span></div>
    <iframe className="preview-frame" src={sandbox.url} title="Sandbox preview"/>
  </div>
}

function CodePanel({ selectedFile, content, loading }) {
  if (!selectedFile) return <div className="code-empty"><Icon name="code" size={27}/><p>Select a file from the explorer to view its contents.</p></div>
  if (loading) return <div className="code-empty">Loading file…</div>
  return <div className="code-editor"><div className="line-numbers">{content.split('\n').map((_, index) => <span key={index}>{index + 1}</span>)}</div><pre>{content}</pre></div>
}

export default function WorkspacePanel({
  sandbox, starting, activeTab, onChangeTab, selectedFile, fileContent, fileLoading,
  terminalOpen, onToggleTerminal, onStart,
}) {
  const socketHost = sandbox ? `${sandbox.sandboxId}.agent.localhost` : ''
  return <section className="center-column">
    <WorkspaceToolbar activeTab={activeTab} onChangeTab={onChangeTab} sandbox={sandbox} selectedFile={selectedFile}/>
    <div className={`canvas ${terminalOpen ? 'with-terminal' : ''}`}>
      {activeTab === 'preview' && <PreviewPanel sandbox={sandbox} onStart={onStart} starting={starting}/>}
      {activeTab === 'code' && <div className="code-area"><CodePanel selectedFile={selectedFile} content={fileContent} loading={fileLoading}/></div>}
      {activeTab === 'terminal' && <div className="terminal-page"><TerminalPanel active={activeTab === 'terminal'} socketHost={socketHost}/></div>}
      {activeTab !== 'terminal' && terminalOpen && <div className="terminal-drawer"><TerminalPanel active={terminalOpen} socketHost={socketHost}/></div>}
    </div>
    {activeTab !== 'terminal' && <TerminalToggle expanded={terminalOpen} onToggle={onToggleTerminal}/>}
    <div className="bottom-bar"><span><span className={`bottom-dot ${sandbox ? 'green' : ''}`}/>{sandbox ? 'Sandbox connected' : 'Ready when you are'}</span><span className="bottom-right">{sandbox ? 'localhost' : 'Patchwork workspace'} <span>·</span> UTF-8</span></div>
  </section>
}
