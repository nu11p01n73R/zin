export const SET_SIZE = 25;

export function shuffle(items, random = Math.random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickSet(pool, size = SET_SIZE, random = Math.random) {
  return shuffle(pool, random).slice(0, size);
}
