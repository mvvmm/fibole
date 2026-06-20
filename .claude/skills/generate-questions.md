# Skill: generate-questions

Generates daily quiz questions for the Fibole game. You fetch Wikipedia content for each entity and derive facts from it — do not use your own knowledge as a source.

## Required credentials

Read from `.env` in the project root:
- `CLOUDFLARE_API_TOKEN` — needs D1:Edit permission
- `CLOUDFLARE_ACCOUNT_ID`
- `D1_DATABASE_ID` — also in `wrangler.jsonc` as `database_id`

If any are missing, tell the user and stop.

## Parameters

Collect from the user's request (defaults if not specified):

| Parameter | Default |
|-----------|---------|
| Number of days | 7 |
| Start date | tomorrow (YYYY-MM-DD) |
| Category filter | all categories (rotate) |

## Step 1 — Check existing answers (dedup)

Query D1 for already-used answers so you never repeat an entity:

```bash
curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}/query" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT answer FROM questions"}' \
  | jq -r '.result[0].results[].answer'
```

Keep this set in memory — never pick an entity already in it.

## Step 2 — Pick entities

For each day × round (3 rounds/day), pick one unused entity from the lists below. Rotate categories across rounds and days.

### Curated entity lists

**US Presidents:** George Washington, Abraham Lincoln, Thomas Jefferson, Franklin D. Roosevelt, Theodore Roosevelt, John F. Kennedy, Dwight D. Eisenhower, Harry S. Truman, Lyndon B. Johnson, James K. Polk, Andrew Jackson, James Madison, John Adams, Ulysses S. Grant, Woodrow Wilson, Ronald Reagan, Richard Nixon, Bill Clinton, Barack Obama, Jimmy Carter

**Historical Figures:** Napoleon Bonaparte, Julius Caesar, Cleopatra, Alexander the Great, Genghis Khan, Leonardo da Vinci, Galileo Galilei, Isaac Newton, Marie Curie, Nikola Tesla, Charles Darwin, Karl Marx, Sigmund Freud, Winston Churchill, Mahatma Gandhi, Martin Luther King Jr., Nelson Mandela, Joan of Arc, Catherine the Great, Elizabeth I of England

**Countries:** France, Japan, Brazil, Australia, Egypt, India, Mexico, Canada, Germany, South Africa, Argentina, Italy, Spain, China, Russia, New Zealand, Greece, Turkey, Thailand, Nigeria

**World Cities:** Tokyo, Paris, New York City, London, Sydney, Rome, Cairo, Mumbai, Rio de Janeiro, Istanbul, Barcelona, Buenos Aires, Seoul, Amsterdam, Vienna, Bangkok, Mexico City, Dubai, Singapore, Nairobi

**Scientists:** Albert Einstein, Isaac Newton, Charles Darwin, Marie Curie, Nikola Tesla, Stephen Hawking, Richard Feynman, Niels Bohr, Max Planck, Louis Pasteur, Gregor Mendel, Carl Sagan, Jane Goodall, Neil deGrasse Tyson, Carl Linnaeus, Ada Lovelace, Alan Turing, Rosalind Franklin, Edwin Hubble, Enrico Fermi

**NFL Athletes:** Jerry Rice, Lawrence Taylor, Jim Brown, Walter Payton, Barry Sanders, Joe Montana, Peyton Manning, Tom Brady, Reggie White, Dick Butkus, Deion Sanders, Johnny Unitas, Ronnie Lott, Tony Gonzalez, Randy Moss, Emmitt Smith, Ray Lewis, Dan Marino, Brett Favre, Bruce Smith

**Music Groups (80s):** U2, R.E.M., Talking Heads, Duran Duran, Depeche Mode, The Cure, New Order, Blondie, The Police, Wham!, Tears for Fears, Def Leppard, Bon Jovi, INXS, Simple Minds, Eurythmics, Culture Club, A-ha, Squeeze, Madness

**Classic Films:** Casablanca, Citizen Kane, Sunset Boulevard, Singin' in the Rain, Vertigo, Rear Window, Some Like It Hot, The Wizard of Oz, Gone with the Wind, All About Eve, Double Indemnity, Chinatown, Psycho, North by Northwest, The Philadelphia Story, It Happened One Night, 12 Angry Men, On the Waterfront, Rebel Without a Cause, Stagecoach

**Animals:** African Elephant, Blue Whale, Snow Leopard, Giant Panda, Cheetah, Komodo Dragon, Peregrine Falcon, Mantis Shrimp, Axolotl, Platypus, Narwhal, Octopus, Monarch Butterfly, Wolverine, Aye-aye, Tardigrade, Electric Eel, Glass Frog, Pistol Shrimp, Bald Eagle

## Step 3 — Fetch Wikipedia content

For each round you need two entities: the **main entity** (the answer) and a **donor entity** (same category, also unused — used only for the fake fact, not inserted as an answer).

Fetch the Wikipedia REST summary for each:

```bash
curl -s "https://en.wikipedia.org/api/rest_v1/page/summary/ENTITY_NAME_UNDERSCORED"
```

Use the `extract` field from the response. If the fetch fails or returns no extract, pick a different entity.

## Step 4 — Derive facts from Wikipedia content

Using **only** the Wikipedia extract text (no outside knowledge):

- **4 true facts** about the main entity — specific, verifiable details drawn directly from the extract. 1–2 sentences each. Must be grounded in the text.
- **1 fake fact** — a specific detail drawn from the **donor entity's** Wikipedia extract, presented as if it could describe the main entity's category. Do NOT name the donor entity in the fake fact.

Mix all 5 facts in random order. Record:
- `fake_fact_index` — 0-based index of the fake fact in the array
- `fake_fact_true_subject` — the donor entity's name (shown to players after the round)

Quality bar:
- Facts must be traceable to the Wikipedia extract — no invention
- Fake fact must be a real fact about the donor entity, not made up
- No single fact should give away the answer on its own

## Step 5 — Insert into D1

```bash
curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}/query" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "INSERT OR IGNORE INTO questions (date, round_number, topic, answer, facts, fake_fact_index, fake_fact_true_subject) VALUES (?, ?, ?, ?, ?, ?, ?)",
    "params": ["DATE", ROUND, "TOPIC", "ANSWER", "[\"fact0\",\"fact1\",\"fact2\",\"fact3\",\"fact4\"]", FAKE_INDEX, "FAKE_SUBJECT"]
  }'
```

`INSERT OR IGNORE` is idempotent — re-running won't duplicate rows.

## Step 6 — Report

- Date range covered
- Total rows inserted vs skipped
- Any Wikipedia fetch failures or insert errors
- Questions are now live; they will appear in the game on their scheduled dates
