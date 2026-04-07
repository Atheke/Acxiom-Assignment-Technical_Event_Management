-- Aggregate reference schema for Technical Event Management.
-- Core tables (`users`, `vendors`, `products`, `orders`, `order_items`) are created
-- according to your environment; this file adds app-specific tables from `backend/sql/`.

-- From backend/sql/guest_list.sql
CREATE TABLE IF NOT EXISTS guest_list (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  guest_name VARCHAR(100) NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS guest_list_user_id_idx ON guest_list(user_id);

-- From backend/sql/vendor_sales_and_requests.sql (vendor_sales only)
CREATE TABLE IF NOT EXISTS vendor_sales (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vendor_sales_vendor_id_idx ON vendor_sales(vendor_id);

-- From backend/sql/user_product_requests.sql
CREATE TABLE IF NOT EXISTS user_product_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_id INTEGER NOT NULL REFERENCES vendors(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS user_product_requests_vendor_id_idx ON user_product_requests(vendor_id);
CREATE INDEX IF NOT EXISTS user_product_requests_user_id_idx ON user_product_requests(user_id);

-- From backend/sql/memberships.sql
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
