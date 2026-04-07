-- Membership tiers and vendor subscriptions.
-- `vendor_memberships.vendor_id` stores `vendors.user_id` (same convention as `user_product_requests`).

CREATE TABLE IF NOT EXISTS memberships (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  features TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS vendors_user_id_uidx ON vendors (user_id);

CREATE TABLE IF NOT EXISTS vendor_memberships (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES vendors (user_id) ON DELETE CASCADE,
  membership_id INTEGER NOT NULL REFERENCES memberships (id) ON DELETE RESTRICT,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED'))
);

CREATE INDEX IF NOT EXISTS vendor_memberships_vendor_id_idx ON vendor_memberships (vendor_id);
CREATE INDEX IF NOT EXISTS vendor_memberships_membership_id_idx ON vendor_memberships (membership_id);
