// Shared Tailwind class strings so forms/buttons stay consistent without a
// component library. Tokens (bg-surface, text-muted, …) come from globals.css.

export const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-ring/30";

export const selectClass = `${inputClass} appearance-none bg-[length:1rem] pr-9`;

export const labelClass = "mb-1.5 block text-sm font-medium";

export const btnPrimary =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

export const btnSecondary =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:bg-accent disabled:opacity-60";

export const btnDanger =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-danger/40 bg-transparent px-4 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-60";

export const cardClass = "rounded-2xl border border-border bg-card p-4";
