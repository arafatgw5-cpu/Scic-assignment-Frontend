"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Copy,
  Check,
  RefreshCcw,
  ThumbsUp,
  Bookmark,
  Share2,
  Paperclip,
  Mic,
  X,
  ImageIcon,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  UploadCloud,
  RotateCcw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

/* -------------------------------------------------------------------------- */
/*                               TYPES & CONSTANTS                            */
/* -------------------------------------------------------------------------- */

type Role = "user" | "ai";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  // --- Image Understanding extensions (all optional, text-only flow is unaffected) ---
  imageUrl?: string;
  imageName?: string;
  imageSize?: number;
  imageType?: string;
  isAnalyzing?: boolean;
  isError?: boolean;
  retryPayload?: { file: File; prompt: string } | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://localhost:5001/api";

let cachedAuthToken: string | null = null;

async function getAuthToken(): Promise<string | null> {
  if (cachedAuthToken) return cachedAuthToken;
  try {
    const res = await fetch("/api/auth/token", { credentials: "include" });
    const data = await res.json();
    console.log("Token API Response:", data);

    if (data.token) {
      cachedAuthToken = data.token;
      return cachedAuthToken;
    }
  } catch (e) {
    console.error("Failed to fetch auth token", e);
  }

  if (typeof document !== "undefined") {
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

const IMAGE_SUGGESTIONS = [
  "Describe this image",
  "Explain this UI screenshot",
  "Extract the text (OCR)",
  "Analyze this receipt",
];

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg_${Date.now()}_${idCounter}`;
}

class ChatError extends Error {
  isQuota: boolean;
  constructor(message: string, isQuota: boolean) {
    super(message);
    this.name = "ChatError";
    this.isQuota = isQuota;
  }
}

/* -------------------------------------------------------------------------- */
/*                       IMAGE UNDERSTANDING — CONSTANTS                      */
/* -------------------------------------------------------------------------- */

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_IMAGE_MB = 10;
const COMPRESS_THRESHOLD_MB = 1.5;
const MAX_IMAGE_DIMENSION = 1600;

function formatBytes(bytes: number): string {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: "Only PNG, JPG, JPEG, or WEBP images are supported." };
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return { valid: false, error: `Image is too large. Max size is ${MAX_IMAGE_MB}MB.` };
  }
  return { valid: true };
}

/** Compresses/resizes large images client-side before upload. Returns original file if small enough. */
async function compressImageIfNeeded(file: File): Promise<File> {
  if (file.size <= COMPRESS_THRESHOLD_MB * 1024 * 1024) return file;

  try {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const img: HTMLImageElement = await new Promise((resolve, reject) => {
      const i = new window.Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });

    let { width, height } = img;
    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, outputType, 0.82)
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name, { type: outputType, lastModified: Date.now() });
  } catch (e) {
    console.warn("Image compression failed, using original file", e);
    return file;
  }
}

/** Lightweight SSE-style line parser shared between text chat and vision streaming. */
function extractStreamText(rawChunk: string): string {
  let out = "";
  const lines = rawChunk.split("\n");
  for (const line of lines) {
    if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
    try {
      const data = JSON.parse(line.slice(6));
      if (data.text) out += data.text;
    } catch {
      // not JSON — ignore partial/non-SSE noise, handled by caller fallback
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*                            SUB-COMPONENTS                                  */
/* -------------------------------------------------------------------------- */

function AmbientBackground() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <motion.div
        className="absolute -top-1/3 left-1/4 h-[60vh] w-[60vh] rounded-full bg-primary/5 blur-[120px]"
        animate={{ x: [0, 40, -20, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 h-[50vh] w-[50vh] rounded-full bg-accent/5 blur-[120px]"
        animate={{ x: [0, -30, 20, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-[40vh] w-[40vh] rounded-full bg-primary/5 blur-[100px]"
        style={{
          left: useSpring(springX, { stiffness: 40, damping: 20 }),
          top: useSpring(springY, { stiffness: 40, damping: 20 }),
          x: "-50%",
          y: "-50%",
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.02] mix-blend-overlay">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}

function CodeCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="hover:text-foreground transition-colors" aria-label="Copy code">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

const MarkdownRenderer = React.memo(({ content }: { content: string }) => {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "text";
            const codeString = String(children).replace(/\n$/, "");

            if (!inline && match) {
              return (
                <div className="relative group my-4 rounded-lg overflow-hidden border border-border/50 bg-[#1E1E1E]">
                  <div className="flex items-center justify-between px-4 py-1.5 bg-black/40 text-xs text-muted-foreground">
                    <span>{language}</span>
                    <CodeCopyButton text={codeString} />
                  </div>
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={language}
                    PreTag="div"
                    customStyle={{ margin: 0, padding: "1rem", background: "transparent" }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return (
              <code className="bg-muted/50 rounded px-1.5 py-0.5 text-xs font-mono text-primary" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
MarkdownRenderer.displayName = "MarkdownRenderer";

function ActionButton({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-muted/60 hover:text-foreground [&>svg]:h-3.5 [&>svg]:w-3.5"
    >
      {icon}
    </button>
  );
}

function MessageActions({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <ActionButton onClick={handleCopy} icon={copied ? <Check className="text-emerald-500" /> : <Copy />} title="Copy" />
      <ActionButton icon={<RefreshCcw />} title="Regenerate" />
      <ActionButton icon={<ThumbsUp />} title="Helpful" />
      <ActionButton icon={<Bookmark />} title="Save" />
      <ActionButton icon={<Share2 />} title="Share" />
    </div>
  );
}

/* ---------------------------- Image message bits --------------------------- */

function ChatImageThumbnail({
  src,
  alt,
  onOpen,
}: {
  src: string;
  alt: string;
  onOpen: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open image fullscreen"
      className="relative mb-2 block w-full max-w-xs overflow-hidden rounded-2xl border border-border/50 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted/60" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`max-h-72 w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <ZoomIn className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

function AnalyzingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      <span className="animate-pulse">Analyzing image...</span>
    </div>
  );
}

