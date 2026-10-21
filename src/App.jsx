import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCards } from "./hooks/useCards.js";
import { useKeys } from "./hooks/useKeys.js";
import { pickSet } from "./lib/shuffle.js";
import { copyText } from "./lib/copy.js";
import { Header } from "./components/Header.jsx";
import { NewWordsNote } from "./components/NewWordsNote.jsx";
import { Card } from "./components/Card.jsx";
import { KeyHints } from "./components/KeyHints.jsx";
import { StatusBox } from "./components/StatusBox.jsx";

const COPY_MS = 1600;
const COPY_TEXT = { copied: "copied", failed: "copy failed" };

export default function App() {
  const { status, data } = useCards();
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  // Part of the card key, so a new set always starts on the Dutch side.
  const [setNo, setSetNo] = useState(0);

  // The card remounts on each move (key), so a move never shows the flip.
  const [flipped, setFlipped] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [copyState, setCopyState] = useState("idle");
  const copyTimer = useRef();

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const newSet = useCallback(() => {
    if (!data) return;
    setDeck(pickSet(data.cards));
    setIndex(0);
    setFlipped(false);
    setSetNo((n) => n + 1);
  }, [data]);

  useEffect(() => {
    if (status === "ready") newSet();
  }, [status, newSet]);

  const goTo = useCallback(
    (next) => {
      if (next < 0 || next >= deck.length) return;
      setIndex(next);
      setFlipped(false);
    },
    [deck.length],
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const flip = useCallback(() => setFlipped((f) => !f), []);

  const card = deck[index];

  const yank = useCallback(async () => {
    if (!card) return;
    const ok = await copyText(card.nl);
    setCopyState(ok ? "copied" : "failed");
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState("idle"), COPY_MS);
  }, [card]);

  const toggleKeys = useCallback(() => setShowKeys((v) => !v), []);
  const hideKeys = useCallback(() => setShowKeys(false), []);

  useKeys(
    { j: next, k: prev, " ": flip, y: yank, n: newSet, "?": toggleKeys, Escape: hideKeys },
    status === "ready",
  );

  const newWords = useMemo(
    () => [...new Set(deck.flatMap((c) => c.newWords ?? []))],
    [deck],
  );

  return (
    <main className="page">
      <Header position={card ? index + 1 : 0} total={deck.length} />

      {status === "loading" && <p className="loading">Loading cards…</p>}

      {status === "empty" && (
        <StatusBox role="status">No cards yet. Run the build to make sentences.</StatusBox>
      )}

      {status === "error" && (
        <StatusBox role="alert">Cards cannot load right now. Reload the page to try again.</StatusBox>
      )}

      {status === "ready" && card && (
        <>
          {newWords.length > 0 && <NewWordsNote words={newWords} />}
          <Card key={`${setNo}-${card.id}`} card={card} flipped={flipped} />
          {/* Outside the card, so it shows on both sides. */}
          <div className="footer">
            <KeyHints open={showKeys} />
            <span className="copy-status" role="status" data-state={copyState}>
              {COPY_TEXT[copyState] ?? ""}
            </span>
          </div>
        </>
      )}
    </main>
  );
}
