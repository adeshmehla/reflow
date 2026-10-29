import React, { useState, useRef, useEffect } from "react";
import { Logo } from "../ui/Logo.jsx";
import { Button } from "../ui/Button.jsx";
import {
  Plus,
  Search,
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  Sun,
  Moon,
  BarChart3,
  Download,
  X,
  Keyboard,
  Compass,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { exportChatToMarkdown } from "../../lib/export.js";
import { useToast } from "../ui/Toast.jsx";

export function Sidebar({
  isOpen,
  onClose,
  convos = [],
  activeId,
  onSelectChat,
  onNewChat,
  onRemoveChat,
  onRenameChat,
  onWipe,
  onOpenShortcuts,
  onOpenCommandPalette,
  searchQuery,
  onSearchChange,
}) {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const renameInputRef = useRef(null);

  // Group chats by date: Today, Yesterday, Earlier
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;

  const groups = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  convos.forEach((c) => {
    const time = c.updatedAt || Date.now();
    if (time >= startOfToday) {
      groups.today.push(c);
    } else if (time >= startOfYesterday) {
      groups.yesterday.push(c);
    } else {
      groups.earlier.push(c);
    }
  });

  const handleStartRename = (c, e) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id) => {
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
      toast.success("Conversation renamed");
    }
    setEditingId(null);
  };

  const handleExport = (c, e) => {
    e.stopPropagation();
    exportChatToMarkdown(c);
    toast.success("Chat exported as Markdown");
    setMenuOpenId(null);
  };

  const handleDelete = (c, e) => {
    e.stopPropagation();
    setMenuOpenId(null);
    onRemoveChat(c);
  };

  // Close ... menu on outside click
  useEffect(() => {
    const closeMenu = () => setMenuOpenId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  return (
    <>
      {/* Mobile Scrim Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`app-sidebar select-none transition-transform duration-200 ease-out fixed min-[900px]:static inset-y-0 left-0 z-40 w-[280px] min-[900px]:w-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full min-[900px]:translate-x-0"
        }`}
      >
        {/* Top Header / Logo */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <Logo size="md" showTagline={true} />
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button & Search Trigger */}
        <div className="p-3 space-y-2">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center shadow-md font-semibold"
            icon={Plus}
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
          >
            New Conversation
          </Button>

          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-[var(--radius-md)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search chats...</span>
            </div>
            <kbd className="px-1.5 py-0.5 font-mono text-[10px] rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4 text-xs">
          {convos.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[var(--text-muted)] space-y-1">
              <p className="font-medium text-[var(--text-secondary)]">No conversations yet</p>
              <p>Your chat history will be saved locally in this browser.</p>
            </div>
          ) : (
            <>
              {Object.entries(groups).map(([label, items]) => {
                if (!items.length) return null;
                const titles = {
                  today: "Today",
                  yesterday: "Yesterday",
                  earlier: "Earlier",
                };

                return (
                  <div key={label} className="space-y-1">
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {titles[label]}
                    </div>

                    {items.map((c) => {
                      const isActive = c.id === activeId;
                      const isMenuOpen = menuOpenId === c.id;
                      const isEditing = editingId === c.id;

                      return (
                        <div
                          key={c.id}
                          className={`group relative flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] transition-colors cursor-pointer ${
                            isActive
                              ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                          }`}
                          onClick={() => {
                            if (!isEditing) {
                              onSelectChat(c.id);
                              if (window.innerWidth < 1024) onClose();
                            }
                          }}
                        >
                          {/* Chat Title or Inline Rename Input */}
                          <div className="flex items-center gap-2.5 truncate mr-2 flex-1">
                            <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`} />
                            {isEditing ? (
                              <input
                                ref={renameInputRef}
                                autoFocus
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveRename(c.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                onBlur={() => handleSaveRename(c.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-[var(--bg-base)] border border-[var(--border-strong)] rounded px-1.5 py-0.5 text-xs text-[var(--text-primary)] focus:outline-none"
                              />
                            ) : (
                              <span className="truncate">{c.title || "Untitled Chat"}</span>
                            )}
                          </div>

                          {/* Hover Action (...) Menu */}
                          {!isEditing && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(isMenuOpen ? null : c.id);
                                }}
                                className={`p-1 rounded hover:bg-[var(--bg-elevated)] transition-opacity cursor-pointer ${
                                  isMenuOpen || isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                                aria-label="Conversation actions"
                              >
                                <MoreVertical className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                              </button>

                              {/* Dropdown Menu */}
                              {isMenuOpen && (
                                <div
                                  className="absolute right-0 top-full mt-1 w-32 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-medium)] shadow-xl py-1 z-30 animate-in fade-in duration-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => handleStartRename(c, e)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Rename</span>
                                  </button>
                                  <button
                                    onClick={(e) => handleExport(c, e)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Export .md</span>
                                  </button>
                                  <button
                                    onClick={(e) => handleDelete(c, e)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Bottom Navigation & Utilities */}
        <div className="p-3 border-t border-[var(--border-subtle)] space-y-2 bg-[var(--bg-subtle)]">
          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-1.5">
            <a
              href="/eval"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>/eval ↗</span>
            </a>

            <button
              type="button"
              onClick={onOpenShortcuts}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors cursor-pointer"
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Shortcuts</span>
            </button>
          </div>

          {/* Theme & Clear Footer Row */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[var(--text-secondary)]" />}
              <span className="capitalize">{theme} Theme</span>
            </button>

            {convos.length > 0 && (
              <button
                onClick={onWipe}
                className="text-[var(--text-muted)] hover:text-rose-400 text-[11px] transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
