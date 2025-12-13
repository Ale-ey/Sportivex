import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { MessageCircle, Users, Loader2 } from "lucide-react";
import { useGemini } from "../../../hooks/useGemini";

// Simple markdown parser for basic formatting
const parseMarkdown = (text: string): React.ReactNode => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const processLine = (line: string, index: number) => {
    // Check for bullet list
    if (/^[-*]\s/.test(line)) {
      const content = line.replace(/^[-*]\s/, '');
      if (listType !== 'ul') {
        if (listType === 'ol' && currentList.length > 0) {
          elements.push(
            <ol key={`list-${index}`} className="list-decimal ml-5 space-y-1 my-2">
              {currentList}
            </ol>
          );
          currentList = [];
        }
        listType = 'ul';
      }
      currentList.push(
        <li key={`item-${index}`} className="my-1">
          {parseInlineMarkdown(content)}
        </li>
      );
      return;
    }

    // Check for numbered list
    if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      if (listType !== 'ol') {
        if (listType === 'ul' && currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc ml-5 space-y-1 my-2">
              {currentList}
            </ul>
          );
          currentList = [];
        }
        listType = 'ol';
      }
      currentList.push(
        <li key={`item-${index}`} className="my-1">
          {parseInlineMarkdown(content)}
        </li>
      );
      return;
    }

    // Close any open list
    if (listType) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`list-${index}`} className="list-disc ml-5 space-y-1 my-2">
            {currentList}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${index}`} className="list-decimal ml-5 space-y-1 my-2">
            {currentList}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    }

    // Regular paragraph
    if (line.trim()) {
      elements.push(
        <p key={`p-${index}`} className="my-2">
          {parseInlineMarkdown(line)}
        </p>
      );
    } else if (elements.length > 0) {
      // Empty line - add spacing
      elements.push(<br key={`br-${index}`} />);
    }
  };

  lines.forEach((line, index) => processLine(line, index));

  // Close any remaining list
  if (listType && currentList.length > 0) {
    if (listType === 'ul') {
      elements.push(
        <ul key="list-final" className="list-disc ml-5 space-y-1 my-2">
          {currentList}
        </ul>
      );
    } else {
      elements.push(
        <ol key="list-final" className="list-decimal ml-5 space-y-1 my-2">
          {currentList}
        </ol>
      );
    }
  }

  return elements.length > 0 ? <>{elements}</> : <>{text}</>;
};

// Parse inline markdown (bold, italic, code)
const parseInlineMarkdown = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  // Match bold (**text** or __text__)
  const boldRegex = /(\*\*|__)(.+?)\1/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${key++}`}>
          {parseInlineMarkdown(text.substring(lastIndex, match.index))}
        </span>
      );
    }
    // Add bold text
    parts.push(
      <strong key={`bold-${key++}`} className="font-semibold">
        {match[2]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex);
    // Check for italic (*text* or _text_)
    const italicRegex = /(\*|_)(.+?)\1/g;
    const italicParts: React.ReactNode[] = [];
    let italicLastIndex = 0;
    let italicKey = 0;

    while ((match = italicRegex.exec(remaining)) !== null) {
      if (match.index > italicLastIndex) {
        italicParts.push(remaining.substring(italicLastIndex, match.index));
      }
      italicParts.push(
        <em key={`italic-${italicKey++}`} className="italic">
          {match[2]}
        </em>
      );
      italicLastIndex = match.index + match[0].length;
    }

    if (italicLastIndex < remaining.length) {
      italicParts.push(remaining.substring(italicLastIndex));
    }

    parts.push(
      <span key={`text-final-${key++}`}>
        {italicParts.length > 1 ? italicParts : remaining}
      </span>
    );
  }

  return parts.length > 0 ? <>{parts}</> : <>{text}</>;
};

const AiChatTab: React.FC = () => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    loading,
    error,
    sendMessage,
    sendMessageWithHistory,
    clearHistory,
  } = useGemini();

  // Auto-scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        container.scrollTop = container.scrollHeight;
      }
    };
    
    // Use setTimeout to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    setInput("");
    
    // Use simple sendMessage for first message, sendMessageWithHistory for subsequent ones
    if (messages.length === 0) {
      await sendMessage(userInput);
    } else {
      await sendMessageWithHistory(userInput);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6">
      <div className="h-[calc(100vh-9rem)] rounded-lg overflow-hidden shadow-lg">
        <div
          className="h-full p-6 flex flex-col"
          style={{
            background:
              "linear-gradient(180deg, #023E8A 0%, #0077B6 50%, #00B4D8 100%)",
          }}
        >
          <div className="text-center mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">AI Assistant</h2>
            {messages.length > 0 && (
              <Button
                onClick={clearHistory}
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 text-sm"
              >
                Clear Chat
              </Button>
            )}
          </div>

          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-2 space-y-4 hide-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white/70">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Start a conversation with AI Assistant</p>
                  <p className="text-sm mt-2">
                    Ask about training plans, technique tips, or anything related to sports!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-white/90" />
                    </div>
                  )}
                  <div
                    className={`max-w-2xl rounded-lg p-4 text-white text-sm shadow-sm ${
                      message.role === "user"
                        ? "bg-white/12 text-right"
                        : "bg-white/8 border border-white/6"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div>
                        {parseMarkdown(message.content)}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-white/90" />
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-white/90" />
                </div>
                <div className="max-w-2xl bg-white/8 border border-white/6 rounded-lg p-4 text-white text-sm shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p>Thinking...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4">
            <div className="bg-white/6 rounded-full p-2 flex items-center space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1 bg-transparent placeholder-white/60 text-white text-sm px-3 py-2 focus:outline-none disabled:opacity-50"
                placeholder="Ask me anything..."
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-[#0077B6] hover:bg-[#0096C7] text-white px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Send"
                )}
              </Button>
            </div>
            {error && (
              <p className="text-red-200 text-xs mt-2 px-3">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChatTab;
