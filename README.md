# Zin

Practice Dutch through sentences.

Learn words in Anki. Practice using them here. An LLM writes 150–200
short sentences that use only the words you know. Each session shows
25 random cards.

## Setup

Node 22+.

    npm install

## Update cards

1. Export Anki words to `words.csv`. Header `want,because`: Dutch, English.
2. Run `/build-sentences` in Claude Code.
3. `npm run build && npm run preview` to check.
4. Commit and push `main`. CI tests, builds and deploys.

## Dev

    npm run dev
    npm test

GitHub Pages source: GitHub Actions.
