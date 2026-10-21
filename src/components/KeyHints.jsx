export function KeyHints({ open }) {
  if (!open) {
    return (
      <p className="keys-hint">
        press <kbd>?</kbd> for shortcuts
      </p>
    );
  }

  return (
    <p className="keys" aria-label="Keyboard shortcuts">
      <kbd>j</kbd> next · <kbd>k</kbd> previous · <kbd>space</kbd> flip · <kbd>y</kbd> copy ·{" "}
      <kbd>n</kbd> new set · <kbd>?</kbd> close
    </p>
  );
}
