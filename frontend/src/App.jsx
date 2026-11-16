import { useEffect, useRef, useState } from 'react'
import ChatPanel from './components/ChatPanel'
import ErrorToast from './components/ErrorToast'
import FileExplorer from './components/FileExplorer'
import TopBar from './components/TopBar'
import WorkspacePanel from './components/WorkspacePanel'
import { useAgentChat } from './hooks/useAgentChat'
import { useSandbox } from './hooks/useSandbox'

export default function App() {
  const workspace = useSandbox()
  const chat = useAgentChat({ sandbox: workspace.sandbox, onFilesChanged: workspace.refreshFiles })
  const [activeTab, setActiveTab] = useState('preview')
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages, chat.events, chat.thinking])

  async function startSandbox() {
    const created = await workspace.start()
    if (!created) return
    chat.showSandboxWelcome()
    setActiveTab('preview')
    setTerminalOpen(false)
  }

  async function selectFile(path) {
    await workspace.openFile(path)
    setActiveTab('code')
  }

  function changeTab(tab) {
    setActiveTab(tab)
    if (tab === 'terminal') setTerminalOpen(true)
  }

  return <div className="app-shell">
    <TopBar sandbox={workspace.sandbox} starting={workspace.starting} onStart={startSandbox} onToggleChat={() => setChatOpen((open) => !open)} chatOpen={chatOpen}/>
    <main className="workspace">
      <FileExplorer
        sandbox={workspace.sandbox}
        files={workspace.files}
        selectedFile={workspace.selectedFile}
        onSelectFile={selectFile}
        onRefresh={() => workspace.refreshFiles()}
      />
      <WorkspacePanel
        sandbox={workspace.sandbox}
        starting={workspace.starting}
        activeTab={activeTab}
        onChangeTab={changeTab}
        selectedFile={workspace.selectedFile}
        fileContent={workspace.fileContent}
        fileLoading={workspace.fileLoading}
        terminalOpen={terminalOpen}
        onToggleTerminal={() => setTerminalOpen((open) => !open)}
        onStart={startSandbox}
      />
      <ChatPanel
        sandbox={workspace.sandbox}
        prompt={chat.prompt}
        setPrompt={chat.setPrompt}
        messages={chat.messages}
        thinking={chat.thinking}
        refreshingFiles={chat.refreshingFiles}
        events={chat.events}
        sendMessage={chat.sendMessage}
        clearMessages={chat.clearMessages}
        chatEndRef={chatEndRef}
        chatOpen={chatOpen}
      />
    </main>
    <ErrorToast message={workspace.error} onDismiss={workspace.clearError}/>
  </div>
}
