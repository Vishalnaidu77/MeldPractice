import { useState } from 'react'
import { invokeAgent } from '../services/agentService'

export function useAgentChat({ sandbox, onFilesChanged }) {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [thinking, setThinking] = useState(false)
  const [refreshingFiles, setRefreshingFiles] = useState(false)
  const [events, setEvents] = useState([])

  async function sendMessage(event) {
    event?.preventDefault()
    const message = prompt.trim()
    if (!message || !sandbox || thinking) return

    setPrompt('')
    setMessages((current) => [...current, { role: 'user', content: message }])
    setEvents([])
    setThinking(true)

    try {
      const received = await invokeAgent(
        message,
        sandbox.sandboxId,
        (activity) => setEvents((current) => [...current, activity]),
        () => { setThinking(false); setRefreshingFiles(true) },
      )
      setMessages((current) => [...current, {
        role: 'assistant',
        content: received.at(-1)?.includes('updated successfully')
          ? 'Done. I’ve updated your project files. Refresh the preview to see the changes.'
          : 'I finished working on your request. You can inspect the updates in your files or preview.',
      }])
      await onFilesChanged?.()
    } catch (cause) {
      setMessages((current) => [...current, {
        role: 'assistant',
        content: `I couldn’t reach the agent: ${cause.message}. Check that the AI service is running.`,
      }])
    } finally {
      setThinking(false)
      setRefreshingFiles(false)
    }
  }

  function clearMessages() {
    setMessages([])
    setEvents([])
  }

  function showSandboxWelcome() {
    setMessages([{ role: 'assistant', content: 'Your sandbox is ready. Tell me what you’d like to build or change, and I’ll take it from here.' }])
  }

  return { prompt, setPrompt, messages, thinking, refreshingFiles, events, sendMessage, clearMessages, showSandboxWelcome }
}
