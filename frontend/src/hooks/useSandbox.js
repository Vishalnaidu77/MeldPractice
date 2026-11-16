import { useCallback, useState } from 'react'
import { listSandboxFiles, readSandboxFile, startSandbox as createSandbox } from '../services/sandboxService'

export function useSandbox() {
  const [sandbox, setSandbox] = useState(null)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [fileLoading, setFileLoading] = useState(false)

  const loadFiles = useCallback(async (target = sandbox) => {
    if (!target) return []
    try {
      const nextFiles = await listSandboxFiles(target.sandboxId)
      setFiles(nextFiles)
      return nextFiles
    } catch (cause) {
      setError(`Sandbox started, but files could not be loaded: ${cause.message}`)
      return []
    }
  }, [sandbox])

  const openFile = useCallback(async (path, target = sandbox) => {
    if (!target || !path) return
    setSelectedFile(path)
    setFileLoading(true)
    setFileContent('')
    try {
      setFileContent(await readSandboxFile(target.sandboxId, path))
    } catch (cause) {
      setFileContent(`// ${cause.message}`)
    } finally {
      setFileLoading(false)
    }
  }, [sandbox])

  const refreshFiles = useCallback(async (target = sandbox) => {
    const nextFiles = await loadFiles(target)
    if (selectedFile && nextFiles.includes(selectedFile)) await openFile(selectedFile, target)
    return nextFiles
  }, [loadFiles, openFile, sandbox, selectedFile])

  const start = useCallback(async () => {
    if (starting) return null
    setStarting(true)
    setError('')
    try {
      const created = await createSandbox()
      setSandbox(created)
      setFiles([])
      setSelectedFile('')
      setFileContent('')
      const nextFiles = await loadFiles(created)
      const firstFile = nextFiles.includes('src/App.jsx') ? 'src/App.jsx' : nextFiles[0]
      if (firstFile) await openFile(firstFile, created)
      return created
    } catch (cause) {
      setError(`${cause.message}. Check that the sandbox API is running and reachable.`)
      return null
    } finally {
      setStarting(false)
    }
  }, [loadFiles, openFile, starting])

  const clearError = useCallback(() => setError(''), [])

  return { sandbox, starting, error, files, selectedFile, fileContent, fileLoading, start, loadFiles, refreshFiles, openFile, clearError }
}
