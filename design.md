# Design — Fibole

Visual language and implementation decisions for the Fibole UI. Source of truth is the Claude Design project "Fibole Game Design Overhaul" (project ID `b27a07c9-9962-4e1e-bb5a-ddd089ad23fd`).

## Design language

The aesthetic is a graded exam paper — warm off-white background, ink-black type, a single terracotta accent, and hand-drawn SVG marks that feel like a teacher's pen. Every decoration is intentional: the ink circle means "this is the fake," the pencil strikethrough means "your wrong pick," the swash under "Fibole" is purely brand. Nothing is double-marked.

## Typography

Four fonts, each with a distinct role:

| Font | Weight | Use |
|------|--------|-----|
| Libre Caslon Display | 400 | Display headings ("Fibole", "Who or what…", score number) |
| Newsreader | 400 italic / 500 italic | Fact numbers, answer-phase serif body, error messages |
| Hanken Grotesk | 400 / 600 / 700 / 800 | All sans-serif UI: labels, buttons, body copy, round header |
| Caveat | 500 / 600 / 700 | Handwritten voice: "three guesses", "fake!", "your pick", "no points" |

Loaded via Google Fonts in `index.html`. Never substitute a system serif for Libre Caslon — it changes the visual weight of every heading.

## Color palette

| Name | Hex | Role |
|------|-----|------|
| Paper | `#f6f1e7` | App background, screen background |
| Ink | `#20201c` | Primary text, buttons |
| Terracotta | `#b4532f` | Accent — fact numbers, ink marks, underlines, error state |
| Body | `#38362f` | Fact body text |
| Muted | `#a39a87` | Secondary labels ("Round 1 / 3", Caveat captions) |
| Divider | `#e2d9c6` | Fact list row separators |
| Divider (revealed) | `#e8e0d1` | Slightly lighter dividers in result state |
| Green | `#46734a` | Correct answer check mark |
| Warm grey | `#9a9080` | Pencil strikethrough, "your pick" label |
| Reveal divider | `#ddd2bd` | Border around the answer reveal banner |
| Ring empty | `#cdbfa3` | Unspent guess rings |

## Ink marks (`src/components/InkMarks.tsx`)

All marks are **static SVG paths** — not a library like rough-notation. The paths were drawn in the design tool and lifted directly; they don't change on each render. This is a deliberate choice: the marks are brand elements, not randomised noise.

| Component | What it does | Where used |
|-----------|-------------|------------|
| `BrandSwash` | Double underline beneath "Fibole" | Answer phase header, endgame header |
| `LongUnderline` | 232 px wavy underline | "Who or what do these facts describe?" |
| `MediumUnderline` | 150 px wavy underline | "Now — which fact is the fake?" |
| `ShortUnderline` | 118 px wavy underline | "Still — spot the fake?" |
| `TopicSpark` | Asterisk/spark before the topic name | Round header row |
| `CheckMark` | Green ink check | Correct answer banner, endgame round rows |
| `XMark` | Terracotta ✕ | Wrong guess, endgame round rows |
| `GuessRing` | Hand-drawn oval (empty or ✕ inside) | Guess counter in answer phase |
| `NumberPenCircle` | Small oval around a fact number | Selected fact in fake-picking phase |
| `FakeOval` | Large oval wrapping an entire fact row | Revealed fake in result screens |
| `PencilStrike` | Two pencil lines crossing a fact row | Wrong fake pick in result screens |
| `ScoreCircle` | Large oval around the day score | Endgame screen |
| `ScoreUnderline` | Short underline beneath "+N" | Round result score |

**Sizing rule**: marks that wrap text rows (`FakeOval`, `PencilStrike`) use `preserveAspectRatio="none"` and `vector-effect="non-scaling-stroke"` so the stroke weight stays constant while the shape stretches to fit any row height.

**Draw-on animation**: not implemented — the paths are present from first render. If you want a draw-on effect later, animate `stroke-dashoffset` from the path length to 0 with a CSS `@keyframes draw-in` rule.

## Screen states

Seven distinct states across a round:

| Screen | Phase | Trigger |
|--------|-------|---------|
| Answer (default) | `answer` | Round start |
| Answer (wrong guess) | `answer` | `answerGuesses.length > 0 && !answerCorrect && !answerPhaseComplete` |
| Spot the fake (solved) | `fake-fact`, selecting | Answered correctly |
| Spot the fake (revealed) | `fake-fact`, selecting | Exhausted all 3 guesses |
| Result (win) | `fake-fact`, complete | Fake was found |
| Result (loss / partial) | `fake-fact`, complete | Fake was missed |
| Endgame | `complete` | All 3 rounds done |

## Copy rules

These are binding — not suggestions. The design spec includes exact copy logic for every dynamic string.

**Answer phase**
- Attempt 1: caption = `"three guesses"` (Caveat, below rings)
- Attempts 2–3: caption = `"guess {n} of 3"`
- Wrong guess message: `Not "{their guess}" — {n} guesses left.` — spell out the number (`"one guess left."` / `"two guesses left."`)
- Input underline turns terracotta on wrong guess; resets to ink on first keystroke

**Fake-picking phase**
- Answered correctly: eyebrow = `"Solved · {ordinal} try"` (ordinal = first / second / third)
- Revealed: eyebrow = `"Answer revealed"` + handwritten `"no points"`
- Heading: `"Now — which fact is the fake?"` (solved) or `"Still — spot the fake?"` (revealed)
- Button hint: `"one shot at this"` (solved) or `"a point of pride is still a point"` (revealed)

**Result screen headlines**
- Answer ✓ + Fake ✓ → `"Both right."`
- Answer ✗ + Fake ✓ → `"Fake spotted."`
- Answer ✓ + Fake ✗ → `"Half marks."`
- Answer ✗ + Fake ✗ → `"Tomorrow's yours."`

**Result screen subscript**: `Answer {a} · Fake {f}` where `a` = answer score (0–3), `f` = fake score (0–1).

**Fake label on revealed row**: `"fake!"` when the player picked correctly; `"the fake"` when they missed (so the correct row is labelled differently from a win vs loss).

**Endgame**: score circle wraps `{total}/{max}`. Two marks per round row: `[answer][fake]` — green check if earned, terracotta ✕ if not.

## Layout

- Max width: 430 px, centred
- Horizontal padding: 28 px
- Vertical padding: 36 px top, 56 px bottom
- Background: `#f6f1e7` (set on `body` in `index.css`, not per-component)
- The Fibole header (title + swash) appears only on the **answer phase** and **endgame** screens — it's absent during the fake-picking and result screens

## Fake-picking interaction

Two-step, not one-step:
1. Tap a fact row → pen circle appears on its number (local `pendingFakeIndex` state)
2. Press "Lock in the fake" → submits; triggers result screen

"Lock in the fake" is disabled (greyed) until a row is selected. This prevents accidental submissions.

## Styling approach

Components use **inline `style` props** for all design-token values — colors, fonts, pixel sizes. Tailwind is only used for global resets in `index.css`. This keeps the design tightly coupled to its spec values and avoids Tailwind's arbitrary-value syntax for every colour.
