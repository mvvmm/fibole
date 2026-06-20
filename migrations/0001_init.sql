CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  round_number INTEGER NOT NULL,
  topic TEXT NOT NULL,
  answer TEXT NOT NULL,
  facts TEXT NOT NULL,
  fake_fact_index INTEGER NOT NULL,
  fake_fact_true_subject TEXT NOT NULL,
  UNIQUE(date, round_number)
);

CREATE INDEX IF NOT EXISTS idx_questions_date ON questions(date);
CREATE INDEX IF NOT EXISTS idx_questions_answer ON questions(answer);
