"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";

type Role = "user" | "ai";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api` 
  : "http://localhost:5001/api";

let cachedAuthToken: string | null = null;

async function getAuthToken(): Promise<string | null> {
  if (cachedAuthToken) return cachedAuthToken;
  try {
    const res = await fetch('/api/auth/token', { credentials: 'include' });
    const data = await res.json();
    console.log("Token API Response:", data);
    
    if (data.token) {
      cachedAuthToken = data.token;
      return cachedAuthToken;
    }
  } catch (e) {
    console.error("Failed to fetch auth token", e);
  }

  // Fallback: try reading it directly from document.cookie (since httpOnly: false is now enabled)
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=([^;]*)/);
    if (match) {
      cachedAuthToken = decodeURIComponent(match[1]);
      console.log("Token extracted from document.cookie fallback");
      return cachedAuthToken;
    }
  }

  return null;
}

const INITIAL_GREETING: ChatMessage = {
  id: "greeting",
  role: "ai",
  content:
    "Hi there! I'm your AI Career Coach. I've reviewed your profile and see you're aiming for a Senior Full Stack role. How can I help you today? We can practice interview questions, discuss salary negotiation, or review your career goals.",
};

const SUGGESTIONS = [
  "Simulate a technical interview",
  "How do I answer 'What is your greatest weakness'?",
  "Review my recent project description",
];

// Simple monotonically increasing id generator so rapid-fire messages never collide.
let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg_${Date.now()}_${idCounter}`;
}

export default function CareerChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = { id: nextId(), role: "user", content: trimmed };
    const historySource = messages.filter((m) => m.id !== INITIAL_GREETING.id);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Gemini requires the first history entry to be from the 'user' role,
    // so the initial greeting is excluded.
    const history = historySource.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = await getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ history, message: trimmed }),
        credentials: "include",
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const message = errJson?.message || "Chat failed";
        const isQuotaError = res.status === 429 || /quota/i.test(message);
        throw new ChatError(message, isQuotaError);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new ChatError("No readable stream", false);

      const decoder = new TextDecoder("utf-8");
      const aiMessageId = nextId();
      appendMessage({ id: aiMessageId, role: "ai", content: "" });
      setIsTyping(false);

      // Buffer partial lines across chunk boundaries so a `data: ` event
      // split between two reads doesn't get silently dropped.
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last (possibly incomplete) line in the buffer.
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMessageId ? { ...m, content: m.content + data.text } : m))
              );
            }
          } catch {
            // Ignore parse errors on partial chunks.
          }
        }
      }
    } catch (err) {
      const chatError = err instanceof ChatError ? err : new ChatError((err as Error).message, false);

      if (chatError.isQuota) {
        // Expected, handled condition — don't spam the console as an error.
        console.warn("Gemini API quota exceeded, using fallback response.");
        appendMessage({
          id: nextId(),
          role: "ai",
          content:
            "I'm currently receiving a high volume of requests (API quota exceeded). In the meantime: practicing your pitch and refining your resume are always great next steps!",
        });
      } else {
        console.error("Chat request failed:", chatError);
        appendMessage({
          id: nextId(),
          role: "ai",
          content: chatError.message || "Sorry, I encountered an error connecting to the AI.",
        });
      }

      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative p-6 md:p-8 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mb-6 flex-shrink-0 relative z-10">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          AI Career Coach
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Get 24/7 personalized advice, interview prep, and negotiation strategies.
        </p>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 border-border/50 bg-card/60 backdrop-blur-xl shadow-premium-lg overflow-hidden relative z-10 rounded-2xl">
        <CardHeader className="bg-background/40 backdrop-blur-md border-b border-border/50 py-4 flex-shrink-0">
          <CardTitle className="text-base flex items-center gap-3 font-semibold">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              SkillPilot Assistant
              <CardDescription className="text-xs font-normal mt-0.5">Powered by Gemini 2.5 Flash</CardDescription>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center shadow-sm ${msg.role === "user" ? "bg-muted text-muted-foreground border border-border" : "bg-primary/10 text-primary border border-primary/20"}`}>
                {msg.role === "user" ? <User className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              </div>
              <div
                className={`p-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                    : "bg-background/80 backdrop-blur border border-border/50 rounded-2xl rounded-tl-sm text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div className="p-4 rounded-2xl bg-background/80 backdrop-blur border border-border/50 rounded-tl-sm flex items-center gap-3 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground font-medium">SkillPilot is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 md:p-6 bg-background/40 backdrop-blur-md border-t border-border/50 flex-shrink-0">
          {messages.length === 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="outline" size="sm" className="rounded-full shrink-0 text-xs text-muted-foreground border-border/60 hover:bg-muted/50 hover:text-foreground transition-all" onClick={() => setInput(s)}>
                  {s}
                </Button>
              ))}
            </div>
          )}
          <div className="relative flex items-center">
            <Input
              placeholder="Ask anything about your career..."
              className="pr-14 h-14 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary/30 text-base shadow-sm backdrop-blur"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <Button
              size="icon"
              className={`absolute right-2 h-10 w-10 rounded-lg transition-all duration-300 ${input.trim() && !isTyping ? 'bg-primary text-primary-foreground shadow-md hover:scale-105 active:scale-95' : 'bg-muted text-muted-foreground'}`}
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center mt-3">
            <p className="text-[11px] text-muted-foreground font-medium">AI can make mistakes. Consider verifying critical information.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

class ChatError extends Error {
  isQuota: boolean;
  constructor(message: string, isQuota: boolean) {
    super(message);
    this.name = "ChatError";
    this.isQuota = isQuota;
  }
}
