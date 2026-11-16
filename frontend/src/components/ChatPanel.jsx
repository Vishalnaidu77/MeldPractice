import Icon from './Icon'

const suggestions = [
  'Build a landing page for my idea',
  'Make the design feel more polished',
  'Add a dark mode toggle',
]

function ChatIntro({ onChooseSuggestion }) {
  return <div className="chat-intro">
    <div className="intro-orb"><Icon name="spark" size={19}/></div>
    <h2>Let’s make it<br/><em>happen.</em></h2>
    <p>Describe what you have in mind. I can create, edit, and improve your project.</p>
    <div className="suggestions"><span>TRY ASKING</span>{suggestions.map((suggestion) => <button key={suggestion} onClick={() => onChooseSuggestion(suggestion)}>{suggestion}<Icon name="chevron" size={14}/></button>)}</div>
  </div>
}

function ChatMessage({ message }) {
  const assistant = message.role === 'assistant'
  return <div className={`message ${message.role}`}>
    <div className="message-avatar">{assistant ? <Icon name="spark" size={13}/> : 'A'}</div>
    <div className="message-content"><span className="message-author">{assistant ? 'Build agent' : 'You'}</span><p>{message.content}</p></div>
  </div>
}

function AgentActivity({ events }) {
  if (!events.length) return null
  return <div className="activity-card">
    <div className="activity-title"><span className="activity-pulse"/>Agent activity <span className="activity-count">{events.length}</span></div>
    {events.slice(-4).map((event, index) => <div className="activity-event" key={`${index}-${event}`}><span>↳</span>{event}</div>)}
  </div>
}

function ChatComposer({ sandbox, prompt, setPrompt, thinking, onSubmit }) {
  return <form className="composer" onSubmit={onSubmit}>
    <div className="composer-box">
      <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={sandbox ? 'Tell the agent what to build…' : 'Start a sandbox to begin chatting…'} disabled={!sandbox || thinking} rows={2} onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); onSubmit(event) }
      }}/>
      <div className="composer-controls"><span><kbd>↵</kbd> to send <span className="composer-sep">·</span> <kbd>⇧ ↵</kbd> new line</span><button className="send-button" type="submit" disabled={!sandbox || !prompt.trim() || thinking} aria-label="Send message"><Icon name="send" size={15}/></button></div>
    </div>
    <div className="composer-foot"><span><span className="sparkle-mini">✳</span> Agent can make changes to your files</span><span>⌘ K</span></div>
  </form>
}

export default function ChatPanel({
  sandbox, prompt, setPrompt, messages, thinking, refreshingFiles, events, sendMessage,
  clearMessages, chatEndRef, chatOpen,
}) {
  return <aside className={`chat-sidebar ${chatOpen ? 'mobile-open' : ''}`}>
    <div className="chat-header">
      <div className="agent-identity"><span className="agent-avatar"><Icon name="spark" size={17}/></span><div><strong>Build agent</strong><small><span className={thinking || refreshingFiles ? 'pulse-dot' : ''}/>{thinking ? 'Working on it' : refreshingFiles ? 'Syncing files' : 'Here to help you build'}</small></div></div>
      <button className="icon-button subtle" title="New chat" onClick={clearMessages}><Icon name="plus" size={17}/></button>
    </div>
    <div className="chat-messages">
      {messages.length === 0 && <ChatIntro onChooseSuggestion={setPrompt}/>}
      {messages.map((message, index) => <ChatMessage key={`${message.role}-${index}`} message={message}/>)}
      <AgentActivity events={events}/>
      {thinking && <div className="thinking-row"><span className="thinking-avatar"><Icon name="spark" size={13}/></span><span className="typing"><i/><i/><i/></span><span>Thinking through it</span></div>}
      <div ref={chatEndRef}/>
    </div>
    <ChatComposer sandbox={sandbox} prompt={prompt} setPrompt={setPrompt} thinking={thinking} onSubmit={sendMessage}/>
  </aside>
}
