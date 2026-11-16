const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

function getAgentUrl(sandboxId) {
  return `http://${sandboxId}.agent.localhost`
}

export async function startSandbox() {
  const response = await fetch(`${API_BASE}/sandbox/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })

  if (!response.ok) throw new Error(`Sandbox start failed (${response.status})`)
  return response.json()
}

export async function listSandboxFiles(sandboxId) {
  const response = await fetch(`${getAgentUrl(sandboxId)}/list-files`)
  if (!response.ok) throw new Error(`File listing failed (${response.status})`)
  const data = await response.json()
  return data.files || []
}

export async function readSandboxFile(sandboxId, path) {
  const response = await fetch(`${getAgentUrl(sandboxId)}/read-files?files=${encodeURIComponent(path)}`, { method: 'POST' })
  if (!response.ok) throw new Error(`Could not read ${path} (${response.status})`)
  const data = await response.json()
  const result = data.results?.[0] || {}
  return result[`/${path}`] ?? result[path] ?? Object.values(result)[0] ?? ''
}
