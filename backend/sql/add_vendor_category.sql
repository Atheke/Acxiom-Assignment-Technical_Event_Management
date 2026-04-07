-- Run once against your database if `vendors` has no category column yet.
ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS category VARCHAR(30)
    CHECK (
      category IS NULL
      OR category IN ('CATERING', 'FLORIST', 'DECORATION', 'LIGHTING')
    );
