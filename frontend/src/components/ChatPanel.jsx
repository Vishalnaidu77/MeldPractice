import { useState, useRef, useEffect } from 'react';
import { useSandboxStore } from '../stores/sandboxStore';
import { invokeAI } from '../services/api';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export default function ChatPanel() {
  const chatMessages = useSandboxStore((s) => s.chatMessages);
  const isAiResponding = useSandboxStore((s) => s.isAiResponding);
  const sandboxId = useSandboxStore((s) => s.sandboxId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isAiResponding || !sandboxId) return;
    const message = input.trim();
    setInput('');
    await invokeAI(message);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#21262d]">
        <Bot size={18} className="text-purple-400" />
        <span className="text-sm font-medium text-gray-200">AI Agent</span>
        {isAiResponding && (
          <Loader2 size={14} className="animate-spin text-purple-400 ml-auto" />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
            <Bot size={48} className="text-gray-600" />
            <p className="text-sm">Ask the AI agent to make changes to your code</p>
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={14} className="text-purple-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#161b22] text-gray-300 border border-[#21262d]'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans m-0">{msg.content}</pre>
              {msg.role === 'assistant' && !msg.content && isAiResponding && (
                <div className="flex gap-1 py-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={14} className="text-blue-400" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#21262d]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={sandboxId ? "Ask AI to make changes..." : "Create a sandbox first..."}
            disabled={!sandboxId || isAiResponding}
            rows={1}
            className="flex-1 bg-[#161b22] text-gray-200 text-sm rounded-lg px-4 py-2.5 border border-[#21262d] focus:border-purple-500 focus:outline-none resize-none placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isAiResponding || !sandboxId}
            className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
