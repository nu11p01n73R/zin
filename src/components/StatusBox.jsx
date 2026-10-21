export function StatusBox({ role, children }) {
  return (
    <div className="status" role={role}>
      {children}
    </div>
  );
}
