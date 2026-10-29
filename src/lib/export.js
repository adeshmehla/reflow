/**
 * Export conversation to markdown file download
 */
export function exportChatToMarkdown(chat) {
  if (!chat || !chat.messages?.length) return;

  let md = `# ${chat.title || "Reflow Conversation"}\n`;
  md += `Exported on: ${new Date().toLocaleString()}\n\n---\n\n`;

  chat.messages.forEach((m) => {
    const role = m.role === "user" ? "User" : "Reflow";
    md += `### ${role}:\n\n${m.content}\n\n`;
    if (m.sources?.length) {
      md += `*Sources: ${m.sources.join(", ")}*\n\n`;
    }
    if (m.ledger) {
      md += `*Tokens: ${m.ledger.totalTokens || 0} | Latency: ${m.ledger.latencyMs || 0}ms | Route: ${m.ledger.route || "—"}*\n\n`;
    }
    md += `---\n\n`;
  });

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(chat.title || "reflow-chat").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
