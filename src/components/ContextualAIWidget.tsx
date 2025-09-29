import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Chat } from '@progress/kendo-react-conversational-ui';
import type { Message, User, ChatSendMessageEvent } from '@progress/kendo-react-conversational-ui';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 7. Use TypeScript interfaces for messages and resources.
interface Resource {
  id: string;
  name: string;
  category: string;
  stock: number;
}

interface ContextualAIWidgetProps {
  disasterType: string;
  resources: Resource[];
}

// 6. Style the widget as a floating bubble button
const fabStyle: React.CSSProperties = {
  position: 'fixed',
  right: 20,
  bottom: 20,
  width: 56,
  height: 56,
  borderRadius: 28,
  background: '#007bff',
  color: 'white',
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  cursor: 'pointer',
  fontSize: 24,
  zIndex: 1050,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  right: 20,
  bottom: 85,
  width: 380,
  maxWidth: '90vw',
  height: 520,
  maxHeight: '80vh',
  background: 'white',
  border: '1px solid #ccc',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  zIndex: 1050,
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  position: 'relative',
  padding: '12px',
  borderBottom: '1px solid #eee',
  background: '#f7f7f7',
  fontWeight: 'bold',
  flexShrink: 0,
};

const ContextualAIWidget: React.FC<ContextualAIWidgetProps> = ({ disasterType, resources }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const user: User = useMemo(() => ({ id: 'user' }), []);
  const bot: User = useMemo(() => ({ id: 'bot', name: 'AI Assistant' }), []);
  const messageId = useRef(0);

  const [messages, setMessages] = useState<Message[]>([]);

  // 5. Start with a greeting from the AI.
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: messageId.current++,
        author: bot,
        text: 'Hello! How can I assist you with the disaster relief operations today?',
        timestamp: new Date(),
      }]);
    }
  }, [bot, messages.length]);

  // 2. Read the API key from import.meta.env.VITE_GEMINI_API_KEY
  const apiKey = useMemo(() => {
    const key = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
    console.log('Gemini API Key:', key);
    return key;
  }, []);

  const callGeminiAPI = useCallback(async (userMessage: string): Promise<string> => {
    if (!apiKey) {
      return "Error: VITE_GEMINI_API_KEY is not configured.";
    }

    // 4. Prepend the context to the prompt
    const contextPrompt = `You are an assistant helping manage a disaster relief operation.
Disaster type: ${disasterType}
Available resources: ${JSON.stringify(resources, null, 2)}
User question: ${userMessage}`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(contextPrompt);
      return result.response.text();
    } catch (error) {
      console.error("Gemini API call failed:", error);
      // 5. Handle API errors gracefully.
      return "Sorry, I encountered an error while processing your request. Please check the console for details.";
    }
  }, [apiKey, disasterType, resources]);

  const handleMessageSend = useCallback(async (event: ChatSendMessageEvent) => {
    if (!event.message.text) {
        return;
    }
    const userMessage: Message = {
      id: messageId.current++,
      author: user,
      text: event.message.text,
      timestamp: new Date(),
    };

    // 5. Show user + AI messages.
    setMessages(prev => [...prev, userMessage]);

    const thinkingMessage: Message = {
      id: messageId.current++,
      author: bot,
      typing: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, thinkingMessage]);

    const aiResponseText = await callGeminiAPI(event.message.text);

    const aiResponseMessage: Message = {
      id: thinkingMessage.id, // Use the same ID to replace the "thinking" message
      author: bot,
      text: aiResponseText,
      timestamp: new Date(),
    };

    // 5. Replace "Thinking..." with the actual AI response.
    setMessages(prev => prev.map(m => m.id === thinkingMessage.id ? aiResponseMessage : m));

  }, [user, bot, callGeminiAPI]);

  return (
    <>
      {/* 1. The assistant should appear as a floating widget */}
      {isOpen && (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <div style={{ fontWeight: 600 }}>AI Assistant</div>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ 
                border: 'none', 
                background: 'transparent', 
                cursor: 'pointer', 
                fontSize: 18,
                position: 'absolute',
                right: '12px',
                top: '12px'
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ 
            flex: 1, 
            minHeight: 0, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '8px'
          }}>
            {React.createElement(Chat as any, {
              messages,
              user,
              onMessageSend: handleMessageSend,
              placeholder: "Ask about resources, volunteers, etc.",
              width: '100%',
              height: '100%'
            })}
          </div>
        </div>
      )}
      <button style={fabStyle} onClick={() => setIsOpen(o => !o)} aria-label="Toggle AI Assistant">
        {isOpen ? '✕' : '🤖'}
      </button>
    </>
  );
};

export default ContextualAIWidget;