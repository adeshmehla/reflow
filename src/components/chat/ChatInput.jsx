import React, { useState, useEffect, useRef } from "react";
import { Send, Square, Mic, MicOff, ArrowDown } from "lucide-react";
import { Tooltip } from "../ui/Tooltip.jsx";

export function ChatInput({
  draft,
  setDraft,
  onSend,
  onStop,
  busy,
  disabled,
  chatMode,
  showJump,
  onJumpLatest,
  inputRef,
}) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setDraft((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setListening(false);
      };

      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, [setDraft]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

  const placeholders = {
    auto: "Ask a frontend engineering question or about Adesh's profile...",
    learn: "Ask about HTML, CSS, JavaScript, React, web performance, or debugging...",
    developer: "Ask about Adesh Mehla's experience, skills, projects, or background...",
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!busy && draft.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="relative shrink-0 w-full max-w-3xl mx-auto px-4 pb-4 pt-1 z-20">
      {/* Floating Jump to Latest Button placed safely ABOVE the input */}
      {showJump && (
        <div className="absolute -top-11 right-6 z-30">
          <button
            type="button"
            onClick={onJumpLatest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-indigo-400 border border-indigo-500/30 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Jump to latest</span>
          </button>
        </div>
      )}

      {/* Composer Container */}
      <div className="relative rounded-[var(--radius-xl)] bg-[var(--bg-surface)] border border-[var(--border-medium)] shadow-xl focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-200 overflow-hidden">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholders[chatMode] || placeholders.auto}
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent px-4 pt-3.5 pb-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none min-h-[48px] max-h-48 leading-relaxed font-sans"
        />

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Left tools: Voice input */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Tooltip content={listening ? "Listening... click to stop" : "Voice input (Speech to Text)"}>
              <button
                type="button"
                onClick={toggleVoice}
                className={`p-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                  listening
                    ? "bg-rose-500/20 text-rose-400 animate-pulse"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`}
                aria-label="Toggle voice input"
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </Tooltip>
            <span className="hidden sm:inline text-[11px]">
              {listening ? "Listening..." : "Enter to send, Shift+Enter for newline"}
            </span>
          </div>

          {/* Right Action: Send / Stop Button */}
          <div className="flex items-center gap-2">
            {busy ? (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all cursor-pointer shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSend()}
                disabled={!draft.trim() || disabled}
                className="flex items-center justify-center p-2 rounded-[var(--radius-md)] bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Footer Disclaimer */}
      <div className="text-center mt-2 text-[11px] text-[var(--text-muted)] select-none">
        Reflow can make mistakes. Verify critical facts and check cited knowledge sources.
      </div>
    </div>
  );
}
