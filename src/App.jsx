import React from "react";
import Chat from "./features/chat/Chat.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="h-full w-full overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
          <Chat />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
