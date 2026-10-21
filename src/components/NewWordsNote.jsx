export function NewWordsNote({ words }) {
  return (
    <p className="note">
      New words in this set: <span lang="nl">{words.join(", ")}</span>
    </p>
  );
}
