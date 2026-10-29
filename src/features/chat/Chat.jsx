import React, { useState, useEffect } from "react";
import { useChat } from "./useChat.js";
import { Sidebar } from "../../components/chat/Sidebar.jsx";
import { ChatHeader } from "../../components/chat/ChatHeader.jsx";
import { ChatInput } from "../../components/chat/ChatInput.jsx";
import { EmptyState } from "../../components/chat/EmptyState.jsx";
import { MessageItem } from "../../components/chat/MessageItem.jsx";
import { ProfileCard } from "../../components/chat/ProfileCard.jsx";
import { ColdStartNotice, ErrorBanner } from "../../components/chat/FriendlyStates.jsx";
import { SettingsDrawer } from "../../components/chat/SettingsDrawer.jsx";
import { CitationsDrawer } from "../../components/chat/CitationsDrawer.jsx";
import { CommandPalette } from "../../components/chat/CommandPalette.jsx";
import { ShortcutsModal } from "../../components/chat/ShortcutsModal.jsx";
import { TourModal } from "../../components/chat/TourModal.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

export default function Chat() {
  const {
    convos, activeId, active, messages, settings, models, server,
    draft, setDraft, busy, error, query, setQuery,
    sideOpen, setSideOpen, panel, setPanel,
    chatMode, setChatMode,
    scrollRef, fieldRef, searchRef,
    lastIsUser, lastAssistantId, noServer,
    send, stop, regenerate, retry, newChat, openChat, removeChat, wipe, onScroll,
    setSetting,
  } = useChat();

  const toast = useToast();
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [showJump, setShowJump] = useState(false);

  // Keyboard shortcut listener for '?' and 'Cmd/Ctrl + K'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      } else if (e.key === "?" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Jump to latest handler
  const handleJumpLatest = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
    setShowJump(false);
  };

  const handleCustomScroll = (e) => {
    onScroll(e);
    const el = e.currentTarget;
    const isScrolledUp = el.scrollHeight - el.scrollTop - el.clientHeight > 140;
    setShowJump(isScrolledUp && messages.length > 0);
  };

  // Session token spend calculation
  const sessionTokens = convos.reduce((total, c) => {
    return total + (c.messages || []).reduce((sub, m) => sub + (m.ledger?.totalTokens || 0), 0);
  }, 0);

  const handleRenameChat = (id, newTitle) => {
    const chat = convos.find((c) => c.id === id);
    if (chat) {
      chat.title = newTitle;
    }
  };

  return (
    <div className="app-shell text-[var(--text-primary)]">
      {/* ── Left Sidebar ── */}
      <Sidebar
        isOpen={sideOpen}
        onClose={() => setSideOpen(false)}
        convos={convos}
        activeId={activeId}
        onSelectChat={openChat}
        onNewChat={newChat}
        onRemoveChat={removeChat}
        onRenameChat={handleRenameChat}
        onWipe={wipe}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        searchQuery={query}
        onSearchChange={setQuery}
      />

      {/* ── Main Chat Area ── */}
      <main className="app-main relative">
        {/* Slim Unified Header */}
        <ChatHeader
          title={active?.title}
          onRename={(newTitle) => handleRenameChat(activeId, newTitle)}
          chatMode={chatMode}
          onModeChange={setChatMode}
          onOpenSettings={() => setPanel(true)}
          onOpenSidebar={() => setSideOpen(true)}
          sessionTokens={sessionTokens}
          maxBudget={50000}
          savingsPercent={68}
        />

        {/* Scrollable Message Thread */}
        <div
          ref={scrollRef}
          onScroll={handleCustomScroll}
          className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
        >
          <div className="w-full max-w-3xl mx-auto">
            {/* Cold Start Notice */}
            {server === "offline" && (
              <div className="mb-4">
                <ColdStartNotice onRetry={() => window.location.reload()} />
              </div>
            )}

            {/* Error Notification Banner */}
            {error && (
              <ErrorBanner
                error={error}
                onRetry={lastIsUser && !busy ? retry : null}
                isRetrying={busy}
              />
            )}

            {/* Developer Profile Header Card (Active in Developer Mode) */}
            {chatMode === "developer" && (
              <ProfileCard onSelectPrompt={(prompt) => send(prompt)} />
            )}

            {/* Empty State vs Message List */}
            {messages.length === 0 ? (
              <EmptyState
                onSelectQuestion={(q) => send(q)}
                onSelectProfile={(q) => {
                  setChatMode("developer");
                  send(q);
                }}
                noServer={noServer}
              />
            ) : (
              <div className="space-y-1">
                {messages.map((m, idx) => (
                  <MessageItem
                    key={m.id || idx}
                    message={m}
                    isLast={idx === messages.length - 1}
                    isLastAssistant={m.id === lastAssistantId}
                    busy={busy}
                    onRegenerate={regenerate}
                    onCitationClick={(filename) => setSelectedCitation(filename)}
                    onSelectPrompt={(p) => send(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Composer Dock at the Bottom */}
        <ChatInput
          draft={draft}
          setDraft={setDraft}
          onSend={() => send()}
          onStop={stop}
          busy={busy}
          disabled={noServer}
          chatMode={chatMode}
          showJump={showJump}
          onJumpLatest={handleJumpLatest}
          inputRef={fieldRef}
        />
      </main>

      {/* ── Settings Drawer ── */}
      <SettingsDrawer
        isOpen={panel}
        onClose={() => setPanel(false)}
        settings={settings}
        setSetting={setSetting}
        models={models}
        onReset={() => toast.success("Settings restored to defaults")}
      />

      {/* ── Grounded Citation Note Drawer ── */}
      <CitationsDrawer
        filename={selectedCitation}
        isOpen={!!selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />

      {/* ── Command Palette (Cmd + K) ── */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewChat={newChat}
        onSelectChat={openChat}
        onSwitchMode={setChatMode}
        convos={convos}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* ── Keyboard Shortcuts Modal (?) ── */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* ── First Visit Tour Modal ── */}
      <TourModal />
    </div>
  );
}