const MessageBubble = React.memo(
  ({
    role,
    content,
    isTyping,
    imageUrl,
    imageName,
    isAnalyzing,
    isError,
    retryPayload,
    onOpenImage,
    onRetry,
  }: ChatMessage & {
    isTyping?: boolean;
    onOpenImage?: (url: string) => void;
    onRetry?: (payload: { file: File; prompt: string }) => void;
  }) => {
    const isUser = role === "user";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`group flex w-full max-w-3xl gap-4 ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm mt-1 ${
            isUser ? "bg-primary text-primary-foreground" : "border border-primary/20 bg-primary/10 text-primary"
          }`}
        >
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </div>

        <div className={`min-w-0 flex-1 ${isUser ? "text-right" : "text-left"}`}>
          <div
            className={`inline-block text-[15px] leading-relaxed ${
              isUser
                ? "px-5 py-3 rounded-3xl rounded-tr-sm bg-primary text-primary-foreground shadow-sm"
                : "w-full text-foreground"
            }`}
          >
            {isUser ? (
              <div className="text-left">
                {imageUrl && (
                  <ChatImageThumbnail
                    src={imageUrl}
                    alt={imageName || "Uploaded image"}
                    onOpen={() => onOpenImage?.(imageUrl)}
                  />
                )}
                {content && <span className="whitespace-pre-wrap">{content}</span>}
              </div>
            ) : (
              <div className="prose-container min-h-[1.5rem]">
                {imageUrl && (
                  <ChatImageThumbnail
                    src={imageUrl}
                    alt={imageName || "Image"}
                    onOpen={() => onOpenImage?.(imageUrl)}
                  />
                )}
                {isAnalyzing && content === "" ? (
                  <AnalyzingIndicator />
                ) : (
                  <>
                    <MarkdownRenderer content={content} />
                    {isTyping && content === "" && (
                      <span className="inline-block h-4 w-1 animate-pulse bg-primary/60 align-middle ml-1" />
                    )}
                  </>
                )}
                {isError && retryPayload && (
                  <button
                    onClick={() => onRetry?.(retryPayload)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
          {!isUser && content && !isAnalyzing && <MessageActions content={content} />}
        </div>
      </motion.div>
    );
  }
);
MessageBubble.displayName = "MessageBubble";

/* ------------------------------ Image lightbox ------------------------------ */

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(4, Math.max(1, s - e.deltaY * 0.0015)));
  };

  const handleDoubleClick = () => {
    setScale((s) => (s > 1 ? 1 : 2));
    setPos({ x: 0, y: 0 });
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen image preview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close fullscreen preview"
        className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="absolute top-5 left-5 flex items-center gap-2 text-white/70">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale((s) => Math.max(1, s - 0.5));
          }}
          className="rounded-full bg-white/10 p-2 hover:bg-white/20"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale((s) => Math.min(4, s + 0.5));
          }}
          className="rounded-full bg-white/10 p-2 hover:bg-white/20"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
      <motion.img
        src={src}
        alt="Fullscreen preview"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onMouseDown={(e) => {
          if (scale <= 1) return;
          dragging.current = true;
          lastPoint.current = { x: e.clientX, y: e.clientY };
        }}
        onMouseMove={(e) => {
          if (!dragging.current) return;
          const dx = e.clientX - lastPoint.current.x;
          const dy = e.clientY - lastPoint.current.y;
          lastPoint.current = { x: e.clientX, y: e.clientY };
          setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
        }}
        onMouseUp={() => (dragging.current = false)}
        onMouseLeave={() => (dragging.current = false)}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          cursor: scale > 1 ? "grab" : "zoom-in",
        }}
        className="max-h-[85vh] max-w-[90vw] select-none rounded-lg object-contain transition-transform duration-150 will-change-transform"
      />
    </motion.div>
  );
}

