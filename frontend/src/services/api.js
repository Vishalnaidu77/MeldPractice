import { getState, setState } from '../stores/sandboxStore';

const API_BASE = '';

// Create a new sandbox
export async function createSandbox() {
  setState({ isCreating: true });
  try {
    const res = await fetch(`${API_BASE}/api/sandbox/start`, { method: 'POST' });
    const data = await res.json();
    const sandboxId = data.sandboxId;
    const agentUrl = `http://${sandboxId}.agent.localhost`;
    const previewUrl = data.url;

    setState({
      sandboxId,
      agentUrl,
      previewUrl,
      isCreating: false,
      isConnected: true,
    });

    // Load files after creation
    await listFiles();
    return data;
  } catch (err) {
    console.error('Failed to create sandbox:', err);
    setState({ isCreating: false });
    throw err;
  }
}

// List all files in sandbox
export async function listFiles() {
  const { agentUrl } = getState();
  if (!agentUrl) return;

  try {
    const res = await fetch(`${agentUrl}/list-files`);
    const data = await res.json();
    setState({ files: data.files || [] });
    return data.files;
  } catch (err) {
    console.error('Failed to list files:', err);
  }
}

// Read a file's content
export async function readFile(filePath) {
  const { agentUrl } = getState();
  if (!agentUrl) return;

  try {
    const res = await fetch(`${agentUrl}/read-files?files=${encodeURIComponent(filePath)}`, {
      method: 'POST',
    });
    const data = await res.json();
    const results = data.results || [];
    const fileKey = Object.keys(results[0] || {})[0];
    const content = fileKey ? results[0][fileKey] : '';

    setState({
      activeFile: filePath,
      activeFileContent: content,
    });
    return content;
  } catch (err) {
    console.error('Failed to read file:', err);
  }
}

// Update files in sandbox
export async function updateFiles(files) {
  const { agentUrl } = getState();
  if (!agentUrl) return;

  try {
    const res = await fetch(`${agentUrl}/update-files`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to update files:', err);
  }
}

// Invoke AI agent via SSE
export async function invokeAI(message, onChunk) {
  const { sandboxId } = getState();
  if (!sandboxId) return;

  setState({ isAiResponding: true });

  // Add user message
  const currentMessages = getState().chatMessages;
  setState({
    chatMessages: [...currentMessages, { role: 'user', content: message }],
  });

  try {
    const res = await fetch(`${API_BASE}/api/ai/invoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, projectId: sandboxId }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let aiMessage = '';

    // Add placeholder AI message
    setState({
      chatMessages: [
        ...getState().chatMessages,
        { role: 'assistant', content: '' },
      ],
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // Parse SSE data
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          aiMessage += data + '\n';
          onChunk?.(data);

          // Update the last AI message
          const msgs = [...getState().chatMessages];
          msgs[msgs.length - 1] = { role: 'assistant', content: aiMessage.trim() };
          setState({ chatMessages: msgs });
        } else if (line.trim() && !line.startsWith(':')) {
          // Handle non-SSE formatted data
          aiMessage += line + '\n';
          onChunk?.(line);
          const msgs = [...getState().chatMessages];
          msgs[msgs.length - 1] = { role: 'assistant', content: aiMessage.trim() };
          setState({ chatMessages: msgs });
        }
      }
    }

    setState({ isAiResponding: false });

    // Refresh file list after AI changes
    await listFiles();
    // Re-read active file if there was one
    const { activeFile } = getState();
    if (activeFile) {
      await readFile(activeFile);
    }
  } catch (err) {
    console.error('Failed to invoke AI:', err);
    setState({ isAiResponding: false });
  }
}
