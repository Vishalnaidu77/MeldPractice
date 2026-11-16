const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export async function invokeAgent(message, projectId, onEvent, onComplete) {
  const response = await fetch(`${API_BASE}/ai/invoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ message, projectId }),
  })

  if (!response.ok || !response.body) throw new Error(`Agent request failed (${response.status})`)

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let completed = false
  const events = []

  function markComplete() {
    if (completed) return
    completed = true
    onComplete?.()
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      markComplete()
      break
    }
    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() || ''

    for (const chunk of chunks) {
      const eventName = chunk.split('\n').find((line) => line.startsWith('event:'))?.slice(6).trim()
      const raw = chunk.split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('\n')
      if (!raw) continue

      if (eventName === 'complete' || raw === '[DONE]') {
        markComplete()
        continue
      }
      if (eventName === 'error') {
        let data
        try { data = JSON.parse(raw) } catch { data = { error: raw } }
        throw new Error(data.error || 'The agent stream failed')
      }

      let item
      try { item = JSON.parse(raw) } catch { item = raw }
      const event = String(typeof item === 'string' ? item : item.message || item.content || item.data || JSON.stringify(item))
      events.push(event)
      onEvent?.(event)
    }
  }

  return events
}
