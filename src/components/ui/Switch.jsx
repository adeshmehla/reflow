import React from "react";

export function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  id,
  className = "",
}) {
  const switchId = id || `switch-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className={`flex items-start justify-between gap-4 py-2 ${className}`}>
      {(label || description) && (
        <label htmlFor={switchId} className="cursor-pointer select-none pr-2">
          {label && <div className="text-sm font-medium text-[var(--text-primary)]">{label}</div>}
          {description && <div className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{description}</div>}
        </label>
      )}
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
          checked ? "bg-gradient-to-r from-indigo-500 to-violet-600" : "bg-[var(--border-strong)]"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
