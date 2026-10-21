export function Header({ position, total }) {
  return (
    <header className="header">
      <h1 className="title">Zin</h1>
      <svg className="underline" viewBox="0 0 200 6" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="0,3 100,0 200,3 100,6" />
      </svg>
      {total > 0 && (
        <p className="meta" aria-label={`Card ${position} of ${total}`}>
          {position} / {total}
        </p>
      )}
    </header>
  );
}
