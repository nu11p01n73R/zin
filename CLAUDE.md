# Project rules

1. `words.csv` is the Anki export. Do not change it.
2. `public/sentences.json` is generated. Do not edit it by hand. Use the `build-sentences` skill.
3. `dist/` is build output. Do not edit it.
4. The app is React + Vite. The build makes one file: `dist/index.html`.
5. Do not push to `main`. Pushing `main` deploys (`.github/workflows/deploy.yml`).
