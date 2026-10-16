-- The plants table. The app runs this automatically on start-up;
-- IF NOT EXISTS makes it safe to run again and again.
-- All timestamps are stored in UTC.
CREATE TABLE IF NOT EXISTS plants (
  id                     INT          AUTO_INCREMENT PRIMARY KEY,
  name                   VARCHAR(100) NOT NULL,
  species                VARCHAR(100),
  location               VARCHAR(100),
  watering_interval_days INT          NOT NULL DEFAULT 7,
  last_watered           DATE,
  is_indoor              BOOLEAN      NOT NULL DEFAULT TRUE,
  notes                  TEXT,
  created_at             DATETIME(3)  NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
  updated_at             DATETIME(3)  NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
  version                INT          NOT NULL DEFAULT 1,

  -- Named rules, so error messages say which one was broken
  CONSTRAINT name_not_blank            CHECK (CHAR_LENGTH(TRIM(name)) > 0),
  CONSTRAINT interval_must_be_positive CHECK (watering_interval_days > 0)
)
