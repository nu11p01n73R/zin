---
name: build-sentences
description: Build the Dutch sentence pool for Zin. Reads words.csv (Anki export), writes 150–200 very simple Dutch sentences that use only known words to public/sentences.json and checks them. Use when the owner asks to build, rebuild or update the sentences or cards.
---

# Build sentences

Make simple Dutch flashcard sentences that use **only** the words in `words.csv`.

## 1. Make the allowed-word set

1. Read `words.csv` with a real CSV parser (values can contain quotes and commas).
   - The header is `want,because`. Column 1 is **Dutch**. Column 2 is **English**.
   - Count the data rows (not the header). This is `wordCount`.
2. For each Dutch value:
   1. Decode HTML entities (`&amp;` → `&`). Lowercase it.
   2. Split it into tokens on spaces, commas and `&`.
   3. Remove all characters that are not letters from each token. Keep `é`, `ë`, `ï` and other accented letters.
   4. Add each token that is not empty to the allowed set.
3. Keep the full entries (`dank je wel`, `tot ziens`) for the summary.

Known special cases:

- `a.u.b.` becomes the token `aub`.
- `frietje met` gives `frietje` and `met`. So `met` is allowed.
- `"de, het snoep"` gives `de`, `het`, `snoep`. `snoep` takes `de` or `het`.
- `ik ben` and `ik heet` give `ik`, `ben`, `heet`. See step 2 for the subjects of these forms.
- `eten & drinken` gives `eten` and `drinken`. These are also plural verb forms.
- Some words have two rows (`ze` = she / they, `zij` = she / they, `morgen` = tomorrow / morning). Both meanings are allowed.

## 2. Find the grammar limits

The word list grows. Do this step again on each run.

1. Find all verb forms in the allowed set.
2. Find which subjects each form works with.

At October 2026 the verb forms are:

| Form | Subjects |
|---|---|
| `ben` | `ik`. Also `jij` / `je` when the verb comes first: `Ben jij blij?`, `Waar ben je?` |
| `heet` | all singular subjects: `ik`, `jij`, `je`, `u`, `hij`, `zij` (she), a single noun: `Hoe heet de dokter?` |
| `zijn` | `wij`, `we`, `zij` / `ze` (they), `jullie`, two nouns joined with `en`, `dit` / `dat` + plural: `Dat zijn de dokter en de leraar.` |
| `roken` | the same plural subjects as `zijn` |
| `eten`, `drinken` | the same plural subjects as `zijn`. From the entry `eten & drinken`. |

- `is`, `bent`, `rookt`, `heten`, `eet` and `drinkt` are **not** in the list. Do not use `hij`, `zij` (she), `u`, a single noun, or `jij` before the verb, as the subject of `zijn`, `roken`, `eten` or `drinken`.
- Adjectives: use them after the verb (`Wij zijn blij.`). Before a noun, only with `een` + a `het` word (`een mooi huis`), because inflected forms (`mooie`) are not in the list.
- Avoid `toen` (past). Avoid plural nouns (`vissers`): they are new words.
- When new verbs or forms appear, use them, and use them with the correct subjects.

## 3. Write the cards

Write 150–200 cards. Rules:

1. Very simple. Short. Present tense. One sentence per card.
2. Use **only** tokens from the allowed set. An inflected form is a new word, unless that exact form is in the set.
3. Use a new word only when there is no other way. Put it in `newWords`. Aim for zero new words in the pool.
4. No duplicate sentences. Vary subjects, nouns, adjectives, question words and patterns.
5. Correct Dutch: verb-second word order, `de`/`het`, verb forms, `niet` position.
6. `en` is natural English with the exact meaning of `nl`. Use "you (all)" for `jullie`. Use "they" or "she" for `ze`/`zij` to match the verb.
7. `nl` starts with a capital letter and ends with `.`, `?` or `!`.
8. `tip` is one short grammar note in plain English, or `""`. Give a tip on about one card in three. Good topics:
   - Verb second: `Morgen zijn wij daar.`
   - Yes/no questions start with the verb: `Zijn jullie blij?`
   - `niet` after the verb: `Wij roken niet.`
   - `wel` to confirm: `Wij zijn wel blij.`
   - `het` nouns: `het huis`, `het meisje`.
   - `jullie` (you all) and `je` (you).
9. Useful patterns:
   - `Ik ben <adjective>.` / `Ik ben de <noun>.` / `Ik ben hier.`
   - `Wij zijn <place word / adjective>.`
   - `De <noun> en de <noun> zijn <adjective / place>.`
   - `<Question word> zijn jullie?`
   - `Zijn zij <adjective>?` / `Ja, zij zijn <adjective>.` / `Nee, wij zijn niet <adjective>.`
   - `Misschien zijn ze daar.` / `Dan zijn wij blij.`
   - `Wij zijn blij, maar zij zijn niet blij.` / `... omdat ...` (verb at the end).
   - `Ben jij de leraar?` / `Hoe oud ben je?` / `Hoe heet de vrouw?`
   - `Wij eten brood met kaas.` / `Hoeveel koffie drinken jullie?` / `Eten jullie vlees of kip?`

Good:

```json
{ "id": "c014", "nl": "Morgen zijn wij daar.", "en": "Tomorrow we are there.", "tip": "Verb second: after 'morgen' the verb comes before the subject.", "newWords": [] }
```

Bad:

- `De man is oud.` — `is` is not in the list.
- `Wij zijn oude.` — `oude` is not in the list.
- `Hij roken.` — wrong verb form.
- `Jij ben blij.` — `jij` before the verb needs `bent`. Only `Ben jij ...?` is correct.

## 4. Write the file

Write `public/sentences.json`:

```json
{
  "generatedAt": "<ISO 8601 UTC time now, e.g. 2026-10-20T21:30:00Z>",
  "wordCount": 140,
  "cards": [
    { "id": "c001", "nl": "Wij zijn hier.", "en": "We are here.", "tip": "wij zijn = we are.", "newWords": [] }
  ]
}
```

- `id`: `c001`, `c002`, … in order.
- `newWords`: lowercase tokens, in sentence order, no duplicates.

## 5. Check the cards

Check each card. Fix or replace the cards that fail. Check again. Stop after 5 rounds.

1. Tokenize `nl` with the same rules as step 1: lowercase, split on spaces, remove characters that are not letters.
2. Each token that is not in the allowed set must be in `newWords`. Each word in `newWords` must be a token that is not in the set.
3. `nl` is unique in the pool (compare lowercase, without punctuation).
4. `id` is unique.
5. The pool has 150–200 cards.
6. `wordCount` is the same as the number of data rows.
7. All fields are present and have the correct type.

You can write a short script to do this check. Put it in the scratchpad, not in the repository.

## 6. Limits

- Change only `public/sentences.json`.
- Do not change `words.csv`, `index.html`, `src/` or any other file.
- Do not build or deploy. The owner does this.

## 7. Summary

Print:

- Number of cards.
- Number of cards with new words.
- The new words.
- New verb forms found in step 2, if there are any.