/* --------------------------- Image preview card ----------------------------- */

function ImagePreviewCard({
  previewUrl,
  name,
  size,
  isUploading,
  uploadProgress,
  error,
  onRemove,
}: {
  previewUrl: string;
  name: string;
  size: number;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mb-3 flex items-center gap-3 rounded-2xl border border-border/50 bg-card/60 p-2.5 pr-4 shadow-sm backdrop-blur-xl"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/40">
        <img src={previewUrl} alt={name} className="h-full w-full object-cover" />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        {error ? (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" /> {error}
          </p>
        ) : isUploading ? (
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{formatBytes(size)}</p>
        )}
      </div>

      <button
        onClick={onRemove}
        aria-label="Remove image"
        title="Remove image"
        className="shrink-0 rounded-full p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

/* --------------------------------- Composer --------------------------------- */

interface ComposerProps {
  input: string;
  setInput: (v: string) => void;
  isTyping: boolean;
  onSend: () => void;
  suggestions: string[];
  showSuggestions: boolean;
  // image understanding
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelected: (file: File) => void;
  onPasteImage: (e: React.ClipboardEvent) => void;
  hasImage: boolean;
  imagePreview: React.ReactNode;
  isUploadingImage: boolean;
}

function Composer({
  input,
  setInput,
  isTyping,
  onSend,
  suggestions,
  showSuggestions,
  fileInputRef,
  onFileSelected,
  onPasteImage,
  hasImage,
  imagePreview,
  isUploadingImage,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = (input.trim().length > 0 || hasImage) && !isTyping && !isUploadingImage;

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:px-0">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
        aria-hidden="true"
      />

      <AnimatePresence>{hasImage && imagePreview}</AnimatePresence>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-4 flex flex-wrap gap-2"
          >
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="rounded-xl border border-border/50 bg-card/40 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur transition-all hover:border-primary/30 hover:bg-muted/50 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-end gap-2 rounded-2xl border border-border/50 bg-card/60 p-2 shadow-sm backdrop-blur-xl transition-colors focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-muted-foreground/60 hover:text-foreground transition-colors hidden sm:block"
          aria-label="Attach an image"
          title="Attach an image"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={hasImage ? "Ask something about this image (optional)..." : "Message AI Career Coach..."}
          className="max-h-40 flex-1 resize-none bg-transparent py-3 text-[15px] outline-none placeholder:text-muted-foreground/50"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={onPasteImage}
          disabled={isTyping}
          aria-label="Chat input"
        />
        <div className="flex items-center gap-1 mb-0.5">
          <button className="p-2.5 text-muted-foreground/60 hover:text-foreground transition-colors hidden sm:block">
            <Mic className="h-5 w-5" />
          </button>
          <Button
            size="icon"
            onClick={onSend}
            disabled={!canSend}
            className={`h-9 w-9 shrink-0 rounded-xl transition-all duration-300 ${
              canSend ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground/50"
            }`}
          >
            {isTyping || isUploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 ml-0.5" />
            )}
          </Button>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground/60">
        AI can make mistakes. Consider verifying critical information.
      </p>
    </div>
  );
}

/* ------------------------------ Drag & drop overlay -------------------------- */

function DragDropOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/50 bg-card/70 px-10 py-8 shadow-lg">
        <UploadCloud className="h-8 w-8 text-primary" />
        <p className="text-sm font-medium text-foreground">Drop image to analyze</p>
        <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, or WEBP</p>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN PAGE COMPONENT                           */
/* -------------------------------------------------------------------------- */

export default function CareerChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /* ---------------------- Image Understanding state ---------------------- */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false); // validating/compressing
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const dragCounter = useRef(0);
  const activeXhrRef = useRef<XMLHttpRequest | null>(null);

  const checkIsNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    const threshold = 120;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  const handleScroll = useCallback(() => {
    const near = checkIsNearBottom();
    setIsNearBottom(near);
    setShowJumpButton(!near);
  }, [checkIsNearBottom]);

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom(!isTyping);
    } else {
      setShowJumpButton(true);
    }
  }, [messages, isTyping, isNearBottom, scrollToBottom]);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                       IMAGE SELECTION / VALIDATION                       */
  /* ------------------------------------------------------------------------ */

  const clearSelectedImage = useCallback(() => {
    setSelectedImage(null);
    setImageError(null);
    setUploadProgress(0);
    setIsUploadingImage(false);
    setImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const handleFileSelected = useCallback(
    async (file: File) => {
      const { valid, error } = validateImageFile(file);
      if (!valid) {
        setImageError(error || "Invalid image file.");
        setSelectedImage(file);
        setImagePreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        return;
      }

      setIsProcessingImage(true);
      setImageError(null);
      try {
        const processed = await compressImageIfNeeded(file);
        setSelectedImage(processed);
        setImagePreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(processed);
        });
      } finally {
        setIsProcessingImage(false);
      }
    },
    []
  );

  // Paste image from clipboard (Ctrl+V)
  const handlePasteImage = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFileSelected(file);
          }
          break;
        }
      }
    },
    [handleFileSelected]
  );

  // Drag & drop across the whole chat surface
  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      e.preventDefault();
      dragCounter.current += 1;
      setIsDragActive(true);
    };
    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      e.preventDefault();
    };
    const onDragLeave = (e: DragEvent) => {
      dragCounter.current = Math.max(0, dragCounter.current - 1);
      if (dragCounter.current === 0) setIsDragActive(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFileSelected(file);
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [handleFileSelected]);

  // Escape key: close lightbox first, otherwise cancel drag overlay
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lightboxImage && isDragActive) {
        setIsDragActive(false);
        dragCounter.current = 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDragActive, lightboxImage]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      activeXhrRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                       EXISTING TEXT CHAT (UNCHANGED)                     */
  /* ------------------------------------------------------------------------ */

  const sendTextMessage = async (trimmed: string) => {
    const userMessage: ChatMessage = { id: nextId(), role: "user", content: trimmed };
    const historySource = messages.filter((m) => m.id !== INITIAL_GREETING.id);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

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

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
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

  /* ------------------------------------------------------------------------ */
  /*                    VISION (IMAGE UNDERSTANDING) REQUEST                  */
  /* ------------------------------------------------------------------------ */

  const sendVisionMessage = useCallback(
    async (file: File, promptText: string, previewUrlOverride?: string) => {
      const previewUrl = previewUrlOverride || imagePreviewUrl || URL.createObjectURL(file);

      const userMessage: ChatMessage = {
        id: nextId(),
        role: "user",
        content: promptText,
        imageUrl: previewUrl,
        imageName: file.name,
        imageSize: file.size,
        imageType: file.type,
      };
      appendMessage(userMessage);
      setInput("");
      clearSelectedImage();

      const aiMessageId = nextId();
      appendMessage({ id: aiMessageId, role: "ai", content: "", isAnalyzing: true });

      setIsUploadingImage(true);
      setUploadProgress(0);

      const headers: Record<string, string> = {};
      const token = await getAuthToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const formData = new FormData();
      formData.append("image", file, file.name);
      formData.append("prompt", promptText || "");

      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        activeXhrRef.current = xhr;
        xhr.open("POST", `${API_BASE_URL}/ai/vision`);
        xhr.withCredentials = true;
        Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

        let lastLength = 0;
        let receivedAnyChunk = false;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onprogress = () => {
          setIsUploadingImage(false);
          const full = xhr.responseText || "";
          const newText = full.substring(lastLength);
          lastLength = full.length;
          if (!newText) return;

          const parsed = extractStreamText(newText);
          if (parsed) {
            receivedAnyChunk = true;
            updateMessage(aiMessageId, { isAnalyzing: false });
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMessageId ? { ...m, content: m.content + parsed } : m))
            );
          }
        };

        xhr.onload = () => {
          setIsUploadingImage(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            if (!receivedAnyChunk) {
              // Non-streaming backend fallback: try JSON, else raw text.
              let finalText = xhr.responseText;
              try {
                const json = JSON.parse(xhr.responseText);
                finalText = json.text || json.message || json.content || xhr.responseText;
              } catch {
                // keep raw text
              }
              updateMessage(aiMessageId, { content: finalText, isAnalyzing: false });
            }
          } else {
            let message = "Sorry, I couldn't analyze that image.";
            let isQuota = xhr.status === 429;
            try {
              const errJson = JSON.parse(xhr.responseText);
              message = errJson?.message || message;
              isQuota = isQuota || /quota/i.test(message);
            } catch {}

            updateMessage(aiMessageId, {
              content: isQuota
                ? "I'm currently receiving a high volume of image requests (API quota exceeded). Please try again shortly."
                : message,
              isAnalyzing: false,
              isError: true,
              retryPayload: { file, prompt: promptText },
            });
          }
          resolve();
        };

        xhr.onerror = () => {
          setIsUploadingImage(false);
          updateMessage(aiMessageId, {
            content: "Sorry, I encountered a network error analyzing this image.",
            isAnalyzing: false,
            isError: true,
            retryPayload: { file, prompt: promptText },
          });
          resolve();
        };

        xhr.send(formData);
      });

      activeXhrRef.current = null;
    },
    [appendMessage, clearSelectedImage, imagePreviewUrl, updateMessage]
  );

  const handleRetryVision = useCallback(
    (payload: { file: File; prompt: string }) => {
      sendVisionMessage(payload.file, payload.prompt);
    },
    [sendVisionMessage]
  );

  /* ------------------------------------------------------------------------ */
  /*                                SEND ENTRY                                */
  /* ------------------------------------------------------------------------ */

  const handleSend = async () => {
    if (isTyping || isUploadingImage) return;

    if (selectedImage && !imageError) {
      await sendVisionMessage(selectedImage, input.trim(), imagePreviewUrl || undefined);
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) return;
    await sendTextMessage(trimmed);
  };

  const hasImage = !!selectedImage;

  return (
    <div className="relative flex h-[100dvh] max-w-5xl mx-auto flex-col overflow-hidden">
      <AmbientBackground />

      {/* Header */}
      <header className="flex-shrink-0 border-b border-border/40 bg-background/60 py-4 px-6 backdrop-blur-xl z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-sm">
            <Bot className="h-5 w-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">SkillPilot Assistant</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              Gemini 2.5 Flash <span className="opacity-50">•</span>{" "}
              {isUploadingImage ? "Uploading image..." : isTyping ? "Typing..." : "Online"}
            </p>
          </div>
        </div>
      </header>

      {/* Chat Log */}
      <div
        role="log"
        aria-live="polite"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8 z-10"
      >
        <div className="flex flex-col space-y-8 max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                {...msg}
                isTyping={isTyping && msg.id === messages[messages.length - 1].id}
                onOpenImage={(url) => setLightboxImage(url)}
                onRetry={handleRetryVision}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Sticky Jump Button */}
      <AnimatePresence>
        {showJumpButton && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            onClick={() => {
              scrollToBottom(true);
              setShowJumpButton(false);
              setIsNearBottom(true);
            }}
            className="absolute bottom-28 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border/50 bg-card/90 px-4 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-card"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            Jump to present
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="shrink-0 pb-4 pt-2 z-20 bg-gradient-to-t from-background via-background/90 to-transparent">
        <Composer
          input={input}
          setInput={setInput}
          isTyping={isTyping}
          onSend={handleSend}
          suggestions={hasImage ? IMAGE_SUGGESTIONS : SUGGESTIONS}
          showSuggestions={messages.length === 1 || hasImage}
          fileInputRef={fileInputRef}
          onFileSelected={handleFileSelected}
          onPasteImage={handlePasteImage}
          hasImage={hasImage}
          isUploadingImage={isUploadingImage || isProcessingImage}
          imagePreview={
            selectedImage && (imagePreviewUrl || imageError) ? (
              <ImagePreviewCard
                previewUrl={imagePreviewUrl || ""}
                name={selectedImage.name}
                size={selectedImage.size}
                isUploading={isUploadingImage || isProcessingImage}
                uploadProgress={uploadProgress}
                error={imageError}
                onRemove={clearSelectedImage}
              />
            ) : null
          }
        />
      </div>

      {/* Drag & drop overlay */}
      <AnimatePresence>{isDragActive && <DragDropOverlay />}</AnimatePresence>

      {/* Fullscreen image lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

