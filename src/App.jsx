import React from "react";
import Chat from "./features/chat/Chat.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Chat />
      </ToastProvider>
    </ThemeProvider>
  );
}
