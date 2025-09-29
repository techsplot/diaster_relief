import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { useDisaster } from '../context/DisasterContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Simple message shape
type ChatMsg = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  ts: string; // ISO string
};

const STORAGE_KEY = 'ai.assistant.chat.v2';

const AIAssistant: React.FC = () => {
  const { activeDisaster, disasters, volunteers, setActiveDisaster, updateDisasterResources } = useDisaster();
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;

  const [messages, setMessages] = useState<ChatMsg[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [
          {
            id: uuidv4(),
            role: 'assistant',
            text: "Hi! I'm your AI Assistant. Ask me about resources, volunteers, or say things like: 'Set water to 100' or 'Set all resources to 50'.",
            ts: new Date().toISOString(),
          },
        ];
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Validate basic shape
        return parsed.filter((m) => m && m.id && m.role && typeof m.text === 'string');
      }
    } catch (e) {
      console.warn('Resetting corrupt chat history', e);
    }
    return [
      {
        id: uuidv4(),
        role: 'assistant',
        text: "Hi! I'm your AI Assistant. Ask me about resources, volunteers, or say things like: 'Set water to 100' or 'Set all resources to 50'.",
        ts: new Date().toISOString(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    // Auto-scroll to bottom on new message
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const userName = useMemo(() => 'You', []);
  const botName = useMemo(() => 'AI Assistant', []);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: uuidv4(), role: 'assistant', text, ts: new Date().toISOString() },
    ]);
  };

  // Build rich context + instruction prompt
  const buildPrompt = (userText: string) => {
    const resourcesDetails = activeDisaster?.resources?.map((r) => `${r.name}: ${r.quantity}`).join(', ') || 'None';
    return `You are a helpful AI assistant for a disaster relief dashboard.
- When asked to update a single resource, respond ONLY with:
[ACTION] UPDATE_RESOURCE(resourceName: "resource name", newQuantity: number)
- When asked to update all resources to the same quantity, respond ONLY with:
[ACTION] UPDATE_ALL_RESOURCES(newQuantity: number)
Otherwise, answer normally.

Active Disaster: ${activeDisaster?.name || activeDisaster?.type || 'None'}
Resources: ${resourcesDetails}
Volunteers: ${volunteers.length}

User: ${userText}`;
  };

  // Execute model-suggested action
  const maybeExecuteAction = (text: string): string | null => {
    if (!activeDisaster) return null;
    const single = text.match(/UPDATE_RESOURCE\(resourceName:\s*"([^\"]+)",\s*newQuantity:\s*(\d+)\)/);
    const bulk = text.match(/UPDATE_ALL_RESOURCES\(newQuantity:\s*(\d+)\)/);
    if (single) {
      const [, resourceName, qtyStr] = single;
      const qty = parseInt(qtyStr, 10);
      if (isNaN(qty)) return null;
      const updated = (activeDisaster.resources || []).map((r) =>
        r.name.toLowerCase() === resourceName.toLowerCase() ? { ...r, quantity: qty, stock: qty } : r
      );
      updateDisasterResources(activeDisaster.id, updated);
      return `Updated ${resourceName} to ${qty} for ${activeDisaster.name || activeDisaster.type}.`;
    }
    if (bulk) {
      const [, qtyStr] = bulk;
      const qty = parseInt(qtyStr, 10);
      if (isNaN(qty)) return null;
      const updated = (activeDisaster.resources || []).map((r) => ({ ...r, quantity: qty, stock: qty }));
      updateDisasterResources(activeDisaster.id, updated);
      return `Updated all resources to ${qty} for ${activeDisaster.name || activeDisaster.type}.`;
    }
    return null;
  };

  // Client-side fallback for natural language updates
  const fallbackDirectIntent = (text: string): string | null => {
    if (!activeDisaster) return null;
    const allMatch = text.match(/(?:set|update)\s+(?:all|every)\s+resources\s+(?:to|at)\s+(\d+)/i);
    const singleMatch = text.match(/(?:set|update)\s+([a-zA-Z][\w\s-]+?)\s+(?:to|at)\s+(\d+)/i);
    if (allMatch) {
      const qty = parseInt(allMatch[1], 10);
      if (isNaN(qty)) return null;
      const updated = (activeDisaster.resources || []).map((r) => ({ ...r, quantity: qty, stock: qty }));
      updateDisasterResources(activeDisaster.id, updated);
      return `Updated all resources to ${qty} for ${activeDisaster.name || activeDisaster.type}.`;
    }
    if (singleMatch) {
      const resourceName = singleMatch[1].trim();
      const qty = parseInt(singleMatch[2], 10);
      if (isNaN(qty)) return null;
      const updated = (activeDisaster.resources || []).map((r) =>
        r.name.toLowerCase() === resourceName.toLowerCase() ? { ...r, quantity: qty, stock: qty } : r
      );
      updateDisasterResources(activeDisaster.id, updated);
      return `Updated ${resourceName} to ${qty} for ${activeDisaster.name || activeDisaster.type}.`;
    }
    return null;
  };

  // Call Gemini with preferred model and fallbacks
  const callGemini = async (userText: string): Promise<{ text: string; usedModel: string }> => {
    if (!apiKey) throw new Error('Missing VITE_GEMINI_API_KEY');
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-pro'];
    const prompt = buildPrompt(userText);

    let lastErr: any = null;
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const res = await model.generateContent(prompt);
        const txt = res.response.text();
        return { text: txt, usedModel: m };
      } catch (err: any) {
        lastErr = err;
        // Try next model
        continue;
      }
    }
    throw lastErr || new Error('All models failed');
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    // Push user message
    setMessages((prev) => [...prev, { id: uuidv4(), role: 'user', text, ts: new Date().toISOString() }]);
    setInput('');

    // If no active disaster yet, guide the user
    if (!activeDisaster) {
      addBotMessage('Please create/select a disaster in Disaster Setup first, then ask me to manage resources.');
      return;
    }

    // Try direct intent first
    const direct = fallbackDirectIntent(text);
    if (direct) {
      addBotMessage(direct);
      return;
    }

    // Call Gemini
    try {
      const { text: aiText, usedModel } = await callGemini(text);
      // Try to execute actions from model
      const acted = maybeExecuteAction(aiText);
      if (acted) {
        addBotMessage(acted);
      } else {
        addBotMessage(aiText);
      }
    } catch (err: any) {
      console.error('Gemini error:', err);
      addBotMessage('Sorry, I could not reach the AI right now. Please check your API key and try again.');
    }
  };

  return (
    <div style={{ maxWidth: 920, margin: '16px auto', padding: '8px' }}>
      <h2 style={{ margin: '8px 0' }}>AI Assistant</h2>

      {/* Disaster selector */}
      <div style={{ margin: '8px 0' }}>
        <label>Active disaster: </label>
        <select
          value={activeDisaster?.id || ''}
          onChange={(e) => setActiveDisaster(e.target.value)}
        >
          {disasters.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name || d.type}
            </option>
          ))}
        </select>
      </div>

      {/* Messages list */}
      <div
        ref={listRef}
        style={{
          border: '1px solid #ddd',
          borderRadius: 6,
          height: 420,
          overflowY: 'auto',
          padding: 12,
          background: '#fff',
          color: '#111',
        }}
      >
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600 }}>
              {m.role === 'user' ? userName : botName}
              <span style={{ fontWeight: 400, marginLeft: 8, color: '#6b7280' }}>
                {new Date(m.ts).toLocaleTimeString()}
              </span>
            </div>
            <div>
              {m.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
              ) : (
                <span>{m.text}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about resources or request updates (e.g., Set all resources to 100)"
          style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #d1d5db' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#2563eb', color: '#fff' }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
